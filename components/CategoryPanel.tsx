import React, { useEffect, useMemo, useState } from 'react';
import { Product, Category } from '../types';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Pause,
  Play,
  Search,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface Props {
  categories: Category[];
  onProductSelect: (product: Product) => void;
}

const normalizeForSearch = (value: string): string => {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
};

const formatWeight = (weight: number | undefined): string => {
  if (!Number.isFinite(weight)) {
    return '0.0 chỉ';
  }
  return `${(weight ?? 0).toFixed(1)} chỉ`;
};

const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) {
    return '0 đ';
  }
  return value.toLocaleString('vi-VN') + ' đ';
};

const getFrameUrl = (image: any): string => {
  if (!image) {
    return '';
  }

  const direct = image?.url || '';
  const medium = image?.formats?.medium?.url || '';
  const large = image?.formats?.large?.url || '';
  const small = image?.formats?.small?.url || '';
  const thumb = image?.formats?.thumbnail?.url || '';

  return large || medium || small || thumb || direct || '';
};

const getProductFrames = (product: Product | null): string[] => {
  if (!product) {
    return [];
  }

  const frames = (product?.images || [])
    .map((image) => getFrameUrl(image))
    .filter(Boolean);

  if (product?.imageUrl) {
    frames.unshift(product.imageUrl);
  }

  return Array.from(new Set(frames));
};

