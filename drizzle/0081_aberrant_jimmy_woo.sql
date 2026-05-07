CREATE TABLE `expediente_automation_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expedienteId` int NOT NULL,
	`trigger` varchar(64) NOT NULL,
	`triggerData` text,
	`actionType` varchar(64) NOT NULL,
	`actionData` text,
	`executedBy` varchar(32) NOT NULL DEFAULT 'system',
	`revertedAt` timestamp,
	`revertedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expediente_automation_logs_id` PRIMARY KEY(`id`)
);
