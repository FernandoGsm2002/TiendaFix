import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'
import { retryOperation } from './retry-helpers'

export const createClient = () => {
  const client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Agregar interceptor para manejar errores de red
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      // Limpiar caché local
      localStorage.removeItem('supabase.auth.token');
      
      // Redirigir a login si es necesario
      if (window.location.pathname !== '/auth/login') {
        window.location.href = '/auth/login';
      }
    }
  });

  // Envolver métodos de autenticación con retry
  const originalSignIn = client.auth.signInWithPassword.bind(client.auth);
  client.auth.signInWithPassword = async (credentials) => {
    return retryOperation(() => originalSignIn(credentials));
  };

  return client;
} 