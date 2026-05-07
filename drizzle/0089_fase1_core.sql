-- Fase 1 — Core Cobrafantasmas: acreedores, deudores, contactos, audit log, documentos

CREATE TABLE IF NOT EXISTS `acreedores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(256) NOT NULL,
  `nif` VARCHAR(32),
  `email` VARCHAR(256),
  `telefono` VARCHAR(64),
  `direccion` TEXT,
  `organizacion` VARCHAR(256),
  `notas` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `deudores` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nombre` VARCHAR(256) NOT NULL,
  `nif` VARCHAR(32),
  `email` VARCHAR(256),
  `telefono` VARCHAR(64),
  `direccion` TEXT,
  `organizacion` VARCHAR(256),
  `nivelCooperacion` ENUM('desconocido','colaborador','evasivo','hostil','bloqueado') NOT NULL DEFAULT 'desconocido',
  `nivelRiesgo` INT NOT NULL DEFAULT 50,
  `historialImpagos` TEXT,
  `ultimoContacto` TIMESTAMP NULL,
  `totalDeudaAcumulada` DECIMAL(12,2) NOT NULL DEFAULT '0',
  `notas` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `deudor_contactos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `deudorId` INT NOT NULL,
  `tipo` ENUM('telefono','email','whatsapp','direccion','linkedin','otro') NOT NULL,
  `valor` VARCHAR(512) NOT NULL,
  `isPrimary` BOOLEAN NOT NULL DEFAULT false,
  `notas` VARCHAR(256),
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_deudor_contactos_deudor` (`deudorId`)
);

CREATE TABLE IF NOT EXISTS `expediente_audit_log` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `expedienteId` INT NOT NULL,
  `campo` VARCHAR(64) NOT NULL,
  `valorAnterior` TEXT,
  `valorNuevo` TEXT,
  `changedBy` INT,
  `changedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_audit_expediente` (`expedienteId`),
  INDEX `idx_audit_changedAt` (`changedAt`)
);

CREATE TABLE IF NOT EXISTS `expediente_documentos` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `expedienteId` INT NOT NULL,
  `tipo` ENUM('contrato','requerimiento','evidencia','acuerdo','identificacion','extracto','otro') NOT NULL,
  `nombre` VARCHAR(256) NOT NULL,
  `s3Key` VARCHAR(512),
  `s3Bucket` VARCHAR(128),
  `url` VARCHAR(1024),
  `uploadedBy` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_documentos_expediente` (`expedienteId`)
);

-- Columnas FK en expedientes (nullable para no romper datos existentes)
ALTER TABLE `expedientes`
  ADD COLUMN IF NOT EXISTS `acreedorId` INT NULL,
  ADD COLUMN IF NOT EXISTS `deudorId` INT NULL;
