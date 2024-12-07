import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'


export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const filters = JSON.parse(searchParams.get('filters') || '{}')
    
    if (!prisma) {
      throw new Error('La connexion à la base de données n\'est pas établie')
    }
    
    console.log('Filtres reçus:', filters)
    
    const where = {
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { city: { contains: filters.search, mode: 'insensitive' } }
        ]
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
  } catch (error) {
    console.error('Erreur détaillée:', error)
    return NextResponse.json(
      { 
        error: 'Erreur lors de la récupération des entreprises',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
