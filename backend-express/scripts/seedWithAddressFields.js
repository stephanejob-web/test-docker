require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Villes françaises avec codes postaux réels
const FRENCH_CITIES = [
  { name: 'Paris', postalCodes: ['75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008', '75009', '75010'], lat: 48.8566, lng: 2.3522 },
  { name: 'Marseille', postalCodes: ['13001', '13002', '13003', '13004', '13005', '13006', '13007', '13008'], lat: 43.2965, lng: 5.3698 },
  { name: 'Lyon', postalCodes: ['69001', '69002', '69003', '69004', '69005', '69006', '69007', '69008'], lat: 45.7640, lng: 4.8357 },
  { name: 'Toulouse', postalCodes: ['31000', '31100', '31200', '31300', '31400', '31500'], lat: 43.6047, lng: 1.4442 },
  { name: 'Nice', postalCodes: ['06000', '06100', '06200', '06300'], lat: 43.7102, lng: 7.2620 },
  { name: 'Nantes', postalCodes: ['44000', '44100', '44200', '44300'], lat: 47.2184, lng: -1.5536 },
  { name: 'Strasbourg', postalCodes: ['67000', '67100', '67200'], lat: 48.5734, lng: 7.7521 },
  { name: 'Montpellier', postalCodes: ['34000', '34070', '34080', '34090'], lat: 43.6108, lng: 3.8767 },
  { name: 'Bordeaux', postalCodes: ['33000', '33100', '33200', '33300'], lat: 44.8378, lng: -0.5792 },
  { name: 'Lille', postalCodes: ['59000', '59160', '59260', '59777'], lat: 50.6292, lng: 3.0573 },
  { name: 'Rennes', postalCodes: ['35000', '35200', '35700'], lat: 48.1173, lng: -1.6778 },
  { name: 'Reims', postalCodes: ['51100', '51370', '51430'], lat: 49.2583, lng: 4.0317 },
  { name: 'Le Havre', postalCodes: ['76600', '76610', '76620'], lat: 49.4944, lng: 0.1079 },
  { name: 'Saint-Étienne', postalCodes: ['42000', '42100', '42230'], lat: 45.4397, lng: 4.3872 },
  { name: 'Toulon', postalCodes: ['83000', '83100', '83200'], lat: 43.1242, lng: 5.9280 },
  { name: 'Grenoble', postalCodes: ['38000', '38100', '38700'], lat: 45.1885, lng: 5.7245 },
  { name: 'Dijon', postalCodes: ['21000', '21800'], lat: 47.3220, lng: 5.0415 },
  { name: 'Angers', postalCodes: ['49000', '49100'], lat: 47.4784, lng: -0.5632 },
  { name: 'Nîmes', postalCodes: ['30000', '30900'], lat: 43.8367, lng: 4.3601 },
  { name: 'Villeurbanne', postalCodes: ['69100'], lat: 45.7667, lng: 4.8800 },
  { name: 'Le Mans', postalCodes: ['72000', '72100'], lat: 48.0077, lng: 0.1984 },
  { name: 'Aix-en-Provence', postalCodes: ['13080', '13090', '13100'], lat: 43.5297, lng: 5.4474 },
  { name: 'Clermont-Ferrand', postalCodes: ['63000', '63100'], lat: 45.7772, lng: 3.0870 },
  { name: 'Brest', postalCodes: ['29200', '29800'], lat: 48.3905, lng: -4.4861 },
  { name: 'Tours', postalCodes: ['37000', '37100', '37200'], lat: 47.3941, lng: 0.6848 },
  { name: 'Limoges', postalCodes: ['87000', '87100'], lat: 45.8336, lng: 1.2611 },
  { name: 'Amiens', postalCodes: ['80000', '80080'], lat: 49.8941, lng: 2.2958 },
  { name: 'Annecy', postalCodes: ['74000'], lat: 45.8992, lng: 6.1294 },
  { name: 'Perpignan', postalCodes: ['66000', '66100'], lat: 42.6886, lng: 2.8948 },
  { name: 'Besançon', postalCodes: ['25000'], lat: 47.2380, lng: 6.0243 },
  { name: 'Orléans', postalCodes: ['45000', '45100'], lat: 47.9029, lng: 1.9093 },
  { name: 'Mulhouse', postalCodes: ['68100', '68200'], lat: 47.7508, lng: 7.3359 },
  { name: 'Rouen', postalCodes: ['76000', '76100'], lat: 49.4432, lng: 1.0993 },
  { name: 'Caen', postalCodes: ['14000'], lat: 49.1829, lng: -0.3707 },
  { name: 'Nancy', postalCodes: ['54000', '54100'], lat: 48.6921, lng: 6.1844 },
];

