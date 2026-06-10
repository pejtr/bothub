ALTER TABLE `affiliate_clicks` ADD `source` varchar(32) DEFAULT 'ibots';--> statement-breakpoint
ALTER TABLE `affiliate_conversions` ADD `conversionSource` varchar(32) DEFAULT 'ibots';