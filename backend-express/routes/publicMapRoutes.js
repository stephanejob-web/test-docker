const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const db = require('../config/db');

/**
 * Route publique : GET /api/public/churches
 * Retourne la liste des églises dans une zone visible (bounding box) ou à proximité
 * Query params:
 *   - Bounding Box: north, south, east, west (coordonnées)
 *   - OU Distance: latitude, longitude, radius (km)
 *   - Autres: denomination_id, limit, search
 */
router.get('/churches', [
    query('north').optional().isFloat({ min: -90, max: 90 }),
    query('south').optional().isFloat({ min: -90, max: 90 }),
    query('east').optional().isFloat({ min: -180, max: 180 }),
    query('west').optional().isFloat({ min: -180, max: 180 }),
    query('latitude').optional().isFloat({ min: -90, max: 90 }),
    query('longitude').optional().isFloat({ min: -180, max: 180 }),
    query('radius').optional().isInt({ min: 1, max: 1000 }),
    query('userLat').optional().isFloat({ min: -90, max: 90 }),
    query('userLng').optional().isFloat({ min: -180, max: 180 }),
    query('denomination_id').optional().isInt(),
    query('search').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 500 })
], async (req, res) => {
    try {
        const {
            north, south, east, west,
            latitude, longitude, radius = 50,
            userLat, userLng,
            denomination_id, search,
            limit = 200
        } = req.query;

        let whereConditions = [
            'a.status = "VALIDATED"',
            'a.role = "PASTOR"',
            'c.id IS NOT NULL'
        ];

        let params = [];
        let selectDistance = '';
        let orderBy = 'ORDER BY c.church_name ASC';

        // Mode 1: Bounding Box (prioritaire pour performance)
        if (north && south && east && west) {
            whereConditions.push('ST_Y(c.location) BETWEEN ? AND ?');
            whereConditions.push('ST_X(c.location) BETWEEN ? AND ?');
            params.push(parseFloat(south), parseFloat(north));
            params.push(parseFloat(west), parseFloat(east));

            // Calculer la distance si userLat et userLng sont fournis
            console.log('🔍 Checking userLat && userLng:', { userLat, userLng, condition: !!(userLat && userLng) });
            if (userLat && userLng) {
                const userPoint = `POINT(${userLng} ${userLat})`;
                selectDistance = `,
                    ST_Distance_Sphere(c.location, ST_GeomFromText('${userPoint}')) / 1000 as distance_km`;
                orderBy = 'ORDER BY distance_km ASC';
                console.log('✅ Distance calculation enabled:', { selectDistance, orderBy });
            }
        }
        // Mode 2: Distance radius (fallback)
        else if (latitude && longitude) {
            const userPoint = `POINT(${longitude} ${latitude})`;
            selectDistance = `,
                ST_Distance_Sphere(c.location, ST_GeomFromText('${userPoint}')) / 1000 as distance_km`;
            whereConditions.push(
                `ST_Distance_Sphere(c.location, ST_GeomFromText('${userPoint}')) <= ? * 1000`
            );
            params.push(parseInt(radius));
            orderBy = 'ORDER BY distance_km ASC';
        }

        // Filtre par dénomination
        if (denomination_id) {
            whereConditions.push('c.denomination_id = ?');
            params.push(denomination_id);
        }

        // Filtre par recherche textuelle
        if (search) {
            whereConditions.push(
                '(c.church_name LIKE ? OR cd.city LIKE ? OR CONCAT(a.first_name, " ", a.last_name) LIKE ?)'
            );
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        const whereClause = whereConditions.join(' AND ');

        // Requête principale - OPTIMISÉE : uniquement churches (pas de JOIN avec church_details)
        const query = `
            SELECT
                c.id,
                c.church_name,
                ST_X(c.location) as longitude,
                ST_Y(c.location) as latitude,
                d.name as denomination_name,
                CONCAT(a.first_name, ' ', a.last_name) as pastor_name
                ${selectDistance}
            FROM churches c
            INNER JOIN admins a ON a.id = c.admin_id
            LEFT JOIN denominations d ON d.id = c.denomination_id
            WHERE ${whereClause}
            ${orderBy}
            LIMIT ?
        `;

        params.push(parseInt(limit));

        const [churches] = await db.query(query, params);

        res.json({
            success: true,
            count: churches.length,
            hasMore: churches.length === parseInt(limit),
            churches: churches.map(church => ({
                ...church,
                distance_km: church.distance_km ? parseFloat(church.distance_km.toFixed(2)) : null
            }))
        });

    } catch (err) {
        console.error('Error fetching public churches:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des églises'
        });
    }
});

