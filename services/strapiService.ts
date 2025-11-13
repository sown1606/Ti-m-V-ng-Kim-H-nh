// --- File: services/strapiService.ts (ĐÃ SỬA) ---

import { Category, Product } from '../types';
import { StrapiCategoryData, StrapiResponse } from '../types';

const STRAPI_URL = 'http://ec2-18-189-20-60.us-east-2.compute.amazonaws.com:1337';

const getFullStrapiUrl = (path: string) => `${STRAPI_URL}${path}`;

export const fetchCategoriesWithProducts = async (): Promise<Category[]> => {
  try {
    // Câu query này ĐÃ ĐÚNG (nhờ nó chúng ta mới có log)
    const response = await fetch(`${STRAPI_URL}/api/categories?fields[0]=name&populate[products][fields][0]=name&populate[products][populate][images]=true`);

    if (!response.ok) {
      throw new Error(`Failed to fetch from Strapi: ${response.statusText}`);
    }

    const json: any = await response.json(); // Tạm thời dùng 'any' vì type cũ bị sai
    console.log('--- STRAPI RAW RESPONSE ---', JSON.stringify(json, null, 2));

    if (!json.data) {
      console.error("Strapi response is missing data field", json);
      return [];
    }

    // === PHẦN SỬA LỖI LOGIC BẮT ĐẦU TỪ ĐÂY ===

    const categories: Category[] = json.data.map((categoryData: any) => {

      // SỬA 1: Không dùng .attributes
      const categoryName = categoryData.name;

      // SỬA 2: Không dùng .attributes.products.data
      const products: Product[] = categoryData.products.map((productData: any) => {

        // SỬA 3: Không dùng .attributes.images.data
        const imagesData = productData.images;

        const imageUrl = (imagesData && imagesData.length > 0)
            // SỬA 4: Không dùng .attributes.url
            ? getFullStrapiUrl(imagesData[0].url)
            : '/placeholder.png';

        return {
          id: productData.id,
          // SỬA 5: Không dùng .attributes.name
          name: productData.name,
          category: categoryName,
          imageUrl: imageUrl,
        };
      });

      return {
        name: categoryName,
        products: products,
      };
    });

    // === KẾT THÚC PHẦN SỬA ===

    return categories;
  } catch (error) {
    console.error("Error fetching categories from Strapi:", error);
    throw error;
  }
};
