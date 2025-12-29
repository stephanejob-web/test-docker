require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// Vraies villes françaises avec coordonnées GPS réelles
const FRENCH_CITIES = [
  { name: 'Paris', lat: 48.8566, lng: 2.3522, region: 'Île-de-France' },
  { name: 'Marseille', lat: 43.2965, lng: 5.3698, region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Lyon', lat: 45.7640, lng: 4.8357, region: 'Auvergne-Rhône-Alpes' },
  { name: 'Toulouse', lat: 43.6047, lng: 1.4442, region: 'Occitanie' },
  { name: 'Nice', lat: 43.7102, lng: 7.2620, region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Nantes', lat: 47.2184, lng: -1.5536, region: 'Pays de la Loire' },
  { name: 'Strasbourg', lat: 48.5734, lng: 7.7521, region: 'Grand Est' },
  { name: 'Montpellier', lat: 43.6108, lng: 3.8767, region: 'Occitanie' },
  { name: 'Bordeaux', lat: 44.8378, lng: -0.5792, region: 'Nouvelle-Aquitaine' },
  { name: 'Lille', lat: 50.6292, lng: 3.0573, region: 'Hauts-de-France' },
  { name: 'Rennes', lat: 48.1173, lng: -1.6778, region: 'Bretagne' },
  { name: 'Reims', lat: 49.2583, lng: 4.0317, region: 'Grand Est' },
  { name: 'Le Havre', lat: 49.4944, lng: 0.1079, region: 'Normandie' },
  { name: 'Saint-Étienne', lat: 45.4397, lng: 4.3872, region: 'Auvergne-Rhône-Alpes' },
  { name: 'Toulon', lat: 43.1242, lng: 5.9280, region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Grenoble', lat: 45.1885, lng: 5.7245, region: 'Auvergne-Rhône-Alpes' },
  { name: 'Dijon', lat: 47.3220, lng: 5.0415, region: 'Bourgogne-Franche-Comté' },
  { name: 'Angers', lat: 47.4784, lng: -0.5632, region: 'Pays de la Loire' },
  { name: 'Nîmes', lat: 43.8367, lng: 4.3601, region: 'Occitanie' },
  { name: 'Villeurbanne', lat: 45.7667, lng: 4.8800, region: 'Auvergne-Rhône-Alpes' },
  { name: 'Le Mans', lat: 48.0077, lng: 0.1984, region: 'Pays de la Loire' },
  { name: 'Aix-en-Provence', lat: 43.5297, lng: 5.4474, region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Clermont-Ferrand', lat: 45.7772, lng: 3.0870, region: 'Auvergne-Rhône-Alpes' },
  { name: 'Brest', lat: 48.3905, lng: -4.4861, region: 'Bretagne' },
  { name: 'Tours', lat: 47.3941, lng: 0.6848, region: 'Centre-Val de Loire' },
  { name: 'Limoges', lat: 45.8336, lng: 1.2611, region: 'Nouvelle-Aquitaine' },
  { name: 'Amiens', lat: 49.8941, lng: 2.2958, region: 'Hauts-de-France' },
  { name: 'Annecy', lat: 45.8992, lng: 6.1294, region: 'Auvergne-Rhône-Alpes' },
  { name: 'Perpignan', lat: 42.6886, lng: 2.8948, region: 'Occitanie' },
  { name: 'Besançon', lat: 47.2380, lng: 6.0243, region: 'Bourgogne-Franche-Comté' },
  { name: 'Orléans', lat: 47.9029, lng: 1.9093, region: 'Centre-Val de Loire' },
  { name: 'Mulhouse', lat: 47.7508, lng: 7.3359, region: 'Grand Est' },
  { name: 'Rouen', lat: 49.4432, lng: 1.0993, region: 'Normandie' },
  { name: 'Caen', lat: 49.1829, lng: -0.3707, region: 'Normandie' },
  { name: 'Nancy', lat: 48.6921, lng: 6.1844, region: 'Grand Est' },
  { name: 'Argenteuil', lat: 48.9475, lng: 2.2469, region: 'Île-de-France' },
  { name: 'Montreuil', lat: 48.8634, lng: 2.4430, region: 'Île-de-France' },
  { name: 'Saint-Denis', lat: 48.9362, lng: 2.3574, region: 'Île-de-France' },
  { name: 'Roubaix', lat: 50.6942, lng: 3.1746, region: 'Hauts-de-France' },
  { name: 'Tourcoing', lat: 50.7236, lng: 3.1609, region: 'Hauts-de-France' },
  { name: 'Avignon', lat: 43.9493, lng: 4.8055, region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Poitiers', lat: 46.5802, lng: 0.3404, region: 'Nouvelle-Aquitaine' },
  { name: 'Versailles', lat: 48.8049, lng: 2.1204, region: 'Île-de-France' },
  { name: 'Pau', lat: 43.2951, lng: -0.3708, region: 'Nouvelle-Aquitaine' },
  { name: 'La Rochelle', lat: 46.1603, lng: -1.1511, region: 'Nouvelle-Aquitaine' },
  { name: 'Calais', lat: 50.9513, lng: 1.8587, region: 'Hauts-de-France' },
  { name: 'Cannes', lat: 43.5528, lng: 7.0174, region: 'Provence-Alpes-Côte d\'Azur' },
  { name: 'Boulogne-Billancourt', lat: 48.8356, lng: 2.2410, region: 'Île-de-France' },
  { name: 'Colmar', lat: 48.0777, lng: 7.3579, region: 'Grand Est' },
  { name: 'Bourges', lat: 47.0844, lng: 2.3964, region: 'Centre-Val de Loire' },
  { name: 'Dunkerque', lat: 51.0343, lng: 2.3768, region: 'Hauts-de-France' },
  { name: 'Chambéry', lat: 45.5646, lng: 5.9178, region: 'Auvergne-Rhône-Alpes' },
  { name: 'Troyes', lat: 48.2973, lng: 4.0744, region: 'Grand Est' },
  { name: 'Metz', lat: 49.1193, lng: 6.1757, region: 'Grand Est' },
  { name: 'Créteil', lat: 48.7903, lng: 2.4555, region: 'Île-de-France' },
  { name: 'Valence', lat: 44.9334, lng: 4.8924, region: 'Auvergne-Rhône-Alpes' },
  { name: 'Nanterre', lat: 48.8924, lng: 2.2069, region: 'Île-de-France' },
  { name: 'Ajaccio', lat: 41.9270, lng: 8.7369, region: 'Corse' },
  { name: 'Cholet', lat: 47.0594, lng: -0.8794, region: 'Pays de la Loire' },
  { name: 'Lorient', lat: 47.7482, lng: -3.3706, region: 'Bretagne' },

  // La Réunion (974) - DOM-TOM
  { name: 'Saint-Denis', lat: -20.8823, lng: 55.4504, region: 'La Réunion' },
  { name: 'Saint-Paul', lat: -21.0096, lng: 55.2708, region: 'La Réunion' },
  { name: 'Saint-Pierre', lat: -21.3393, lng: 55.4781, region: 'La Réunion' },
  { name: 'Le Tampon', lat: -21.2778, lng: 55.5153, region: 'La Réunion' },
  { name: 'Saint-André', lat: -20.9628, lng: 55.6544, region: 'La Réunion' },
  { name: 'Saint-Louis', lat: -21.2817, lng: 55.4098, region: 'La Réunion' },
  { name: 'Saint-Benoît', lat: -21.0341, lng: 55.7129, region: 'La Réunion' },
  { name: 'Le Port', lat: -20.9374, lng: 55.2967, region: 'La Réunion' },
  { name: 'Saint-Joseph', lat: -21.3763, lng: 55.6170, region: 'La Réunion' },
  { name: 'Saint-Leu', lat: -21.1700, lng: 55.2889, region: 'La Réunion' },
  { name: 'La Possession', lat: -20.9400, lng: 55.3300, region: 'La Réunion' },
  { name: 'Sainte-Marie', lat: -20.8976, lng: 55.5485, region: 'La Réunion' },
  { name: 'Sainte-Suzanne', lat: -20.9063, lng: 55.6062, region: 'La Réunion' },
  { name: 'Petite-Île', lat: -21.3375, lng: 55.5647, region: 'La Réunion' },
  { name: 'Bras-Panon', lat: -21.0176, lng: 55.6837, region: 'La Réunion' },
  { name: 'Saint-Philippe', lat: -21.3589, lng: 55.7692, region: 'La Réunion' },
  { name: 'Entre-Deux', lat: -21.2481, lng: 55.4681, region: 'La Réunion' },
  { name: 'Cilaos', lat: -21.1367, lng: 55.4722, region: 'La Réunion' },
  { name: 'Salazie', lat: -21.0331, lng: 55.5392, region: 'La Réunion' },
  { name: 'Les Avirons', lat: -21.2400, lng: 55.3372, region: 'La Réunion' },
];

// Préfixes pour noms d'églises
const CHURCH_PREFIXES = [
  'Église Évangélique',
  'Assemblée de Dieu',
  'Église Baptiste',
  'Église Pentecôtiste',
  'Centre Chrétien',
  'Communauté Évangélique',
  'Mission Évangélique',
  'Église de Réveil',
  'Temple Protestant',
  'Maison de Prière',
  'Église du Plein Évangile',
  'Église de la Grâce',
  'Église de la Foi',
  'Centre de Vie',
  'Église Nouvelle Vie',
];

// Suffixes pour noms d'églises
const CHURCH_SUFFIXES = [
  '',
  'La Source',
  'Le Rocher',
  'Bethel',
  'Shalom',
  'Emmanuel',
  'La Bonne Nouvelle',
  'La Lumière',
  'Le Refuge',
  'La Victoire',
  'L\'Espérance',
  'La Grâce',
  'Le Bon Berger',
  'La Pentecôte',
  'Le Réveil',
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

// Titres d'événements
const EVENT_TITLES = [
  'Culte de Réveil', 'Conférence Prophétique', 'Séminaire de Prière', 'Concert de Louange',
  'Retraite Spirituelle', 'Évangélisation de Masse', 'Conférence Missionnaire', 'Nuit de Prière',
  'Rencontre Jeunesse', 'Camp d\'Été', 'Journée de Jeûne et Prière', 'Séminaire Biblique',
  'Concert Gospel', 'Fête de Pâques', 'Célébration de Pentecôte', 'Culte de Noël',
  'Soirée de Louange', 'Conférence de Guérison', 'Marche pour Jésus', 'Festival de Musique Chrétienne',
  'Atelier de Discipulat', 'Rencontre Couples', 'Culte en Plein Air', 'Baptêmes',
  'Conférence Famille', 'Journée Portes Ouvertes', 'Culte de Rentrée', 'Soirée Témoignages',
];

// Noms d'orateurs
const SPEAKERS = [
  'Pasteur Jean-Claude Florin', 'Dr. Daniel Kolenda', 'Pasteur Yvan Castanou', 'Mamadou Karambiri',
  'Pasteur Marcello Tunasi', 'Évangéliste Reinhard Bonnke', 'Pasteur Paul Ohlott', 'Dr. Mensa Otabil',
  'Pasteur Alain Aghedu', 'Évangéliste Dag Heward-Mills', 'Pasteur Shora Kuetu', 'Dr. T.L. Osborn',
  'Pasteur Henri Viaud-Murat', 'Évangéliste Emmanuel Eni', 'Pasteur Yohann Tourne', 'Dr. David Yonggi Cho',
  'Pasteur Samuel Peterschmitt', 'Évangéliste Benny Hinn', 'Pasteur Mohammed Sanogo', 'Dr. Myles Munroe',
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

// Fonction pour ajouter une variation aléatoire aux coordonnées (pour ne pas avoir toutes les églises au même endroit)
function addRandomOffset(coord, isLatitude) {
  // Ajoute +/- 0.05 degrés (environ 5km)
  const offset = (Math.random() - 0.5) * 0.1;
  return coord + offset;
}

// Fonction pour générer une date future aléatoire
function randomFutureDate(daysFromNow, daysRange) {
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);
  const end = new Date(start);
  end.setDate(end.getDate() + daysRange);
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

async function massiveSeedData() {
  const connection = await pool.getConnection();

  try {
    console.log('🚀 Début du seeding massif...\n');
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

    // 2. Créer les pasteurs
    console.log('👥 Création de 3000 pasteurs...');
    const hashedPassword = await bcrypt.hash('password123', 10);
    const pastors = [];
    const pastorEmails = [];

    for (let i = 0; i < 3000; i++) {
      const firstName = randomChoice(FIRST_NAMES);
      const lastName = randomChoice(LAST_NAMES);
      const email = generateEmail(firstName, lastName, i);

      pastors.push([
        email,
        hashedPassword,
        'PASTOR',
        'VALIDATED',
        firstName,
        lastName,
        true // allow_network_visibility
      ]);
      pastorEmails.push(email);
    }

    // Insertion par lots de 500
    const batchSize = 500;
    for (let i = 0; i < pastors.length; i += batchSize) {
      const batch = pastors.slice(i, i + batchSize);
      await connection.query(
        `INSERT INTO admins (email, password_hash, role, status, first_name, last_name, allow_network_visibility) VALUES ?`,
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

    // 3. Créer les églises
    console.log('⛪ Création de 3000 églises...');
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

      churches.push([
        pastor.id,
        randomChoice(denominationIds),
        churchName,
        lng,
        lat
      ]);

      churchesData.push({
        pastorId: pastor.id,
        city: city,
        churchName: churchName
      });
    }

    // Insertion par lots
    for (let i = 0; i < churches.length; i += batchSize) {
      const batch = churches.slice(i, i + batchSize);

      // Construire la requête avec ST_PointFromText
      const values = batch.map(c => `(${c[0]}, ${c[1]}, ${connection.escape(c[2])}, ST_PointFromText('POINT(${c[3]} ${c[4]})'))`).join(', ');
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

    // 4. Créer les détails des églises
    console.log('📝 Création des détails des églises...');
    const churchDetails = [];

    for (let i = 0; i < createdChurches.length; i++) {
      const church = createdChurches[i];
      const cityData = churchesData[i].city;
      const pastor = createdPastors.find(p => p.id === church.admin_id);

      // Split pastor name into first and last
      const pastorName = pastor ? pastor.email.split('@')[0].replace(/\d+$/, '') : 'anonyme';
      const [firstName, lastName] = pastorName.split('.');

      churchDetails.push([
        church.id,
        'ACTIVE',
        randomChoice(languageIds),
        firstName || 'Pasteur',
        lastName || 'Inconnu',
        null, // logo_url
        `${Math.floor(Math.random() * 200) + 1} Rue de la ${randomChoice(['Paix', 'Liberté', 'République', 'Victoire', 'Grâce'])}, ${cityData.name}`,
        null, // street_number
        `Rue de la ${randomChoice(['Paix', 'Liberté', 'République', 'Victoire', 'Grâce'])}`,
        cityData.name.split('-')[0].substring(0, 5),
        cityData.name,
        `0${Math.floor(Math.random() * 9) + 1}${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        `Une église accueillante et dynamique au cœur de ${cityData.name}. Nous prêchons l'Évangile de Jésus-Christ avec passion et authenticité.`,
        Math.random() > 0.7 ? `https://eglise-${cityData.name.toLowerCase()}.fr` : null,
        Math.random() > 0.3 ? 1 : 0,
        Math.random() > 0.3 ? Math.floor(Math.random() * 150) + 20 : null,
        1
      ]);
    }

    for (let i = 0; i < churchDetails.length; i += batchSize) {
      const batch = churchDetails.slice(i, i + batchSize);
      await connection.query(
        `INSERT INTO church_details (church_id, status, language_id, pastor_first_name, pastor_last_name, logo_url, address, street_number, street_name, postal_code, city, phone, description, website, has_parking, parking_capacity, is_parking_free) VALUES ?`,
        [batch]
      );
      console.log(`   ✓ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(churchDetails.length / batchSize)}`);
    }
    console.log(`✅ ${churchDetails.length} détails d'églises créés\n`);

    // 5. Créer les horaires des églises
    console.log('🕐 Création des horaires...');
    const schedules = [];
    const days = ['SUNDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const times = ['09:00:00', '10:00:00', '18:00:00', '19:00:00', '19:30:00', '20:00:00'];

    for (const church of createdChurches) {
      // Culte du dimanche (obligatoire)
      schedules.push([church.id, randomChoice(activityTypeIds), 'SUNDAY', randomChoice(['09:00:00', '10:00:00', '10:30:00'])]);

      // 1-2 activités supplémentaires aléatoires
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

    // 6. Créer les réseaux sociaux (50% des églises)
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

    // 7. Créer les événements (2 événements par église en moyenne)
    console.log('🎉 Création de ~6000 événements...');
    const events = [];
    const eventDetails = [];
    const numEvents = Math.floor(createdChurches.length * 2);

    for (let i = 0; i < numEvents; i++) {
      const church = randomChoice(createdChurches);
      const churchData = churchesData.find(cd => cd.pastorId === church.admin_id);
      const city = churchData.city;

      const lat = addRandomOffset(city.lat, true);
      const lng = addRandomOffset(city.lng, false);

      const startDate = randomFutureDate(1, 180); // Entre 1 et 180 jours
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 4) + 1); // +1 à +5 heures

      const eventId = i + 1000; // Offset pour éviter les conflits

      events.push([
        church.admin_id,
        church.id,
        randomChoice(EVENT_TITLES),
        randomChoice(languageIds),
        startDate,
        endDate.toISOString().slice(0, 19).replace('T', ' '),
        lng,
        lat
      ]);

      // Détails de l'événement
      const hasParking = Math.random() > 0.4;
      eventDetails.push([
        null, // event_id sera mis à jour après insertion
        `${randomChoice(EVENT_TITLES)} organisé par ${churchData.churchName}. Une rencontre spirituelle puissante pour toute la famille.`,
        Math.floor(Math.random() * 500) + 50,
        null, // image_url
        `${Math.floor(Math.random() * 200) + 1} Avenue de ${randomChoice(['la Paix', 'la Liberté', 'la République'])}, ${city.name}`,
        Math.random() > 0.6 ? randomChoice(SPEAKERS) : null,
        hasParking ? 1 : 0,
        hasParking ? Math.floor(Math.random() * 200) + 20 : null,
        hasParking ? 1 : 0,
        null,
        Math.random() > 0.3 ? 1 : 0,
        Math.random() > 0.7 ? `https://inscription-eglise-${city.name.toLowerCase()}.fr` : null,
        Math.random() > 0.8 ? `https://youtube.com/live/${Math.random().toString(36).substr(2, 9)}` : null
      ]);
    }

    // Insertion des événements
    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);

      // Construire la requête avec ST_PointFromText
      const values = batch.map(e =>
        `(${e[0]}, ${e[1]}, ${connection.escape(e[2])}, ${e[3]}, ${connection.escape(e[4])}, ${connection.escape(e[5])}, ST_PointFromText('POINT(${e[6]} ${e[7]})'))`
      ).join(', ');

      await connection.query(
        `INSERT INTO events (admin_id, church_id, title, language_id, start_datetime, end_datetime, event_location) VALUES ${values}`
      );
      console.log(`   ✓ Batch événements ${Math.floor(i / batchSize) + 1}/${Math.ceil(events.length / batchSize)}`);
    }

    // Récupérer les IDs des événements créés (les derniers insérés)
    const [createdEvents] = await connection.query(
      `SELECT id FROM events ORDER BY id DESC LIMIT ?`,
      [numEvents]
    );

    // Mettre à jour les event_id dans eventDetails
    for (let i = 0; i < eventDetails.length && i < createdEvents.length; i++) {
      eventDetails[i][0] = createdEvents[createdEvents.length - 1 - i].id;
    }

    // Insertion des détails d'événements
    for (let i = 0; i < eventDetails.length; i += batchSize) {
      const batch = eventDetails.slice(i, i + batchSize);
      await connection.query(
        `INSERT INTO event_details (event_id, description, max_seats, image_url, address, speaker_name, has_parking, parking_capacity, is_parking_free, parking_details, is_free, registration_link, youtube_live) VALUES ?`,
        [batch]
      );
      console.log(`   ✓ Batch détails événements ${Math.floor(i / batchSize) + 1}/${Math.ceil(eventDetails.length / batchSize)}`);
    }
    console.log(`✅ ${events.length} événements créés avec détails\n`);

    await connection.commit();

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log('\n✅ ========================================');
    console.log('✅ SEEDING MASSIF TERMINÉ AVEC SUCCÈS !');
    console.log('✅ ========================================\n');
    console.log(`📊 STATISTIQUES:`);
    console.log(`   • ${createdPastors.length} pasteurs créés`);
    console.log(`   • ${createdChurches.length} églises créées`);
    console.log(`   • ${schedules.length} horaires créés`);
    console.log(`   • ${socials.length} réseaux sociaux créés`);
    console.log(`   • ${events.length} événements créés`);
    console.log(`   • Durée totale: ${duration} secondes\n`);
    console.log(`🔐 Tous les pasteurs ont le mot de passe: password123\n`);

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
massiveSeedData()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });