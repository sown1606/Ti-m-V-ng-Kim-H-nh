import { Category } from './types';

// This data replaces the placeholder generator function with real product data.
// It is assumed these image paths will be available in a public '/images' directory.
// Example: public/images/bông/bong-5-phan.png

export const CATEGORIES: Category[] = [
  {
    name: 'Bông',
    products: [
      { id: 1, name: 'Bông 5 Phân', category: 'Bông', imageUrl: '/images/bông/bong-5-phan.png' },
      { id: 2, name: 'Bông Mía Tôn Tẹn', category: 'Bông', imageUrl: '/images/bông/bong-mia-ton-ten-41.png' },
    ],
  },
  {
    name: 'Dây',
    products: [
      { id: 3, name: 'Dây 10c36', category: 'Dây', imageUrl: '/images/dây/10c36 - 3690 - vang 980.png' },
      { id: 4, name: 'Dây Hoa Mai', category: 'Dây', imageUrl: '/images/dây/day-hoamai-14c1 - 5490 - vang 9999.png' },
      { id: 5, name: 'Dây Long Phụng', category: 'Dây', imageUrl: '/images/dây/day-long-phung-5c28-1590 - vang 980.jpg' },
    ],
  },
  {
    name: 'Kiềng',
    products: [
      { id: 6, name: 'Kiềng 2c', category: 'Kiềng', imageUrl: '/images/kiềng/kieng-2c.png' },
      { id: 7, name: 'Kiềng 2c Mẫu 2', category: 'Kiềng', imageUrl: '/images/kiềng/2-kieng-2c.png' },
      { id: 8, name: 'Kiềng 2c Mẫu 3', category: 'Kiềng', imageUrl: '/images/kiềng/3-kieng-2c.png' },
      { id: 9, name: 'Kiềng 2c Mẫu 4', category: 'Kiềng', imageUrl: '/images/kiềng/4-kieng-2c.png' },
      { id: 10, name: 'Kiềng 5c', category: 'Kiềng', imageUrl: '/images/kiềng/5-kieng.png' },
    ],
  },
  {
    name: 'Cara', // Mapped from user's 'nhẫn' directory
    products: [
        { id: 11, name: 'Cara Hoa Mai 1c92', category: 'Cara', imageUrl: '/images/nhẫn/cara-hoa-mai-1c92.png' },
        { id: 12, name: 'Cara Hoa Mai Hột 5p', category: 'Cara', imageUrl: '/images/nhẫn/cara-hoa-mai-hot-5p - 390.png' },
    ],
  },
  {
    name: 'Lắc',
    products: [
      { id: 13, name: 'Lắc Cưới Hoa Mai', category: 'Lắc', imageUrl: '/images/lắc/lac-cuoi-hoa-mai-2c.jpg' },
    ],
  },
  {
    name: 'Vòng',
    products: [
      { id: 14, name: 'Vòng 1c', category: 'Vòng', imageUrl: '/images/vòng/vong 1c.png' },
      { id: 15, name: 'Vòng Trơn 2', category: 'Vòng', imageUrl: '/images/vòng/vongtron2.png' },
      { id: 16, name: 'Vòng Trơn 3', category: 'Vòng', imageUrl: '/images/vòng/vongtron3.png' },
      { id: 17, name: 'Vòng Trơn 4', category: 'Vòng', imageUrl: '/images/vòng/vongtron4.png' },
      { id: 18, name: 'Vòng Trơn 5', category: 'Vòng', imageUrl: '/images/vòng/vongtron5.png' },
    ],
  },
  {
    name: 'Nhẫn trơn',
    products: [
      { id: 19, name: 'Nhẫn Trơn 1', category: 'Nhẫn trơn', imageUrl: '/images/nhẫn trơn/nhantron1.png' },
      { id: 20, name: 'Nhẫn Trơn 2', category: 'Nhẫn trơn', imageUrl: '/images/nhẫn trơn/nhantron2.png' },
      { id: 21, name: 'Nhẫn Trơn 3', category: 'Nhẫn trơn', imageUrl: '/images/nhẫn trơn/nhantron3.png' },
      { id: 22, name: 'Nhẫn Trơn 4', category: 'Nhẫn trơn', imageUrl: '/images/nhẫn trơn/nhantron4.png' },
      { id: 23, name: 'Nhẫn Trơn 5', category: 'Nhẫn trơn', imageUrl: '/images/nhẫn trơn/nhantron5.png' },
    ],
  },
];
