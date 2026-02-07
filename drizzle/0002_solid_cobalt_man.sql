CREATE TABLE `affiliate_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(200),
	`company` varchar(200),
	`website` varchar(500),
	`affiliateCode` varchar(100) NOT NULL,
	`status` enum('pending','approved','active') NOT NULL DEFAULT 'pending',
	`gdprConsent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `affiliate_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(200),
	`company` varchar(200),
	`plan` enum('free','gold','diamond') NOT NULL DEFAULT 'free',
	`source` varchar(100) DEFAULT 'hero_cta',
	`status` enum('pending','activated','synced') NOT NULL DEFAULT 'pending',
	`ctaVariant` varchar(50),
	`affiliateCode` varchar(100),
	`gdprConsent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `registrations_id` PRIMARY KEY(`id`)
);
