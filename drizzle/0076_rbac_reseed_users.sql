-- Phase 4: Re-seed rbac_user_roles para todos los usuarios activos.
-- Autocontenido: crea la tabla si no existe (0071 puede haber sido saltado por Drizzle
-- al tener un timestamp anterior a 0068 en el journal).
CREATE TABLE IF NOT EXISTS `rbac_user_roles` (
  `user_id`    int       NOT NULL,
  `role_id`    int       NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  PRIMARY KEY (`user_id`, `role_id`),
  INDEX `idx_rbac_ur_user` (`user_id`),
  INDEX `idx_rbac_ur_role` (`role_id`)
);
--> statement-breakpoint
INSERT IGNORE INTO `rbac_user_roles` (`user_id`, `role_id`)
SELECT u.id, r.id
FROM `users` u
JOIN `rbac_roles` r ON r.`key` = u.role
WHERE r.is_active = 1;
