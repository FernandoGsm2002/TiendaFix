import { retryOperation } from './retry-helpers';

export const checkSupabaseConnection = async () => {
  try {
    const response = await retryOperation(async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Supabase health check failed');
      }

      return res;
    });

    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};

export const waitForConnection = async (
  maxAttempts: number = 5,
  delayMs: number = 2000
): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isConnected = await checkSupabaseConnection();
    if (isConnected) return true;
    
    if (attempt < maxAttempts) {
      console.log(`🔄 Esperando conexión... Intento ${attempt} de ${maxAttempts}`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  return false;
}; 