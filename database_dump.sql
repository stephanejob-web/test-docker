-- MySQL dump 10.13  Distrib 8.0.44, for Linux (x86_64)
--
-- Host: localhost    Database: light_church
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_types`
--

DROP TABLE IF EXISTS `activity_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `label_fr` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_types`
--

LOCK TABLES `activity_types` WRITE;
/*!40000 ALTER TABLE `activity_types` DISABLE KEYS */;
INSERT INTO `activity_types` VALUES (9,'WORSHIP','Culte du Dimanche','church'),(10,'PRAYER','RÃ©union de PriÃ¨re','hands-praying'),(11,'YOUTH','RÃ©union Jeunesse','users'),(12,'BIBLE_STUDY','Ã‰tude Biblique','book-open');
/*!40000 ALTER TABLE `activity_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `admins`
--

DROP TABLE IF EXISTS `admins`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('SUPER_ADMIN','PASTOR','EVANGELIST') COLLATE utf8mb4_unicode_ci DEFAULT 'PASTOR',
  `status` enum('PENDING','VALIDATED','REJECTED','SUSPENDED') COLLATE utf8mb4_unicode_ci DEFAULT 'PENDING',
  `first_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admins`
--

LOCK TABLES `admins` WRITE;
/*!40000 ALTER TABLE `admins` DISABLE KEYS */;
INSERT INTO `admins` VALUES (1,'darksh3ll@gmail.com','$2b$10$X5QwbEqcI0IdyxGFN5tRXOhily3bElUWxBhSSEIm.pjQYf/Zo0PVm','SUPER_ADMIN','VALIDATED','Super','Admin','2025-12-22 14:20:38'),(2,'pasteur@gmail.com','$2b$10$2jwrdjYuXzGsWnN3dLiocOpdtyWqM4fMEFZCXjV39Rm8Ijm0HxSY6','PASTOR','VALIDATED','laurent','botta','2025-12-22 14:22:19'),(3,'jean.dupont@example.com','$2b$10$vJufhDrJOcYVnMTaXJJYCOt8Ixv4BRJ8xEMLoJ8E.Ik2UDzf52dbm','PASTOR','VALIDATED','Jean','Dupont','2025-12-22 14:46:39'),(4,'paul.martin@example.com','$2b$10$mKX8BPRJE47NzaJdFshBS.K9n5EkO6aGOUgOeI9YT4IYytbjWAMGW','PASTOR','VALIDATED','Paul','Martin','2025-12-22 14:47:26'),(5,'pierre.durand@example.com','$2b$10$mKX8BPRJE47NzaJdFshBS.K9n5EkO6aGOUgOeI9YT4IYytbjWAMGW','PASTOR','VALIDATED','Pierre','Durand','2025-12-22 14:47:26'),(6,'jacques.moreau@example.com','$2b$10$mKX8BPRJE47NzaJdFshBS.K9n5EkO6aGOUgOeI9YT4IYytbjWAMGW','PASTOR','VALIDATED','Jacques','Moreau','2025-12-22 14:47:26'),(7,'marie.petit@example.com','$2b$10$mKX8BPRJE47NzaJdFshBS.K9n5EkO6aGOUgOeI9YT4IYytbjWAMGW','PASTOR','VALIDATED','Marie','Petit','2025-12-22 14:47:26'),(8,'daniel@gmail.com','$2b$10$zZIcXBBBqSOcu4EHxQssReUtg0jYOz8vTiNjw0HG4TP9ejijQGhr.','PASTOR','VALIDATED','daniel','kolenda','2025-12-22 16:13:00');
/*!40000 ALTER TABLE `admins` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `church_details`
--

DROP TABLE IF EXISTS `church_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_details` (
  `church_id` int NOT NULL,
  `status` enum('ACTIVE','INACTIVE') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
  `language_id` int NOT NULL DEFAULT '10',
  `pastor_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_parking` tinyint(1) DEFAULT '0',
  `parking_capacity` int DEFAULT NULL,
  `is_parking_free` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`church_id`),
  KEY `fk_det_lang` (`language_id`),
  FULLTEXT KEY `idx_church_desc_search` (`description`),
  CONSTRAINT `fk_det_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_det_lang` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `church_details`
--

LOCK TABLES `church_details` WRITE;
/*!40000 ALTER TABLE `church_details` DISABLE KEYS */;
INSERT INTO `church_details` VALUES (2,'ACTIVE',10,'Paul Martin',NULL,'10 Rue de la Paix, Lyon','0102030405','Une Ã©glise vivante et accueillante au cÅ“ur de Lyon.','https://eglise-test.com',1,NULL,1),(3,'ACTIVE',10,'Pierre Durand',NULL,'10 Rue de la Paix, Marseille','0102030405','Une Ã©glise vivante et accueillante au cÅ“ur de Marseille.','https://eglise-test.com',1,NULL,1),(4,'ACTIVE',10,'Jacques Moreau',NULL,'10 Rue de la Paix, Bordeaux','0102030405','Une Ã©glise vivante et accueillante au cÅ“ur de Bordeaux.','https://eglise-test.com',1,NULL,1),(5,'ACTIVE',10,'Marie Petit',NULL,'10 Rue de la Paix, Lille','0102030405','Une Ã©glise vivante et accueillante au cÅ“ur de Lille.','https://eglise-test.com',1,NULL,1),(9,'ACTIVE',10,NULL,NULL,NULL,NULL,'toto aime le pain',NULL,0,NULL,0),(10,'ACTIVE',10,NULL,'http://localhost/uploads/1766421414658-503907718.png',NULL,NULL,'daniel kolenda successeur a reihnard boonke',NULL,0,NULL,1);
/*!40000 ALTER TABLE `church_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `church_schedules`
--

DROP TABLE IF EXISTS `church_schedules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_schedules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `activity_type_id` int NOT NULL,
  `day_of_week` enum('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') COLLATE utf8mb4_unicode_ci NOT NULL,
  `start_time` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sch_church` (`church_id`),
  KEY `fk_sch_type` (`activity_type_id`),
  CONSTRAINT `fk_sch_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_sch_type` FOREIGN KEY (`activity_type_id`) REFERENCES `activity_types` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `church_schedules`
--

LOCK TABLES `church_schedules` WRITE;
/*!40000 ALTER TABLE `church_schedules` DISABLE KEYS */;
INSERT INTO `church_schedules` VALUES (1,2,9,'SUNDAY','10:00:00'),(2,2,10,'TUESDAY','19:30:00'),(3,3,9,'SUNDAY','10:00:00'),(4,3,10,'TUESDAY','19:30:00'),(5,4,9,'SUNDAY','10:00:00'),(6,4,10,'TUESDAY','19:30:00'),(7,5,9,'SUNDAY','10:00:00'),(8,5,10,'TUESDAY','19:30:00');
/*!40000 ALTER TABLE `church_schedules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `church_socials`
--

DROP TABLE IF EXISTS `church_socials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_socials` (
  `id` int NOT NULL AUTO_INCREMENT,
  `church_id` int NOT NULL,
  `platform` enum('FACEBOOK','INSTAGRAM','YOUTUBE','TIKTOK','WHATSAPP','LINKEDIN') COLLATE utf8mb4_unicode_ci NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_social_church` (`church_id`),
  CONSTRAINT `fk_social_church` FOREIGN KEY (`church_id`) REFERENCES `churches` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `church_socials`
--

LOCK TABLES `church_socials` WRITE;
/*!40000 ALTER TABLE `church_socials` DISABLE KEYS */;
INSERT INTO `church_socials` VALUES (1,2,'FACEBOOK','https://facebook.com/eglisetest'),(2,2,'INSTAGRAM','https://instagram.com/eglisetest'),(3,3,'FACEBOOK','https://facebook.com/eglisetest'),(4,3,'INSTAGRAM','https://instagram.com/eglisetest'),(5,4,'FACEBOOK','https://facebook.com/eglisetest'),(6,4,'INSTAGRAM','https://instagram.com/eglisetest'),(7,5,'FACEBOOK','https://facebook.com/eglisetest'),(8,5,'INSTAGRAM','https://instagram.com/eglisetest');
/*!40000 ALTER TABLE `church_socials` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `church_unions`
--

DROP TABLE IF EXISTS `church_unions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `church_unions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `logo_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `church_unions`
--

LOCK TABLES `church_unions` WRITE;
/*!40000 ALTER TABLE `church_unions` DISABLE KEYS */;
INSERT INTO `church_unions` VALUES (3,'FÃ©dÃ©ration Protestante de France','FPF','https://www.protestants.org',NULL,1),(4,'Conseil National des Ã‰vangÃ©liques de France','CNEF','https://lecnef.org',NULL,1);
/*!40000 ALTER TABLE `church_unions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `churches`
--

DROP TABLE IF EXISTS `churches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `churches` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `denomination_id` int NOT NULL,
  `church_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` point NOT NULL,
  `latitude` decimal(10,7) GENERATED ALWAYS AS (st_y(`location`)) VIRTUAL,
  `longitude` decimal(10,7) GENERATED ALWAYS AS (st_x(`location`)) VIRTUAL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  SPATIAL KEY `idx_church_geo` (`location`),
  KEY `fk_ch_admin` (`admin_id`),
  KEY `fk_ch_den` (`denomination_id`),
  FULLTEXT KEY `idx_church_name_search` (`church_name`),
  CONSTRAINT `fk_ch_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `fk_ch_den` FOREIGN KEY (`denomination_id`) REFERENCES `denominations` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `churches`
--

LOCK TABLES `churches` WRITE;
/*!40000 ALTER TABLE `churches` DISABLE KEYS */;
INSERT INTO `churches` (`id`, `admin_id`, `denomination_id`, `church_name`, `location`, `created_at`, `updated_at`) VALUES (1,3,2,'Ã‰glise Ã‰vangÃ©lique de Marseille',_binary '\0\0\0\0\0\0\0¨5\Í;N\Ñ@v\àœ¥mH@','2025-12-22 14:46:39','2025-12-22 14:46:39'),(2,4,6,'Ã‰glise Ã‰vangÃ©lique de Lyon',_binary '\0\0\0\0\0\0\0¥½ÁW@oƒÀ\Ê\áF@','2025-12-22 14:47:26','2025-12-22 14:47:26'),(3,5,5,'Ã‰glise Ã‰vangÃ©lique de Marseille',_binary '\0\0\0\0\0\0\0B>\èÙ¬z@Ë¡E¶\ó¥E@','2025-12-22 14:47:26','2025-12-22 14:47:26'),(4,6,5,'Ã‰glise Ã‰vangÃ©lique de Bordeaux',_binary '\0\0\0\0\0\0\0û:pÎˆ\â¿^K\È=kF@','2025-12-22 14:47:26','2025-12-22 14:47:26'),(5,7,6,'Ã‰glise Ã‰vangÃ©lique de Lille',_binary '\0\0\0\0\0\0\0…|Ð³Yu@TR\' ‰PI@','2025-12-22 14:47:26','2025-12-22 14:47:26'),(9,2,5,'toto aime la pain',_binary '\0\0\0\0\0\0\0\0\0\0\0\0\0i@\0\0\0\0\0\0i@','2025-12-22 15:03:07','2025-12-22 15:07:39'),(10,8,5,'daniel kolenda',_binary '\0\0\0\0\0\0\0\0\0\0\0\0\0i@\0\0\0\0\0\0i@','2025-12-22 16:37:37','2025-12-22 16:37:37');
/*!40000 ALTER TABLE `churches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `denominations`
--

DROP TABLE IF EXISTS `denominations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `denominations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `union_id` int DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abbreviation` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_den_union` (`union_id`),
  CONSTRAINT `fk_den_union` FOREIGN KEY (`union_id`) REFERENCES `church_unions` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `denominations`
--

LOCK TABLES `denominations` WRITE;
/*!40000 ALTER TABLE `denominations` DISABLE KEYS */;
INSERT INTO `denominations` VALUES (4,3,'AssemblÃ©es de Dieu','ADD',1),(5,3,'Baptiste','FEEBF',1),(6,3,'PentecÃ´tiste Libre','PL',1);
/*!40000 ALTER TABLE `denominations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_details`
--

DROP TABLE IF EXISTS `event_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_details` (
  `event_id` int NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `max_seats` int DEFAULT NULL,
  `image_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` text COLLATE utf8mb4_unicode_ci,
  `speaker_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `has_parking` tinyint(1) DEFAULT '0',
  `parking_capacity` int DEFAULT NULL,
  `is_parking_free` tinyint(1) DEFAULT '1',
  `parking_details` text COLLATE utf8mb4_unicode_ci,
  `is_free` tinyint(1) DEFAULT '1',
  `registration_link` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `youtube_live` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`event_id`),
  CONSTRAINT `fk_det_event_final` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_details`
--

LOCK TABLES `event_details` WRITE;
/*!40000 ALTER TABLE `event_details` DISABLE KEYS */;
INSERT INTO `event_details` VALUES (11,NULL,NULL,NULL,'614 route de la seyne',NULL,1,200,1,NULL,1,NULL,NULL);
/*!40000 ALTER TABLE `event_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `church_id` int DEFAULT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `language_id` int NOT NULL DEFAULT '10',
  `start_datetime` datetime NOT NULL,
  `end_datetime` datetime NOT NULL,
  `event_location` point NOT NULL,
  `latitude` decimal(10,7) GENERATED ALWAYS AS (st_y(`event_location`)) VIRTUAL,
  `longitude` decimal(10,7) GENERATED ALWAYS AS (st_x(`event_location`)) VIRTUAL,
  `status` enum('PUBLISHED','CANCELLED','DRAFT','COMPLETED') COLLATE utf8mb4_unicode_ci DEFAULT 'PUBLISHED',
  PRIMARY KEY (`id`),
  SPATIAL KEY `idx_evt_geo` (`event_location`),
  KEY `fk_evt_admin` (`admin_id`),
  KEY `fk_evt_lang_id` (`language_id`),
  FULLTEXT KEY `idx_evt_title_search` (`title`),
  CONSTRAINT `fk_evt_admin` FOREIGN KEY (`admin_id`) REFERENCES `admins` (`id`),
  CONSTRAINT `fk_evt_lang_id` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` (`id`, `admin_id`, `church_id`, `title`, `language_id`, `start_datetime`, `end_datetime`, `event_location`, `status`) VALUES (1,4,2,'Grand Concert Ã  Lyon',1,'2025-12-29 14:47:26','2025-12-29 16:47:26',_binary '\0\0\0\0\0\0\0¥½ÁW@oƒÀ\Ê\áF@','PUBLISHED'),(2,4,2,'SÃ©minaire Biblique',1,'2026-01-05 14:47:26','2026-01-05 16:47:26',_binary '\0\0\0\0\0\0\0¥½ÁW@oƒÀ\Ê\áF@','PUBLISHED'),(3,5,3,'Grand Concert Ã  Marseille',1,'2025-12-29 14:47:26','2025-12-29 16:47:26',_binary '\0\0\0\0\0\0\0B>\èÙ¬z@Ë¡E¶\ó¥E@','PUBLISHED'),(4,5,3,'SÃ©minaire Biblique',1,'2026-01-05 14:47:26','2026-01-05 16:47:26',_binary '\0\0\0\0\0\0\0B>\èÙ¬z@Ë¡E¶\ó¥E@','PUBLISHED'),(5,6,4,'Grand Concert Ã  Bordeaux',1,'2025-12-29 14:47:26','2025-12-29 16:47:26',_binary '\0\0\0\0\0\0\0û:pÎˆ\â¿^K\È=kF@','PUBLISHED'),(6,6,4,'SÃ©minaire Biblique',1,'2026-01-05 14:47:26','2026-01-05 16:47:26',_binary '\0\0\0\0\0\0\0û:pÎˆ\â¿^K\È=kF@','PUBLISHED'),(7,7,5,'Grand Concert Ã  Lille',1,'2025-12-29 14:47:26','2025-12-29 16:47:26',_binary '\0\0\0\0\0\0\0…|Ð³Yu@TR\' ‰PI@','PUBLISHED'),(8,7,5,'SÃ©minaire Biblique',1,'2026-01-05 14:47:26','2026-01-05 16:47:26',_binary '\0\0\0\0\0\0\0…|Ð³Yu@TR\' ‰PI@','PUBLISHED'),(11,2,9,'evangelisation de masse',10,'2025-12-23 16:41:00','2025-12-25 16:41:00',_binary '\0\0\0\0\0\0\0\0\0\0\0\0\0i@\0\0\0\0\0\0i@','PUBLISHED');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `languages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(5) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_native` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name_fr` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flag_emoji` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `code_UNIQUE` (`code`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES (10,'fr','FranÃ§ais','FranÃ§ais','ðŸ‡«ðŸ‡·',1,0),(11,'en','English','Anglais','ðŸ‡¬ðŸ‡§',1,0),(12,'es','EspaÃ±ol','Espagnol','ðŸ‡ªðŸ‡¸',1,0),(13,'pt','PortuguÃªs','Portugais','ðŸ‡µðŸ‡¹',1,0);
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `push_tokens`
--

DROP TABLE IF EXISTS `push_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `push_tokens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `device_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `push_token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `platform` enum('ios','android') COLLATE utf8mb4_unicode_ci NOT NULL,
  `language_id` int DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_device` (`device_id`),
  KEY `fk_token_lang_id` (`language_id`),
  CONSTRAINT `fk_token_lang_id` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `push_tokens`
--

LOCK TABLES `push_tokens` WRITE;
/*!40000 ALTER TABLE `push_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `push_tokens` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-12-23  8:27:01
