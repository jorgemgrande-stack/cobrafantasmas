-- Planes de pago fraccionado para presupuestos
-- Tablas presentes en schema.ts pero sin migración SQL — causaba ER_NO_SUCH_TABLE en CRM

CREATE TABLE IF NOT EXISTS `payment_plans` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `quote_id` int NOT NULL,
  `plan_type` enum('full','installment') NOT NULL DEFAULT 'installment',
  `total_amount_cents` int NOT NULL,
  `created_by` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `payment_installments` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `plan_id` int NOT NULL,
  `quote_id` int NOT NULL,
  `installment_number` int NOT NULL,
  `amount_cents` int NOT NULL,
  `due_date` varchar(20) NOT NULL,
  `status` enum('pending','paid','overdue','cancelled') NOT NULL DEFAULT 'pending',
  `is_required_for_confirmation` boolean NOT NULL DEFAULT false,
  `merchant_order` varchar(30),
  `reservation_id` int,
  `payment_method` varchar(32),
  `paidAt` timestamp NULL,
  `paid_by` varchar(128),
  `reminders_sent` int NOT NULL DEFAULT 0,
  `lastReminderAt` timestamp NULL,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_installments_plan` (`plan_id`),
  INDEX `idx_installments_quote` (`quote_id`)
);
