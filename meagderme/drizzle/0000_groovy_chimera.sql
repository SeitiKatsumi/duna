CREATE TABLE `events` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`name` text NOT NULL,
	`clinic` text NOT NULL,
	`specialty` text NOT NULL,
	`phone` text NOT NULL,
	`location` text NOT NULL,
	`period` text NOT NULL,
	`plan` text NOT NULL,
	`source` text NOT NULL,
	`referrer` text NOT NULL,
	`consent_version` text NOT NULL,
	`crm_status` text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_leads_created` ON `leads` (`created_at`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
