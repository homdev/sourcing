import { NextResponse } from 'next/server'
import { GooglePlacesScraper } from '@/services/scraping/googlePlaces'
import { CompanyService } from '@/services/database/company'

export async function POST(request: Request) {
  try {
    const { query, location } = await request.json()
    
    // Scraping
    const scraper = new GooglePlacesScraper()
    const scrapedCompanies = await scraper.scrapeCompany(query, location)
    
    // Sauvegarde en base de données
    const savedCompanies = await CompanyService.saveScrapedCompanies(scrapedCompanies)
    
    // Fermeture du navigateur
    await scraper.close()
    
    return NextResponse.json({ 
      success: true, 
      data: savedCompanies,
      message: `${savedCompanies.length} entreprises sauvegardées`
    })
  } catch (error) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    )
  }
}