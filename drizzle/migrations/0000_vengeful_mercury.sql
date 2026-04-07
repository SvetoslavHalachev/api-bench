CREATE TABLE `benchmark_results` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer NOT NULL,
	`endpoint_a_label` text NOT NULL,
	`endpoint_a_url` text NOT NULL,
	`endpoint_b_label` text NOT NULL,
	`endpoint_b_url` text NOT NULL,
	`config` text NOT NULL,
	`result_a` text NOT NULL,
	`result_b` text NOT NULL
);
