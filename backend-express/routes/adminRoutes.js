const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { verifyToken, requireSuperAdmin } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(requireSuperAdmin);

// --- UTILISATEURS ---

// Lister tous les utilisateurs (avec pagination, recherche, filtres)
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const roleFilter = req.query.role || '';
        const statusFilter = req.query.status || '';

        // Build WHERE clause
        let whereClause = 'WHERE 1=1';
        const params = [];

        // Filter by Role
        if (roleFilter && roleFilter !== 'ALL') {
            whereClause += ' AND a.role = ?';
            params.push(roleFilter);
        }

        // Filter by Status
        if (statusFilter && statusFilter !== 'ALL') {
            whereClause += ' AND a.status = ?';
            params.push(statusFilter);
        }

        // Filter by Search (Name or Email)
        if (search) {
            whereClause += ' AND (a.first_name LIKE ? OR a.last_name LIKE ? OR a.email LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM admins a ${whereClause}`,
            params
        );
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get paginated results with church info for pastors
        const [users] = await db.query(
            `SELECT a.id, a.first_name, a.last_name, a.email, a.role, a.status, a.created_at,
                    c.id as church_id, c.church_name
             FROM admins a
             LEFT JOIN churches c ON a.id = c.admin_id
             ${whereClause}
             ORDER BY a.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Lister uniquement les pending (pour compatibilité ou dashboard)
router.get('/pending-users', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, first_name, last_name, email, role, created_at FROM admins WHERE status = "PENDING"'
        );
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Modifier un utilisateur
router.put('/users/:id', async (req, res) => {
    console.log('PUT /users/:id body:', req.body);
    const { status, role } = req.body;
    try {
        let updateQuery = 'UPDATE admins SET ';
        const updateParams = [];

        if (status) { updateQuery += 'status = ?, '; updateParams.push(status); }
        if (role) { updateQuery += 'role = ?, '; updateParams.push(role); }

        if (updateParams.length === 0) {
            return res.status(400).json({ message: 'Aucun champ à modifier' });
        }

        updateQuery = updateQuery.slice(0, -2); // Remove trailing comma
        updateQuery += ' WHERE id = ?';
        updateParams.push(req.params.id);

        await db.query(updateQuery, updateParams);
        res.json({ message: 'Utilisateur mis à jour' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Supprimer un utilisateur
router.delete('/users/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM admins WHERE id = ?', [req.params.id]);
        res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// --- EGLISES ---

// Lister toutes les églises (avec pagination, recherche, filtres)
router.get('/churches', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const denominationFilter = req.query.denomination || '';
        const cityFilter = req.query.city || '';

        // Build WHERE clause
        let whereClause = 'WHERE 1=1';
        const params = [];

        // Filter by Denomination
        if (denominationFilter && denominationFilter !== 'ALL') {
            whereClause += ' AND c.denomination_id = ?';
            params.push(denominationFilter);
        }

        // Filter by City
        if (cityFilter && cityFilter !== 'ALL') {
            whereClause += ' AND cd.city = ?';
            params.push(cityFilter);
        }

        // Filter by Search (Church Name, City, Pastor Name)
        if (search) {
            whereClause += ' AND (c.church_name LIKE ? OR cd.city LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        // Get total count
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total
             FROM churches c
             JOIN admins a ON c.admin_id = a.id
             JOIN denominations d ON c.denomination_id = d.id
             LEFT JOIN church_details cd ON c.id = cd.church_id
             ${whereClause}`,
            params
        );
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Get paginated results with city
        const [churches] = await db.query(
            `SELECT c.id, c.church_name, d.name as denomination, d.id as denomination_id,
                    a.first_name, a.last_name, c.created_at, cd.city
             FROM churches c
             JOIN admins a ON c.admin_id = a.id
             JOIN denominations d ON c.denomination_id = d.id
             LEFT JOIN church_details cd ON c.id = cd.church_id
             ${whereClause}
             ORDER BY c.created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            churches,
            pagination: {
                page,
                limit,
                total,
                totalPages
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Lister toutes les villes disponibles (pour le filtre)
router.get('/cities', async (req, res) => {
    try {
        const [cities] = await db.query(
            `SELECT DISTINCT city
             FROM church_details
             WHERE city IS NOT NULL AND city != ''
             ORDER BY city ASC`
        );
        res.json(cities.map(c => c.city));
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer une église complète (Admin)
router.get('/churches/:id', async (req, res) => {
    try {
        const [churches] = await db.query(
            `SELECT id, church_name, admin_id, denomination_id, ST_X(location) as longitude, ST_Y(location) as latitude 
             FROM churches WHERE id = ?`,
            [req.params.id]
        );

        if (churches.length === 0) return res.status(404).json({ message: 'Église non trouvée' });
        const church = churches[0];

        const [details] = await db.query('SELECT * FROM church_details WHERE church_id = ?', [church.id]);
        const [socials] = await db.query('SELECT * FROM church_socials WHERE church_id = ?', [church.id]);
        const [schedules] = await db.query('SELECT * FROM church_schedules WHERE church_id = ?', [church.id]);
        const [events] = await db.query(
            `SELECT e.id, e.title, e.start_datetime, e.end_datetime, e.status, ed.description
             FROM events e
             LEFT JOIN event_details ed ON e.id = ed.event_id
             WHERE e.church_id = ?
             ORDER BY e.start_datetime DESC`,
            [church.id]
        );

        res.json({
            ...church,
            details: details[0] || {},
            socials: socials || [],
            schedules: schedules || [],
            events: events || []
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Mettre à jour une église (Admin)
router.put('/churches/:id', async (req, res) => {
    const churchId = req.params.id;
    const {
        church_name, latitude, longitude, denomination_id,
        description, address, phone, website, pastor_name, has_parking, parking_capacity, is_parking_free,
        socials, schedules
    } = req.body;

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Update Church Basic Info
        await connection.query(
            `UPDATE churches 
             SET church_name = ?, location = ST_GeomFromText(?), denomination_id = ? 
             WHERE id = ?`,
            [church_name, `POINT(${longitude} ${latitude})`, denomination_id, churchId]
        );

        // 2. Update Details
        const [existingDetails] = await connection.query('SELECT church_id FROM church_details WHERE church_id = ?', [churchId]);
        const langId = 10; // Default to French
        const detailParams = [
            description || null, address || null, phone || null, website || null,
            pastor_name || null, has_parking ? 1 : 0, parking_capacity || null, is_parking_free ? 1 : 0,
            langId
        ];

        if (existingDetails.length > 0) {
            await connection.query(
                `UPDATE church_details 
                 SET description=?, address=?, phone=?, website=?, pastor_name=?, has_parking=?, parking_capacity=?, is_parking_free=?, language_id=?
                 WHERE church_id=?`,
                [...detailParams, churchId]
            );
        } else {
            await connection.query(
                `INSERT INTO church_details 
                 (description, address, phone, website, pastor_name, has_parking, parking_capacity, is_parking_free, language_id, church_id)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [...detailParams, churchId]
            );
        }

        // 3. Update Socials (Replace)
        await connection.query('DELETE FROM church_socials WHERE church_id = ?', [churchId]);
        if (socials && Array.isArray(socials) && socials.length > 0) {
            const socialValues = socials.map(s => [churchId, s.platform, s.url]);
            await connection.query('INSERT INTO church_socials (church_id, platform, url) VALUES ?', [socialValues]);
        }

        // 4. Update Schedules (Replace)
        await connection.query('DELETE FROM church_schedules WHERE church_id = ?', [churchId]);
        if (schedules && Array.isArray(schedules) && schedules.length > 0) {
            const scheduleValues = schedules.map(s => [churchId, s.activity_type_id, s.day_of_week, s.start_time]);
            await connection.query('INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time) VALUES ?', [scheduleValues]);
        }

        await connection.commit();
        res.json({ message: 'Église mise à jour' });
    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    } finally {
        connection.release();
    }
});

