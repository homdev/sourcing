import { NextResponse } from 'next/server'
import { GooglePlacesScraper } from '@/services/scraping/googlePlaces'
import { CompanyService } from '@/services/database/company'

// export const runtime = 'edge';
// export const preferredRegion = ['fra1'];
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { query, location } = await request.json()
    
    // Validation des entrées
    if (!query || !location) {
      return NextResponse.json(
        { success: false, error: 'Query et location sont requis' },
        { status: 400 }
      )
    }
    
    // Ajoutez des logs
    console.log('Démarrage du scraping pour:', { query, location })
    
    const scraper = new GooglePlacesScraper()
    
    try {
      const scrapedCompanies = await scraper.scrapeCompany(query, location)
      console.log('Entreprises scrapées:', scrapedCompanies.length)
      
      const savedCompanies = await CompanyService.saveScrapedCompanies(scrapedCompanies)
      console.log('Entreprises sauvegardées:', savedCompanies.length)
      
      return NextResponse.json({ 
        success: true, 
        data: savedCompanies,
        message: `${savedCompanies.length} entreprises sauvegardées`
      })
    } finally {
      await scraper.close()
    }
  } catch (error) {
    console.error('Erreur détaillée du scraping:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Une erreur est survenue',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

