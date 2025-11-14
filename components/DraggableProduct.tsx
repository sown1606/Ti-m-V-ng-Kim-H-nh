import React, { useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Product } from '../types';

type ProductWithImages = Product & {
    instanceId?: number;
    quantity?: number;
    x?: number;
    y?: number;
    displayWidth?: number;
    images?: {
        url?: string;
        formats?: {
            medium?: { url: string };
            large?: { url: string };
        };
    }[];
    imageUrl?: string;
};

interface DraggableProductProps {
    product: ProductWithImages;
    onRemove: (instanceId: number) => void;
    onChangeQuantity: (instanceId: number) => void;
    onPositionChange: (instanceId: number, x: number, y: number) => void;
    onResize: (instanceId: number, width: number) => void;
}

const getBaseUrlFromImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return '';
    try {
        const u = new URL(imageUrl);
        return `${u.protocol}//${u.host}`;
    } catch {
        return '';
    }
};

const getImageUrlForQuantity = (
    product: ProductWithImages,
    quantity: number
): string | undefined => {
  console.log('[IMG] getImageUrlForQuantity', {
    name: product.name,
    quantity,
    images: product.images,
    baseImageUrl: product.imageUrl,
  });

    const baseImageUrl = product.imageUrl;
    const imgs = product.images;

    if (!imgs || imgs.length === 0) {
    console.log('[IMG] no images, return base', baseImageUrl);
        return baseImageUrl;
    }

  let matched: any | undefined;

  // Cố tìm theo pattern tên file: nhantron1 / nhantron2 / vongtron3...
  const first: any = imgs[0];
  const nameOrUrl: string =
    (first as any)?.name ||
    first?.url ||
    first?.formats?.medium?.url ||
    '';

  console.log('[IMG] first img', { first, nameOrUrl });

  if (nameOrUrl) {
    const m = nameOrUrl.match(/^(.*?)(\d+)(\.[^.]*)?$/);
    if (m) {
      const prefix = m[1];
      const target = `${prefix}${quantity}`;

      matched = imgs.find((img: any) => {
        const n = img?.name || img?.url || '';
        return n.includes(target);
      });

      console.log('[IMG] pattern match', { prefix, target, matched });
    }
  }

    const index = Math.min(quantity, imgs.length) - 1;
  const img: any = matched || imgs[index] || imgs[imgs.length - 1];

    const variantPath: string | undefined =
        img?.formats?.medium?.url ||
        img?.formats?.large?.url ||
        img?.url;

  console.log('[IMG] final choose', { index, img, variantPath });

    if (!variantPath) return baseImageUrl;
    if (variantPath.startsWith('http')) return variantPath;

    const base = getBaseUrlFromImageUrl(baseImageUrl);
    const finalUrl = base ? `${base}${variantPath}` : variantPath;

    console.log('[IMG] finalUrl', finalUrl);
    return finalUrl;
};

const DraggableProduct: React.FC<DraggableProductProps> = ({
                                                               product,
                                                               onRemove,
                                                               onChangeQuantity,
                                                               onPositionChange,
                                                               onResize,
                                                           }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [isActive, setIsActive] = useState(false);

    const quantity = product.quantity ?? 1;
    const displayUrl =
        getImageUrlForQuantity(product, quantity) || product.imageUrl || '';
    const width = product.displayWidth ?? 260;

    console.log('[DraggableProduct] render', {
        name: product.name,
        quantity,
        displayUrl,
        images: product.images,
    });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if ((e.target as HTMLElement).closest('button')) return;

        e.preventDefault();
        setIsActive(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const initialX = product.x ?? 40;
        const initialY = product.y ?? 40;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            if (product.instanceId != null) {
                onPositionChange(product.instanceId, initialX + dx, initialY + dy);
            }
        };

        const handleMouseUp = () => {
            setIsActive(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (product.instanceId != null) {
            onChangeQuantity(product.instanceId);
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        e.preventDefault();
        if (product.instanceId == null) return;

        const startX = e.clientX;
        const startWidth = product.displayWidth ?? 260;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - startX;
    // cho nhỏ tới 80px
    const newWidth = Math.max(80, Math.min(420, startWidth + dx));
            onResize(product.instanceId!, newWidth);
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    if (!product.instanceId || !displayUrl) {
        return null;
    }

    return (
        <div
            ref={ref}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            style={{
                position: 'absolute',
                left: product.x ?? 40,
                top: product.y ?? 40,
                cursor: 'move',
            }}
            className="group"
        >
            <div
                className={[
        'relative inline-flex transition-all',
        isActive ? 'ring-2 ring-yellow-400' : '',
                ].join(' ')}
            >
                <img
                    src={displayUrl}
                    alt={product.name}
                    style={{ width, maxHeight: 420 }}
                    className="object-contain rounded-lg"
                />

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(product.instanceId!);
                    }}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                    aria-label="Remove item"
                >
                    <Trash2 size={14} />
                </button>

                {quantity > 1 && (
                    <div className="absolute bottom-1 right-1 bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full shadow">
                        x{quantity}
                    </div>
                )}

                <div
                    onMouseDown={handleResizeMouseDown}
                    className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-yellow-400 rounded-full border border-yellow-900 cursor-se-resize opacity-0 group-hover:opacity-100"
                />
            </div>
        </div>
    );
};

export default DraggableProduct;
