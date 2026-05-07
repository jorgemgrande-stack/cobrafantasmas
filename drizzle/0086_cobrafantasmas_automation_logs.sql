-- Cobrafantasmas — Automation Logs (Fase 5)

CREATE TABLE IF NOT EXISTS `expediente_automation_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `expedienteId` INT NOT NULL,
  `trigger` VARCHAR(64) NOT NULL,
  `triggerData` TEXT,
  `actionType` VARCHAR(64) NOT NULL,
  `actionData` TEXT,
  `executedBy` VARCHAR(32) NOT NULL DEFAULT 'system',
  `revertedAt` TIMESTAMP NULL,
  `revertedBy` INT,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_automation_expediente` (`expedienteId`),
  INDEX `idx_automation_trigger` (`trigger`, `createdAt`)
);
