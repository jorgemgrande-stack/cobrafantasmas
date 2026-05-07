-- Fase 8: Motor de Protocolos de Recobro

CREATE TABLE IF NOT EXISTS `protocolos` (
  `id`                    INT AUTO_INCREMENT PRIMARY KEY,
  `nombre`                VARCHAR(256) NOT NULL,
  `tipo`                  ENUM('persistente','radar','reactivacion','intensivo','presencial') NOT NULL,
  `descripcion`           TEXT,
  `pasos`                 JSON NOT NULL,
  `intensidadRecomendada` INT NOT NULL DEFAULT 2,
  `duracionDias`          INT NOT NULL DEFAULT 30,
  `activo`                TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt`             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt`             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_protocolos_tipo` (`tipo`),
  INDEX `idx_protocolos_activo` (`activo`)
);

CREATE TABLE IF NOT EXISTS `expediente_protocolos` (
  `id`           INT AUTO_INCREMENT PRIMARY KEY,
  `expedienteId` INT NOT NULL,
  `protocoloId`  INT NOT NULL,
  `estado`       ENUM('activo','completado','cancelado') NOT NULL DEFAULT 'activo',
  `pasoActual`   INT NOT NULL DEFAULT 0,
  `notas`        TEXT,
  `asignadoPor`  INT NULL,
  `iniciadoAt`   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completadoAt` TIMESTAMP NULL,
  INDEX `idx_exp_prot_expediente` (`expedienteId`),
  INDEX `idx_exp_prot_protocolo` (`protocoloId`),
  INDEX `idx_exp_prot_estado` (`estado`)
);
