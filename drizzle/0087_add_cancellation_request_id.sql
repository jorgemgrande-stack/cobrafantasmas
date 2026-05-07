-- Vinculación de reservas con solicitudes de anulación
-- Esta columna existe en el schema de Drizzle desde el módulo de anulaciones
-- pero nunca tuvo migración SQL, causando ER_BAD_FIELD_ERROR en todos los INSERTs de reservations.
ALTER TABLE `reservations` ADD COLUMN IF NOT EXISTS `cancellation_request_id` int;
