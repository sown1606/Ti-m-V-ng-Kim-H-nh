
import { Category } from './types';

const generateProducts = (categoryName: string, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${categoryName} ${i + 1}`,
    category: categoryName,
    imageUrl: `https://picsum.photos/seed/${categoryName}${i}/100/100`,
  }));
};

export const CATEGORIES: Category[] = [
  { name: 'Bông', products: generateProducts('Bông', 5) },
  { name: 'Dây', products: generateProducts('Dây', 5) },
  { name: 'Kiềng', products: generateProducts('Kiềng', 5) },
  { name: 'Cara', products: generateProducts('Cara', 5) },
  { name: 'Lắc', products: generateProducts('Lắc', 5) },
  { name: 'Vòng', products: generateProducts('Vòng', 5) },
  { name: 'Nhẫn trơn', products: generateProducts('Nhẫn trơn', 5) },
];
