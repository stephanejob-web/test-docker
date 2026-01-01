});

/**
 * Route publique : POST /api/public/events/:id/interest
 * Permet à un utilisateur mobile de montrer son intérêt pour un événement
 * Body: { device_id: string }
 */
router.post('/events/:id/interest', [
    param('id').isInt({ min: 1 })
], async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { device_id } = req.body;

        if (!device_id) {
            return res.status(400).json({
                success: false,
                message: 'device_id est requis'
            });
        }

        // Vérifier que l'événement existe et n'est pas annulé
        const [events] = await db.query(
            `SELECT id, cancelled_at FROM events WHERE id = ?`,
            [eventId]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        if (events[0].cancelled_at) {
            return res.status(400).json({
                success: false,
                message: 'Cet événement a été annulé'
            });
        }

        // Vérifier que le device_id existe dans push_tokens
        const [devices] = await db.query(
            `SELECT device_id FROM push_tokens WHERE device_id = ?`,
            [device_id]
        );

        if (devices.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Device non enregistré pour les notifications'
            });
        }

        // Insérer l'intérêt (ignore si déjà existant grâce à UNIQUE)
        await db.query(
            `INSERT IGNORE INTO event_interests (event_id, device_id) VALUES (?, ?)`,
            [eventId, device_id]
        );

        // Mettre à jour le compteur
        await db.query(
            `UPDATE events SET interested_count = (
                SELECT COUNT(*) FROM event_interests WHERE event_id = ?
            ) WHERE id = ?`,
            [eventId, eventId]
        );

        // Récupérer le nouveau total
        const [result] = await db.query(
            `SELECT interested_count FROM events WHERE id = ?`,
            [eventId]
        );

        res.json({
            success: true,
            message: 'Intérêt enregistré avec succès',
            interested_count: result[0].interested_count
        });

    } catch (err) {
        console.error('Error adding interest:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'enregistrement de l\'intérêt'
        });
    }
});

/**
 * Route publique : DELETE /api/public/events/:id/interest
 * Permet à un utilisateur mobile de retirer son intérêt pour un événement
 * Body: { device_id: string }
 */
router.delete('/events/:id/interest', [
    param('id').isInt({ min: 1 })
], async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { device_id } = req.body;

        if (!device_id) {
            return res.status(400).json({
                success: false,
                message: 'device_id est requis'
            });
        }

        // Supprimer l'intérêt
        const [result] = await db.query(
            `DELETE FROM event_interests WHERE event_id = ? AND device_id = ?`,
            [eventId, device_id]
        );

        // Mettre à jour le compteur
        await db.query(
            `UPDATE events SET interested_count = (
                SELECT COUNT(*) FROM event_interests WHERE event_id = ?
            ) WHERE id = ?`,
            [eventId, eventId]
        );

        // Récupérer le nouveau total
        const [countResult] = await db.query(
            `SELECT interested_count FROM events WHERE id = ?`,
            [eventId]
        );

        res.json({
            success: true,
            message: 'Intérêt retiré avec succès',
            interested_count: countResult[0].interested_count,
            removed: result.affectedRows > 0
        });

    } catch (err) {
        console.error('Error removing interest:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors du retrait de l\'intérêt'
        });
    }
});

/**
 * Route publique : GET /api/public/events/:id/interested-count
 * Récupère le nombre de personnes intéressées par un événement
 */
router.get('/events/:id/interested-count', [
    param('id').isInt({ min: 1 })
], async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);

        const [result] = await db.query(
            `SELECT interested_count FROM events WHERE id = ?`,
            [eventId]
        );

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Événement non trouvé'
            });
        }

        res.json({
            success: true,
            interested_count: result[0].interested_count || 0
        });

    } catch (err) {
        console.error('Error fetching interested count:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du compteur'
        });
    }
});

/**
 * Route publique : GET /api/public/events/:id/is-interested
 * Vérifie si un device est intéressé par un événement
 * Query: device_id
 */
router.get('/events/:id/is-interested', [
    param('id').isInt({ min: 1 }),
    query('device_id').notEmpty()
], async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const { device_id } = req.query;

        const [result] = await db.query(
            `SELECT id FROM event_interests WHERE event_id = ? AND device_id = ?`,
            [eventId, device_id]
        );

        res.json({
            success: true,
            is_interested: result.length > 0
        });

    } catch (err) {
        console.error('Error checking interest:', err);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la vérification'
        });
