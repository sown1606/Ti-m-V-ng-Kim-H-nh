import { useState, type CSSProperties } from 'react';
import { Coins, Gem, Scale } from 'lucide-react';
import { useDrag } from 'react-dnd';
import type { Product } from '../services/api';

export const PRODUCT_DND_TYPE = 'Product';

export interface DragProductItem {
  type: typeof PRODUCT_DND_TYPE;
  product: Product;
}

interface DraggableProductProps {
  product: Product;
}

const cardBaseStyle: CSSProperties = {
  background: 'linear-gradient(145deg, #ffffff 0%, #f7f8fb 100%)',
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)',
  cursor: 'grab',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  overflow: 'hidden',
  transition: 'transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease',
};

const imageStyle: CSSProperties = {
  width: '100%',
  height: 180,
  objectFit: 'cover',
  display: 'block',
};

const placeholderStyle: CSSProperties = {
  height: 180,
  background: 'linear-gradient(120deg, #f8fafc 0%, #e2e8f0 100%)',
  color: '#475569',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 600,
};

const bodyStyle: CSSProperties = {
  padding: '0 14px 14px',
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
};

const lineStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  color: '#334155',
  fontSize: 14,
};

const formatWeight = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(2)} g`;
};

const formatVnd = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

function DraggableProduct({ product }: DraggableProductProps) {
  const [imageError, setImageError] = useState(false);

  const [{ isDragging }, dragRef] = useDrag<DragProductItem, void, { isDragging: boolean }>(
    () => ({
      type: PRODUCT_DND_TYPE,
      item: {
        type: PRODUCT_DND_TYPE,
        product,
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [product]
  );

  const cardStyle: CSSProperties = {
    ...cardBaseStyle,
    opacity: isDragging ? 0.45 : 1,
    transform: isDragging ? 'scale(0.98)' : 'scale(1)',
    boxShadow: isDragging
      ? '0 8px 16px rgba(15, 23, 42, 0.08)'
      : '0 12px 24px rgba(15, 23, 42, 0.08)',
  };

  return (
    <article ref={dragRef} style={cardStyle}>
      {product?.imageUrl && !imageError ? (
        <img
          src={product.imageUrl}
          alt={product?.name || 'Jewelry product image'}
          style={imageStyle}
          onError={() => setImageError(true)}
        />
      ) : (
        <div style={placeholderStyle}>No image available</div>
      )}

      <div style={bodyStyle}>
        <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
          {product?.name || 'Unnamed product'}
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>{product?.category || 'Other'}</div>
        <div style={lineStyle}>
          <Scale size={16} />
          <span>Gold: {formatWeight(product?.goldWeight ?? 0)}</span>
        </div>
        <div style={lineStyle}>
          <Gem size={16} />
          <span>Stone: {formatWeight(product?.stoneWeight ?? 0)}</span>
        </div>
        <div style={lineStyle}>
          <Coins size={16} />
          <span>{formatVnd(product?.price ?? 0)}</span>
        </div>
      </div>
    </article>
  );
}

export default DraggableProduct;

