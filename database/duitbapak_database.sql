-- MySQL dump 10.13  Distrib 8.0.30, for Win64 (x86_64)
--
-- Host: localhost    Database: family_financial_tracker
-- ------------------------------------------------------
-- Server version	8.0.30

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
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('e0b65650-b78a-40d5-927f-39063603af53','cfb13562f3bbe937e373039ac244b55d2919a8708fb81425c7907cd6704241dc','2025-01-08 10:38:53.096','20250104034645_init',NULL,NULL,'2025-01-08 10:38:52.810',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `family`
--

DROP TABLE IF EXISTS `family`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `family` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `familyCode` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `familyHeadId` int NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Family_name_key` (`name`),
  UNIQUE KEY `Family_familyCode_key` (`familyCode`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `family`
--

LOCK TABLES `family` WRITE;
/*!40000 ALTER TABLE `family` DISABLE KEYS */;
INSERT INTO `family` VALUES (1,'kelurga cemara','UNLPGD',1,'2025-01-09 01:56:54.287','2025-01-09 01:56:54.287'),(2,'keluarga baru','F8ETD6',2,'2025-01-09 04:07:29.408','2025-01-09 04:07:29.408'),(3,'Keluarga Cemara','F1VLMH',4,'2025-01-11 07:11:14.088','2025-01-11 07:11:14.088');
/*!40000 ALTER TABLE `family` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `member` (
  `id` int NOT NULL AUTO_INCREMENT,
  `userId` int NOT NULL,
  `familyId` int NOT NULL,
  `role` enum('AYAH','IBU','ANAK') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ANAK',
  `isFamilyHead` tinyint(1) NOT NULL DEFAULT '0',
  `canAddIncome` tinyint(1) NOT NULL DEFAULT '0',
  `canViewFamilyReport` tinyint(1) NOT NULL DEFAULT '0',
  `balance` double NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Member_userId_key` (`userId`),
  KEY `Member_familyId_fkey` (`familyId`),
  CONSTRAINT `Member_familyId_fkey` FOREIGN KEY (`familyId`) REFERENCES `family` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Member_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `member`
--

LOCK TABLES `member` WRITE;
/*!40000 ALTER TABLE `member` DISABLE KEYS */;
INSERT INTO `member` VALUES (1,1,1,'IBU',1,1,1,14780,'2025-01-09 01:56:54.297','2025-01-15 06:42:39.199'),(2,2,2,'AYAH',1,1,1,200000,'2025-01-09 04:07:29.421','2025-01-11 07:09:14.921'),(3,4,3,'AYAH',1,1,1,500000,'2025-01-11 07:11:14.284','2025-01-11 07:42:22.343'),(4,7,3,'ANAK',0,0,0,500000,'2025-01-11 07:41:37.935','2025-01-11 07:42:22.343');
/*!40000 ALTER TABLE `member` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `familyId` int NOT NULL,
  `memberId` int NOT NULL,
  `amount` double NOT NULL,
  `transactionType` enum('INCOME','EXPENSE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EXPENSE',
  `description` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imageUrl` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `transactionAt` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Transaction_familyId_fkey` (`familyId`),
  KEY `Transaction_memberId_fkey` (`memberId`),
  CONSTRAINT `Transaction_familyId_fkey` FOREIGN KEY (`familyId`) REFERENCES `family` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Transaction_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `member` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES (1,1,1,20000,'INCOME','beli dtop','beli apa ya',NULL,'2025-01-14 17:00:00.000','2025-01-09 02:21:47.296','2025-01-15 06:42:39.180'),(3,1,1,10,'EXPENSE','descdsdsd','catdsdsd',NULL,'2025-01-20 17:00:00.000','2025-01-09 02:24:15.901','2025-01-09 03:31:45.719'),(4,1,1,123,'INCOME','desc','cat',NULL,'2025-01-21 17:00:00.000','2025-01-09 02:24:29.450','2025-01-09 03:11:32.436'),(5,1,1,1000,'INCOME','description','category',NULL,'2025-01-04 04:01:21.942','2025-01-09 02:25:48.949','2025-01-09 02:25:48.949'),(6,1,1,2222,'INCOME','jualandssd','jualandsds',NULL,'2025-01-13 17:00:00.000','2025-01-09 02:29:05.376','2025-01-09 03:02:38.088'),(8,1,1,100,'EXPENSE','sdsdsd','sdsdsd',NULL,'2025-01-27 17:00:00.000','2025-01-09 03:03:16.431','2025-01-09 03:39:24.659'),(12,3,3,1000000,'INCOME','Gaji dari Bos','Gaji dari Bos',NULL,'2025-01-15 17:00:00.000','2025-01-11 07:12:07.327','2025-01-11 07:12:07.327'),(13,3,3,500000,'EXPENSE','beli tv smart','beli tv smart',NULL,'2025-01-13 17:00:00.000','2025-01-11 07:13:37.500','2025-01-11 07:13:37.500'),(14,3,3,1000000,'INCOME','Gaji Bulanan','Gaji Bulanan',NULL,'2025-01-10 17:00:00.000','2025-01-11 07:26:04.011','2025-01-11 07:26:04.011'),(15,3,3,500000,'EXPENSE','Beli Lemari','Beli Lemari',NULL,'2025-01-10 17:00:00.000','2025-01-11 07:26:29.565','2025-01-11 07:26:29.565'),(16,3,3,-500000,'EXPENSE','Transfer ke anak4: uang bulanan','Transfer',NULL,'2025-01-11 07:42:22.330','2025-01-11 07:42:22.343','2025-01-11 07:42:22.343'),(17,3,4,500000,'INCOME','Transfer dari ayah: uang bulanan','Transfer',NULL,'2025-01-11 07:42:22.331','2025-01-11 07:42:22.343','2025-01-11 07:42:22.343');
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `verificationCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `memberId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_username_key` (`username`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'username','gmail@gmail.com','$2b$10$eThCC4k7yYfVxCe6rIrsXu3BlZ8g5Abu4AGrqARCukuohOR0EELyG',1,NULL,'2025-01-09 01:55:40.323','2025-01-09 01:56:54.314',1),(2,'username2','gmail2@gmail.com','$2b$10$8zSwREJSK.lnSq3CGHgXhOd8D4YdZQB/GLKeFqQTCgRDKQAZTVtW.',1,NULL,'2025-01-09 04:06:59.709','2025-01-09 04:07:29.427',2),(3,'username6','email6@gmail.com','$2b$10$lB/qX8fiaLsDxq4/azgYh..TnPhqo/BKZaUtiL.MgSYSp7O6XLKIW',0,'687422','2025-01-10 12:13:44.653','2025-01-10 12:13:44.653',NULL),(4,'ayah','ayah@gmail.com','$2b$10$CBsWE70z7lhaH3lRQc9O4ueBpuHQotou4tmAKiQAT3szJwzx6ofXa',1,NULL,'2025-01-11 07:10:44.786','2025-01-11 07:11:14.411',3),(5,'anak','anak@gmail.com','$2b$10$irbMd8sPDq4OP2BtvFaryujtBiYlJKhEmDCMN7fV3W803GeMtmLRK',1,NULL,'2025-01-11 07:14:32.366','2025-01-11 07:14:46.277',NULL),(6,'anak2','anak2@gmail.com','$2b$10$QdnmE686po/d.StGCTUtQO8rqhvDTjI1IrpCwjFJC9f6KP8c0gXYm',0,'733275','2025-01-11 07:39:19.330','2025-01-11 07:39:19.330',NULL),(7,'anak4','anak4@gmail.com','$2b$10$kUYLpDBrixoeLviwdC2LFOPJDpZ6oINt.937d.98iwGJpEcYJIZ6K',1,NULL,'2025-01-11 07:40:39.823','2025-01-11 07:41:37.963',4);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-01-26 20:36:13
