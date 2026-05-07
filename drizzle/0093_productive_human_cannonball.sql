CREATE TABLE `acreedores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(256) NOT NULL,
	`nif` varchar(32),
	`email` varchar(256),
	`telefono` varchar(64),
	`direccion` text,
	`organizacion` varchar(256),
	`notas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `acreedores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deudor_contactos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`deudorId` int NOT NULL,
	`tipo` enum('telefono','email','whatsapp','direccion','linkedin','otro') NOT NULL,
	`valor` varchar(512) NOT NULL,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`notas` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deudor_contactos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deudores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(256) NOT NULL,
	`nif` varchar(32),
	`email` varchar(256),
	`telefono` varchar(64),
	`direccion` text,
	`organizacion` varchar(256),
	`nivelCooperacion` enum('desconocido','colaborador','evasivo','hostil','bloqueado') NOT NULL DEFAULT 'desconocido',
	`nivelRiesgo` int NOT NULL DEFAULT 50,
	`historialImpagos` text,
	`ultimoContacto` timestamp,
	`totalDeudaAcumulada` decimal(12,2) NOT NULL DEFAULT '0',
	`notas` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deudores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expediente_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expedienteId` int NOT NULL,
	`campo` varchar(64) NOT NULL,
	`valorAnterior` text,
	`valorNuevo` text,
	`changedBy` int,
	`changedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expediente_audit_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expediente_documentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expedienteId` int NOT NULL,
	`tipo` enum('contrato','requerimiento','evidencia','acuerdo','identificacion','extracto','otro') NOT NULL,
	`nombre` varchar(256) NOT NULL,
	`s3Key` varchar(512),
	`s3Bucket` varchar(128),
	`url` varchar(1024),
	`uploadedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `expediente_documentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expediente_protocolos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`expedienteId` int NOT NULL,
	`protocoloId` int NOT NULL,
	`estado` enum('activo','completado','cancelado') NOT NULL DEFAULT 'activo',
	`pasoActual` int NOT NULL DEFAULT 0,
	`notas` text,
	`asignadoPor` int,
	`iniciadoAt` timestamp NOT NULL DEFAULT (now()),
	`completadoAt` timestamp,
	CONSTRAINT `expediente_protocolos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `protocolos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nombre` varchar(256) NOT NULL,
	`tipo` enum('persistente','radar','reactivacion','intensivo','presencial') NOT NULL,
	`descripcion` text,
	`pasos` json NOT NULL,
	`intensidadRecomendada` int NOT NULL DEFAULT 2,
	`duracionDias` int NOT NULL DEFAULT 30,
	`activo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `protocolos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `expedientes` ADD `acreedorId` int;--> statement-breakpoint
ALTER TABLE `expedientes` ADD `deudorId` int;--> statement-breakpoint
ALTER TABLE `expedientes` ADD `deudorToken` varchar(64);--> statement-breakpoint
ALTER TABLE `expedientes` ADD CONSTRAINT `expedientes_deudorToken_unique` UNIQUE(`deudorToken`);