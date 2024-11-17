import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const config = {
  runtime: 'edge',
  regions: ['fra1'],
}

export default async function handler(req: NextRequest) {
  const { pathname, searchParams } = new URL(req.url)
  
  try {
    // Route GET /api/companies
    if (pathname === '/api/companies' && req.method === 'GET') {
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '10')
      const filters = JSON.parse(searchParams.get('filters') || '{}')

      const where = {
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { city: { contains: filters.search, mode: 'insensitive' } }
          ]
        }),
        ...(filters.location && {
          city: { contains: filters.location, mode: 'insensitive' }
        })
      }

      const [items, total] = await Promise.all([
        prisma.company.findMany({
          skip: (page - 1) * limit,
          take: limit,
          where,
          include: {
            contacts: true,
            tags: true,
            scrapingLogs: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          },
          orderBy: { lastUpdate: 'desc' }
        }),
        prisma.company.count({ where })
      ])

      return NextResponse.json({
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    }

    // Route POST /api/scraping
    if (pathname === '/api/scraping' && req.method === 'POST') {
      const body = await req.json()
      const { query, location } = body

      if (!query || !location) {
        return NextResponse.json(
          { error: 'Query et location sont requis' },
          { status: 400 }
        )
      }

      // Créer un log de scraping
      const scrapingLog = await prisma.scrapingLog.create({
        data: {
          status: 'IN_PROGRESS',
          message: `Démarrage du scraping pour ${query} à ${location}`,
          company: {
            create: {
              name: query,
              city: location,
              status: 'PENDING'
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Scraping démarré',
        logId: scrapingLog.id
      })
    }

    // Route non trouvée
    return NextResponse.json(
      { error: 'Route non trouvée' },
      { status: 404 }
    )

  } catch (error) {
    console.error('Erreur API:', error)
    return NextResponse.json(
      { 
        error: 'Erreur serveur',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}