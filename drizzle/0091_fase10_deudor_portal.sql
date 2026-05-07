-- Phase 10: Portal del Deudor
-- Adds deudorToken column to expedientes for public deudor portal access

ALTER TABLE `expedientes`
  ADD COLUMN IF NOT EXISTS `deudorToken` VARCHAR(64) NULL;

CREATE UNIQUE INDEX IF NOT EXISTS `idx_expedientes_deudorToken`
  ON `expedientes` (`deudorToken`);
