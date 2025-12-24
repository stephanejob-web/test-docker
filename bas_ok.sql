-- 1. Création de la base de données
CREATE DATABASE IF NOT EXISTS light_church CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE light_church;

-- 2. Tables de référence (Sans dépendances)
CREATE TABLE languages (
  id int NOT NULL AUTO_INCREMENT,
  code varchar(5) NOT NULL,
  name_native varchar(50) NOT NULL,
  name_fr varchar(50) NOT NULL,
  flag_emoji varchar(10) DEFAULT NULL,
  is_active tinyint(1) DEFAULT '1',
  display_order int DEFAULT '0',
  PRIMARY KEY (id),
  UNIQUE KEY code_UNIQUE (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE activity_types (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  label_fr varchar(100) NOT NULL,
  icon varchar(50) DEFAULT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE church_unions (
  id int NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  abbreviation varchar(20) DEFAULT NULL,
  website varchar(255) DEFAULT NULL,
  logo_url varchar(512) DEFAULT NULL,
  is_active tinyint(1) DEFAULT '1',
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admins (
  id int NOT NULL AUTO_INCREMENT,
  email varchar(100) NOT NULL,
  password_hash varchar(255) NOT NULL,
  role enum('SUPER_ADMIN','PASTOR','EVANGELIST') DEFAULT 'PASTOR',
  status enum('PENDING','VALIDATED','REJECTED','SUSPENDED') DEFAULT 'PENDING',
  first_name varchar(50) NOT NULL,
  last_name varchar(50) NOT NULL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY email_UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tables avec dépendances simples
CREATE TABLE denominations (
  id int NOT NULL AUTO_INCREMENT,
  union_id int DEFAULT NULL,
  name varchar(100) NOT NULL,
  abbreviation varchar(20) DEFAULT NULL,
  is_active tinyint(1) DEFAULT '1',
  PRIMARY KEY (id),
  CONSTRAINT fk_den_union FOREIGN KEY (union_id) REFERENCES church_unions (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE churches (
  id int NOT NULL AUTO_INCREMENT,
  admin_id int NOT NULL,
  denomination_id int NOT NULL,
  church_name varchar(255) NOT NULL,
  location point NOT NULL,
  latitude decimal(10,7) GENERATED ALWAYS AS (st_y(location)) VIRTUAL,
  longitude decimal(10,7) GENERATED ALWAYS AS (st_x(location)) VIRTUAL,
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  SPATIAL KEY idx_church_geo (location),
  FULLTEXT KEY idx_church_name_search (church_name),
  CONSTRAINT fk_ch_admin FOREIGN KEY (admin_id) REFERENCES admins (id),
  CONSTRAINT fk_ch_den FOREIGN KEY (denomination_id) REFERENCES denominations (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Tables de détails et liaisons
CREATE TABLE church_details (
  church_id int NOT NULL,
  status enum('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  language_id int NOT NULL DEFAULT '10',
  pastor_name varchar(100) DEFAULT NULL,
  logo_url varchar(512) DEFAULT NULL,
  address text,
  street_number varchar(10) DEFAULT NULL,
  street_name varchar(255) DEFAULT NULL,
  postal_code varchar(10) DEFAULT NULL,
  city varchar(100) DEFAULT NULL,
  phone varchar(20) DEFAULT NULL,
  description text,
  website varchar(255) DEFAULT NULL,
  has_parking tinyint(1) DEFAULT '0',
  parking_capacity int DEFAULT NULL,
  is_parking_free tinyint(1) DEFAULT '1',
  PRIMARY KEY (church_id),
  KEY idx_church_city (city),
  FULLTEXT KEY idx_church_desc_search (description),
  CONSTRAINT fk_det_church FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE,
  CONSTRAINT fk_det_lang FOREIGN KEY (language_id) REFERENCES languages (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE church_socials (
  id int NOT NULL AUTO_INCREMENT,
  church_id int NOT NULL,
  platform enum('FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK','WHATSAPP','LINKEDIN') NOT NULL,
  url varchar(255) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_social_church FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE church_schedules (
  id int NOT NULL AUTO_INCREMENT,
  church_id int NOT NULL,
  activity_type_id int NOT NULL,
  day_of_week enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') NOT NULL,
  start_time time NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_sch_church FOREIGN KEY (church_id) REFERENCES churches (id) ON DELETE CASCADE,
  CONSTRAINT fk_sch_type FOREIGN KEY (activity_type_id) REFERENCES activity_types (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Événements et Notifications
CREATE TABLE events (
  id int NOT NULL AUTO_INCREMENT,
  admin_id int NOT NULL,
  church_id int DEFAULT NULL,
  title varchar(255) NOT NULL,
  language_id int NOT NULL DEFAULT '10',
  start_datetime datetime NOT NULL,
  end_datetime datetime NOT NULL,
  event_location point NOT NULL,
  latitude decimal(10,7) GENERATED ALWAYS AS (st_y(event_location)) VIRTUAL,
  longitude decimal(10,7) GENERATED ALWAYS AS (st_x(event_location)) VIRTUAL,
  status enum('PUBLISHED','CANCELLED','DRAFT','COMPLETED') DEFAULT 'PUBLISHED',
  PRIMARY KEY (id),
  SPATIAL KEY idx_evt_geo (event_location),
  FULLTEXT KEY idx_evt_title_search (title),
  CONSTRAINT fk_evt_admin FOREIGN KEY (admin_id) REFERENCES admins (id),
  CONSTRAINT fk_evt_lang_id FOREIGN KEY (language_id) REFERENCES languages (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE event_details (
  event_id int NOT NULL,
  description text,
  max_seats int DEFAULT NULL,
  image_url varchar(512) DEFAULT NULL,
  address text,
  speaker_name varchar(100) DEFAULT NULL,
  has_parking tinyint(1) DEFAULT '0',
  parking_capacity int DEFAULT NULL,
  is_parking_free tinyint(1) DEFAULT '1',
  parking_details text,
  is_free tinyint(1) DEFAULT '1',
  registration_link varchar(512) DEFAULT NULL,
  youtube_live varchar(512) DEFAULT NULL,
  PRIMARY KEY (event_id),
  CONSTRAINT fk_det_event_final FOREIGN KEY (event_id) REFERENCES events (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE push_tokens (
  id int NOT NULL AUTO_INCREMENT,
  device_id varchar(255) NOT NULL,
  push_token varchar(512) NOT NULL,
  platform enum('ios','android') NOT NULL,
  language_id int DEFAULT '1',
  created_at datetime DEFAULT CURRENT_TIMESTAMP,
  updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_device (device_id),
  CONSTRAINT fk_token_lang_id FOREIGN KEY (language_id) REFERENCES languages (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;