// Noms de rues françaises réalistes
const STREET_NAMES = [
  'Rue de la Paix', 'Avenue Victor Hugo', 'Boulevard de la République', 'Rue Jean Jaurès',
  'Place de la Liberté', 'Avenue Charles de Gaulle', 'Rue Gambetta', 'Boulevard Voltaire',
  'Rue de la Victoire', 'Avenue de la Grâce', 'Rue du Temple', 'Place de l\'Église',
  'Avenue du Pasteur Martin Luther King', 'Rue de la Pentecôte', 'Boulevard de l\'Espérance',
  'Rue Saint-Paul', 'Avenue des Apôtres', 'Rue de Bethléem', 'Place de la Foi',
  'Boulevard de la Renaissance', 'Rue du Calvaire', 'Avenue de la Croix', 'Rue Emmanuel',
  'Place de la Grâce', 'Boulevard de la Rédemption', 'Rue de Sion', 'Avenue de Jérusalem',
  'Rue des Martyrs', 'Place du Réveil', 'Boulevard de la Mission', 'Rue de la Prière',
  'Avenue des Prophètes', 'Rue de la Louange', 'Place de l\'Adoration', 'Boulevard du Salut',
];

// Préfixes pour noms d'églises
const CHURCH_PREFIXES = [
  'Église Évangélique', 'Assemblée de Dieu', 'Église Baptiste', 'Église Pentecôtiste',
  'Centre Chrétien', 'Communauté Évangélique', 'Mission Évangélique', 'Église de Réveil',
  'Temple Protestant', 'Maison de Prière', 'Église du Plein Évangile', 'Église de la Grâce',
  'Église de la Foi', 'Centre de Vie', 'Église Nouvelle Vie',
];

// Suffixes pour noms d'églises
const CHURCH_SUFFIXES = [
  '', 'La Source', 'Le Rocher', 'Bethel', 'Shalom', 'Emmanuel', 'La Bonne Nouvelle',
  'La Lumière', 'Le Refuge', 'La Victoire', 'L\'Espérance', 'La Grâce', 'Le Bon Berger',
  'La Pentecôte', 'Le Réveil',
];

// Prénoms français
const FIRST_NAMES = [
  'Jean', 'Pierre', 'Paul', 'Jacques', 'Michel', 'André', 'Philippe', 'Marc', 'Luc', 'Matthieu',
  'François', 'Daniel', 'Joseph', 'David', 'Étienne', 'Thomas', 'Nicolas', 'Laurent', 'Olivier', 'Patrick',
  'Marie', 'Anne', 'Sophie', 'Claire', 'Élise', 'Isabelle', 'Catherine', 'Sylvie', 'Martine', 'Monique',
  'Christophe', 'Sébastien', 'Julien', 'Alexandre', 'Antoine', 'Benjamin', 'Maxime', 'Simon', 'Samuel', 'Nathan',
  'Emmanuel', 'Gabriel', 'Raphaël', 'Jonathan', 'Josué', 'Élie', 'Ézéchiel', 'Timothée', 'Barnabé', 'Abel',
];

// Noms de famille français
const LAST_NAMES = [
  'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau',
  'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier',
  'Morel', 'Girard', 'André', 'Lefèvre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez',
  'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas',
  'Perrin', 'Morin', 'Mathieu', 'Clement', 'Gauthier', 'Dumont', 'Lopez', 'Fontaine', 'Chevalier', 'Robin',
];

// Fonction utilitaire pour choix aléatoire
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Fonction pour générer un email unique
function generateEmail(firstName, lastName, index) {
  const cleanFirst = firstName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const cleanLast = lastName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return `${cleanFirst}.${cleanLast}${index}@eglise-france.fr`;
}

// Fonction pour ajouter une variation aléatoire aux coordonnées
function addRandomOffset(coord, isLatitude) {
  const offset = (Math.random() - 0.5) * 0.1; // +/- 5km
  return coord + offset;
}

