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
                e.created_at,
                e.updated_at,
                e.interested_count,
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

/**
 * Route publique : GET /api/public/stats
 * Retourne les statistiques globales (France)
 */
router.get('/stats', async (req, res) => {
    try {
        // Nombre d'églises actives (validées)
        const [churchesCount] = await db.query(`
            SELECT COUNT(*) as total
            FROM churches c
            INNER JOIN admins a ON a.id = c.admin_id
            WHERE a.status = 'VALIDATED'
        `);

        // Nombre d'événements en cours
        const [ongoingEvents] = await db.query(`
            SELECT COUNT(*) as total
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            WHERE e.cancelled_at IS NULL
            AND a.status = 'VALIDATED'
            AND e.start_datetime <= NOW()
            AND COALESCE(e.end_datetime, e.start_datetime) >= NOW()
        `);

        // Nombre d'événements à venir
        const [upcomingEvents] = await db.query(`
            SELECT COUNT(*) as total
            FROM events e
            INNER JOIN admins a ON a.id = e.admin_id
            WHERE e.cancelled_at IS NULL
            AND a.status = 'VALIDATED'
            AND e.start_datetime > NOW()
        `);

        res.json({
            success: true,
            stats: {
                churches: churchesCount[0].total,
                ongoingEvents: ongoingEvents[0].total,
                upcomingEvents: upcomingEvents[0].total
            }
        });

    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du chargement des statistiques'
        });
    }
