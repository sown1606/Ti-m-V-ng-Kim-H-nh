import { Category, Product, GoldPrice } from '../types';

const STRAPI_URL = 'http://ec2-18-189-20-60.us-east-2.compute.amazonaws.com:1337';

const getFullStrapiUrl = (path: string) => `${STRAPI_URL}${path}`;

// (Hàm fetchCategoriesWithProducts đã đúng, giữ nguyên)
export const fetchCategoriesWithProducts = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/categories?fields[0]=name&populate[products][fields][0]=name&populate[products][fields][1]=weight&populate[products][fields][2]=labor_cost&populate[products][populate][images]=true`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Strapi: ${response.statusText}`);
    }
    const json: any = await response.json();
    if (!json.data) {
      console.error("Strapi response is missing data field", json);
      return [];
    }
    const categories: Category[] = json.data.map((categoryData: any) => {
      const categoryName = categoryData.name;
      const products: Product[] = categoryData.products.map((productData: any) => {
        const imagesData = productData.images;
        const imageUrl = (imagesData && imagesData.length > 0)
            ? getFullStrapiUrl(imagesData[0].url)
            : '/placeholder.png';
        return {
          id: productData.id,
          name: productData.name,
          category: categoryName,
          imageUrl: imageUrl,
          weight: productData.weight || 0,
          labor_cost: productData.labor_cost || 0,
        };
      });
      return {
        name: categoryName,
        products: products,
      };
    });
    return categories;
  } catch (error) {
    console.error("Error fetching categories from Strapi:", error);
    throw error;
  }
};

// === SỬA LỖI LOGIC Ở ĐÂY ===
export const fetchGoldPrice = async (): Promise<GoldPrice> => {
  try {
    const response = await fetch(`${STRAPI_URL}/api/gold-price`);
    if (!response.ok) {
      throw new Error(`Failed to fetch gold price: ${response.statusText}`);
    }

    // JSON trả về là {"data": {...}, "meta": {}}
    const json: any = await response.json();

    // Chúng ta phải đi vào "json.data"
    const priceData = json.data;

    if (!priceData) {
      console.error("Strapi gold price response is missing data field", json);
      return { buy_price: 0, sell_price: 0 };
    }

    return {
      buy_price: priceData.buy_price || 0,
      sell_price: priceData.sell_price || 0,
    };

  } catch (error) {
    console.error("Error fetching gold price:", error);
    return { buy_price: 0, sell_price: 0 };
  }
}
