export class ScrapingError extends Error {
    constructor(message: string, public readonly details: unknown = undefined) {
      super(message);
      this.name = 'ScrapingError';
    }
  }
  
  export function handleScrapingError(error: unknown): never {
    if (error instanceof ScrapingError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ScrapingError(error.message, { originalError: error });
    }
    
    throw new ScrapingError('Une erreur inconnue est survenue');
  }