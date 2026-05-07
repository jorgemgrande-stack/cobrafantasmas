-- Cobrafantasmas — Expedientes Operativos (Fase 1)

CREATE TABLE IF NOT EXISTS `expedientes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `numeroExpediente` VARCHAR(32) NOT NULL UNIQUE,
  `estado` ENUM(
    'pendiente_activacion','estrategia_inicial','operativo_activo',
    'negociacion','acuerdo_parcial','recuperacion_parcial',
    'recuperado','incobrable','suspendido','escalada_juridica','finalizado'
  ) NOT NULL DEFAULT 'pendiente_activacion',
  `clienteId` INT,
  `clienteNombre` VARCHAR(256),
  `deudorNombre` VARCHAR(256) NOT NULL,
  `deudorTelefono` VARCHAR(64),
  `deudorEmail` VARCHAR(256),
  `deudorDireccion` TEXT,
  `deudorNif` VARCHAR(32),
  `importeDeuda` DECIMAL(12,2) NOT NULL DEFAULT '0',
  `importeRecuperado` DECIMAL(12,2) DEFAULT '0',
  `porcentajeExito` DECIMAL(5,2) DEFAULT '20',
  `tipoDeuda` VARCHAR(64),
  `probabilidadRecuperacion` INT DEFAULT 50,
  `intensidadOperativa` INT DEFAULT 1,
  `modoOperacion` ENUM('manual','semi-automatico','automatico') DEFAULT 'manual',
  `cazadorId` INT,
  `progresoOperativo` INT DEFAULT 0,
  `progresoFinanciero` INT DEFAULT 0,
  `progresoPsicologico` INT DEFAULT 0,
  `fechaApertura` VARCHAR(10),
  `fechaCierre` VARCHAR(10),
  `landingToken` VARCHAR(64) UNIQUE,
  `observacionesInternas` TEXT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `acciones_operativas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `expedienteId` INT NOT NULL,
  `tipo` ENUM(
    'llamada','whatsapp','email','visita','negociacion',
    'acuerdo','seguimiento','investigacion','requerimiento',
    'accion_sorpresa','escalada','hito','nota'
  ) NOT NULL,
  `titulo` VARCHAR(256) NOT NULL,
  `descripcion` TEXT,
  `prioridad` ENUM('baja','media','alta','critica') DEFAULT 'media',
  `estado` ENUM('pendiente','en_progreso','completada','cancelada') DEFAULT 'pendiente',
  `fechaProgramada` TIMESTAMP NULL,
  `fechaCompletada` TIMESTAMP NULL,
  `resultado` TEXT,
  `visibleCliente` BOOLEAN NOT NULL DEFAULT FALSE,
  `cazadorId` INT,
  `notasInternas` TEXT,
  `createdBy` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_acciones_expediente` (`expedienteId`)
);

-- Insertar contador para numeración de expedientes
INSERT IGNORE INTO `document_counters` (`document_type`, `year`, `current_number`, `prefix`, `updated_at`)
VALUES ('expediente', YEAR(NOW()), 0, 'EXP', NOW());
