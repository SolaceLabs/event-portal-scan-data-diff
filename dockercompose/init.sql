CREATE DATABASE IF NOT EXISTS config_audit;

USE config_audit;

CREATE TABLE IF NOT EXISTS `Environment` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS `MEM` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(256),
  `envId` VARCHAR(256),
  FOREIGN KEY (`envId`) REFERENCES `Environment`(`id`)
);

CREATE TABLE IF NOT EXISTS `MessagingService` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(256),
  `memId` VARCHAR(256),
  FOREIGN KEY (`memId`) REFERENCES `MEM`(`id`)
);

CREATE TABLE IF NOT EXISTS `MsScan` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(256),
  `createdTime` DATETIME,
  `msId` VARCHAR(256),
  `status` VARCHAR(256),
  `statusDescription` VARCHAR(4096),
  FOREIGN KEY (`msId`) REFERENCES `MessagingService`(`id`)
);

CREATE TABLE IF NOT EXISTS `Entity` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(256),
  `dataCollectionType` VARCHAR(256),
  `type` VARCHAR(256),
  `scanId` VARCHAR(256),
  `rawData` JSON,
  FOREIGN KEY (`scanId`) REFERENCES `MsScan`(`id`)
);

CREATE TABLE IF NOT EXISTS `Jobs` (
  `id` VARCHAR(255) PRIMARY KEY,
  `type` VARCHAR(256),
  `relatedId` VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS `MappedEntity` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(256),
  `dataCollectionType` VARCHAR(256),
  `type` VARCHAR(256),
  `scanId` VARCHAR(256),
  `hash` VARCHAR(256),
  `rawData` JSON,
  FOREIGN KEY (`scanId`) REFERENCES `MsScan`(`id`)
);
