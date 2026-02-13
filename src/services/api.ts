const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:1337/api'}`.trim();
const IMAGE_URL = `${import.meta.env.VITE_IMAGE_URL || API_URL.replace(/\/api\/?$/, '')}`.trim();
const API_TOKEN = `${import.meta.env.VITE_API_TOKEN ?? ''}`.trim();
const API_BASE_URL = API_URL.replace(/\/+$/, '');
const IMAGE_BASE_URL = IMAGE_URL.replace(/\/+$/, '');
const REQUEST_TIMEOUT_MS = 15000;

type JsonRecord = Record<string, unknown>;

export interface Product {
  id: number | string;
  documentId: string;
  name: string;
  category: string;
  goldWeight: number;
  stoneWeight: number;
  price: number;
  imageUrl: string;
}

export interface GoldPrice {
  buyPrice: number;
  sellPrice: number;
  updatedAt: string;
}

const isRecord = (value: unknown): value is JsonRecord => {
  return typeof value === 'object' && value !== null;
};

const toText = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue || fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return fallback;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const normalized = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
};

const buildApiUrl = (endpoint: string): string => {
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (API_BASE_URL.endsWith('/api')) {
    return `${API_BASE_URL}${normalizedEndpoint.replace(/^\/api/, '')}`;
  }
  if (normalizedEndpoint.startsWith('/api/')) {
    return `${API_BASE_URL}${normalizedEndpoint}`;
  }
  return `${API_BASE_URL}/api${normalizedEndpoint}`;
};

const toAbsoluteUrl = (url: string): string => {
  if (!url) {
    return '';
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `${IMAGE_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const normalizeEntity = (entity: unknown): JsonRecord => {
  if (!isRecord(entity)) {
    return {};
  }

  const attributes = entity.attributes;
  if (isRecord(attributes)) {
    return {
      ...attributes,
      id: entity.id ?? attributes.id ?? '',
      documentId: entity.documentId ?? attributes.documentId ?? '',
    };
  }

  return entity;
};

const normalizeCollectionData = (payload: unknown): JsonRecord[] => {
  if (Array.isArray(payload)) {
    return payload.map((item) => normalizeEntity(item));
  }

  if (!isRecord(payload)) {
    return [];
  }

  const payloadData = payload.data;
  if (Array.isArray(payloadData)) {
    return payloadData.map((item) => normalizeEntity(item));
  }
  if (isRecord(payloadData)) {
    return [normalizeEntity(payloadData)];
  }

  return [];
};

const normalizeSingleData = (payload: unknown): JsonRecord | null => {
  if (isRecord(payload) && 'data' in payload) {
    const payloadData = payload.data;
    if (Array.isArray(payloadData)) {
      return payloadData.length > 0 ? normalizeEntity(payloadData[0]) : null;
    }
    if (isRecord(payloadData)) {
      return normalizeEntity(payloadData);
    }
    return null;
  }

  return isRecord(payload) ? normalizeEntity(payload) : null;
};

const normalizeMedia = (mediaField: unknown): JsonRecord | string | null => {
  if (typeof mediaField === 'string') {
    return mediaField;
  }
  if (Array.isArray(mediaField)) {
    return normalizeMedia(mediaField[0] ?? null);
  }
  if (!isRecord(mediaField)) {
    return null;
  }

  if ('data' in mediaField) {
    return normalizeMedia(mediaField.data);
  }

  const attributes = mediaField.attributes;
  if (isRecord(attributes)) {
    return normalizeEntity(mediaField);
  }

  return mediaField;
};

const readMediaUrl = (mediaField: unknown): string => {
  const normalizedMedia = normalizeMedia(mediaField);
  if (typeof normalizedMedia === 'string') {
    return toAbsoluteUrl(normalizedMedia);
  }
  if (!isRecord(normalizedMedia)) {
    return '';
  }

  const directUrl = toText(normalizedMedia.url, '');
  if (directUrl) {
    return toAbsoluteUrl(directUrl);
  }

  const formats = normalizedMedia.formats;
  if (!isRecord(formats)) {
    return '';
  }

  const preferredFormatKeys = ['medium', 'small', 'thumbnail', 'large'];
  for (const key of preferredFormatKeys) {
    const formatData = formats[key];
    if (isRecord(formatData)) {
      const formatUrl = toText(formatData.url, '');
      if (formatUrl) {
        return toAbsoluteUrl(formatUrl);
      }
    }
  }

  return '';
};

const extractErrorMessage = (payload: unknown, status: number): string => {
  if (isRecord(payload)) {
    const topLevelMessage = toText(payload.message, '');
    if (topLevelMessage) {
      return topLevelMessage;
    }

    const nestedError = payload.error;
    if (isRecord(nestedError)) {
      const nestedMessage = toText(nestedError.message, '');
      if (nestedMessage) {
        return nestedMessage;
      }
    }
  }

  return `Request failed with status ${status}.`;
};

async function apiFetch<T>(endpoint: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  const url = buildApiUrl(endpoint);
  const headers = new Headers(init.headers ?? {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (API_TOKEN && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${API_TOKEN}`);
  }

  try {
    const response = await fetch(url, {
      ...init,
      headers,
      signal: controller.signal,
    });

    const rawText = await response.text();
    let payload: unknown = null;
    if (rawText) {
      try {
        payload = JSON.parse(rawText) as unknown;
      } catch {
        payload = { message: rawText };
      }
    }

    if (!response.ok) {
      throw new Error(extractErrorMessage(payload, response.status));
    }

    return payload as T;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('The request timed out. Please try again.');
    }

    if (error instanceof Error) {
      throw new Error(error.message || 'A network error occurred.');
    }

    throw new Error('A network error occurred.');
  } finally {
    window.clearTimeout(timeoutId);
  }
}

const mapProduct = (entry: JsonRecord, index: number): Product => {
  const fallbackId = `product-${index + 1}`;
  const rawId = entry.documentId ?? entry.id ?? fallbackId;
  const normalizedId =
    typeof rawId === 'string' || typeof rawId === 'number' ? rawId : fallbackId;

  return {
    id: normalizedId,
    documentId: toText(entry.documentId, String(normalizedId)),
    name: toText(entry.name, 'Unnamed product'),
    category: toText(entry.category, 'Other'),
    goldWeight: toNumber(entry.goldWeight, 0),
    stoneWeight: toNumber(entry.stoneWeight, 0),
    price: toNumber(entry.price, 0),
    imageUrl: readMediaUrl(entry.image),
  };
};

export async function getProducts(): Promise<Product[]> {
  const payload = await apiFetch<unknown>('/products?populate=*');
  const entries = normalizeCollectionData(payload);
  return entries.map((entry, index) => mapProduct(entry, index));
}

export async function getGoldPrice(): Promise<GoldPrice | null> {
  const payload = await apiFetch<unknown>('/gold-price');
  const entry = normalizeSingleData(payload);
  if (!entry) {
    return null;
  }

  return {
    buyPrice: toNumber(entry.buyPrice, 0),
    sellPrice: toNumber(entry.sellPrice, 0),
    updatedAt: toText(entry.updatedAt, ''),
  };
}