const CategoryPanel: React.FC<Props> = ({ categories, onProductSelect }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [rotateDelay, setRotateDelay] = useState(180);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (categories.length > 0 && !openCategory) {
      setOpenCategory(categories[0]?.name ?? null);
    }
  }, [categories, openCategory]);

  useEffect(() => {
    const urls: string[] = [];
    categories.forEach((category) => {
      category?.products?.forEach((product) => {
        if (product?.imageUrl) {
          urls.push(product.imageUrl);
        }
      });
    });

    urls.forEach((url) => {
      const image = new Image();
      image.src = url;
    });
  }, [categories]);

  const allProducts = useMemo(() => {
    const flattened = categories.flatMap((category) =>
      (category?.products || []).map((product) => ({
        ...product,
        category: product?.category || category?.name || 'Danh mục',
      }))
    );

    const seen = new Set<number>();
    return flattened.filter((product) => {
      if (!product?.id || seen.has(product.id)) {
        return false;
      }
      seen.add(product.id);
      return true;
    });
  }, [categories]);

  const filteredAllProducts = useMemo(() => {
    const keyword = normalizeForSearch(searchKeyword);
    if (!keyword) {
      return allProducts;
    }

    return allProducts.filter((product) => {
      const productName = normalizeForSearch(product?.name || '');
      const productCategory = normalizeForSearch(product?.category || '');
      return productName.includes(keyword) || productCategory.includes(keyword);
    });
  }, [allProducts, searchKeyword]);

  const detailFrames = useMemo(() => getProductFrames(selectedProduct), [selectedProduct]);
  const activeFrame = detailFrames[frameIndex] || selectedProduct?.imageUrl || '/placeholder.png';

  useEffect(() => {
    setFrameIndex(0);
    setZoom(1);
    setIsAutoRotate(true);
  }, [selectedProduct?.id]);

  useEffect(() => {
    if (!selectedProduct || !isAutoRotate || detailFrames.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setFrameIndex((previous) => (previous + 1) % detailFrames.length);
    }, rotateDelay);

    return () => window.clearInterval(timer);
  }, [selectedProduct, isAutoRotate, detailFrames.length, rotateDelay]);

  const toggleCategory = (name: string) => {
    setOpenCategory((previous) => (previous === name ? null : name));
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
  };

  const selectCurrentProduct = () => {
    if (!selectedProduct) {
      return;
    }
    onProductSelect(selectedProduct);
    setSelectedProduct(null);
    setIsViewAllOpen(false);
  };

  if (categories.length === 0) {
    return (
      <div className="bg-black/35 border border-yellow-700 rounded-lg p-3 h-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold text-yellow-300 mb-3 border-b border-yellow-700/60 pb-2">
          Sản phẩm
        </h3>
        <p className="text-sm text-yellow-100">Không có sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-black/35 border border-yellow-700/70 rounded-lg p-3 h-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-2 mb-3 border-b border-yellow-700/60 pb-2">
          <h3 className="text-lg font-bold text-yellow-300">Sản phẩm</h3>
          <button
            type="button"
            onClick={() => setIsViewAllOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-yellow-700/75 hover:bg-yellow-700 text-white text-xs font-semibold"
          >
            <LayoutGrid size={14} />
            View All
          </button>
        </div>

        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category?.name || 'category'}>
              <button
                type="button"
                onClick={() => toggleCategory(category?.name || '')}
                className="w-full text-left flex justify-between items-center px-2 py-1.5 bg-yellow-900/55 hover:bg-yellow-800/70 rounded-md text-yellow-200 transition-colors"
              >
                <span className="font-semibold text-sm">{category?.name || 'Danh mục'}</span>
                {openCategory === category?.name ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>

              {openCategory === category?.name ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 p-2 bg-slate-900/40 rounded border border-yellow-900/60">
                  {category?.products?.map((product) => (
                    <button
                      key={product?.id || `${category?.name}-${product?.name}`}
                      type="button"
                      className="text-left p-1 border border-transparent hover:border-yellow-400 rounded-md transition-all bg-black/45"
                      onClick={() => openProductDetail(product)}
                      title={`Xem chi tiết ${product?.name || 'sản phẩm'}`}
                    >
                      <img
                        src={product?.imageUrl || '/placeholder.png'}
                        alt={product?.name || 'Product'}
                        className="w-full h-24 object-contain rounded bg-black/30"
                        loading="lazy"
                      />
                      <div className="mt-1 px-1">
                        <p className="text-[11px] font-semibold text-yellow-100 leading-snug min-h-[28px]">
                          {product?.name || 'Sản phẩm'}
                        </p>
                        <p className="text-[10px] text-yellow-300">{formatWeight(product?.weight)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {isViewAllOpen ? (
        <div className="fixed inset-0 z-[85] bg-black/75 backdrop-blur-[2px] flex items-center justify-center p-3">
          <div className="w-[96vw] max-w-6xl max-h-[90vh] bg-[#f5f5f5] text-black rounded-lg border border-yellow-800 shadow-2xl overflow-hidden">
            <div className="bg-[#8c6e1f] text-white px-4 py-2 flex items-center justify-between gap-2">
              <div className="font-semibold text-sm md:text-base">Danh sách toàn bộ sản phẩm</div>
              <button
                type="button"
                onClick={() => {
                  setIsViewAllOpen(false);
                  setSearchKeyword('');
                }}
                className="bg-black/25 hover:bg-black/40 rounded-full p-1"
                aria-label="Close all products"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-3 py-2 border-b border-gray-300 flex gap-2 items-center">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={searchKeyword}
                  onChange={(event) => setSearchKeyword(event.target.value || '')}
                  placeholder="Tìm tên sản phẩm hoặc danh mục (không dấu vẫn tìm được)..."
                  className="w-full border border-gray-400 rounded-md pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-700"
                />
              </div>
              <span className="text-xs text-gray-700 whitespace-nowrap">
                {filteredAllProducts.length} sản phẩm
              </span>
            </div>

            <div className="overflow-y-auto max-h-[72vh] p-3 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredAllProducts.map((product) => (
                <button
                  key={product?.id || product?.name}
                  type="button"
                  className="bg-white rounded-lg border border-gray-300 hover:border-yellow-600 shadow-sm p-2 text-left"
                  onClick={() => openProductDetail(product)}
                >
                  <img
                    src={product?.imageUrl || '/placeholder.png'}
                    alt={product?.name || 'Product'}
                    className="w-full h-36 object-contain rounded bg-gray-50"
                  />
                  <p className="mt-2 text-sm font-semibold text-gray-900 min-h-[40px] max-h-[40px] overflow-hidden leading-5">
                    {product?.name || 'Sản phẩm'}
                  </p>
                  <p className="text-xs text-blue-700">{product?.category || 'Danh mục'}</p>
                  <p className="text-xs text-gray-700">Trọng lượng: {formatWeight(product?.weight)}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {selectedProduct ? (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-[1px] flex items-center justify-center p-3">
          <div className="w-[97vw] max-w-6xl max-h-[92vh] bg-[#f8f8f8] text-black rounded-xl border border-yellow-900 shadow-2xl overflow-hidden">
            <div className="bg-[#8c6e1f] text-white px-4 py-2 flex items-center justify-between">
              <h4 className="font-semibold text-sm md:text-base">Chi tiết sản phẩm</h4>
              <button
                type="button"
                onClick={closeProductDetail}
                className="bg-black/25 hover:bg-black/40 rounded-full p-1"
                aria-label="Close product detail"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 max-h-[84vh]">
              <div className="lg:col-span-3 border-r border-gray-300 p-3 flex flex-col gap-2">
                <div
                  className="relative rounded-lg border border-gray-300 bg-white flex items-center justify-center overflow-hidden h-[44vh] md:h-[52vh]"
                  onWheel={(event) => {
                    event.preventDefault();
                    const delta = event.deltaY > 0 ? -0.1 : 0.1;
                    setZoom((previous) => Math.max(1, Math.min(3.5, previous + delta)));
                  }}
                >
                  <img
                    src={activeFrame}
                    alt={selectedProduct?.name || 'Product'}
                    className="max-h-full max-w-full object-contain select-none transition-transform duration-150"
                    style={{ transform: `scale(${zoom})` }}
                    draggable={false}
                  />

                  {detailFrames.length > 1 ? (
                    <div className="absolute top-2 left-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded-full">
                      360 View: {frameIndex + 1}/{detailFrames.length}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setIsAutoRotate((previous) => !previous)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 text-white hover:bg-slate-700"
                  >
                    {isAutoRotate ? <Pause size={14} /> : <Play size={14} />}
                    {isAutoRotate ? 'Dừng quay' : 'Tự quay'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrameIndex((previous) => (previous - 1 + detailFrames.length) % detailFrames.length)}
                    disabled={detailFrames.length <= 1}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                    Frame
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrameIndex((previous) => (previous + 1) % detailFrames.length)}
                    disabled={detailFrames.length <= 1}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40"
                  >
                    Frame
                    <ChevronRight size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setZoom((previous) => Math.max(1, previous - 0.1))}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100"
                  >
                    <ZoomOut size={14} />
                    Zoom
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((previous) => Math.min(3.5, previous + 0.1))}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100"
                  >
                    <ZoomIn size={14} />
                    Zoom
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="px-2 py-1 rounded-md bg-white border border-gray-300 hover:bg-gray-100"
                  >
                    Reset
                  </button>

                  <label className="ml-auto flex items-center gap-1 text-[11px] text-gray-700">
                    Tốc độ
                    <input
                      type="range"
                      min={90}
                      max={450}
                      step={10}
                      value={rotateDelay}
                      onChange={(event) => setRotateDelay(Number(event.target.value) || 180)}
                    />
                  </label>
                </div>

                {detailFrames.length > 1 ? (
                  <div className="grid grid-cols-6 md:grid-cols-8 gap-2 pt-1">
                    {detailFrames.map((frame, index) => (
                      <button
                        key={`${selectedProduct?.id || 'product'}-frame-${index}`}
                        type="button"
                        onClick={() => setFrameIndex(index)}
                        className={`rounded border p-0.5 ${
                          frameIndex === index ? 'border-yellow-600' : 'border-gray-300'
                        }`}
                      >
                        <img
                          src={frame}
                          alt={`Frame ${index + 1}`}
                          className="w-full h-14 object-cover rounded"
                        />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="lg:col-span-2 p-4 flex flex-col gap-3">
                <h5 className="text-xl font-bold text-gray-900">{selectedProduct?.name || 'Sản phẩm'}</h5>
                <p className="text-sm text-blue-700">Danh mục: {selectedProduct?.category || 'Danh mục'}</p>
                <p className="text-sm text-gray-800">Trọng lượng: {formatWeight(selectedProduct?.weight)}</p>
                <p className="text-sm text-gray-800">
                  Tiền công tham khảo: {formatCurrency(selectedProduct?.labor_cost ?? 0)}
                </p>

                <p className="text-xs text-gray-600 leading-relaxed">
                  360 view sẽ mượt nhất khi mỗi sản phẩm có bộ ảnh chụp theo vòng (24 - 36 ảnh).
                  Nếu bạn muốn, tôi có thể cung cấp checklist chuẩn ảnh để bạn tải lên Strapi.
                </p>

                <button
                  type="button"
                  onClick={selectCurrentProduct}
                  className="mt-auto bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg px-4 py-2 font-semibold"
                >
                  Chọn sản phẩm này
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default CategoryPanel;
