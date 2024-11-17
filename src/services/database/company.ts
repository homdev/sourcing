import { prisma } from '@/lib/prisma';
import { Prisma, Status } from '@prisma/client';
import type { SearchFilters, PaginatedResponse, Company } from '@/types/dashboard';

export class CompanyService {
  static async getCompanies(params: {
    page?: number;
    limit?: number;
    filters?: SearchFilters;
  }): Promise<PaginatedResponse<Company>> {
    const { page = 1, limit = 10 } = params;
    
    const skip = (page - 1) * limit;

    console.log('Fetching companies with params:', { page, limit, skip });
    
    try {
      const [total, items] = await prisma.$transaction([
        prisma.company.count(),
        prisma.company.findMany({
          skip,
          take: limit,
          include: {
            contacts: true,
            tags: true,
            scrapingLogs: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
          orderBy: { 
            lastUpdate: 'desc' 
          },
        }),
      ]);

      console.log('Query results:', { total, itemsCount: items.length });

      return {
        items,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error fetching companies:', error);
      throw error;
    }
  }

  static async updateCompany(id: string, data: Partial<Prisma.CompanyUpdateInput>) {
    return prisma.company.update({
      where: { id },
      data: {
        ...data,
        lastUpdate: new Date()
      },
      include: {
        contacts: true,
        tags: true,
        scrapingLogs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
  }

  static async deleteCompany(id: string) {
    return prisma.company.delete({
      where: { id },
    });
  }

  static async getCompanyStats() {
    const stats = await prisma.company.groupBy({
      by: ['status'],
      _count: {
        _all: true,
      },
    });

    return stats.reduce((acc, curr) => {
      acc[curr.status.toLowerCase()] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);
  }

  static async createOrUpdateCompany(companyData: {
    name: string;
    rating: number;
    reviews: number;
    address: string;
    phone: string;
    website: string;
  }) {
    const now = new Date();
    
    const commonData = {
      rating: companyData.rating,
      reviews: companyData.reviews,
      address: companyData.address,
      phone: companyData.phone,
      website: companyData.website,
      status: Status.ACTIVE,
      lastScraped: now,
      lastUpdate: now
    } as const;

    const existingCompany = await prisma.company.findFirst({
      where: { name: companyData.name }
    });

    if (existingCompany) {
      return await prisma.company.update({
        where: { id: existingCompany.id },
        data: commonData,
        include: {
          contacts: true,
          tags: true,
          scrapingLogs: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });
    } else {
      return await prisma.company.create({
        data: {
          name: companyData.name,
          ...commonData,
          source: 'google'
        },
        include: {
          contacts: true,
          tags: true,
          scrapingLogs: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          }
        }
      });
    }
  }

  static async saveScrapedCompanies(companies: Array<{
    name: string;
    rating: number;
    reviews: number;
    address: string;
    phone: string;
    website: string;
  }>) {
    console.log('Sauvegarde des entreprises...');
    const savedCompanies = await Promise.all(
      companies.map(company => this.createOrUpdateCompany(company))
    );
    console.log(`${savedCompanies.length} entreprises sauvegardées`);
    return savedCompanies;
  }
}