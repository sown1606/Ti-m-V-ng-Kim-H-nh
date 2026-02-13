import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, ShoppingCart } from 'lucide-react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableProduct from './components/DraggableProduct';
import DropZoneBuilder from './components/DropZoneBuilder';
import GoldPriceBoard from './components/GoldPriceBoard';
import { getGoldPrice, getProducts, type GoldPrice, type Product } from './services/api';

const formatVnd = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

const getIsMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  return window.innerWidth <= 960;
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [builderItems, setBuilderItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string>('');
  const [goldPriceError, setGoldPriceError] = useState<string>('');
  const [checkoutMessage, setCheckoutMessage] = useState<string>('');
  const [isMobile, setIsMobile] = useState<boolean>(() => getIsMobile());

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setIsMobile(getIsMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      setProductsError('');
      setGoldPriceError('');

      const [productsResult, goldPriceResult] = await Promise.allSettled([
        getProducts(),
        getGoldPrice(),
      ]);

      if (!isMounted) {
        return;
      }

      if (productsResult.status === 'fulfilled') {
        setProducts(productsResult.value ?? []);
      } else {
        setProducts([]);
        const message =
          productsResult.reason instanceof Error
            ? productsResult.reason.message
            : 'Failed to load products.';
        setProductsError(message);
      }

      if (goldPriceResult.status === 'fulfilled') {
        setGoldPrice(goldPriceResult.value ?? null);
      } else {
        setGoldPrice(null);
        const message =
          goldPriceResult.reason instanceof Error
            ? goldPriceResult.reason.message
            : 'Failed to load gold prices.';
        setGoldPriceError(message);
      }

      setIsLoading(false);
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const normalized = products.map((product) => product?.category?.trim() || 'Other');
    const unique = Array.from(new Set(normalized));
    return ['All', ...unique];
  }, [products]);

  useEffect(() => {
    if (selectedCategory === 'All') {
      return;
    }

    const hasCategory = products.some(
      (product) => (product?.category?.trim() || 'Other') === selectedCategory
    );
    if (!hasCategory) {
      setSelectedCategory('All');
    }
  }, [products, selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'All') {
      return products;
    }

    return products.filter(
      (product) => (product?.category?.trim() || 'Other') === selectedCategory
    );
  }, [products, selectedCategory]);

  const totalSetPrice = useMemo(() => {
    return builderItems.reduce((sum, product) => {
      const safePrice = Number.isFinite(product?.price) ? product.price : 0;
      return sum + safePrice;
    }, 0);
  }, [builderItems]);

  const handleDropProduct = useCallback((product: Product) => {
    setBuilderItems((previousItems) => [...previousItems, product]);
    setCheckoutMessage('');
  }, []);

  const handleRemoveProduct = useCallback((index: number) => {
    setBuilderItems((previousItems) =>
      previousItems.filter((_, currentIndex) => currentIndex !== index)
    );
    setCheckoutMessage('');
  }, []);

  const handleCheckout = useCallback(() => {
    if (builderItems.length === 0) {
      setCheckoutMessage('Please drag at least one product into the set before checkout.');
      return;
    }

    setCheckoutMessage(
      `Checkout ready: ${builderItems.length} item(s), estimated total ${formatVnd(totalSetPrice)}.`
    );
  }, [builderItems.length, totalSetPrice]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div
        style={{
          minHeight: '100vh',
          padding: isMobile ? 12 : 20,
          background:
            'radial-gradient(circle at top left, rgba(2, 132, 199, 0.12), transparent 42%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
          color: '#0f172a',
          boxSizing: 'border-box',
        }}
      >
        <header
          style={{
            marginBottom: 16,
            padding: isMobile ? '12px 14px' : '14px 18px',
            borderRadius: 16,
            background: 'linear-gradient(120deg, #ffffff 0%, #ecfeff 100%)',
            border: '1px solid #dbeafe',
            boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: isMobile ? 22 : 28 }}>Kim Hạnh II Jewelry Shop</h1>
          <p style={{ margin: '6px 0 0', color: '#475569' }}>
            Drag products from the gallery to build your perfect jewelry set.
          </p>
        </header>

        <main
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 3fr) minmax(0, 2fr)',
            gap: 16,
            alignItems: 'start',
          }}
        >
          <section
            style={{
              background: '#ffffff',
              borderRadius: 18,
              border: '1px solid #dbeafe',
              boxShadow: '0 10px 22px rgba(15, 23, 42, 0.06)',
              padding: 14,
              maxHeight: isMobile ? 'none' : 'calc(100vh - 170px)',
              overflowY: isMobile ? 'visible' : 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700 }}>
                <Filter size={16} />
                <span>Product Gallery</span>
              </div>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target?.value || 'All')}
                style={{
                  minWidth: 170,
                  borderRadius: 10,
                  border: '1px solid #cbd5e1',
                  padding: '8px 10px',
                  fontSize: 14,
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                }}
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {productsError ? (
              <div
                style={{
                  border: '1px solid #fecaca',
                  background: '#fff1f2',
                  color: '#991b1b',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontSize: 14,
                }}
              >
                {productsError}
              </div>
            ) : null}

            {isLoading && products.length === 0 ? (
              <div
                style={{
                  borderRadius: 12,
                  border: '1px dashed #93c5fd',
                  background: '#eff6ff',
                  color: '#1d4ed8',
                  textAlign: 'center',
                  padding: 18,
                }}
              >
                Loading products...
              </div>
            ) : null}

            {!isLoading && filteredProducts.length === 0 ? (
              <div
                style={{
                  borderRadius: 12,
                  border: '1px dashed #cbd5e1',
                  background: '#f8fafc',
                  color: '#475569',
                  textAlign: 'center',
                  padding: 18,
                }}
              >
                No products found for this category.
              </div>
            ) : null}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                gap: 12,
              }}
            >
              {filteredProducts.map((product, index) => (
                <DraggableProduct
                  key={`${product?.documentId || product?.id || 'product'}-${index}`}
                  product={product}
                />
              ))}
            </div>
          </section>

          <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <DropZoneBuilder
              items={builderItems}
              onDropProduct={handleDropProduct}
              onRemoveProduct={handleRemoveProduct}
            />

            <div
              style={{
                background: '#ffffff',
                borderRadius: 18,
                border: '1px solid #dbeafe',
                boxShadow: '0 10px 22px rgba(15, 23, 42, 0.06)',
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <GoldPriceBoard
                goldPrice={goldPrice}
                loading={isLoading && !goldPrice}
                errorMessage={goldPriceError}
              />

              <div
                style={{
                  borderRadius: 12,
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>Set items</span>
                  <strong>{builderItems.length}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                  <span>Estimated total</span>
                  <strong>{formatVnd(totalSetPrice)}</strong>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  style={{
                    borderRadius: 12,
                    border: 'none',
                    background: 'linear-gradient(120deg, #0284c7 0%, #2563eb 100%)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    fontWeight: 700,
                    padding: '11px 14px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    fontSize: 14,
                  }}
                >
                  <ShoppingCart size={16} />
                  Checkout
                </button>

                {checkoutMessage ? (
                  <p style={{ margin: 0, color: '#0f172a', fontSize: 14 }}>{checkoutMessage}</p>
                ) : null}
              </div>
            </div>
          </section>
        </main>
      </div>
    </DndProvider>
  );
}

export default App;
