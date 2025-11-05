
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
