import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const filters = JSON.parse(searchParams.get('filters') || '{}')
    
    const skip = (page - 1) * limit
    
    const where = {
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { city: { contains: filters.search, mode: 'insensitive' } }
        ]
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.city && { city: filters.city }),
      ...(filters.category && { category: filters.category })
    }

    const [items, total] = await Promise.all([
      prisma.company.findMany({
        skip,
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
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}
