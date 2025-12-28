const express = require('express');
const router = express.Router();
const { query, param } = require('express-validator');
const db = require('../config/db');

/**
 * Route publique : GET /api/public/churches
 * Retourne la liste des églises à proximité avec calcul de distance
 * Query params: latitude, longitude, radius (km), denomination_id, limit
 */
router.get('/churches', [
    query('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude invalide'),
    query('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude invalide'),
    query('radius')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Rayon doit être entre 1 et 100 km'),
    query('denomination_id')
        .optional()
        .isInt()
        .withMessage('ID dénomination invalide'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 500 })
        .withMessage('Limite doit être entre 1 et 500')
], async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            radius = 50,
            denomination_id,
            limit = 100
        } = req.query;

        // Construction de la requête de base
        let whereConditions = [
            'a.status = "VALIDATED"',
            'a.role = "PASTOR"',
            'c.id IS NOT NULL'
        ];

        let params = [];
        let selectDistance = '';
        let orderByDistance = '';

        // Si coordonnées fournies, calculer la distance
        if (latitude && longitude) {
            const userPoint = `POINT(${longitude} ${latitude})`;

            selectDistance = `,
                ST_Distance_Sphere(c.location, ST_GeomFromText('${userPoint}')) / 1000 as distance_km`;

            whereConditions.push(
                `ST_Distance_Sphere(c.location, ST_GeomFromText('${userPoint}')) <= ? * 1000`
            );
            params.push(parseInt(radius));

            orderByDistance = 'ORDER BY distance_km ASC';
        } else {
            orderByDistance = 'ORDER BY c.church_name ASC';
        }

        // Filtre par dénomination
        if (denomination_id) {
            whereConditions.push('c.denomination_id = ?');
            params.push(denomination_id);
        }

        const whereClause = whereConditions.join(' AND ');

        // Requête principale
        const query = `
            SELECT
                c.id,
                c.church_name,
                ST_X(c.location) as longitude,
                ST_Y(c.location) as latitude,
                d.name as denomination_name,
                cd.city,
                cd.postal_code,
                cd.address,
                cd.logo_url,
                CONCAT(a.first_name, ' ', a.last_name) as pastor_name
                ${selectDistance}
            FROM churches c
            INNER JOIN admins a ON a.id = c.admin_id
            LEFT JOIN denominations d ON d.id = c.denomination_id
            LEFT JOIN church_details cd ON cd.church_id = c.id
            WHERE ${whereClause}
            ${orderByDistance}
            LIMIT ?
        `;

        params.push(parseInt(limit));

        const [churches] = await db.query(query, params);

        res.json({
            success: true,
            count: churches.length,
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
 * Retourne la liste des événements publiés à proximité
 */
router.get('/events', [
    query('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude invalide'),
    query('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude invalide'),
    query('radius')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Rayon doit être entre 1 et 100 km'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 500 })
        .withMessage('Limite doit être entre 1 et 500')
], async (req, res) => {
    try {
        const {
            latitude,
            longitude,
            radius = 50,
            limit = 100
        } = req.query;

        let whereConditions = [
            'e.cancelled_at IS NULL',
            'e.start_datetime >= NOW()',
            'a.status = "VALIDATED"'
        ];

        let params = [];
        let selectDistance = '';
        let orderByDistance = '';

        // Si coordonnées fournies, calculer la distance
        if (latitude && longitude) {
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

            orderByDistance = 'ORDER BY distance_km ASC, e.start_datetime ASC';
        } else {
            orderByDistance = 'ORDER BY e.start_datetime ASC';
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
            LEFT JOIN churches c ON c.admin_id = a.id
            LEFT JOIN event_details ed ON ed.event_id = e.id
            WHERE ${whereClause}
            ${orderByDistance}
            LIMIT ?
        `;

        params.push(parseInt(limit));

        const [events] = await db.query(query, params);

        res.json({
            success: true,
            count: events.length,
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
                CONCAT(a.first_name, ' ', a.last_name) as organizer_name
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            LEFT JOIN churches c ON c.admin_id = a.id
            WHERE e.id = ? AND e.cancelled_at IS NULL AND a.status = 'VALIDATED'
        `, [id]);

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        const event = events[0];

        // Détails supplémentaires
        const [details] = await db.query(
            'SELECT * FROM event_details WHERE event_id = ?',
            [id]
        );

        res.json({
            success: true,
            event: {
                ...event,
                details: details[0] || {}
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
