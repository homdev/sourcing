import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Parser } from 'json2csv'

// export const runtime = 'edge';
// export const preferredRegion = ['fra1'];
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const filters = JSON.parse(searchParams.get('filters') || '{}')
    
    const where = {
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { city: { contains: filters.search, mode: 'insensitive' } }
        ]
      })
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        contacts: true,
        tags: true,
        scrapingLogs: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    const fields = ['name', 'address', 'phone', 'website', 'rating', 'reviews', 'status']
    const opts = { fields }
    const parser = new Parser(opts)
    const csv = parser.parse(companies)

    const headers = new Headers()
    headers.set('Content-Type', 'text/csv')
    headers.set('Content-Disposition', `attachment; filename=companies_export_${new Date().toISOString().split('T')[0]}.csv`)

    return new NextResponse(csv, {
      headers,
      status: 200
    })
  } catch (error) {
    console.error('Erreur lors de l\'export:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export des données' },
      { status: 500 }
    )
  }
}