-- MySQL dump 10.13  Distrib 5.7.17, for Win64 (x86_64)
--
-- Host: localhost    Database: bharatgas
-- ------------------------------------------------------
-- Server version	5.7.21-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `customer_demand_info`
--

LOCK TABLES `customer_demand_info` WRITE;
/*!40000 ALTER TABLE `customer_demand_info` DISABLE KEYS */;
/*!40000 ALTER TABLE `customer_demand_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `distributor`
--

LOCK TABLES `distributor` WRITE;
/*!40000 ALTER TABLE `distributor` DISABLE KEYS */;
INSERT INTO `distributor` (`dist_sno`, `dist_id`, `dist_name`, `dist_email`, `dist_is_email_verified`, `dist_primary_mobile`, `dist_pwd`, `dist_secondary_mobile`, `dist_address`, `dist_city`, `dist_state`, `dist_country`, `dist_pincode`, `dist_added_by`, `dist_added_by_name`, `dist_last_login`, `dist_last_login_IP`, `dist_time_created`, `dist_time_modified`, `dist_is_deleted`) VALUES (1,'DISTSK001','Distributor','distributor@bharatgas.com',0,'8106302821','Qwerty12$','7842487859','Telugu Ganga Road','Srikalahasti','Andhra Pradesh','India','517644',NULL,NULL,'2019-06-14 18:47:21',':::0','2019-06-14 18:47:21','2019-06-14 18:47:21',0);
/*!40000 ALTER TABLE `distributor` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `loc_city`
--

LOCK TABLES `loc_city` WRITE;
/*!40000 ALTER TABLE `loc_city` DISABLE KEYS */;
INSERT INTO `loc_city` (`loc_city_city`, `loc_city_state`) VALUES ('Srikalahasti','Andhra Pradesh');
/*!40000 ALTER TABLE `loc_city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `loc_country`
--

LOCK TABLES `loc_country` WRITE;
/*!40000 ALTER TABLE `loc_country` DISABLE KEYS */;
INSERT INTO `loc_country` (`loc_country_country`) VALUES ('India');
/*!40000 ALTER TABLE `loc_country` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `loc_state`
--

LOCK TABLES `loc_state` WRITE;
/*!40000 ALTER TABLE `loc_state` DISABLE KEYS */;
INSERT INTO `loc_state` (`loc_state_state`, `loc_state_country`) VALUES ('Andhra Pradesh','India');
/*!40000 ALTER TABLE `loc_state` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `sales_officer`
--

LOCK TABLES `sales_officer` WRITE;
/*!40000 ALTER TABLE `sales_officer` DISABLE KEYS */;
/*!40000 ALTER TABLE `sales_officer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'bharatgas'
--

--
-- Dumping routines for database 'bharatgas'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-06-15  0:22:22
