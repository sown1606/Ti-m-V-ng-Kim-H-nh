
import { Category, Product } from '../types';
import { StrapiCategoryData, StrapiResponse } from '../types';

// QUAN TRỌNG: Thay thế URL này bằng địa chỉ Strapi backend của bạn
const STRAPI_URL = 'http://ec2-18-189-20-60.us-east-2.compute.amazonaws.com:1337';

const getFullStrapiUrl = (path: string) => `${STRAPI_URL}${path}`;

export const fetchCategoriesWithProducts = async (): Promise<Category[]> => {
  try {
    // Cập nhật populate query từ `imageUrl` sang `images`
    const response = await fetch(`${STRAPI_URL}/api/categories?populate[products][populate][0]=images`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Strapi: ${response.statusText}`);
    }

    const json: StrapiResponse<StrapiCategoryData> = await response.json();

    if (!json.data) {
        console.error("Strapi response is missing data field", json);
        return [];
    }

    // Chuyển đổi dữ liệu phức tạp từ Strapi sang cấu trúc Category[] đơn giản mà ứng dụng đang dùng.
    const categories: Category[] = json.data.map(categoryData => {
      const categoryName = categoryData.attributes.name;
      const products: Product[] = categoryData.attributes.products.data.map(productData => {

        // Cập nhật logic để lấy ảnh đầu tiên từ mảng 'images'
        const imagesData = productData.attributes.images.data;
        const imageUrl = (imagesData && imagesData.length > 0)
          ? getFullStrapiUrl(imagesData[0].attributes.url)
          : '/placeholder.png'; // Hình ảnh dự phòng

        return {
          id: productData.id,
          name: productData.attributes.name,
          category: categoryName,
          imageUrl: imageUrl, // Giữ nguyên trường `imageUrl` để các component khác không bị lỗi
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
    throw error; // Ném lỗi ra để component có thể bắt và xử lý
  }
};
