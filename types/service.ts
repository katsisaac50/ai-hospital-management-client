export interface Service {
  id: string;
  name: string;
  code: string;
  price: number;
  description?: string;
  category: 'consultation' | 'diagnostic' | 'treatment' | 'procedure' | 'other';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ServiceFilterParams {
  name?: string;
  code?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string[];
  isActive?: boolean;
  sort?: string;
  fields?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedServices {
  success: boolean;
  count: number;
  pagination: {
    next?: { page: number; limit: number };
    prev?: { page: number; limit: number };
  };
  total: number;
  data: Service[];
}