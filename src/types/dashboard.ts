import { Contact, ScrapingLog, Status, Tag } from '@prisma/client'

export interface Annonce {
    name: string
    rating: number
    reviews: number
    phone: string
    address: string
    website: string
    status: string
  }
  
  export interface AnnonceCardProps {
    annonce: Annonce
  }

export interface ScrapedCompany {
  name: string
  rating: string | number
  reviews: string | number
  phone: string
  address: string
  website: string
}

export interface Company {
  id: string
  name: string
  rating?: number | null
  reviews?: number | null
  phone?: string | null
  address?: string | null
  website?: string | null
  email?: string | null
  category?: string | null
  description?: string | null
  city?: string | null
  status: Status
  source: string
  lastScraped?: Date | null
  createdAt: Date
  lastUpdate: Date
  contacts?: Contact[]
  scrapingLogs?: ScrapingLog[]
  tags?: Tag[]
}

export interface SearchFilters {
  search?: string
  status?: Status
  city?: string
  category?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}

export interface CompanyListViewProps {
  companies: Company[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export interface CompanyGridViewProps {
  companies: Company[]
}