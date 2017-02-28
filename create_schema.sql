CREATE SCHEMA `payment_test` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;

CREATE TABLE IF NOT EXISTS `payment_test`.`orders` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `customer_name` VARCHAR(45) NULL,
  `customer_phone` VARCHAR(45) NULL,
  `currency` VARCHAR(45) NULL,
  `price` VARCHAR(45) NULL,
  `payment_gateway_id` VARCHAR(45) NULL,
  `ref_code` VARCHAR(45) NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX(`ref_code`)
);
