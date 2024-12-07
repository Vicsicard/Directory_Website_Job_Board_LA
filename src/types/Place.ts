export interface Place {
  id: string;
  name: string;
  address: string;
  rating?: number;
  reviewCount?: number;
  priceLevel?: string;
  categories: string[];
  imageUrl?: string;
  website?: string;
  phone?: string;
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
}