/**
 * Route publique : GET /api/public/churches/:id
 * Retourne les détails complets d'une église
 */
router.get('/churches/:id', [
    param('id').isInt().withMessage('ID église invalide')
], async (req, res) => {
    try {
        const { id } = req.params;

        // Détails de l'église
        const [churches] = await db.query(`
            SELECT
                c.id,
                c.church_name,
                c.denomination_id,
                ST_X(c.location) as longitude,
                ST_Y(c.location) as latitude,
                d.name as denomination_name,
                a.first_name,
                a.last_name,
                a.email
            FROM churches c
            INNER JOIN admins a ON a.id = c.admin_id
            LEFT JOIN denominations d ON d.id = c.denomination_id
            WHERE c.id = ? AND a.status = 'VALIDATED'
        `, [id]);

        if (churches.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Église non trouvée'
            });
        }

        const church = churches[0];

        // Détails supplémentaires
        const [details] = await db.query(
            'SELECT * FROM church_details WHERE church_id = ?',
            [id]
        );

        // Horaires
        const [schedules] = await db.query(`
            SELECT
                cs.id,
                CASE cs.day_of_week
                    WHEN 'MONDAY' THEN 'Lundi'
                    WHEN 'TUESDAY' THEN 'Mardi'
                    WHEN 'WEDNESDAY' THEN 'Mercredi'
                    WHEN 'THURSDAY' THEN 'Jeudi'
                    WHEN 'FRIDAY' THEN 'Vendredi'
                    WHEN 'SATURDAY' THEN 'Samedi'
                    WHEN 'SUNDAY' THEN 'Dimanche'
                    ELSE cs.day_of_week
                END as day_of_week,
                cs.start_time,
                at.label_fr as activity_type
            FROM church_schedules cs
            LEFT JOIN activity_types at ON at.id = cs.activity_type_id
            WHERE cs.church_id = ?
            ORDER BY FIELD(cs.day_of_week, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
                     cs.start_time
        `, [id]);

        // Réseaux sociaux
        const [socials] = await db.query(
            'SELECT platform, url FROM church_socials WHERE church_id = ?',
            [id]
        );

        res.json({
            success: true,
            church: {
                ...church,
                details: details[0] || {},
                schedules: schedules || [],
                socials: socials || []
            }
        });

    } catch (err) {
        console.error('Error fetching church details:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des détails de l\'église'
        });
    }
});

/**
 * Route publique : GET /api/public/events
 * Retourne la liste des événements dans une zone visible ou à proximité
 * Query params: north, south, east, west OU latitude, longitude, radius
 */
