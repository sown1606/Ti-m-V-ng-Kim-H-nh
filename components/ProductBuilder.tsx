import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import { GoldPrice, Product } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Eye, EyeOff, Image as ImageIcon, Save } from 'lucide-react';
import { fetchGoldPrice } from '@/services/strapiService.ts';
import DraggableProduct from './DraggableProduct';

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onRemoveProduct: (instanceId: number) => void;
  onSave: () => void;
}

const ProductBuilder: React.FC<Props> = ({
  products,
  setProducts,
  onRemoveProduct,
  onSave,
}) => {
  const builderRef = useRef<HTMLDivElement>(null);
  const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);
  const [quantityEditing, setQuantityEditing] = useState<{
    instanceId: number;
    value: string;
  } | null>(null);
  const [showPreviewMeta, setShowPreviewMeta] = useState(true);

  useEffect(() => {
    const loadGoldPrice = async () => {
      const price = await fetchGoldPrice();
      setGoldPrice(price);
    };
    void loadGoldPrice();
  }, []);

  const { totalLabor, totalWeight, totalPrice } = useMemo(() => {
    const pricePerChi = (goldPrice?.sell_price || 0) / 100;
    const labor = products.reduce(
      (sum, product: any) => sum + (product?.labor_cost || 0) * (product?.quantity ?? 1),
      0
    );
    const weight = products.reduce(
      (sum, product: any) => sum + (product?.weight || 0) * (product?.quantity ?? 1),
      0
    );
    const goldValue = weight * pricePerChi;
    const finalPrice = goldValue + labor;
    return { totalLabor: labor, totalWeight: weight, totalPrice: finalPrice };
  }, [products, goldPrice]);
  const pricePerChi = (goldPrice?.sell_price || 0) / 100;

  const formatCurrency = (value: number) => {
    if (value === 0) {
      return '0 Tr';
    }
    return `${(value / 1_000_000).toFixed(1)} Tr`;
  };

  const handlePositionChange = useCallback(
    (instanceId: number, x: number, y: number) => {
      setProducts((previous: any[]) =>
        previous.map((product) => (product?.instanceId === instanceId ? { ...product, x, y } : product))
      );
    },
    [setProducts]
  );

  const handleResize = useCallback(
    (instanceId: number, width: number) => {
      setProducts((previous: any[]) =>
        previous.map((product) =>
          product?.instanceId === instanceId ? { ...product, displayWidth: width } : product
        )
      );
    },
    [setProducts]
  );

  const openQuantityModal = (instanceId: number) => {
    const current = (products as any[]).find((product) => product?.instanceId === instanceId);
    const currentQty = current?.quantity ?? 1;
    setQuantityEditing({ instanceId, value: String(currentQty) });
  };

  const handleConfirmQuantity = () => {
    if (!quantityEditing) {
      return;
    }

    const value = parseInt(quantityEditing.value.trim(), 10);
    if (Number.isNaN(value) || value <= 0) {
      setQuantityEditing(null);
      return;
    }

    setProducts((previous: any[]) =>
      previous.map((product) =>
        product?.instanceId === quantityEditing.instanceId
          ? { ...product, quantity: value }
          : product
      )
    );
    setQuantityEditing(null);
  };

  const exportAs = async (format: 'png' | 'pdf') => {
    if (!builderRef.current) {
      return;
    }

    const canvas = await html2canvas(builderRef.current, {
      backgroundColor: '#7f1d1d',
    });
    const dataUrl = canvas.toDataURL(`image/${format === 'pdf' ? 'jpeg' : 'png'}`);

    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'bo-trang-suc.png';
      link.href = dataUrl;
      link.click();
      return;
    }

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });
    pdf.addImage(dataUrl, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save('bo-trang-suc.pdf');
  };

  return (
    <div className="bg-black/35 border border-yellow-700 rounded-lg p-3 flex flex-col h-full max-h-[80vh]">
      <div className="bg-black/35 border border-yellow-800 rounded-lg p-3 flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-yellow-300 leading-none">Bộ Sưu Tập Của Bạn</h3>
          <p className="text-xs text-yellow-200 font-semibold">
            Giá tham khảo: ~{formatCurrency(totalPrice)} (~{totalWeight.toFixed(1)} chỉ)
          </p>
          <p className="text-xs text-yellow-200">Tiền công: ~{formatCurrency(totalLabor)}</p>
          <p className="text-[11px] text-gray-400">(Giá có thể thay đổi theo mỗi ngày)</p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={() => setShowPreviewMeta((previous) => !previous)}
            className="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white py-1 px-3 rounded-md transition-transform hover:scale-[1.03]"
          >
            {showPreviewMeta ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{showPreviewMeta ? 'Ẩn tên + giá' : 'Hiện tên + giá'}</span>
          </button>
          <button
            onClick={onSave}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md transition-transform hover:scale-[1.03]"
          >
            <Save size={14} />
            <span>Lưu BST</span>
          </button>
          <button
            onClick={() => exportAs('png')}
            className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md transition-transform hover:scale-[1.03]"
          >
            <ImageIcon size={14} />
            <span>Xuất ảnh</span>
          </button>
          <button
            onClick={() => exportAs('pdf')}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition-transform hover:scale-[1.03]"
          >
            <Download size={14} />
            <span>Xuất PDF</span>
          </button>
        </div>
      </div>

      <div
        ref={builderRef}
        className="mt-2 flex-grow bg-gradient-to-br from-red-950 via-red-900 to-red-800 rounded-lg p-3 flex flex-col border border-red-700/60"
      >
        <div className="relative flex-1 overflow-hidden rounded-md">
          {products.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-yellow-200 text-sm md:text-base">
                Chọn sản phẩm từ cột bên trái để bắt đầu.
              </p>
            </div>
          ) : (
            (products as any[]).map((product) =>
              product?.instanceId ? (
                <DraggableProduct
                  key={product.instanceId}
                  product={product}
                  onRemove={onRemoveProduct}
                  onChangeQuantity={openQuantityModal}
                  onPositionChange={handlePositionChange}
                  onResize={handleResize}
                  showMeta={showPreviewMeta}
                  pricePerChi={pricePerChi}
                />
              ) : null
            )
          )}
        </div>

        <div className="mt-2 text-center text-yellow-100 text-xs">
          Đ/c: 1276 Kha Vạn Cân, P.Linh Trung, TP.Thủ Đức, TP.HCM.
        </div>
      </div>

      {quantityEditing ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-yellow-600 rounded-lg p-4 w-80 shadow-2xl">
            <h4 className="text-yellow-300 font-semibold text-base mb-2">Chỉnh số lượng sản phẩm</h4>
            <p className="text-xs text-gray-300 mb-2">Nhập số lượng tối thiểu là 1.</p>
            <input
              type="number"
              min={1}
              value={quantityEditing.value}
              onChange={(event) =>
                setQuantityEditing((previous) =>
                  previous
                    ? { ...previous, value: event.target.value || '' }
                    : quantityEditing
                )
              }
              className="w-full rounded-md bg-black/40 border border-yellow-700 text-yellow-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setQuantityEditing(null)}
                className="px-3 py-1 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 text-sm"
              >
                Huỷ
              </button>
              <button
                onClick={handleConfirmQuantity}
                className="px-4 py-1 rounded-md bg-yellow-500 text-black font-semibold hover:bg-yellow-400 text-sm"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ProductBuilder;
