import { Category, GoldPrice, Product, ProductImage } from '../types';

const RAW_API_URL = `${import.meta.env.VITE_API_URL || 'http://ec2-18-189-20-60.us-east-2.compute.amazonaws.com:1337/api'}`.trim();
const RAW_IMAGE_URL = `${import.meta.env.VITE_IMAGE_URL || RAW_API_URL.replace(/\/api\/?$/, '')}`.trim();
const API_URL = RAW_API_URL.replace(/\/+$/, '');
const IMAGE_BASE_URL = RAW_IMAGE_URL.replace(/\/+$/, '');

const toNumber = (value: unknown, fallback = 0): number => {
  const normalized = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
};

const toText = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed || fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
};

const toAbsoluteUrl = (path: string): string => {
  if (!path) {
    return '';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${IMAGE_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

const normalizeImage = (rawImage: any): ProductImage | null => {
  const source = rawImage?.attributes ? rawImage.attributes : rawImage;
  if (!source) {
    return null;
  }

  const mediumUrl = toText(source?.formats?.medium?.url, '');
  const largeUrl = toText(source?.formats?.large?.url, '');
  const smallUrl = toText(source?.formats?.small?.url, '');
  const thumbUrl = toText(source?.formats?.thumbnail?.url, '');

  return {
    name: toText(source?.name, ''),
    url: toAbsoluteUrl(toText(source?.url, '')),
    formats: {
      medium: mediumUrl ? { url: toAbsoluteUrl(mediumUrl) } : undefined,
      large: largeUrl ? { url: toAbsoluteUrl(largeUrl) } : undefined,
      small: smallUrl ? { url: toAbsoluteUrl(smallUrl) } : undefined,
      thumbnail: thumbUrl ? { url: toAbsoluteUrl(thumbUrl) } : undefined,
    },
  };
};

const normalizeImages = (rawImages: any): ProductImage[] => {
  const normalizedArray = Array.isArray(rawImages)
    ? rawImages
    : Array.isArray(rawImages?.data)
      ? rawImages.data
      : [];

  return normalizedArray
    .map((image) => normalizeImage(image))
    .filter((image): image is ProductImage => Boolean(image?.url || image?.formats));
};

export const fetchCategoriesWithProducts = async (): Promise<Category[]> => {
  try {
    const endpoint = `${API_URL}/categories?populate[products][populate]=images`;
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Strapi: ${response.statusText}`);
    }

    const json: any = await response.json();
    const categoryRows = Array.isArray(json?.data) ? json.data : [];

    return categoryRows.map((categoryData: any) => {
      const categoryName = toText(
        categoryData?.name ?? categoryData?.attributes?.name,
        'Danh mục'
      );
      const productRows = Array.isArray(categoryData?.products)
        ? categoryData.products
        : Array.isArray(categoryData?.attributes?.products?.data)
          ? categoryData.attributes.products.data
          : [];

      const products: Product[] = productRows.map((productData: any) => {
        const normalized = productData?.attributes ? productData.attributes : productData;
        const images = normalizeImages(normalized?.images);
        const imageUrl =
          images?.[0]?.url ||
          images?.[0]?.formats?.medium?.url ||
          images?.[0]?.formats?.large?.url ||
          '/placeholder.png';

        return {
          id: toNumber(productData?.id ?? normalized?.id, Date.now()),
          name: toText(normalized?.name, 'Sản phẩm'),
          category: categoryName,
          imageUrl,
          images,
          weight: toNumber(normalized?.weight, 0),
          labor_cost: toNumber(normalized?.labor_cost, 0),
        };
      });

      return {
        name: categoryName,
        products,
      };
    });
  } catch (error) {
    console.error('Error fetching categories from Strapi:', error);
    throw error;
  }
};

export const fetchGoldPrice = async (): Promise<GoldPrice> => {
  try {
    const response = await fetch(`${API_URL}/gold-price`);
    if (!response.ok) {
      throw new Error(`Failed to fetch gold price: ${response.statusText}`);
    }

    const json: any = await response.json();
    const priceData = json?.data ?? {};

    return {
      buy_price: toNumber(priceData?.buy_price ?? priceData?.buyPrice, 0),
      sell_price: toNumber(priceData?.sell_price ?? priceData?.sellPrice, 0),
    };
  } catch (error) {
    console.error('Error fetching gold price:', error);
    return { buy_price: 0, sell_price: 0 };
  }
};
