CREATE TABLE `ab_test_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testName` varchar(64) NOT NULL,
	`variant` varchar(32) NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`converted` boolean NOT NULL DEFAULT false,
	`conversionValue` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ab_test_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`referrerUrl` text,
	`userAgent` text,
	`ipHash` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_conversions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`affiliateId` int NOT NULL,
	`referredUserId` int NOT NULL,
	`planId` varchar(64) NOT NULL,
	`saleAmount` bigint NOT NULL,
	`commissionRate` int NOT NULL,
	`commissionAmount` bigint NOT NULL,
	`conversionStatus` enum('pending','confirmed','paid','refunded') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_conversions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_partners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`affiliateCode` varchar(32) NOT NULL,
	`status` enum('pending','active','suspended') NOT NULL DEFAULT 'pending',
	`paymentEmail` varchar(320),
	`totalEarnings` bigint NOT NULL DEFAULT 0,
	`totalPaidOut` bigint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_partners_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliate_partners_affiliateCode_unique` UNIQUE(`affiliateCode`)
);
--> statement-breakpoint
CREATE TABLE `chat_trigger_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`visitorId` varchar(64) NOT NULL,
	`eventType` varchar(64) NOT NULL,
	`eventData` text,
	`pageUrl` text,
	`botTriggered` varchar(64),
	`interacted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_trigger_events_id` PRIMARY KEY(`id`)
);
