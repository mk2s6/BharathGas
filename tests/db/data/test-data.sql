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
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `branch`
--

LOCK TABLES `branch` WRITE;
/*!40000 ALTER TABLE `branch` DISABLE KEYS */;
INSERT INTO `branch` VALUES (1,'Pune Branch',NULL,'pune.branch@fsjars.com','Swargate','Pune','Maharashtra','India','411042',1,1,1,'FSJ OwnerAnuj',NULL,NULL,'2019-03-03 18:26:05','2019-03-29 10:02:09',0),(2,'Mumbai Branch',NULL,'mumbai.branch@fsjars.com','Andheri','Mumbai','Maharashtra','India','400047',2,1,1,'FSJ OwnerAnuj',NULL,NULL,'2019-03-03 18:26:21','2019-03-29 10:02:12',0);
/*!40000 ALTER TABLE `branch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT INTO `company` VALUES (1,'FSJARS','FSJARS','We have created this application.','',1,'Anuj Sharma','2019-02-18 06:14:53','2019-03-29 11:31:23',0);
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `employee`
--

LOCK TABLES `employee` WRITE;
/*!40000 ALTER TABLE `employee` DISABLE KEYS */;
INSERT INTO `employee` VALUES (1,'FSJ OwnerAnuj','owner1@fsjars.com',0,'$2a$10$PRBfDOILQU0f0CC1TMcj1uTRq9kQmHICiprQR0dE3rifUQgj4vVJy',NULL,'9175514982','9175514983','Male','Owner','1991-04-12','','Pune','Maharashtra','India','411047',1,'FSJARS',1,NULL,NULL,NULL,'2019-05-21 18:21:17','::1','2019-02-18 10:28:21','2019-05-21 18:21:18',0),(5,'FSJ Owner2','owner2@fsjars.com',0,'$2a$10$PRBfDOILQU0f0CC1TMcj1uTRq9kQmHICiprQR0dE3rifUQgj4vVJy',NULL,'9175514985','9175514983','Female','Owner','1995-06-16','','Pune','Maharashtra','India','411047',1,'FSJARS',1,NULL,NULL,NULL,'2019-02-18 10:28:21','','2019-02-18 10:28:21','2019-03-15 13:43:01',0),(6,'FSJ Company Admin1','testadmin@fsjars.com',0,'$2a$10$PRBfDOILQU0f0CC1TMcj1uTRq9kQmHICiprQR0dE3rifUQgj4vVJy',NULL,'9175514983','9175514982','Male','Company Admin','1995-06-16','','Pune','Maharashtra','India','411047',1,'FSJARS',1,NULL,NULL,NULL,'2019-02-18 10:28:21','','2019-02-18 10:28:21','2019-03-25 14:57:04',0);
/*!40000 ALTER TABLE `employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `employee_manages_branch`
--

LOCK TABLES `employee_manages_branch` WRITE;
/*!40000 ALTER TABLE `employee_manages_branch` DISABLE KEYS */;
INSERT INTO `employee_manages_branch` VALUES (1,1,1,'FSJ OwnerAnuj',NULL,NULL,1,'2019-03-03 18:27:09','2019-03-29 11:48:18'),(1,2,1,'FSJ OwnerAnuj',NULL,NULL,1,'2019-03-03 18:27:09','2019-03-29 11:48:20');
/*!40000 ALTER TABLE `employee_manages_branch` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `employee_notification`
--

LOCK TABLES `employee_notification` WRITE;
/*!40000 ALTER TABLE `employee_notification` DISABLE KEYS */;
INSERT INTO `employee_notification` VALUES (2,1,'Enquiry','New','Followups for today :  0',5,'Sample Link Id','2019-05-05 03:05:56','2019-05-05 03:05:56'),(3,1,'Enquiry','New','Followups over due :  1',5,'Sample Link Id','2019-05-05 03:05:56','2019-05-05 03:05:56'),(4,1,'Enquiry','New','Followups for today :  0',5,'Sample Link Id','2019-05-05 18:35:00','2019-05-05 18:35:00'),(5,1,'Enquiry','New','Followups over due :  1',5,'Sample Link Id','2019-05-05 18:35:00','2019-05-05 18:35:00'),(6,1,'Enquiry','New','Followups for today :  0',5,'Sample Link Id','2019-05-15 18:35:00','2019-05-15 18:35:00'),(7,1,'Enquiry','New','Followups over due :  1',5,'Sample Link Id','2019-05-15 18:35:00','2019-05-15 18:35:00'),(8,1,'Enquiry','New','Anuj New notification',1,'1231','2019-05-18 12:49:47','2019-05-18 12:49:47'),(9,1,'Enquiry','New','Followups for today :  0',5,NULL,'2019-05-21 01:24:22','2019-05-21 01:24:22'),(10,1,'Enquiry','New','Followups over due :  1',5,NULL,'2019-05-21 01:24:22','2019-05-21 01:24:22');
/*!40000 ALTER TABLE `employee_notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `enquiry`
--

LOCK TABLES `enquiry` WRITE;
/*!40000 ALTER TABLE `enquiry` DISABLE KEYS */;
INSERT INTO `enquiry` VALUES (14,'My New Enquiry','Customer Name','customer@fsjars.com','9175514982','Swargate, Pune','Pune','Maharashtra','India','411028','Website',1,'This is new enquiry I have created',1,'In-Progress',1,'FSJ OwnerAnuj',NULL,NULL,5,'FSJ Owner2','Call',5,'FSJ Owner2','2019-03-14','14:30:00','15:30:00','Positive',NULL,'2019-03-15 16:13:02','2019-03-18 10:45:54',0);
/*!40000 ALTER TABLE `enquiry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `enquiry_comment`
--

LOCK TABLES `enquiry_comment` WRITE;
/*!40000 ALTER TABLE `enquiry_comment` DISABLE KEYS */;
INSERT INTO `enquiry_comment` VALUES (1,14,1,'Comment','My New Comment','This is my new comment that you need to add','2019-04-03 07:05:03',1,'FSJ OwnerAnuj');
/*!40000 ALTER TABLE `enquiry_comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `enquiry_task`
--

LOCK TABLES `enquiry_task` WRITE;
/*!40000 ALTER TABLE `enquiry_task` DISABLE KEYS */;
/*!40000 ALTER TABLE `enquiry_task` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `fsjars_employee`
--

LOCK TABLES `fsjars_employee` WRITE;
/*!40000 ALTER TABLE `fsjars_employee` DISABLE KEYS */;
INSERT INTO `fsjars_employee` VALUES (1,'Anuj Sharma','sharma.anuj1991@fsjars.com','$2a$10$PRBfDOILQU0f0CC1TMcj1uTRq9kQmHICiprQR0dE3rifUQgj4vVJy','','9175514982','Male','FSJ_Admin',1,NULL,NULL,NULL,'2019-02-17 14:05:52','','2019-01-15 06:58:19','2019-02-18 06:23:55',0),(2,'Swapnil Sharma','swapnil.r.sharma@fsjars.com','$2a$10$PRBfDOILQU0f0CC1TMcj1uTRq9kQmHICiprQR0dE3rifUQgj4vVJy','','9284720778','Male','FSJ_Sales_n_Mkting',1,NULL,NULL,NULL,'2019-02-17 14:05:52','','2019-01-15 06:58:19','2019-02-18 06:23:50',0),(3,'Test Admin','testadmin@fsjars.com','$2a$10$PRBfDOILQU0f0CC1TMcj1uTRq9kQmHICiprQR0dE3rifUQgj4vVJy','/profile/emp/DefaultBoy.png','9999999999','Male','FSJ_Admin',1,NULL,NULL,NULL,'2019-02-17 14:05:52','','2019-01-18 18:05:35','2019-01-18 19:12:11',0);
/*!40000 ALTER TABLE `fsjars_employee` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_city`
--

LOCK TABLES `lt_city` WRITE;
/*!40000 ALTER TABLE `lt_city` DISABLE KEYS */;
INSERT INTO `lt_city` VALUES ('Tirupati','Andhra Pradesh'),('Vizag','Andhra Pradesh'),('Mumbai','Maharashtra'),('Pune','Maharashtra');
/*!40000 ALTER TABLE `lt_city` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_country`
--

LOCK TABLES `lt_country` WRITE;
/*!40000 ALTER TABLE `lt_country` DISABLE KEYS */;
INSERT INTO `lt_country` VALUES ('India');
/*!40000 ALTER TABLE `lt_country` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_emp_role`
--

LOCK TABLES `lt_emp_role` WRITE;
/*!40000 ALTER TABLE `lt_emp_role` DISABLE KEYS */;
INSERT INTO `lt_emp_role` VALUES ('Branch Admin',1,1,0,1,1,'Anuj Sharma',NULL,NULL,'2019-02-17 16:00:56','2019-03-29 12:04:04'),('Company Admin',1,1,1,1,1,'Anuj Sharma',NULL,NULL,'2019-02-17 15:58:48','2019-03-29 12:04:06'),('Owner',1,1,1,1,1,'Anuj Sharma',NULL,NULL,'2019-02-17 15:58:48','2019-03-29 12:04:08'),('Receptionist',0,1,0,0,1,'Anuj Sharma',NULL,NULL,'2019-02-17 16:01:51','2019-03-29 12:04:11'),('Sales and Marketing',0,1,0,0,1,'Anuj Sharma',NULL,NULL,'2019-02-17 16:00:56','2019-03-29 12:04:13');
/*!40000 ALTER TABLE `lt_emp_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_employee_notification_type`
--

LOCK TABLES `lt_employee_notification_type` WRITE;
/*!40000 ALTER TABLE `lt_employee_notification_type` DISABLE KEYS */;
INSERT INTO `lt_employee_notification_type` VALUES ('Enquiry'),('Task');
/*!40000 ALTER TABLE `lt_employee_notification_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_enq_classification`
--

LOCK TABLES `lt_enq_classification` WRITE;
/*!40000 ALTER TABLE `lt_enq_classification` DISABLE KEYS */;
INSERT INTO `lt_enq_classification` VALUES ('Negative'),('Positive');
/*!40000 ALTER TABLE `lt_enq_classification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_enq_comment_type`
--

LOCK TABLES `lt_enq_comment_type` WRITE;
/*!40000 ALTER TABLE `lt_enq_comment_type` DISABLE KEYS */;
INSERT INTO `lt_enq_comment_type` VALUES ('Assignment-Change'),('Classification'),('Comment'),('Follow-up'),('Task');
/*!40000 ALTER TABLE `lt_enq_comment_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_enq_loss_reason`
--

LOCK TABLES `lt_enq_loss_reason` WRITE;
/*!40000 ALTER TABLE `lt_enq_loss_reason` DISABLE KEYS */;
INSERT INTO `lt_enq_loss_reason` VALUES ('Competitor'),('Other'),('Postponed'),('Price');
/*!40000 ALTER TABLE `lt_enq_loss_reason` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_enq_status`
--

LOCK TABLES `lt_enq_status` WRITE;
/*!40000 ALTER TABLE `lt_enq_status` DISABLE KEYS */;
INSERT INTO `lt_enq_status` VALUES ('Converted'),('In-Progress'),('Loss');
/*!40000 ALTER TABLE `lt_enq_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_fsjars_emp_role`
--

LOCK TABLES `lt_fsjars_emp_role` WRITE;
/*!40000 ALTER TABLE `lt_fsjars_emp_role` DISABLE KEYS */;
INSERT INTO `lt_fsjars_emp_role` VALUES ('FSJ_Admin'),('FSJ_Executive'),('FSJ_Sales_n_Mkting');
/*!40000 ALTER TABLE `lt_fsjars_emp_role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_notification_status`
--

LOCK TABLES `lt_notification_status` WRITE;
/*!40000 ALTER TABLE `lt_notification_status` DISABLE KEYS */;
INSERT INTO `lt_notification_status` VALUES ('New'),('Read'),('Unread');
/*!40000 ALTER TABLE `lt_notification_status` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_source_of_enquiry`
--

LOCK TABLES `lt_source_of_enquiry` WRITE;
/*!40000 ALTER TABLE `lt_source_of_enquiry` DISABLE KEYS */;
INSERT INTO `lt_source_of_enquiry` VALUES ('Banner'),('Google Search'),('Just Dial'),('Walk In'),('Website'),('Word Of Mouth');
/*!40000 ALTER TABLE `lt_source_of_enquiry` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `lt_state`
--

LOCK TABLES `lt_state` WRITE;
/*!40000 ALTER TABLE `lt_state` DISABLE KEYS */;
INSERT INTO `lt_state` VALUES ('Andaman & Nicobar','India'),('Andhra Pradesh','India'),('Hariyana','India'),('Kerala','India'),('Maharashtra','India'),('Rajasthan','India');
/*!40000 ALTER TABLE `lt_state` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping data for table `temp_test`
--

LOCK TABLES `temp_test` WRITE;
/*!40000 ALTER TABLE `temp_test` DISABLE KEYS */;
INSERT INTO `temp_test` VALUES (92,2,'Insert With Transaction.','00:00:00'),(93,2,'Transaction1.','00:00:00'),(94,2,'Insert With Transaction.','00:00:00'),(95,2,'Transaction1.','00:00:00'),(96,2,'Insert With Transaction.','00:00:00'),(97,2,'Transaction1.','00:00:00');
/*!40000 ALTER TABLE `temp_test` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-05-26 18:28:46
