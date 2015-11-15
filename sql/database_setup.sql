-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               5.5.46-0ubuntu0.14.04.2 - (Ubuntu)
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             9.3.0.5009
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Dumping database structure for michrosoft
CREATE DATABASE IF NOT EXISTS `michrosoft` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `michrosoft`;


-- Dumping structure for table michrosoft.condition
CREATE TABLE IF NOT EXISTS `condition` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `min_friends` smallint(5) unsigned NOT NULL DEFAULT '0' COMMENT 'A special case in the backend is required if this is 0',
  `max_enemies` smallint(5) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.


-- Dumping structure for table michrosoft.condition_must_attend
CREATE TABLE IF NOT EXISTS `condition_must_attend` (
  `user_id` int(10) unsigned NOT NULL,
  `condition_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`condition_id`),
  KEY `FK_invitation_condition` (`condition_id`),
  KEY `FK_invitation_user` (`user_id`),
  CONSTRAINT `condition_must_attend_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `condition_must_attend_ibfk_3` FOREIGN KEY (`condition_id`) REFERENCES `condition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- Data exporting was unselected.


-- Dumping structure for table michrosoft.condition_must_not_attend
CREATE TABLE IF NOT EXISTS `condition_must_not_attend` (
  `user_id` int(10) unsigned NOT NULL,
  `condition_id` int(10) unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`condition_id`),
  KEY `FK_invitation_condition` (`condition_id`),
  KEY `FK_invitation_user` (`user_id`),
  CONSTRAINT `condition_must_not_attend_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`),
  CONSTRAINT `condition_must_not_attend_ibfk_2` FOREIGN KEY (`condition_id`) REFERENCES `condition` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- Data exporting was unselected.


-- Dumping structure for table michrosoft.event
CREATE TABLE IF NOT EXISTS `event` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `owner` int(10) unsigned NOT NULL,
  `title` tinytext NOT NULL,
  `description` text NOT NULL,
  `location` tinytext NOT NULL,
  `start_time` timestamp NOT NULL DEFAULT '1970-01-01 00:00:00',
  `response_deadline` timestamp NOT NULL DEFAULT '1970-01-01 00:00:00',
  `minimum_attendance` smallint(5) unsigned NOT NULL,
  `status` tinyint(3) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `FK_event_user` (`owner`),
  CONSTRAINT `FK_event_user` FOREIGN KEY (`owner`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.


-- Dumping structure for table michrosoft.favorite
CREATE TABLE IF NOT EXISTS `favorite` (
  `favoriter` int(10) unsigned NOT NULL,
  `favoritee` int(10) unsigned NOT NULL,
  PRIMARY KEY (`favoriter`,`favoritee`),
  KEY `FK__user_2` (`favoritee`),
  KEY `FK__user` (`favoriter`),
  CONSTRAINT `FK__user` FOREIGN KEY (`favoriter`) REFERENCES `user` (`id`),
  CONSTRAINT `FK__user_2` FOREIGN KEY (`favoritee`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.


-- Dumping structure for table michrosoft.group
CREATE TABLE IF NOT EXISTS `group` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` tinytext NOT NULL,
  `owner` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_group_user` (`owner`),
  CONSTRAINT `FK_group_user` FOREIGN KEY (`owner`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.


-- Dumping structure for table michrosoft.group_membership
CREATE TABLE IF NOT EXISTS `group_membership` (
  `user_id` int(10) unsigned NOT NULL,
  `group_id` int(10) unsigned NOT NULL,
  `accepted` tinyint(4) NOT NULL DEFAULT '0' COMMENT '0 for false, 1 for true',
  PRIMARY KEY (`user_id`,`group_id`),
  KEY `FK_group_membership_group` (`group_id`),
  KEY `FK_group_membership_user` (`user_id`),
  CONSTRAINT `FK_group_membership_group` FOREIGN KEY (`group_id`) REFERENCES `group` (`id`),
  CONSTRAINT `FK_group_membership_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.


-- Dumping structure for table michrosoft.invitation
CREATE TABLE IF NOT EXISTS `invitation` (
  `user_id` int(10) unsigned NOT NULL,
  `event_id` int(10) unsigned NOT NULL,
  `condition_id` int(10) unsigned DEFAULT NULL,
  `status` tinyint(3) unsigned NOT NULL DEFAULT '0',
  `hidden` tinyint(3) unsigned NOT NULL DEFAULT '0' COMMENT '0 is false, 1 is true',
  PRIMARY KEY (`user_id`,`event_id`),
  KEY `FK_invitation_event` (`event_id`),
  KEY `FK_invitation_condition` (`condition_id`),
  KEY `FK_invitation_user` (`user_id`),
  CONSTRAINT `FK_invitation_condition` FOREIGN KEY (`condition_id`) REFERENCES `condition` (`id`),
  CONSTRAINT `FK_invitation_event` FOREIGN KEY (`event_id`) REFERENCES `event` (`id`),
  CONSTRAINT `FK_invitation_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.


-- Dumping structure for table michrosoft.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `openid` char(50) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `image_url` tinytext CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `openid` (`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Data exporting was unselected.
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