async function seedWithAddressFields() {
  const connection = await pool.getConnection();

  try {
    console.log('🚀 Début du seeding avec nouveaux champs d\'adresse...\n');
    const startTime = Date.now();

    await connection.beginTransaction();

    // 1. Récupérer les IDs des dénominations et langues
    const [denominations] = await connection.query('SELECT id FROM denominations WHERE is_active = 1');
    const [languages] = await connection.query('SELECT id FROM languages WHERE is_active = 1');
    const [activityTypes] = await connection.query('SELECT id FROM activity_types');

    const denominationIds = denominations.map(d => d.id);
    const languageIds = languages.map(l => l.id);
    const activityTypeIds = activityTypes.map(a => a.id);

    console.log(`📊 Dénominations disponibles: ${denominationIds.length}`);
    console.log(`📊 Langues disponibles: ${languageIds.length}`);
    console.log(`📊 Types d'activités disponibles: ${activityTypeIds.length}\n`);

    // 2. Créer 500 pasteurs
    console.log('👥 Création de 500 pasteurs...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const pastors = [];
    const pastorEmails = [];

    for (let i = 0; i < 500; i++) {
      const firstName = randomChoice(FIRST_NAMES);
      const lastName = randomChoice(LAST_NAMES);
      const email = generateEmail(firstName, lastName, i + Date.now());

      pastors.push([
        email,
        hashedPassword,
        'PASTOR',
        'VALIDATED',
        firstName,
        lastName
      ]);
      pastorEmails.push(email);
    }

    // Insertion des pasteurs
    const batchSize = 100;
    for (let i = 0; i < pastors.length; i += batchSize) {
      const batch = pastors.slice(i, i + batchSize);
      await connection.query(
        `INSERT INTO admins (email, password_hash, role, status, first_name, last_name) VALUES ?`,
        [batch]
      );
      console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pastors.length / batchSize)} (${batch.length} pasteurs)`);
    }

    // Récupérer les IDs des pasteurs créés
    const [createdPastors] = await connection.query(
      `SELECT id, email FROM admins WHERE email IN (?)`,
      [pastorEmails]
    );
    console.log(`✅ ${createdPastors.length} pasteurs créés\n`);

    // 3. Créer 500 églises avec adresses complètes
    console.log('⛪ Création de 500 églises avec adresses détaillées...');
    const churches = [];
    const churchesData = [];

    for (let i = 0; i < createdPastors.length; i++) {
      const pastor = createdPastors[i];
      const city = randomChoice(FRENCH_CITIES);
      const prefix = randomChoice(CHURCH_PREFIXES);
      const suffix = randomChoice(CHURCH_SUFFIXES);
      const churchName = suffix ? `${prefix} ${suffix} - ${city.name}` : `${prefix} de ${city.name}`;

      // Coordonnées avec variation aléatoire
      const lat = addRandomOffset(city.lat, true);
      const lng = addRandomOffset(city.lng, false);

      // Générer une adresse complète
      const streetNumber = String(Math.floor(Math.random() * 200) + 1);
      const streetName = randomChoice(STREET_NAMES);
      const postalCode = randomChoice(city.postalCodes);

      churches.push([
        pastor.id,
        randomChoice(denominationIds),
        churchName,
        lng,
        lat
      ]);

      churchesData.push({
        pastorId: pastor.id,
        city: city.name,
        churchName: churchName,
        streetNumber: streetNumber,
        streetName: streetName,
        postalCode: postalCode
      });
    }

    // Insertion des églises
    for (let i = 0; i < churches.length; i += batchSize) {
      const batch = churches.slice(i, i + batchSize);
      const values = batch.map(c =>
        `(${c[0]}, ${c[1]}, ${connection.escape(c[2])}, ST_PointFromText('POINT(${c[3]} ${c[4]})'))`
      ).join(', ');

      await connection.query(
        `INSERT INTO churches (admin_id, denomination_id, church_name, location) VALUES ${values}`
      );
      console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(churches.length / batchSize)} (${batch.length} églises)`);
    }

    // Récupérer les IDs des églises créées
    const [createdChurches] = await connection.query(
      `SELECT id, admin_id FROM churches WHERE admin_id IN (?)`,
      [createdPastors.map(p => p.id)]
    );
    console.log(`✅ ${createdChurches.length} églises créées\n`);

    // 4. Créer les détails des églises avec les nouveaux champs d'adresse
    console.log('📝 Création des détails avec champs d\'adresse...');
    const churchDetails = [];

    for (let i = 0; i < createdChurches.length; i++) {
      const church = createdChurches[i];
      const cityData = churchesData[i];
      const pastor = createdPastors.find(p => p.id === church.admin_id);

      // Construire l'adresse complète à partir des nouveaux champs
      const fullAddress = `${cityData.streetNumber} ${cityData.streetName}, ${cityData.postalCode} ${cityData.city}`;

      churchDetails.push([
        church.id,
        'ACTIVE',
        randomChoice(languageIds),
        `Pasteur ${pastor ? pastor.email.split('@')[0].replace('.', ' ').replace(/\d+/g, '') : 'Anonyme'}`,
        null, // logo_url
        fullAddress,
        cityData.streetNumber,
        cityData.streetName,
        cityData.postalCode,
        cityData.city,
        `0${Math.floor(Math.random() * 9) + 1}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        `Une église accueillante et dynamique située au ${cityData.streetNumber} ${cityData.streetName} à ${cityData.city}. Nous prêchons l'Évangile de Jésus-Christ avec passion et authenticité.`,
        Math.random() > 0.7 ? `https://eglise-${cityData.city.toLowerCase().replace(/[^a-z0-9]/g, '')}.fr` : null,
        Math.random() > 0.3 ? 1 : 0,
        Math.random() > 0.3 ? Math.floor(Math.random() * 150) + 20 : null,
        1
      ]);
    }

    for (let i = 0; i < churchDetails.length; i += batchSize) {
      const batch = churchDetails.slice(i, i + batchSize);
      await connection.query(
        `INSERT INTO church_details
        (church_id, status, language_id, pastor_name, logo_url, address, street_number, street_name, postal_code, city, phone, description, website, has_parking, parking_capacity, is_parking_free)
        VALUES ?`,
        [batch]
      );
      console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(churchDetails.length / batchSize)}`);
    }
    console.log(`✅ ${churchDetails.length} détails d'églises créés avec champs d'adresse\n`);

    // 5. Créer les horaires des églises
    console.log('🕐 Création des horaires...');
    const schedules = [];
    const days = ['SUNDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const times = ['09:00:00', '10:00:00', '18:00:00', '19:00:00', '19:30:00', '20:00:00'];

    for (const church of createdChurches) {
      // Culte du dimanche
      schedules.push([church.id, randomChoice(activityTypeIds), 'SUNDAY', randomChoice(['09:00:00', '10:00:00', '10:30:00'])]);

      // Activités supplémentaires
      const extraActivities = Math.floor(Math.random() * 2) + 1;
      for (let i = 0; i < extraActivities; i++) {
        schedules.push([
          church.id,
          randomChoice(activityTypeIds),
          randomChoice(days.filter(d => d !== 'SUNDAY')),
          randomChoice(times)
        ]);
      }
    }

    for (let i = 0; i < schedules.length; i += batchSize) {
      const batch = schedules.slice(i, i + batchSize);
      await connection.query(
        `INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time) VALUES ?`,
        [batch]
      );
      console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(schedules.length / batchSize)}`);
    }
    console.log(`✅ ${schedules.length} horaires créés\n`);

    // 6. Créer les réseaux sociaux
    console.log('📱 Création des réseaux sociaux...');
    const socials = [];
    const platforms = ['FACEBOOK', 'INSTAGRAM', 'YOUTUBE'];

    for (const church of createdChurches) {
      if (Math.random() > 0.5) {
        const numPlatforms = Math.floor(Math.random() * 3) + 1;
        const selectedPlatforms = [...platforms].sort(() => 0.5 - Math.random()).slice(0, numPlatforms);

        for (const platform of selectedPlatforms) {
          const churchName = churchesData.find(cd => cd.pastorId === church.admin_id)?.churchName || 'eglise';
          const slug = churchName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');

          let url;
          if (platform === 'FACEBOOK') url = `https://facebook.com/${slug}`;
          else if (platform === 'INSTAGRAM') url = `https://instagram.com/${slug}`;
          else if (platform === 'YOUTUBE') url = `https://youtube.com/@${slug}`;

          socials.push([church.id, platform, url]);
        }
      }
    }

    if (socials.length > 0) {
      for (let i = 0; i < socials.length; i += batchSize) {
        const batch = socials.slice(i, i + batchSize);
        await connection.query(
          `INSERT INTO church_socials (church_id, platform, url) VALUES ?`,
          [batch]
        );
        console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(socials.length / batchSize)}`);
      }
    }
    console.log(`✅ ${socials.length} réseaux sociaux créés\n`);

    await connection.commit();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n✅ ========================================');
    console.log('✅ SEEDING TERMINÉ AVEC SUCCÈS !');
    console.log('✅ ========================================\n');
    console.log(`📊 STATISTIQUES:`);
    console.log(`   • ${createdPastors.length} pasteurs créés`);
    console.log(`   • ${createdChurches.length} églises créées`);
    console.log(`   • ${churchDetails.length} détails d'églises avec adresses complètes`);
    console.log(`   • ${schedules.length} horaires créés`);
    console.log(`   • ${socials.length} réseaux sociaux créés`);
    console.log(`   • Durée totale: ${duration} secondes\n`);
    console.log(`🔐 Tous les pasteurs ont le mot de passe: password123`);
    console.log(`📧 Exemple d'email: ${pastorEmails[0]}\n`);

  } catch (error) {
    await connection.rollback();
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Exécution
seedWithAddressFields()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
