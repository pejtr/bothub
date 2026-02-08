CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(200) NOT NULL,
	`titleCs` varchar(300) NOT NULL,
	`titleEn` varchar(300),
	`contentCs` text NOT NULL,
	`contentEn` text,
	`excerptCs` text,
	`excerptEn` text,
	`metaDescriptionCs` varchar(300),
	`metaDescriptionEn` varchar(300),
	`category` varchar(100),
	`coverImage` varchar(500),
	`author` varchar(200) DEFAULT 'BOTHUB Team',
	`blogStatus` enum('draft','published') NOT NULL DEFAULT 'draft',
	`readingTime` int DEFAULT 5,
	`publishedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `user_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('registration','affiliate','milestone','system','payment') NOT NULL DEFAULT 'system',
	`title` varchar(200) NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`actionUrl` varchar(500),
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_notifications_id` PRIMARY KEY(`id`)
);
