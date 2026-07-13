INSERT INTO compliance_types (id, name) VALUES
  ('gst', 'GST'),
  ('pf', 'PF'),
  ('esi', 'ESI'),
  ('factory_license', 'Factory License'),
  ('fire_noc', 'Fire NOC'),
  ('pollution_noc', 'Pollution NOC'),
  ('trade_license', 'Trade License')
ON DUPLICATE KEY UPDATE name = VALUES(name);