const cron = require('node-cron');
const db = require('../config/db');

// Tâche planifiée : S'exécute toutes les heures
// Met à jour le statut des événements dont la date de fin est passée
const initEventCron = () => {
    cron.schedule('0 * * * *', async () => {
        console.log('[CRON] Vérification des événements terminés...');

        try {
            const [result] = await db.query(`
        UPDATE events 
        SET status = 'COMPLETED' 
        WHERE end_datetime < NOW() 
        AND status = 'PUBLISHED'
      `);

            if (result.changedRows > 0) {
                console.log(`[CRON] ${result.changedRows} événement(s) marqué(s) comme terminés.`);
            } else {
                console.log('[CRON] Aucun événement à mettre à jour.');
            }
        } catch (error) {
            console.error('[CRON] Erreur lors de la mise à jour des événements :', error);
        }
    });

    console.log('[CRON] Tâche de mise à jour des événements initialisée.');
};

module.exports = initEventCron;
