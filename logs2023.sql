CREATE TABLE `cso1_kiosk_paid_pos` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`kioskUuid` VARCHAR(50) NOT NULL COLLATE 'utf8mb4_general_ci',
	`paymentTypeId` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`paid` INT(11) NULL DEFAULT '0',
	`deviceId` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`cardId` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`externalTransId` VARCHAR(50) NULL DEFAULT NULL COLLATE 'utf8mb4_general_ci',
	`startDate` DATETIME NULL DEFAULT '2023-01-01 00:00:00',
	`input_date` DATETIME NULL DEFAULT '2023-01-01 00:00:00',
	`update_date` DATETIME NULL DEFAULT '2023-01-01 00:00:00',
	PRIMARY KEY (`id`) USING BTREE
)
COLLATE='utf8mb4_general_ci'
ENGINE=InnoDB
AUTO_INCREMENT=6
;


alter TABLE 'cso1_transaction' add  settlementId
 

ALTER TABLE `cso1_promotion`
	CHANGE COLUMN `Thur` `Thu` INT(1) NULL DEFAULT '0' AFTER `Wed`;

ALTER TABLE `cso1_kiosk_cart`
	ADD COLUMN `promotionFreeId` INT(11) NULL DEFAULT NULL AFTER `promotionItemId`;


	ALTER TABLE `cso1_transaction_detail`
	ADD COLUMN `exchange` VARCHAR(50) NOT NULL DEFAULT '' AFTER `refund`;

ALTER TABLE `cso1_kiosk_uuid`
	ADD COLUMN `exchange` VARCHAR(50) NOT NULL AFTER `kioskUuid`;
