
export enum PurchaseType {
  REGULAR = 'regular',
  WEDDING = 'wedding',
}

export interface PersonInfo {
  name: string;
  dob: string;
}

export interface User {
  purchaseType: PurchaseType;
  primary: PersonInfo;
  partner?: PersonInfo;
  phone: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  imageUrl: string;
  instanceId?: number;
}

export interface Category {
  name: string;
  products: Product[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export interface SavedCollection {
  phone: string;
  products: Product[];
}

// Strapi API response types
export interface StrapiImageFormat {
  url: string;
}

export interface StrapiImage {
  id: number;
  attributes: {
    name: string;
    url: string;
    formats: {
      thumbnail: StrapiImageFormat;
      small: StrapiImageFormat;
      medium: StrapiImageFormat;
      large: StrapiImageFormat;
    }
  }
}

export interface StrapiProductData {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    images: {
      data: StrapiImage[] | null;
    }
  }
}

export interface StrapiCategoryData {
  id: number;
  attributes: {
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    products: {
      data: StrapiProductData[];
    }
  }
}

export interface StrapiResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    }
  }
}
