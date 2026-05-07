-- Identidad de marca Cobrafantasmas en system_settings
-- Ejecutar tras fase10: actualiza brand y email defaults en BD

INSERT INTO `system_settings` (`key`, `value`, `type`) VALUES
  ('brand_name',         'Cobrafantasmas',                      'text'),
  ('brand_short_name',   'Cobrafantasmas',                      'text'),
  ('brand_logo_url',     '',                                    'image'),
  ('brand_hero_image_url','',                                   'image'),
  ('brand_website_url',  'https://cobrafantasmas.com',          'text'),
  ('brand_support_phone','',                                    'text'),
  ('brand_location',     'España',                              'text'),
  ('email_noreply_sender','',                                   'text'),
  ('email_reservations', '',                                    'text'),
  ('email_admin_alerts', '',                                    'text'),
  ('email_accounting',   '',                                    'text'),
  ('email_cancellations','',                                    'text'),
  ('email_tpv_ingestion','',                                    'text'),
  ('email_copy_recipient','',                                   'text')
ON DUPLICATE KEY UPDATE `value` = VALUES(`value`);
