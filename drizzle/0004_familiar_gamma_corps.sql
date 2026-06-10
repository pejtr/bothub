CREATE TABLE `conversation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`botId` varchar(64) NOT NULL,
	`userId` int,
	`visitorId` varchar(64),
	`messageCount` int NOT NULL DEFAULT 0,
	`firstMessage` text,
	`topicsJson` text,
	`durationSeconds` int DEFAULT 0,
	`planAtTime` varchar(32) DEFAULT 'free',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversation_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportDate` varchar(10) NOT NULL,
	`reportType` enum('daily','weekly') NOT NULL DEFAULT 'daily',
	`newUsers` int NOT NULL DEFAULT 0,
	`activeUsers` int NOT NULL DEFAULT 0,
	`newSubscriptions` int NOT NULL DEFAULT 0,
	`revenue` bigint NOT NULL DEFAULT 0,
	`chatSessions` int NOT NULL DEFAULT 0,
	`avgRating` int DEFAULT 0,
	`topBotsJson` text,
	`aiSummary` text,
	`strategicRecommendations` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `daily_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(64) NOT NULL,
	`botId` varchar(64) NOT NULL,
	`userId` int,
	`visitorId` varchar(64),
	`rating` int NOT NULL,
	`comment` text,
	`wouldRecommend` boolean,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_feedback_id` PRIMARY KEY(`id`)
);
