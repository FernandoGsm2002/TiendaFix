# Solucion: Error de Row Level Security (RLS)

## Problema
```n Error: new row violates row-level security policy for table sale_items
```n
## Solucion
El problema es que los APIs server-side necesitan la **Service Role Key** para bypasear RLS, no la Anon Key.

## Pasos:
1. Ve a Supabase Dashboard > Settings > API
2. Copia la **service_role** key (no la anon)
3. Agrega a .env.local:
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
4. Reinicia: npm run dev
