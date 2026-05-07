CREATE TABLE `acciones_operativas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expedienteId` int NOT NULL,
	`tipo` enum('llamada','whatsapp','email','visita','negociacion','acuerdo','seguimiento','investigacion','requerimiento','accion_sorpresa','escalada','hito','nota') NOT NULL,
	`titulo` varchar(256) NOT NULL,
	`descripcion` text,
	`prioridad` enum('baja','media','alta','critica') DEFAULT 'media',
	`estado` enum('pendiente','en_progreso','completada','cancelada') DEFAULT 'pendiente',
	`fechaProgramada` timestamp,
	`fechaCompletada` timestamp,
	`resultado` text,
	`visibleCliente` boolean NOT NULL DEFAULT false,
	`cazadorId` int,
	`notasInternas` text,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `acciones_operativas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commercial_communications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`customerEmail` varchar(320),
	`customerPhone` varchar(32),
	`type` enum('quote_sent','automatic_reminder','manual_reminder','payment_link_sent','internal_note','phone_call','whatsapp','lost_reason') NOT NULL,
	`channel` enum('email','phone','whatsapp','internal') NOT NULL DEFAULT 'email',
	`subject` varchar(500),
	`bodySnapshot` text,
	`ruleId` int,
	`status` enum('sent','failed','skipped') NOT NULL DEFAULT 'sent',
	`errorMessage` text,
	`sentByUserId` int,
	`sentAt` timestamp NOT NULL DEFAULT (now()),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commercial_communications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commercial_emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`account_id` int NOT NULL,
	`message_id` varchar(512) NOT NULL,
	`in_reply_to` varchar(512),
	`from_email` varchar(320) NOT NULL,
	`from_name` varchar(255),
	`to_emails` json NOT NULL,
	`cc_emails` json DEFAULT ('[]'),
	`subject` varchar(512) NOT NULL,
	`body_html` mediumtext,
	`body_text` mediumtext,
	`snippet` varchar(300),
	`sent_at` timestamp,
	`is_read` boolean NOT NULL DEFAULT false,
	`is_answered` boolean NOT NULL DEFAULT false,
	`is_archived` boolean NOT NULL DEFAULT false,
	`is_deleted` boolean NOT NULL DEFAULT false,
	`is_sent` boolean NOT NULL DEFAULT false,
	`folder` varchar(100) NOT NULL DEFAULT 'INBOX',
	`has_attachments` boolean NOT NULL DEFAULT false,
	`labels` json DEFAULT ('[]'),
	`assigned_user_id` int,
	`linked_lead_id` int,
	`linked_client_id` int,
	`linked_quote_id` int,
	`linked_reservation_id` int,
	`imap_uid` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commercial_emails_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commercial_followup_rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`delayHours` int NOT NULL DEFAULT 24,
	`triggerFrom` enum('quote_sent_at','last_reminder_at') NOT NULL DEFAULT 'quote_sent_at',
	`onlyIfNotViewed` boolean NOT NULL DEFAULT false,
	`allowIfViewedButUnpaid` boolean NOT NULL DEFAULT true,
	`maxSendsPerQuoteForThisRule` int NOT NULL DEFAULT 1,
	`emailSubject` varchar(500) NOT NULL,
	`emailBody` text NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commercial_followup_rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `commercial_followup_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`enabled` boolean NOT NULL DEFAULT true,
	`maxTotalRemindersPerQuote` int NOT NULL DEFAULT 3,
	`maxEmailsPerRun` int NOT NULL DEFAULT 50,
	`allowedSendStart` varchar(5) NOT NULL DEFAULT '09:00',
	`allowedSendEnd` varchar(5) NOT NULL DEFAULT '21:00',
	`timezone` varchar(50) NOT NULL DEFAULT 'Europe/Madrid',
	`stopAfterDays` int NOT NULL DEFAULT 30,
	`internalCcEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `commercial_followup_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`imap_host` varchar(255) NOT NULL DEFAULT '',
	`imap_port` int NOT NULL DEFAULT 993,
	`imap_secure` boolean NOT NULL DEFAULT true,
	`imap_user` varchar(320) NOT NULL DEFAULT '',
	`imap_password_enc` text NOT NULL DEFAULT (''),
	`smtp_host` varchar(255) NOT NULL DEFAULT '',
	`smtp_port` int NOT NULL DEFAULT 587,
	`smtp_secure` boolean NOT NULL DEFAULT false,
	`smtp_user` varchar(320) NOT NULL DEFAULT '',
	`smtp_password_enc` text NOT NULL DEFAULT (''),
	`from_name` varchar(255) NOT NULL DEFAULT '',
	`from_email` varchar(320) NOT NULL DEFAULT '',
	`is_active` boolean NOT NULL DEFAULT true,
	`is_default` boolean NOT NULL DEFAULT false,
	`sync_enabled` boolean NOT NULL DEFAULT true,
	`sync_interval_min` int NOT NULL DEFAULT 5,
	`last_sync_at` timestamp,
	`last_sync_error` text,
	`folder_inbox` varchar(100) NOT NULL DEFAULT 'INBOX',
	`folder_sent` varchar(100) NOT NULL DEFAULT 'Sent',
	`folder_archive` varchar(100) NOT NULL DEFAULT 'Archive',
	`folder_trash` varchar(100) NOT NULL DEFAULT 'Trash',
	`max_emails_per_sync` int NOT NULL DEFAULT 50,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expedientes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numeroExpediente` varchar(32) NOT NULL,
	`estado` enum('pendiente_activacion','estrategia_inicial','operativo_activo','negociacion','acuerdo_parcial','recuperacion_parcial','recuperado','incobrable','suspendido','escalada_juridica','finalizado') NOT NULL DEFAULT 'pendiente_activacion',
	`clienteId` int,
	`clienteNombre` varchar(256),
	`deudorNombre` varchar(256) NOT NULL,
	`deudorTelefono` varchar(64),
	`deudorEmail` varchar(256),
	`deudorDireccion` text,
	`deudorNif` varchar(32),
	`importeDeuda` decimal(12,2) NOT NULL DEFAULT '0',
	`importeRecuperado` decimal(12,2) DEFAULT '0',
	`porcentajeExito` decimal(5,2) DEFAULT '20',
	`tipoDeuda` varchar(64),
	`probabilidadRecuperacion` int DEFAULT 50,
	`intensidadOperativa` int DEFAULT 1,
	`modoOperacion` enum('manual','semi-automatico','automatico') DEFAULT 'manual',
	`cazadorId` int,
	`progresoOperativo` int DEFAULT 0,
	`progresoFinanciero` int DEFAULT 0,
	`progresoPsicologico` int DEFAULT 0,
	`fechaApertura` varchar(10),
	`fechaCierre` varchar(10),
	`landingToken` varchar(64),
	`observacionesInternas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `expedientes_id` PRIMARY KEY(`id`),
	CONSTRAINT `expedientes_numeroExpediente_unique` UNIQUE(`numeroExpediente`),
	CONSTRAINT `expedientes_landingToken_unique` UNIQUE(`landingToken`)
);
--> statement-breakpoint
CREATE TABLE `ghl_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ghlConversationId` varchar(64) NOT NULL,
	`ghlContactId` varchar(64),
	`locationId` varchar(64),
	`channel` varchar(32) NOT NULL DEFAULT 'whatsapp',
	`customerName` varchar(255),
	`phone` varchar(32),
	`email` varchar(320),
	`lastMessagePreview` text,
	`lastMessageAt` timestamp,
	`unreadCount` int NOT NULL DEFAULT 0,
	`inbox` varchar(64),
	`starred` boolean NOT NULL DEFAULT false,
	`status` enum('new','open','pending','replied','closed') NOT NULL DEFAULT 'new',
	`assignedUserId` int,
	`linkedQuoteId` int,
	`linkedReservationId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ghl_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `ghl_conversations_ghlConversationId_unique` UNIQUE(`ghlConversationId`)
);
--> statement-breakpoint
CREATE TABLE `ghl_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ghlMessageId` varchar(64) NOT NULL,
	`ghlConversationId` varchar(64) NOT NULL,
	`direction` enum('inbound','outbound') NOT NULL DEFAULT 'inbound',
	`messageType` varchar(32) DEFAULT 'text',
	`body` text,
	`attachmentsJson` json,
	`senderName` varchar(255),
	`sentAt` timestamp,
	`deliveryStatus` varchar(32),
	`rawPayloadJson` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ghl_messages_id` PRIMARY KEY(`id`),
	CONSTRAINT `ghl_messages_ghlMessageId_unique` UNIQUE(`ghlMessageId`)
);
--> statement-breakpoint
CREATE TABLE `ghl_webhook_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`eventId` varchar(128),
	`eventType` varchar(128) NOT NULL,
	`ghlConversationId` varchar(64),
	`ghlContactId` varchar(64),
	`locationId` varchar(64),
	`rawPayloadJson` json,
	`processedStatus` enum('pending','processed','failed','ignored') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`receivedAt` timestamp NOT NULL DEFAULT (now()),
	`processedAt` timestamp,
	CONSTRAINT `ghl_webhook_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quote_commercial_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quoteId` int NOT NULL,
	`commercialStatus` enum('pending_followup','reminder_1_sent','reminder_2_sent','reminder_3_sent','interested','paused','lost','converted','discarded') NOT NULL DEFAULT 'pending_followup',
	`reminderPaused` boolean NOT NULL DEFAULT false,
	`reminderPausedReason` text,
	`reminderCount` int NOT NULL DEFAULT 0,
	`lastReminderAt` timestamp,
	`nextFollowupAt` timestamp,
	`lastContactAt` timestamp,
	`lastContactChannel` enum('email','phone','whatsapp','internal'),
	`lostReason` text,
	`internalNotes` text,
	`assignedToUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quote_commercial_tracking_id` PRIMARY KEY(`id`),
	CONSTRAINT `quote_commercial_tracking_quoteId_unique` UNIQUE(`quoteId`)
);
--> statement-breakpoint
CREATE TABLE `vapi_calls` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vapiCallId` varchar(128) NOT NULL,
	`assistantId` varchar(128),
	`phoneNumber` varchar(32),
	`customerName` varchar(255),
	`customerEmail` varchar(320),
	`startedAt` timestamp,
	`endedAt` timestamp,
	`durationSeconds` int,
	`status` varchar(64),
	`endedReason` varchar(128),
	`recordingUrl` text,
	`transcript` mediumtext,
	`summary` text,
	`structuredData` json,
	`rawPayload` json,
	`linkedLeadId` int,
	`linkedBudgetId` int,
	`linkedReservationId` int,
	`reviewed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vapi_calls_id` PRIMARY KEY(`id`),
	CONSTRAINT `vapi_calls_vapiCallId_unique` UNIQUE(`vapiCallId`)
);
--> statement-breakpoint
ALTER TABLE `invoices` MODIFY COLUMN `paymentMethod` enum('redsys','transferencia','efectivo','otro','tarjeta_fisica','tarjeta_redsys') DEFAULT 'redsys';--> statement-breakpoint
ALTER TABLE `quotes` MODIFY COLUMN `payment_method` enum('redsys','transferencia','efectivo','otro','tarjeta_fisica','tarjeta_redsys');--> statement-breakpoint
ALTER TABLE `reservations` MODIFY COLUMN `paymentMethod` enum('redsys','transferencia','efectivo','otro','tarjeta_fisica','tarjeta_redsys');--> statement-breakpoint
ALTER TABLE `reviews` MODIFY COLUMN `entityType` enum('hotel','spa','experience','pack','restaurant') NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions` MODIFY COLUMN `paymentMethod` enum('tarjeta','transferencia','efectivo','link_pago','otro','tarjeta_fisica','tarjeta_redsys') DEFAULT 'tarjeta';--> statement-breakpoint
ALTER TABLE `tpv_sale_items` ADD `is_manual` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `tpv_sale_items` ADD `concept_text` varchar(500);