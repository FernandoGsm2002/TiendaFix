-- FERNANDO CONFIRMADO EN BD
-- User ID: a06654c1-d078-404d-bfec-72c883079a41
-- Organization ID: 873d8154-8b40-4b8a-8d03-431bf9f697e6
-- Role: owner
-- Organization: TiendaFix

-- Verificacion completa:
SELECT u.id, u.email, u.name, u.role, o.name as org FROM users u JOIN organizations o ON u.organization_id = o.id WHERE u.email = 'fernandoapplehtml@gmail.com';