router.get('/events', [
    query('north').optional().isFloat({ min: -90, max: 90 }),
    query('south').optional().isFloat({ min: -90, max: 90 }),
    query('east').optional().isFloat({ min: -180, max: 180 }),
    query('west').optional().isFloat({ min: -180, max: 180 }),
    query('latitude').optional().isFloat({ min: -90, max: 90 }),
    query('longitude').optional().isFloat({ min: -180, max: 180 }),
    query('radius').optional().isInt({ min: 1, max: 1000 }),
    query('userLat').optional().isFloat({ min: -90, max: 90 }),
    query('userLng').optional().isFloat({ min: -180, max: 180 }),
    query('search').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 500 })
], async (req, res) => {
    try {
        const {
            north, south, east, west,
            latitude, longitude, radius = 50,
            userLat, userLng,
            search,
            limit = 200
        } = req.query;

        let whereConditions = [
            'e.cancelled_at IS NULL',
            'e.start_datetime >= NOW()',
            'a.status = "VALIDATED"'
        ];

        let params = [];
        let selectDistance = '';
        let orderBy = 'ORDER BY e.start_datetime ASC';

        // Mode 1: Bounding Box
        if (north && south && east && west) {
            // Pour les événements, utiliser COALESCE car location peut être celle de l'événement ou de l'église
            whereConditions.push(
                'ST_Y(COALESCE(e.event_location, c.location)) BETWEEN ? AND ?'
            );
            whereConditions.push(
                'ST_X(COALESCE(e.event_location, c.location)) BETWEEN ? AND ?'
            );
            params.push(parseFloat(south), parseFloat(north));
            params.push(parseFloat(west), parseFloat(east));

            // Calculer la distance si userLat et userLng sont fournis
            if (userLat && userLng) {
                const userPoint = `POINT(${userLng} ${userLat})`;
                selectDistance = `,
                    ST_Distance_Sphere(
                        COALESCE(e.event_location, c.location),
                        ST_GeomFromText('${userPoint}')
                    ) / 1000 as distance_km`;
                orderBy = 'ORDER BY distance_km ASC, e.start_datetime ASC';
            }
        }
        // Mode 2: Distance radius
        else if (latitude && longitude) {
            const userPoint = `POINT(${longitude} ${latitude})`;
            selectDistance = `,
                ST_Distance_Sphere(
                    COALESCE(e.event_location, c.location),
                    ST_GeomFromText('${userPoint}')
                ) / 1000 as distance_km`;
            whereConditions.push(
                `ST_Distance_Sphere(
                    COALESCE(e.event_location, c.location),
                    ST_GeomFromText('${userPoint}')
                ) <= ? * 1000`
            );
            params.push(parseInt(radius));
            orderBy = 'ORDER BY distance_km ASC, e.start_datetime ASC';
        }

        // Filtre par recherche textuelle
        if (search) {
            whereConditions.push(
                '(e.title LIKE ? OR c.church_name LIKE ? OR ed.city LIKE ?)'
            );
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern);
        }

        const whereClause = whereConditions.join(' AND ');

        // Requête principale
        const query = `
            SELECT
                e.id,
                e.title,
                e.start_datetime,
                e.end_datetime,
                ST_X(COALESCE(e.event_location, c.location)) as longitude,
                ST_Y(COALESCE(e.event_location, c.location)) as latitude,
                c.church_name,
                c.id as church_id,
                ed.address as event_address,
                ed.city as event_city
                ${selectDistance}
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            LEFT JOIN churches c ON c.id = e.church_id
            LEFT JOIN event_details ed ON ed.event_id = e.id
            WHERE ${whereClause}
            ${orderBy}
            LIMIT ?
        `;

        params.push(parseInt(limit));

        const [events] = await db.query(query, params);

        res.json({
            success: true,
            count: events.length,
            hasMore: events.length === parseInt(limit),
            events: events.map(event => ({
                ...event,
                distance_km: event.distance_km ? parseFloat(event.distance_km.toFixed(2)) : null
            }))
        });

    } catch (err) {
        console.error('Error fetching public events:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des événements'
        });
    }
});

/**
 * Route publique : GET /api/public/events/:id
 * Retourne les détails complets d'un événement
 */
