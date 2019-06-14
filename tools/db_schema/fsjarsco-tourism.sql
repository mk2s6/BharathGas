-- MySQL dump 10.16  Distrib 10.1.38-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: fsjarsco_tourism
-- ------------------------------------------------------
-- Server version	10.1.38-MariaDB

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
-- Table structure for table `branch`
--

DROP TABLE IF EXISTS `branch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `branch` (
  `bran_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bran_name` varchar(100) NOT NULL,
  `bran_contact` varchar(20) DEFAULT NULL COMMENT 'Only needed when it is there and need not be unique.',
  `bran_email` varchar(150) DEFAULT NULL COMMENT 'Only needed when it is there and need not be unique.',
  `bran_address` varchar(255) NOT NULL,
  `bran_city` varchar(50) NOT NULL,
  `bran_state` varchar(50) NOT NULL,
  `bran_country` varchar(50) NOT NULL,
  `bran_PIN` varchar(10) NOT NULL,
  `bran_sort_order` smallint(5) unsigned NOT NULL COMMENT 'If branch is in 1 it means this is head quarter',
  `bran_comp_id` int(10) unsigned NOT NULL,
  `bran_added_by` int(10) unsigned NOT NULL,
  `bran_added_by_name` varchar(100) NOT NULL,
  `bran_modified_by` int(10) unsigned DEFAULT NULL,
  `bran_modified_by_name` varchar(100) DEFAULT NULL,
  `bran_time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `bran_time_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `bran_is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`bran_id`),
  UNIQUE KEY `bran_name` (`bran_name`,`bran_comp_id`),
  UNIQUE KEY `UNIQUE_bran_sort_order_comp_id` (`bran_sort_order`,`bran_comp_id`) USING BTREE,
  KEY `FK_bran_comp_id` (`bran_comp_id`),
  KEY `FK_bran_city` (`bran_city`),
  KEY `FK_bran_state` (`bran_state`),
  KEY `FK_bran_country` (`bran_country`),
  KEY `FK_bran_modified_by_id_and_name` (`bran_modified_by`,`bran_modified_by_name`),
  KEY `FK_bran_added_by_id_and_name` (`bran_added_by`,`bran_added_by_name`),
  CONSTRAINT `FK_bran_added_by_id_and_name` FOREIGN KEY (`bran_added_by`, `bran_added_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_bran_city` FOREIGN KEY (`bran_city`) REFERENCES `lt_city` (`lt_city_city`) ON UPDATE CASCADE,
  CONSTRAINT `FK_bran_comp_id` FOREIGN KEY (`bran_comp_id`) REFERENCES `company` (`comp_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_bran_country` FOREIGN KEY (`bran_country`) REFERENCES `lt_country` (`lt_country_country`) ON UPDATE CASCADE,
  CONSTRAINT `FK_bran_modified_by_id_and_name` FOREIGN KEY (`bran_modified_by`, `bran_modified_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_bran_state` FOREIGN KEY (`bran_state`) REFERENCES `lt_state` (`lt_state_state`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `company` (
  `comp_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `comp_code` varchar(20) NOT NULL COMMENT 'This should be unique so that we can identify which company employee/student is login.',
  `comp_name` varchar(100) NOT NULL,
  `comp_description` varchar(2000) DEFAULT NULL COMMENT 'Hold description about the customer',
  `comp_img` varchar(255) NOT NULL,
  `comp_RM` int(10) unsigned DEFAULT NULL COMMENT 'Who is RM from our customer care executive',
  `comp_RM_name` varchar(100) DEFAULT NULL,
  `comp_time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `comp_time_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `comp_is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`comp_id`),
  UNIQUE KEY `UNIQUE_comp_code` (`comp_code`),
  KEY `comp_name` (`comp_name`),
  KEY `FK_comp_RM_id_and_name` (`comp_RM`,`comp_RM_name`),
  CONSTRAINT `FK_comp_RM_id_and_name` FOREIGN KEY (`comp_RM`, `comp_RM_name`) REFERENCES `fsjars_employee` (`fsj_emp_id`, `fsj_emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee`
--

DROP TABLE IF EXISTS `employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee` (
  `emp_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `emp_name` varchar(100) NOT NULL COMMENT 'This is full name and shouldn''t be used for login',
  `emp_email` varchar(150) NOT NULL,
  `emp_is_email_verified` tinyint(1) NOT NULL DEFAULT '0',
  `emp_pwd` varchar(256) NOT NULL,
  `emp_image` varchar(255) DEFAULT NULL,
  `emp_mobile_primary` varchar(11) NOT NULL,
  `emp_mobile_secondary` varchar(20) DEFAULT NULL,
  `emp_gender` enum('Male','Female','','') NOT NULL,
  `emp_role` varchar(20) NOT NULL COMMENT 'What is the role of this user',
  `emp_DOB` date NOT NULL,
  `emp_address` varchar(255) NOT NULL,
  `emp_city` varchar(50) NOT NULL,
  `emp_state` varchar(50) NOT NULL,
  `emp_country` varchar(50) NOT NULL,
  `emp_PIN` varchar(10) NOT NULL,
  `emp_comp_id` int(10) unsigned NOT NULL COMMENT 'This store in which company employee belongs',
  `emp_comp_code` varchar(20) NOT NULL COMMENT 'FK from company table.',
  `emp_added_by` int(10) unsigned DEFAULT NULL COMMENT 'This store who added this user. We need this to be null because for first owner there will not be any ID that we can use.',
  `emp_added_by_name` varchar(100) DEFAULT NULL,
  `emp_modified_by` int(10) unsigned DEFAULT NULL COMMENT 'Who modified the details of this employee',
  `emp_modified_by_name` varchar(100) DEFAULT NULL,
  `emp_last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `emp_last_login_IP` varchar(30) NOT NULL,
  `emp_time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `emp_time_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `emp_is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`emp_id`),
  UNIQUE KEY `emp_mobile` (`emp_mobile_primary`,`emp_comp_id`),
  UNIQUE KEY `emp_email` (`emp_email`,`emp_comp_id`),
  KEY `FK_emp_comp_id` (`emp_comp_id`),
  KEY `FK_emp_city` (`emp_city`),
  KEY `FK_emp_state` (`emp_state`),
  KEY `FK_emp_country` (`emp_country`),
  KEY `FK_emp_comp_code` (`emp_comp_code`),
  KEY `INDEX_emp_id_and_name` (`emp_id`,`emp_name`) USING BTREE,
  KEY `FK_emp_role` (`emp_role`) USING BTREE,
  KEY `FK_emp_added_by_id_and_name` (`emp_added_by`,`emp_added_by_name`),
  KEY `FK_emp_modified_by_id_and_name` (`emp_modified_by`,`emp_modified_by_name`),
  CONSTRAINT `FK_emp_added_by_id_and_name` FOREIGN KEY (`emp_added_by`, `emp_added_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_emp_city` FOREIGN KEY (`emp_city`) REFERENCES `lt_city` (`lt_city_city`) ON UPDATE CASCADE,
  CONSTRAINT `FK_emp_comp_code` FOREIGN KEY (`emp_comp_code`) REFERENCES `company` (`comp_code`) ON UPDATE CASCADE,
  CONSTRAINT `FK_emp_comp_id` FOREIGN KEY (`emp_comp_id`) REFERENCES `company` (`comp_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_emp_country` FOREIGN KEY (`emp_country`) REFERENCES `lt_country` (`lt_country_country`) ON UPDATE CASCADE,
  CONSTRAINT `FK_emp_modified_by_id_and_name` FOREIGN KEY (`emp_modified_by`, `emp_modified_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_emp_role` FOREIGN KEY (`emp_role`) REFERENCES `lt_emp_role` (`lt_emp_role`) ON UPDATE CASCADE,
  CONSTRAINT `FK_emp_state` FOREIGN KEY (`emp_state`) REFERENCES `lt_state` (`lt_state_state`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_manages_branch`
--

DROP TABLE IF EXISTS `employee_manages_branch`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee_manages_branch` (
  `emb_emp_id` int(10) unsigned NOT NULL,
  `emb_bran_id` int(10) unsigned NOT NULL,
  `emb_added_by` int(10) unsigned NOT NULL,
  `emb_added_by_name` varchar(100) NOT NULL,
  `emb_modified_by` int(10) unsigned DEFAULT NULL,
  `emb_modified_by_name` varchar(100) DEFAULT NULL,
  `emb_comp_id` int(10) unsigned NOT NULL,
  `emb_time_added` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `emb_time_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`emb_emp_id`,`emb_bran_id`),
  KEY `FK_emb_bran_id` (`emb_bran_id`),
  KEY `FK_emb_comp_id` (`emb_comp_id`),
  KEY `FK_emb_modified_by_id_and_name` (`emb_modified_by`,`emb_modified_by_name`),
  KEY `FK_emb_added_by_id_and_name` (`emb_added_by`,`emb_added_by_name`),
  CONSTRAINT `FK_emb_added_by_id_and_name` FOREIGN KEY (`emb_added_by`, `emb_added_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_emb_bran_id` FOREIGN KEY (`emb_bran_id`) REFERENCES `branch` (`bran_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_emb_comp_id` FOREIGN KEY (`emb_comp_id`) REFERENCES `company` (`comp_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `FK_emb_emp_id` FOREIGN KEY (`emb_emp_id`) REFERENCES `employee` (`emp_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_emb_modified_by_id_and_name` FOREIGN KEY (`emb_modified_by`, `emb_modified_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `employee_notification`
--

DROP TABLE IF EXISTS `employee_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `employee_notification` (
  `noti_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `noti_comp_id` int(10) unsigned NOT NULL,
  `noti_type` varchar(50) NOT NULL,
  `noti_status` varchar(20) NOT NULL,
  `noti_message` varchar(255) NOT NULL,
  `noti_emp_id` int(10) unsigned NOT NULL,
  `noti_link_id` varchar(100) DEFAULT NULL COMMENT 'A unique identifiers to identify the element associated with this notificaiton.',
  `time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `time_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`noti_id`),
  KEY `FK_noti_comp_id` (`noti_comp_id`),
  KEY `FK_noti_type` (`noti_type`),
  KEY `FK_noti_status` (`noti_status`),
  KEY `FK_noti_emp_id` (`noti_emp_id`),
  CONSTRAINT `FK_noti_comp_id` FOREIGN KEY (`noti_comp_id`) REFERENCES `company` (`comp_id`),
  CONSTRAINT `FK_noti_emp_id` FOREIGN KEY (`noti_emp_id`) REFERENCES `employee` (`emp_id`),
  CONSTRAINT `FK_noti_status` FOREIGN KEY (`noti_status`) REFERENCES `lt_notification_status` (`lt_notification_status_status`) ON UPDATE CASCADE,
  CONSTRAINT `FK_noti_type` FOREIGN KEY (`noti_type`) REFERENCES `lt_employee_notification_type` (`lt_employee_notification_type_type`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enquiry`
--

DROP TABLE IF EXISTS `enquiry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enquiry` (
  `enq_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `enq_title` varchar(255) NOT NULL,
  `enq_cust_name` varchar(100) NOT NULL,
  `enq_cust_email` varchar(150) NOT NULL,
  `enq_cust_mobile` varchar(20) NOT NULL,
  `enq_cust_address` varchar(255) DEFAULT NULL,
  `enq_cust_city` varchar(50) NOT NULL,
  `enq_cust_state` varchar(50) NOT NULL,
  `enq_cust_country` varchar(50) NOT NULL,
  `enq_cust_PIN` varchar(10) DEFAULT NULL,
  `enq_source_of_enquiry` varchar(20) NOT NULL,
  `enq_bran_id` int(10) unsigned NOT NULL,
  `enq_description` varchar(5000) DEFAULT NULL,
  `enq_comp_id` int(10) unsigned NOT NULL,
  `enq_status` varchar(20) NOT NULL,
  `enq_created_by` int(10) unsigned NOT NULL,
  `enq_created_by_name` varchar(100) NOT NULL,
  `enq_modified_by` int(10) unsigned DEFAULT NULL,
  `enq_modified_by_name` varchar(100) DEFAULT NULL,
  `enq_assigned_to` int(10) unsigned NOT NULL,
  `enq_assigned_to_name` varchar(100) NOT NULL,
  `enq_follow_up_details` varchar(80) NOT NULL COMMENT 'This can be Call, In person meeting or any details',
  `enq_follow_up_assigned_to` int(10) unsigned NOT NULL,
  `enq_follow_up_assigned_to_name` varchar(100) NOT NULL,
  `enq_follow_up_due_date` date NOT NULL,
  `enq_follow_up_start_time` time NOT NULL,
  `enq_follow_up_end_time` time NOT NULL,
  `enq_classification` varchar(20) NOT NULL DEFAULT 'Positive',
  `enq_loss_reason` varchar(20) DEFAULT NULL,
  `enq_time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `enq_time_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `enq_is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`enq_id`),
  KEY `INDEX_enq_cust_email` (`enq_cust_email`),
  KEY `INDEX_enq_cust_mobile` (`enq_cust_mobile`),
  KEY `FK_enq_status` (`enq_status`),
  KEY `FK_enq_classification` (`enq_classification`),
  KEY `FK_enq_loss_reason` (`enq_loss_reason`),
  KEY `FK_enq_comp_id` (`enq_comp_id`),
  KEY `FK_enq_cust_city` (`enq_cust_city`),
  KEY `FK_enq_cust_state` (`enq_cust_state`),
  KEY `FK_enq_cust_country` (`enq_cust_country`),
  KEY `FK_enq_source_of_enquiry` (`enq_source_of_enquiry`),
  KEY `FK_enq_bran_id` (`enq_bran_id`),
  KEY `FK_enq_assigned_to_id_and_name` (`enq_assigned_to`,`enq_assigned_to_name`),
  KEY `FK_enq_follow_up_assigned_to_id_and_name` (`enq_follow_up_assigned_to`,`enq_follow_up_assigned_to_name`),
  KEY `FK_enq_modified_by_id_and_name` (`enq_modified_by`,`enq_modified_by_name`),
  KEY `FK_enq_created_by_id_and_name` (`enq_created_by`,`enq_created_by_name`),
  CONSTRAINT `FK_enq_assigned_to_id_and_name` FOREIGN KEY (`enq_assigned_to`, `enq_assigned_to_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_bran_id` FOREIGN KEY (`enq_bran_id`) REFERENCES `branch` (`bran_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_classification` FOREIGN KEY (`enq_classification`) REFERENCES `lt_enq_classification` (`lt_enq_classification_classification`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_comp_id` FOREIGN KEY (`enq_comp_id`) REFERENCES `company` (`comp_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_created_by_id_and_name` FOREIGN KEY (`enq_created_by`, `enq_created_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_cust_city` FOREIGN KEY (`enq_cust_city`) REFERENCES `lt_city` (`lt_city_city`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_cust_country` FOREIGN KEY (`enq_cust_country`) REFERENCES `lt_country` (`lt_country_country`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_cust_state` FOREIGN KEY (`enq_cust_state`) REFERENCES `lt_state` (`lt_state_state`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_follow_up_assigned_to_id_and_name` FOREIGN KEY (`enq_follow_up_assigned_to`, `enq_follow_up_assigned_to_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_loss_reason` FOREIGN KEY (`enq_loss_reason`) REFERENCES `lt_enq_loss_reason` (`lt_loss_reason_reason`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_modified_by_id_and_name` FOREIGN KEY (`enq_modified_by`, `enq_modified_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_source_of_enquiry` FOREIGN KEY (`enq_source_of_enquiry`) REFERENCES `lt_source_of_enquiry` (`lt_source_of_enquiry_source`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_status` FOREIGN KEY (`enq_status`) REFERENCES `lt_enq_status` (`lt_enq_status_status`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enquiry_comment`
--

DROP TABLE IF EXISTS `enquiry_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enquiry_comment` (
  `enq_com_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `enq_com_enq_id` int(10) unsigned NOT NULL,
  `enq_com_comp_id` int(10) unsigned NOT NULL,
  `enq_com_type` varchar(20) NOT NULL,
  `enq_com_title` varchar(100) NOT NULL COMMENT 'This has to be in specific format given by backend so that it is easy to colour it',
  `enq_com_description` varchar(5000) DEFAULT NULL,
  `enq_com_created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `enq_com_created_by` int(10) unsigned NOT NULL,
  `enq_com_created_by_name` varchar(100) NOT NULL,
  PRIMARY KEY (`enq_com_id`),
  KEY `FK_enq_comment_comp_id` (`enq_com_comp_id`),
  KEY `FK_enq_comment_enq_id` (`enq_com_enq_id`),
  KEY `FK_enq_comment_created_by_id_and_name` (`enq_com_created_by`,`enq_com_created_by_name`),
  KEY `FK_enq_comment_type` (`enq_com_type`),
  CONSTRAINT `FK_enq_comment_comp_id` FOREIGN KEY (`enq_com_comp_id`) REFERENCES `company` (`comp_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_comment_created_by_id_and_name` FOREIGN KEY (`enq_com_created_by`, `enq_com_created_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_comment_enq_id` FOREIGN KEY (`enq_com_enq_id`) REFERENCES `enquiry` (`enq_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_comment_type` FOREIGN KEY (`enq_com_type`) REFERENCES `lt_enq_comment_type` (`lt_enq_comment_type_type`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `enquiry_task`
--

DROP TABLE IF EXISTS `enquiry_task`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `enquiry_task` (
  `enq_task_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `enq_task_enq_id` int(10) unsigned NOT NULL,
  `enq_task_comp_id` int(10) unsigned NOT NULL,
  `enq_task_title` varchar(100) NOT NULL,
  `enq_task_details` varchar(2000) NOT NULL COMMENT 'This does not give description of the task but just gives the idea of what it is.',
  `enq_task_created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `enq_task_created_by` int(10) unsigned NOT NULL,
  `enq_task_create_by_name` varchar(100) NOT NULL,
  `enq_task_assigned_to` int(10) unsigned NOT NULL,
  `enq_task_assigned_to_name` varchar(100) NOT NULL,
  `enq_task_due_date` date NOT NULL,
  `enq_task_start_time` time DEFAULT NULL,
  `enq_task_end_time` time DEFAULT NULL,
  PRIMARY KEY (`enq_task_id`),
  KEY `INDEX_enq_task_comp_id` (`enq_task_comp_id`),
  KEY `FK_enq_task_enq_id` (`enq_task_enq_id`),
  KEY `FK_enq_task_created_by_id_and_name` (`enq_task_created_by`,`enq_task_create_by_name`),
  KEY `FK_enq_task_assigned_to_id_and_name` (`enq_task_assigned_to`,`enq_task_assigned_to_name`) USING BTREE,
  CONSTRAINT `FK_enq_task_assigned_to_id_and_name` FOREIGN KEY (`enq_task_assigned_to`, `enq_task_assigned_to_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_task_comp_id` FOREIGN KEY (`enq_task_comp_id`) REFERENCES `company` (`comp_id`) ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_task_created_by_id_and_name` FOREIGN KEY (`enq_task_created_by`, `enq_task_create_by_name`) REFERENCES `employee` (`emp_id`, `emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_enq_task_enq_id` FOREIGN KEY (`enq_task_enq_id`) REFERENCES `enquiry` (`enq_id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `fsjars_employee`
--

DROP TABLE IF EXISTS `fsjars_employee`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `fsjars_employee` (
  `fsj_emp_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `fsj_emp_name` varchar(100) NOT NULL,
  `fsj_emp_email` varchar(320) NOT NULL,
  `fsj_emp_pwd` varchar(256) NOT NULL,
  `fsj_emp_image` varchar(255) NOT NULL,
  `fsj_emp_mobile` varchar(11) NOT NULL,
  `fsj_emp_gender` enum('Male','Female') NOT NULL,
  `fsj_emp_role` varchar(20) NOT NULL,
  `fsj_emp_added_by` int(10) unsigned DEFAULT NULL,
  `fsj_emp_added_by_name` varchar(100) DEFAULT NULL,
  `fsj_emp_modified_by` int(10) unsigned DEFAULT NULL,
  `fsj_emp_modified_by_name` varchar(100) DEFAULT NULL,
  `fsj_emp_last_login` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fsj_emp_last_login_IP` varchar(30) NOT NULL,
  `fsj_emp_time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fsj_emp_time_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fsj_emp_is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`fsj_emp_id`),
  UNIQUE KEY `emp_mobile_UNIQUE` (`fsj_emp_mobile`) USING BTREE,
  UNIQUE KEY `emp_email_UNIQUE` (`fsj_emp_email`) USING BTREE,
  KEY `FK_emp_employee_role` (`fsj_emp_role`),
  KEY `INDEX_fsj_emp_id_and_name` (`fsj_emp_id`,`fsj_emp_name`) USING BTREE,
  KEY `FK_fsj_emp_added_by_id_and_name` (`fsj_emp_added_by`,`fsj_emp_added_by_name`),
  KEY `FK_fsj_emp_modified_by_id_and_name` (`fsj_emp_modified_by`,`fsj_emp_modified_by_name`),
  CONSTRAINT `FK_fsj_emp_added_by_id_and_name` FOREIGN KEY (`fsj_emp_added_by`, `fsj_emp_added_by_name`) REFERENCES `fsjars_employee` (`fsj_emp_id`, `fsj_emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_fsj_emp_employee_role` FOREIGN KEY (`fsj_emp_role`) REFERENCES `lt_fsjars_emp_role` (`lt_fsj_emp_role`) ON UPDATE CASCADE,
  CONSTRAINT `FK_fsj_emp_modified_by_id_and_name` FOREIGN KEY (`fsj_emp_modified_by`, `fsj_emp_modified_by_name`) REFERENCES `fsjars_employee` (`fsj_emp_id`, `fsj_emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_city`
--

DROP TABLE IF EXISTS `lt_city`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_city` (
  `lt_city_city` varchar(50) NOT NULL,
  `lt_city_state` varchar(50) NOT NULL,
  PRIMARY KEY (`lt_city_city`),
  KEY `FK_lt_city_state` (`lt_city_state`),
  CONSTRAINT `FK_lt_city_state` FOREIGN KEY (`lt_city_state`) REFERENCES `lt_state` (`lt_state_state`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_country`
--

DROP TABLE IF EXISTS `lt_country`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_country` (
  `lt_country_country` varchar(50) NOT NULL,
  PRIMARY KEY (`lt_country_country`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_emp_role`
--

DROP TABLE IF EXISTS `lt_emp_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_emp_role` (
  `lt_emp_role` varchar(20) NOT NULL,
  `lt_emp_role_is_comp_level` tinyint(1) NOT NULL,
  `lt_emp_role_enq_mgmt` tinyint(1) NOT NULL COMMENT 'Whether enquiry management is allowed or not',
  `lt_emp_role_comp_setting` tinyint(1) NOT NULL COMMENT 'Add branch, add roles etc.',
  `lt_emp_role_employee_mgmt` tinyint(1) NOT NULL COMMENT 'Add remove employee, change roles etc.',
  `lt_emp_role_added_by` int(10) unsigned NOT NULL,
  `lt_emp_role_added_by_name` varchar(100) NOT NULL,
  `lt_emp_role_modified_by` int(10) unsigned DEFAULT NULL,
  `lt_emp_role_modified_by_name` varchar(100) DEFAULT NULL,
  `lt_emp_role_time_created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lt_emp_role_time_modified` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`lt_emp_role`) USING BTREE,
  KEY `FK_lt_emp_role_modified_by_id_and_name` (`lt_emp_role_modified_by`,`lt_emp_role_modified_by_name`),
  KEY `FK_lt_emp_role_added_by_id_and_name` (`lt_emp_role_added_by`,`lt_emp_role_added_by_name`),
  CONSTRAINT `FK_lt_emp_role_added_by_id_and_name` FOREIGN KEY (`lt_emp_role_added_by`, `lt_emp_role_added_by_name`) REFERENCES `fsjars_employee` (`fsj_emp_id`, `fsj_emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `FK_lt_emp_role_modified_by_id_and_name` FOREIGN KEY (`lt_emp_role_modified_by`, `lt_emp_role_modified_by_name`) REFERENCES `fsjars_employee` (`fsj_emp_id`, `fsj_emp_name`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_employee_notification_type`
--

DROP TABLE IF EXISTS `lt_employee_notification_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_employee_notification_type` (
  `lt_employee_notification_type_type` varchar(50) NOT NULL,
  PRIMARY KEY (`lt_employee_notification_type_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_enq_classification`
--

DROP TABLE IF EXISTS `lt_enq_classification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_enq_classification` (
  `lt_enq_classification_classification` varchar(20) NOT NULL,
  PRIMARY KEY (`lt_enq_classification_classification`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_enq_comment_type`
--

DROP TABLE IF EXISTS `lt_enq_comment_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_enq_comment_type` (
  `lt_enq_comment_type_type` varchar(20) NOT NULL,
  PRIMARY KEY (`lt_enq_comment_type_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_enq_loss_reason`
--

DROP TABLE IF EXISTS `lt_enq_loss_reason`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_enq_loss_reason` (
  `lt_loss_reason_reason` varchar(20) NOT NULL,
  PRIMARY KEY (`lt_loss_reason_reason`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_enq_status`
--

DROP TABLE IF EXISTS `lt_enq_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_enq_status` (
  `lt_enq_status_status` varchar(20) NOT NULL,
  PRIMARY KEY (`lt_enq_status_status`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_fsjars_emp_role`
--

DROP TABLE IF EXISTS `lt_fsjars_emp_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_fsjars_emp_role` (
  `lt_fsj_emp_role` varchar(20) NOT NULL,
  PRIMARY KEY (`lt_fsj_emp_role`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_notification_status`
--

DROP TABLE IF EXISTS `lt_notification_status`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_notification_status` (
  `lt_notification_status_status` varchar(20) NOT NULL,
  PRIMARY KEY (`lt_notification_status_status`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_source_of_enquiry`
--

DROP TABLE IF EXISTS `lt_source_of_enquiry`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_source_of_enquiry` (
  `lt_source_of_enquiry_source` varchar(20) NOT NULL,
  PRIMARY KEY (`lt_source_of_enquiry_source`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `lt_state`
--

DROP TABLE IF EXISTS `lt_state`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `lt_state` (
  `lt_state_state` varchar(50) NOT NULL,
  `lt_state_country` varchar(50) NOT NULL,
  PRIMARY KEY (`lt_state_state`),
  KEY `FK_lt_state_country` (`lt_state_country`),
  CONSTRAINT `FK_lt_state_country` FOREIGN KEY (`lt_state_country`) REFERENCES `lt_country` (`lt_country_country`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `temp_test`
--

DROP TABLE IF EXISTS `temp_test`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `temp_test` (
  `pk` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `a` int(11) NOT NULL,
  `b` varchar(100) NOT NULL,
  `time` time NOT NULL,
  PRIMARY KEY (`pk`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-05-26 17:24:19