// --- EVENEMENTS ---

// Lister tous les événements (avec pagination, recherche, filtre)
router.get('/events', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const status = req.query.status || ''; // 'PUBLISHED', 'DRAFT', etc.

        // Base Query Logic
        let whereClause = 'WHERE 1=1';
        const params = [];

        // Filter by Status
        if (status && status !== 'ALL') {
            whereClause += ' AND e.status = ?';
            params.push(status);
        }

        // Filter by Search (Title, Church Name, Creator Name)
        if (search) {
            whereClause += ' AND (e.title LIKE ? OR c.church_name LIKE ? OR a.first_name LIKE ? OR a.last_name LIKE ?)';
            const searchParam = `%${search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        // 1. Get Total Count (for pagination meta)
        const [countResult] = await db.query(
            `SELECT COUNT(*) as total 
             FROM events e
             LEFT JOIN churches c ON e.church_id = c.id
             LEFT JOIN admins a ON e.admin_id = a.id
             ${whereClause}`,
            params
        );
        const total = countResult[0].total;

        // 2. Get Data
        const [events] = await db.query(
            `SELECT e.id, e.title, e.start_datetime, e.end_datetime, e.status, c.church_name, a.first_name, a.last_name
             FROM events e
             LEFT JOIN churches c ON e.church_id = c.id
             LEFT JOIN admins a ON e.admin_id = a.id
             ${whereClause}
             ORDER BY e.start_datetime DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            data: events,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Récupérer un événement (Admin)
router.get('/events/:id', async (req, res) => {
    try {
        const [events] = await db.query(
            `SELECT id, title, start_datetime, end_datetime, ST_X(event_location) as longitude, ST_Y(event_location) as latitude 
             FROM events WHERE id = ?`,
            [req.params.id]
        );
        if (events.length === 0) return res.status(404).json({ message: 'Non trouvé' });

        const [details] = await db.query('SELECT * FROM event_details WHERE event_id = ?', [req.params.id]);

        res.json({ ...events[0], details: details[0] || {} });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Modifier un événement (Admin)
router.put('/events/:id', async (req, res) => {
    const { title, start_datetime, end_datetime, latitude, longitude, description, status } = req.body;
    try {
        let updateQuery = 'UPDATE events SET ';
        const updateParams = [];

        if (title) { updateQuery += 'title = ?, '; updateParams.push(title); }
        if (start_datetime) { updateQuery += 'start_datetime = ?, '; updateParams.push(start_datetime); }
        if (end_datetime) { updateQuery += 'end_datetime = ?, '; updateParams.push(end_datetime); }
        if (latitude && longitude) { updateQuery += 'event_location = ST_GeomFromText(?), '; updateParams.push(`POINT(${longitude} ${latitude})`); }
        if (status) { updateQuery += 'status = ?, '; updateParams.push(status); }

        updateQuery = updateQuery.slice(0, -2); // Remove trailing comma
        updateQuery += ' WHERE id = ?';
        updateParams.push(req.params.id);

        if (updateParams.length > 1) { // At least one field + ID
            await db.query(updateQuery, updateParams);
        }

        // Upsert details
        const [existing] = await db.query('SELECT event_id FROM event_details WHERE event_id = ?', [req.params.id]);
        if (existing.length > 0) {
            await db.query('UPDATE event_details SET description=? WHERE event_id=?', [description, req.params.id]);
        } else {
            await db.query('INSERT INTO event_details (event_id, description) VALUES (?,?)', [req.params.id, description]);
        }

        res.json({ message: 'Événement mis à jour' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Supprimer un événement
router.delete('/events/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);
        res.json({ message: 'Événement supprimé' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

// Stats complètes pour Dashboard Analytics
router.get('/stats', async (req, res) => {
    try {
        // 1. Kpis
        const [kpiUsers] = await db.query('SELECT COUNT(*) as count FROM admins WHERE role != "SUPER_ADMIN"');
        const [kpiPending] = await db.query('SELECT COUNT(*) as count FROM admins WHERE status = "PENDING"');
        const [kpiChurches] = await db.query('SELECT COUNT(*) as count FROM churches');
        const [kpiEvents] = await db.query('SELECT COUNT(*) as count FROM events WHERE start_datetime >= NOW()');

        // 2. Répartition par Dénomination
        const [byDenomination] = await db.query(
            `SELECT d.name, COUNT(c.id) as count 
             FROM churches c 
             JOIN denominations d ON c.denomination_id = d.id 
             GROUP BY d.name`
        );

        // 3. Croissance mensuelle (6 derniers mois) - Simplifié
        // Note: Pour une vraie prod, générer la série de mois vide en code JS si besoin
        const [userGrowth] = await db.query(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
             FROM admins 
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month 
             ORDER BY month ASC`
        );

        const [churchGrowth] = await db.query(
            `SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
             FROM churches
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
             GROUP BY month
             ORDER BY month ASC`
        );

        // 4. Répartition des églises par ville (Top 10)
        const [churchesByCity] = await db.query(
            `SELECT cd.city as name, COUNT(c.id) as count
             FROM churches c
             JOIN church_details cd ON c.id = cd.church_id
             WHERE cd.city IS NOT NULL AND cd.city != ''
             GROUP BY cd.city
             ORDER BY count DESC
             LIMIT 10`
        );

        // 5. État des événements (À venir, En cours, Terminés)
        const now = new Date();
        const [eventsStatus] = await db.query(
            `SELECT
                SUM(CASE WHEN start_datetime > NOW() THEN 1 ELSE 0 END) as upcoming,
                SUM(CASE WHEN start_datetime <= NOW() AND end_datetime >= NOW() THEN 1 ELSE 0 END) as ongoing,
                SUM(CASE WHEN end_datetime < NOW() THEN 1 ELSE 0 END) as completed
             FROM events`
        );

        const eventsStatusData = [
            { name: 'À venir', count: parseInt(eventsStatus[0].upcoming) || 0 },
            { name: 'En cours', count: parseInt(eventsStatus[0].ongoing) || 0 },
            { name: 'Terminés', count: parseInt(eventsStatus[0].completed) || 0 }
        ];

        res.json({
            kpi: {
                total_users: kpiUsers[0].count,
                pending_users: kpiPending[0].count,
                total_churches: kpiChurches[0].count,
                upcoming_events: kpiEvents[0].count
            },
            charts: {
                by_denomination: byDenomination,
                churches_by_city: churchesByCity,
                events_status: eventsStatusData,
                growth: {
                    users: userGrowth,
                    churches: churchGrowth
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
});

module.exports = router;