router.get('/events/:id', [
    param('id').isInt().withMessage('ID événement invalide')
], async (req, res) => {
    try {
        const { id } = req.params;

        const [events] = await db.query(`
            SELECT
                e.id,
                e.title,
                e.start_datetime,
                e.end_datetime,
                ST_X(COALESCE(e.event_location, c.location)) as longitude,
                ST_Y(COALESCE(e.event_location, c.location)) as latitude,
                c.church_name,
                c.id as church_id,
                c.denomination_id,
                d.name as denomination_name,
                CONCAT(a.first_name, ' ', a.last_name) as organizer_name,
                a.first_name as pastor_first_name,
                a.last_name as pastor_last_name,
                a.email as pastor_email,
                l.code as primary_language_code,
                l.name_fr as primary_language_name,
                l.flag_emoji as primary_language_flag
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            LEFT JOIN churches c ON c.id = e.church_id
            LEFT JOIN denominations d ON d.id = c.denomination_id
            LEFT JOIN languages l ON l.id = e.language_id
            WHERE e.id = ? AND e.cancelled_at IS NULL AND a.status = 'VALIDATED'
        `, [id]);

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        const event = events[0];

        // Détails de l'événement
        const [eventDetails] = await db.query(
            'SELECT * FROM event_details WHERE event_id = ?',
            [id]
        );

        // Traductions disponibles pour l'événement
        const [translations] = await db.query(`
            SELECT
                l.code,
                l.name_fr,
                l.flag_emoji
            FROM event_translations et
            INNER JOIN languages l ON l.id = et.language_id
            WHERE et.event_id = ?
            ORDER BY l.display_order
        `, [id]);

        // Détails de l'église si elle existe
        let churchDetails = null;
        let churchSchedules = [];
        let churchSocials = [];

        if (event.church_id) {
            // Détails de l'église
            const [details] = await db.query(
                'SELECT * FROM church_details WHERE church_id = ?',
                [event.church_id]
            );
            churchDetails = details[0] || null;

            // Horaires de l'église
            const [schedules] = await db.query(`
                SELECT
                    cs.id,
                    CASE cs.day_of_week
                        WHEN 'MONDAY' THEN 'Lundi'
                        WHEN 'TUESDAY' THEN 'Mardi'
                        WHEN 'WEDNESDAY' THEN 'Mercredi'
                        WHEN 'THURSDAY' THEN 'Jeudi'
                        WHEN 'FRIDAY' THEN 'Vendredi'
                        WHEN 'SATURDAY' THEN 'Samedi'
                        WHEN 'SUNDAY' THEN 'Dimanche'
                        ELSE cs.day_of_week
                    END as day_of_week,
                    cs.start_time,
                    at.label_fr as activity_type
                FROM church_schedules cs
                LEFT JOIN activity_types at ON at.id = cs.activity_type_id
                WHERE cs.church_id = ?
                ORDER BY FIELD(cs.day_of_week, 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'),
                         cs.start_time
            `, [event.church_id]);
            churchSchedules = schedules;

            // Réseaux sociaux de l'église
            const [socials] = await db.query(
                'SELECT platform, url FROM church_socials WHERE church_id = ?',
                [event.church_id]
            );
            churchSocials = socials;
        }

        res.json({
            success: true,
            event: {
                ...event,
                details: eventDetails[0] || {},
                primary_language: event.primary_language_code ? {
                    code: event.primary_language_code,
                    name: event.primary_language_name,
                    flag: event.primary_language_flag
                } : null,
                translations: translations || [],
                church: event.church_id ? {
                    id: event.church_id,
                    church_name: event.church_name,
                    denomination_id: event.denomination_id,
                    denomination_name: event.denomination_name,
                    pastor_first_name: event.pastor_first_name,
                    pastor_last_name: event.pastor_last_name,
                    pastor_email: event.pastor_email,
                    details: churchDetails,
                    schedules: churchSchedules,
                    socials: churchSocials
                } : null
            }
        });

    } catch (err) {
        console.error('Error fetching event details:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des détails de l\'événement'
        });
    }
});

/**
 * Route publique : GET /api/public/denominations
 * Retourne la liste de toutes les dénominations
 */
router.get('/denominations', async (req, res) => {
    try {
        const [denominations] = await db.query(
            'SELECT id, name FROM denominations ORDER BY name ASC'
        );

        res.json({
            success: true,
            count: denominations.length,
            denominations
        });

    } catch (err) {
        console.error('Error fetching denominations:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des dénominations'
        });
    }
});

module.exports = router;
