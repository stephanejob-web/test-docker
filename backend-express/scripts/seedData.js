require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD || 'admin',
    database: process.env.DB_NAME || 'light_church'
};

const seed = async () => {
    console.log('🌱 Starting seeding...');
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        // 1. Languages
        console.log('... Seeding Languages');
        await connection.query('DELETE FROM languages');
        await connection.query(`INSERT INTO languages (code, name_native, name_fr, flag_emoji) VALUES 
            ('fr', 'Français', 'Français', '🇫🇷'),
            ('en', 'English', 'Anglais', '🇬🇧'),
            ('es', 'Español', 'Espagnol', '🇪🇸'),
            ('pt', 'Português', 'Portugais', '🇵🇹')`);

        // 2. Activity Types
        console.log('... Seeding Activity Types');
        await connection.query('DELETE FROM activity_types');
        const [resParams] = await connection.query(`INSERT INTO activity_types (name, label_fr, icon) VALUES 
            ('WORSHIP', 'Culte du Dimanche', 'church'),
            ('PRAYER', 'Réunion de Prière', 'hands-praying'),
            ('YOUTH', 'Réunion Jeunesse', 'users'),
            ('BIBLE_STUDY', 'Étude Biblique', 'book-open')`);

        // Retrieve IDs for later
        const [activityTypes] = await connection.query('SELECT * FROM activity_types');

        // 3. Unions & Denominations
        console.log('... Seeding Unions & Denominations');
        await connection.query('DELETE FROM denominations');
        await connection.query('DELETE FROM church_unions');

        const [uRes] = await connection.query(`INSERT INTO church_unions (name, abbreviation, website) VALUES 
            ('Fédération Protestante de France', 'FPF', 'https://www.protestants.org'),
            ('Conseil National des Évangéliques de France', 'CNEF', 'https://lecnef.org')`);
        const unionId = uRes.insertId;

        const [dRes] = await connection.query(`INSERT INTO denominations (name, abbreviation, union_id) VALUES 
            ('Assemblées de Dieu', 'ADD', ?),
            ('Baptiste', 'FEEBF', ?),
            ('Pentecôtiste Libre', 'PL', ?)`, [unionId, unionId, unionId]);

        const [denominations] = await connection.query('SELECT * FROM denominations');

        // 4. Pastors (Users)
        console.log('... Seeding Pastors');
        // Clean existing pastors (keep Super Admin if possible, but let's be safe and just insert new ones)
        // Note: We won't delete all admins to avoid killing the super admin user.

        const password = await bcrypt.hash('password123', 10);
        const pastorsData = [
            { first: 'Jean', last: 'Dupont', email: 'jean.dupont@example.com', lat: 48.8566, lng: 2.3522, city: 'Marseille' }, // Paris coords actually
            { first: 'Paul', last: 'Martin', email: 'paul.martin@example.com', lat: 45.7640, lng: 4.8357, city: 'Lyon' },
            { first: 'Pierre', last: 'Durand', email: 'pierre.durand@example.com', lat: 43.2965, lng: 5.3698, city: 'Marseille' },
            { first: 'Jacques', last: 'Moreau', email: 'jacques.moreau@example.com', lat: 44.8378, lng: -0.5792, city: 'Bordeaux' },
            { first: 'Marie', last: 'Petit', email: 'marie.petit@example.com', lat: 50.6292, lng: 3.0573, city: 'Lille' }
        ];

        for (const p of pastorsData) {
            // Check if exists
            const [exists] = await connection.query('SELECT id FROM admins WHERE email = ?', [p.email]);
            let adminId;
            if (exists.length > 0) {
                adminId = exists[0].id;
            } else {
                const [res] = await connection.query(
                    'INSERT INTO admins (email, password_hash, first_name, last_name, role, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [p.email, password, p.first, p.last, 'PASTOR', 'VALIDATED']
                );
                adminId = res.insertId;
            }

            // Create Church for this pastor
            const denomId = denominations[Math.floor(Math.random() * denominations.length)].id;
            const churchName = `Église ${p.city} ${denomId}`; // Simple name

            // Check if church exists
            const [existingChurch] = await connection.query('SELECT id FROM churches WHERE admin_id = ?', [adminId]);
            let churchId;

            if (existingChurch.length === 0) {
                const [cRes] = await connection.query(
                    `INSERT INTO churches (admin_id, denomination_id, church_name, location) VALUES (?, ?, ?, ST_GeomFromText(?))`,
                    [adminId, denomId, `Église Évangélique de ${p.city}`, `POINT(${p.lng} ${p.lat})`]
                );
                churchId = cRes.insertId;

                // Get French language ID
                const [langResQuery] = await connection.query("SELECT id FROM languages WHERE code = 'fr' LIMIT 1");
                const langId = langResQuery[0]?.id || 1;

                // Church Details
                await connection.query(
                    `INSERT INTO church_details (church_id, language_id, description, address, phone, website, pastor_name, has_parking, is_parking_free) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        churchId,
                        langId,
                        `Une église vivante et accueillante au cœur de ${p.city}.`,
                        `10 Rue de la Paix, ${p.city}`,
                        '0102030405',
                        'https://eglise-test.com',
                        `${p.first} ${p.last}`,
                        1,
                        1
                    ]
                );

                // Socials
                await connection.query(
                    `INSERT INTO church_socials (church_id, platform, url) VALUES 
                     (?, 'FACEBOOK', 'https://facebook.com/eglisetest'),
                     (?, 'INSTAGRAM', 'https://instagram.com/eglisetest')`,
                    [churchId, churchId]
                );

                // Schedules
                const actId = activityTypes[0].id;
                await connection.query(
                    `INSERT INTO church_schedules (church_id, activity_type_id, day_of_week, start_time) VALUES 
                     (?, ?, 'SUNDAY', '10:00:00'),
                     (?, ?, 'TUESDAY', '19:30:00')`,
                    [churchId, actId, churchId, activityTypes[1].id] // Worship & Prayer
                );

                // Events (2 per church)
                await connection.query(
                    `INSERT INTO events (admin_id, church_id, title, start_datetime, end_datetime, event_location) VALUES 
                     (?, ?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(NOW(), INTERVAL '7:2' DAY_HOUR), ST_GeomFromText(?))`,
                    [adminId, churchId, `Grand Concert à ${p.city}`, `POINT(${p.lng} ${p.lat})`]
                );
                await connection.query(
                    `INSERT INTO events (admin_id, church_id, title, start_datetime, end_datetime, event_location) VALUES 
                     (?, ?, ?, DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(NOW(), INTERVAL '14:2' DAY_HOUR), ST_GeomFromText(?))`,
                    [adminId, churchId, `Séminaire Biblique`, `POINT(${p.lng} ${p.lat})`]
                );

                console.log(`Created Church & Events for ${p.city}`);
            }
        }

        console.log('✅ Seeding completed successfully!');

        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        if (connection) connection.end();
    }
};

seed();
