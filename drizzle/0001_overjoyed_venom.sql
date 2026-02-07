CREATE TABLE `ab_test_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`testName` varchar(100) NOT NULL,
	`variant` varchar(50) NOT NULL,
	`impressions` int NOT NULL DEFAULT 0,
	`clicks` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ab_test_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `affiliate_clicks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`partner` varchar(50) NOT NULL,
	`plan` varchar(50),
	`referrer` varchar(500),
	`clickedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_clicks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_captures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`source` varchar(50) DEFAULT 'unlock_modal',
	`variant` varchar(50),
	`gdprConsent` int NOT NULL DEFAULT 0,
	`capturedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_captures_id` PRIMARY KEY(`id`)
);
