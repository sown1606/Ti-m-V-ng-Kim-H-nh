import { Trash2, WandSparkles } from 'lucide-react';
import { useDrop } from 'react-dnd';
import type { Product } from '../services/api';
import { PRODUCT_DND_TYPE, type DragProductItem } from './DraggableProduct';

interface DropZoneBuilderProps {
  items: Product[];
  onDropProduct: (product: Product) => void;
  onRemoveProduct: (index: number) => void;
}

const formatVnd = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(safeValue);
};

function DropZoneBuilder({ items, onDropProduct, onRemoveProduct }: DropZoneBuilderProps) {
  const [{ isOver, canDrop }, dropRef] = useDrop<
    DragProductItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >(
    () => ({
      accept: PRODUCT_DND_TYPE,
      canDrop: (item) => Boolean(item?.product),
      drop: (item) => {
        const droppedProduct = item?.product;
        if (droppedProduct) {
          onDropProduct(droppedProduct);
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [onDropProduct]
  );

  const isActive = isOver && canDrop;

  return (
    <section
      ref={dropRef}
      style={{
        border: `2px dashed ${isActive ? '#0284c7' : '#94a3b8'}`,
        borderRadius: 18,
        background: isActive
          ? 'linear-gradient(135deg, rgba(14, 165, 233, 0.12) 0%, rgba(255, 255, 255, 1) 100%)'
          : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        minHeight: 260,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'all 180ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <WandSparkles size={18} color="#0369a1" />
        <h3 style={{ margin: 0, fontSize: 18, color: '#0f172a' }}>Jewelry Set Builder</h3>
      </div>

      {items?.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((item, index) => (
            <article
              key={`${item?.documentId || item?.id || 'product'}-${index}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '64px 1fr auto',
                alignItems: 'center',
                gap: 10,
                borderRadius: 12,
                border: '1px solid #dbeafe',
                background: '#ffffff',
                padding: 8,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 10,
                  background: '#eef2ff',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {item?.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item?.name || 'Dropped product'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  'No image'
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <strong style={{ color: '#0f172a', fontSize: 14 }}>
                  {item?.name || 'Unnamed product'}
                </strong>
                <span style={{ color: '#475569', fontSize: 13 }}>{item?.category || 'Other'}</span>
                <span style={{ color: '#0f766e', fontSize: 13, fontWeight: 600 }}>
                  {formatVnd(item?.price ?? 0)}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onRemoveProduct(index)}
                style={{
                  border: '1px solid #fecaca',
                  background: '#fef2f2',
                  color: '#b91c1c',
                  borderRadius: 10,
                  padding: '7px 10px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 13,
                }}
              >
                <Trash2 size={14} />
                Remove
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: '#475569',
            fontSize: 15,
            padding: 18,
            background: '#f8fafc',
            borderRadius: 12,
          }}
        >
          Drag products here to mix Ring, Necklace, Bracelet, and more.
        </div>
      )}
    </section>
  );
}

export default DropZoneBuilder;

