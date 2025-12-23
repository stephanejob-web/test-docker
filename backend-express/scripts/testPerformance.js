require('dotenv').config();
const pool = require('../config/db');

async function testPerformance() {
  try {
    console.log('🚀 Test de performance de la base de données\n');

    // Test 1: Compter les églises
    console.log('=== Test 1: Compter toutes les églises ===');
    let start = Date.now();
    const [countResult] = await pool.query('SELECT COUNT(*) as total FROM churches');
    console.log(`Temps: ${Date.now() - start}ms`);
    console.log(`Total: ${countResult[0].total} églises\n`);

    // Test 2: Récupérer 20 églises avec pagination
    console.log('=== Test 2: Récupérer 20 églises (page 1) ===');
    start = Date.now();
    const [churches] = await pool.query(`
      SELECT c.id, c.church_name, c.latitude, c.longitude,
             cd.pastor_name, cd.address, cd.phone
      FROM churches c
      LEFT JOIN church_details cd ON c.id = cd.church_id
      LIMIT 20 OFFSET 0
    `);
    console.log(`Temps: ${Date.now() - start}ms`);
    console.log(`Églises retournées: ${churches.length}\n`);

    // Test 3: Récupérer 20 événements avec pagination
    console.log('=== Test 3: Récupérer 20 événements (page 1) ===');
    start = Date.now();
    const [events] = await pool.query(`
      SELECT e.id, e.title, e.start_datetime, e.end_datetime,
             e.latitude, e.longitude, e.status,
             ed.description, ed.speaker_name
      FROM events e
      LEFT JOIN event_details ed ON e.id = ed.event_id
      WHERE e.status = 'PUBLISHED'
      ORDER BY e.start_datetime DESC
      LIMIT 20 OFFSET 0
    `);
    console.log(`Temps: ${Date.now() - start}ms`);
    console.log(`Événements retournés: ${events.length}\n`);

    // Test 4: Requête complexe avec JOIN multiple
    console.log('=== Test 4: Requête complexe (église + détails + horaires + réseaux sociaux) ===');
    start = Date.now();
    const [complexQuery] = await pool.query(`
      SELECT
        c.id,
        c.church_name,
        c.latitude,
        c.longitude,
        cd.pastor_name,
        cd.description,
        cd.phone,
        cd.address,
        cd.website,
        GROUP_CONCAT(DISTINCT CONCAT(cs.platform, ':', cs.url) SEPARATOR '|') as socials,
        GROUP_CONCAT(DISTINCT CONCAT(sch.day_of_week, ':', sch.start_time) SEPARATOR '|') as schedules
      FROM churches c
      LEFT JOIN church_details cd ON c.id = cd.church_id
      LEFT JOIN church_socials cs ON c.id = cs.church_id
      LEFT JOIN church_schedules sch ON c.id = sch.church_id
      GROUP BY c.id
      LIMIT 10
    `);
    console.log(`Temps: ${Date.now() - start}ms`);
    console.log(`Églises avec détails complets: ${complexQuery.length}\n`);

    // Test 5: Recherche full-text
    console.log('=== Test 5: Recherche full-text sur les églises (mot "Évangélique") ===');
    start = Date.now();
    const [searchResult] = await pool.query(`
      SELECT c.id, c.church_name, cd.description
      FROM churches c
      LEFT JOIN church_details cd ON c.id = cd.church_id
      WHERE MATCH(c.church_name) AGAINST(? IN BOOLEAN MODE)
      LIMIT 20
    `, ['Évangélique']);
    console.log(`Temps: ${Date.now() - start}ms`);
    console.log(`Résultats trouvés: ${searchResult.length}\n`);

    // Test 6: Statistiques du dashboard
    console.log('=== Test 6: Statistiques dashboard (requête complexe) ===');
    start = Date.now();
    const [stats] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM admins) as totalUsers,
        (SELECT COUNT(*) FROM churches) as totalChurches,
        (SELECT COUNT(*) FROM events WHERE status = 'PUBLISHED' AND start_datetime > NOW()) as upcomingEvents
    `);
    console.log(`Temps: ${Date.now() - start}ms`);
    console.log(`Stats:`, stats[0]);
    console.log('');

    // Test 7: Page 50 (milieu de la pagination)
    console.log('=== Test 7: Pagination page 50 (offset 980) ===');
    start = Date.now();
    const [page50] = await pool.query(`
      SELECT c.id, c.church_name, cd.pastor_name
      FROM churches c
      LEFT JOIN church_details cd ON c.id = cd.church_id
      LIMIT 20 OFFSET 980
    `);
    console.log(`Temps: ${Date.now() - start}ms`);
    console.log(`Églises retournées: ${page50.length}\n`);

    // Test 8: Dernière page (page 150)
    console.log('=== Test 8: Dernière page (offset 2980) ===');
    start = Date.now();
    const [lastPage] = await pool.query(`
      SELECT c.id, c.church_name, cd.pastor_name
      FROM churches c
      LEFT JOIN church_details cd ON c.id = cd.church_id
      LIMIT 20 OFFSET 2980
    `);
    console.log(`Temps: ${Date.now() - start}ms`);
    console.log(`Églises retournées: ${lastPage.length}\n`);

    console.log('✅ Tous les tests sont terminés !');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await pool.end();
  }
}

testPerformance();
