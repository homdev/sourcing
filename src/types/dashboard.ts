export interface Annonce {
    name: string
    rating: number
    reviews: number
    phone: string
    address: string
    website: string
  }
  
  export interface AnnonceCardProps {
    annonce: Annonce
  }