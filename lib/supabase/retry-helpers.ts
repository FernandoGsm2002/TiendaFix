export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<T> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      console.log(`🔄 Intento ${attempt} de ${maxRetries} falló, reintentando en ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // Esta línea nunca se ejecutará debido al throw en el catch,
  // pero TypeScript necesita un return aquí
  throw new Error('Máximo número de intentos alcanzado');
};

export const isNetworkError = (error: Error): boolean => {
  return (
    error.message.includes('NetworkError') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Network request failed')
  );
}; 