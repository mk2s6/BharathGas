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
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer` (
  `cust_sno` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `cust_id` varchar(10) NOT NULL,
  `cust_name` varchar(100) NOT NULL,
  `cust_email` varchar(150) DEFAULT NULL,
  `cust_is_email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `cust_primary_mobile` varchar(11) NOT NULL,
  `cust_pwd` varchar(256) NOT NULL,
  `cust_secondary_mobile` varchar(20) DEFAULT NULL,
  `cust_address` varchar(50) DEFAULT NULL,
  `cust_city` varchar(50) NOT NULL,
  `cust_state` varchar(50) NOT NULL,
  `cust_country` varchar(50) NOT NULL,
  `cust_pincode` varchar(6) NOT NULL,
  `cust_saof_id` int(10) unsigned DEFAULT NULL,
  `cust_saof_name` varchar(100) DEFAULT NULL,
  `cust_added_by` int(10) unsigned DEFAULT NULL,
  `cust_added_by_name` varchar(50) DEFAULT NULL,
  `cust_last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cust_last_login_IP` varchar(30) NOT NULL,
  `cust_time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cust_time_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `cust_is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`cust_id`),
  UNIQUE KEY `cust_sno_UNIQUE` (`cust_sno`),
  UNIQUE KEY `cust_primary_mobile_UNIQUE` (`cust_primary_mobile`),
  UNIQUE KEY `cust_email_UNIQUE` (`cust_email`),
  KEY `FK_cust_city_idx` (`cust_city`),
  KEY `FK_cust_state_idx` (`cust_state`),
  KEY `FK_cust_country_idx` (`cust_country`),
  KEY `FK_cust_dist_link_idx` (`cust_saof_name`),
  KEY `FK_cust_fk_link_index` (`cust_sno`,`cust_name`),
  KEY `FK_cust_name_index` (`cust_name`),
  KEY `FK_cust_saof_link_idx` (`cust_saof_id`,`cust_saof_name`),
  CONSTRAINT `FK_cust_city` FOREIGN KEY (`cust_city`) REFERENCES `loc_city` (`loc_city_city`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_cust_country` FOREIGN KEY (`cust_country`) REFERENCES `loc_country` (`loc_country_country`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_cust_saof_link` FOREIGN KEY (`cust_saof_id`, `cust_saof_name`) REFERENCES `sales_officer` (`saof_sno`, `saof_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_cust_state` FOREIGN KEY (`cust_state`) REFERENCES `loc_state` (`loc_state_state`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `customer_demand_info`
--

DROP TABLE IF EXISTS `customer_demand_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `customer_demand_info` (
  `cdi_cust_id` int(10) unsigned NOT NULL,
  `cdi_cust_name` varchar(100) NOT NULL,
  `cdi_demand_per_month` int(5) unsigned NOT NULL,
  `cdi_compnay_used` varchar(50) NOT NULL,
  `cdi_package` double unsigned NOT NULL,
  `cdi_running_discount` double unsigned NOT NULL,
  `cdi_remarks` varchar(2000) DEFAULT NULL,
  `cdi_added_by` varchar(10) NOT NULL,
  `cdi_added_by_name` varchar(100) NOT NULL,
  `cdi_added_by_type` enum('','Distributor','Sales_Officer') NOT NULL DEFAULT '',
  `cdi_time_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cdi_time_modified` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `cdi_is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`cdi_cust_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='It contains the demand for the gas at present for a customer';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `distributor`
--

DROP TABLE IF EXISTS `distributor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `distributor` (
  `dist_sno` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `dist_id` varchar(10) NOT NULL,
  `dist_name` varchar(100) NOT NULL,
  `dist_email` varchar(150) NOT NULL,
  `dist_is_email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `dist_primary_mobile` varchar(11) NOT NULL,
  `dist_pwd` varchar(256) NOT NULL,
  `dist_secondary_mobile` varchar(20) DEFAULT NULL,
  `dist_address` varchar(50) DEFAULT NULL,
  `dist_city` varchar(50) NOT NULL,
  `dist_state` varchar(50) NOT NULL,
  `dist_country` varchar(50) NOT NULL,
  `dist_pincode` varchar(6) NOT NULL,
  `dist_added_by` int(10) unsigned DEFAULT NULL,
  `dist_added_by_name` varchar(50) DEFAULT NULL,
  `dist_last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dist_last_login_IP` varchar(30) NOT NULL,
  `dist_time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `dist_time_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `dist_is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`dist_id`),
  UNIQUE KEY `dist_sno_UNIQUE` (`dist_sno`),
  UNIQUE KEY `dist_email_UNIQUE` (`dist_email`),
  UNIQUE KEY `dist_primary_mobile_UNIQUE` (`dist_primary_mobile`),
  KEY `FK_dist_city_idx` (`dist_city`),
  KEY `FK_dist_state_idx` (`dist_state`),
  KEY `FK_dist_country_idx` (`dist_country`),
  KEY `FK_dist_saof_link_INDEX` (`dist_sno`,`dist_name`),
  KEY `INDEX_dist_name` (`dist_name`),
  KEY `FK_dist_code_name_index` (`dist_id`,`dist_name`),
  CONSTRAINT `FK_dist_city` FOREIGN KEY (`dist_city`) REFERENCES `loc_city` (`loc_city_city`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_dist_country` FOREIGN KEY (`dist_country`) REFERENCES `loc_country` (`loc_country_country`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_dist_state` FOREIGN KEY (`dist_state`) REFERENCES `loc_state` (`loc_state_state`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COMMENT='	';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loc_city`
--

DROP TABLE IF EXISTS `loc_city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loc_city` (
  `loc_city_city` varchar(50) NOT NULL,
  `loc_city_state` varchar(50) NOT NULL,
  PRIMARY KEY (`loc_city_city`),
  KEY `FK_loc_city_state` (`loc_city_state`),
  CONSTRAINT `FK_loc_city_state` FOREIGN KEY (`loc_city_state`) REFERENCES `loc_state` (`loc_state_state`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loc_country`
--

DROP TABLE IF EXISTS `loc_country`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loc_country` (
  `loc_country_country` varchar(50) NOT NULL,
  PRIMARY KEY (`loc_country_country`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `loc_state`
--

DROP TABLE IF EXISTS `loc_state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `loc_state` (
  `loc_state_state` varchar(50) NOT NULL,
  `loc_state_country` varchar(50) NOT NULL,
  PRIMARY KEY (`loc_state_state`),
  KEY `FK_loc_state_country` (`loc_state_country`),
  CONSTRAINT `FK_loc_state_country` FOREIGN KEY (`loc_state_country`) REFERENCES `loc_country` (`loc_country_country`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `sales_officer`
--

DROP TABLE IF EXISTS `sales_officer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sales_officer` (
  `saof_sno` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `saof_id` varchar(10) NOT NULL,
  `saof_name` varchar(100) NOT NULL,
  `saof_email` varchar(150) NOT NULL,
  `saof_is_email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `saof_primary_mobile` varchar(11) NOT NULL,
  `saof_pwd` varchar(256) NOT NULL,
  `saof_secondary_mobile` varchar(20) DEFAULT NULL,
  `saof_address` varchar(50) DEFAULT NULL,
  `saof_city` varchar(50) NOT NULL,
  `saof_state` varchar(50) NOT NULL,
  `saof_country` varchar(50) NOT NULL,
  `saof_pincode` varchar(6) NOT NULL,
  `saof_dist_id` int(10) unsigned DEFAULT NULL,
  `saof_dist_name` varchar(100) DEFAULT NULL,
  `saof_added_by` int(10) unsigned DEFAULT NULL,
  `saof_added_by_name` varchar(50) DEFAULT NULL,
  `saof_last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `saof_last_login_IP` varchar(30) NOT NULL,
  `saof_time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `saof_time_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `saof_is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`saof_id`),
  UNIQUE KEY `saof_sno_UNIQUE` (`saof_sno`),
  UNIQUE KEY `saof_email_UNIQUE` (`saof_email`),
  UNIQUE KEY `saof_primary_mobile_UNIQUE` (`saof_primary_mobile`),
  KEY `FK_saof_city_idx` (`saof_city`),
  KEY `FK_saof_state_idx` (`saof_state`),
  KEY `FK_saof_country_idx` (`saof_country`),
  KEY `FK_saof_dist_link_idx` (`saof_dist_name`),
  KEY `FK_saof_dist_link_idx1` (`saof_dist_id`,`saof_dist_name`),
  KEY `FK_saof_fk_link_index` (`saof_sno`,`saof_name`),
  KEY `FK_saof_name_index` (`saof_name`),
  KEY `FK_saof_code_name_index` (`saof_id`,`saof_name`),
  CONSTRAINT `FK_saof_city` FOREIGN KEY (`saof_city`) REFERENCES `loc_city` (`loc_city_city`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_saof_country` FOREIGN KEY (`saof_country`) REFERENCES `loc_country` (`loc_country_country`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_saof_dist_link` FOREIGN KEY (`saof_dist_id`, `saof_dist_name`) REFERENCES `distributor` (`dist_sno`, `dist_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_saof_state` FOREIGN KEY (`saof_state`) REFERENCES `loc_state` (`loc_state_state`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

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

-- Dump completed on 2019-06-15  0:21:32
