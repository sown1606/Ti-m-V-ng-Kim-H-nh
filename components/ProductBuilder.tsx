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
import { Download, Image as ImageIcon, Save } from 'lucide-react';
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

    useEffect(() => {
        const loadGoldPrice = async () => {
            const price = await fetchGoldPrice();
            setGoldPrice(price);
        };
        loadGoldPrice();
    }, []);

    const { totalLabor, totalWeight, totalPrice } = useMemo(() => {
        const pricePerChi = (goldPrice?.sell_price || 0) / 100;

        const totalLabor = products.reduce(
            (sum, p: any) => sum + (p.labor_cost || 0) * (p.quantity ?? 1),
            0
        );
        const totalWeight = products.reduce(
            (sum, p: any) => sum + (p.weight || 0) * (p.quantity ?? 1),
            0
        );
        const totalGoldValue = totalWeight * pricePerChi;
        const totalPrice = totalGoldValue + totalLabor;

        return { totalLabor, totalWeight, totalPrice };
    }, [products, goldPrice]);

    const formatCurrency = (value: number) => {
        if (value === 0) return '0Tr';
        return `${(value / 1_000_000).toFixed(1)}Tr`;
    };

    const handlePositionChange = useCallback(
        (instanceId: number, x: number, y: number) => {
            setProducts((prev: any[]) =>
                prev.map((p) => (p.instanceId === instanceId ? { ...p, x, y } : p))
            );
        },
        [setProducts]
    );

    const handleResize = useCallback(
        (instanceId: number, width: number) => {
            setProducts((prev: any[]) =>
                prev.map((p) =>
                    p.instanceId === instanceId ? { ...p, displayWidth: width } : p
                )
            );
        },
        [setProducts]
    );

    const openQuantityModal = (instanceId: number) => {
        const current = (products as any[]).find(
            (p) => p.instanceId === instanceId
        );
        const currentQty = current?.quantity ?? 1;
        setQuantityEditing({ instanceId, value: String(currentQty) });
    };

    const handleConfirmQuantity = () => {
        if (!quantityEditing) return;
        const raw = quantityEditing.value.trim();
        const value = parseInt(raw, 10);

        if (Number.isNaN(value) || value <= 0) {
            setQuantityEditing(null);
            return;
        }

  // KHÔNG clamp nữa – lưu đúng số lượng khách nhập
        setProducts((prev: any[]) =>
            prev.map((p) =>
                p.instanceId === quantityEditing.instanceId
        ? { ...p, quantity: value }
                    : p
            )
        );

        setQuantityEditing(null);
    };

    const exportAs = async (format: 'png' | 'pdf') => {
        if (!builderRef.current) return;
        const canvas = await html2canvas(builderRef.current, {
            backgroundColor: '#7f1d1d',
        });
        const dataUrl = canvas.toDataURL(
            `image/${format === 'pdf' ? 'jpeg' : 'png'}`
        );

        if (format === 'png') {
            const link = document.createElement('a');
            link.download = 'bo-trang-suc.png';
            link.href = dataUrl;
            link.click();
        } else {
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height],
            });
            pdf.addImage(dataUrl, 'JPEG', 0, 0, canvas.width, canvas.height);
            pdf.save('bo-trang-suc.pdf');
        }
    };

    return (
        <div className="bg-black bg-opacity-40 border border-yellow-800 rounded-lg p-4 flex flex-col h-full max-h-[80vh]">
            <div className="bg-black bg-opacity-40 border border-yellow-800 rounded-lg p-4 flex flex-col">
                <h3 className="text-xl font-bold text-yellow-400">
                    Bộ Sưu Tập Của Bạn
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={onSave}
                        className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md transition-transform transform hover:scale-105"
                    >
                        <Save size={16} />
                        <span>Lưu BST</span>
                    </button>
                    <button
                        onClick={() => exportAs('png')}
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md transition-transform transform hover:scale-105"
                    >
                        <ImageIcon size={16} />
                        <span>Xuất ảnh</span>
                    </button>
                    <button
                        onClick={() => exportAs('pdf')}
                        className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition-transform transform hover:scale-105"
                    >
                        <Download size={16} />
                        <span>Xuất PDF</span>
                    </button>
                </div>
            </div>

            <div
                ref={builderRef}
                className="flex-grow bg-gradient-to-br from-red-950 via-red-900 to-red-800 rounded-lg p-4 flex flex-col"
            >
                <div className="relative flex-1 overflow-hidden">
                    {products.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-yellow-200 text-lg">
                                Chọn sản phẩm từ cột bên trái để bắt đầu.
                            </p>
                        </div>
                    ) : (
                        (products as any[]).map((product) =>
                            product.instanceId ? (
                                <DraggableProduct
                                    key={product.instanceId}
                                    product={product}
                                    onRemove={onRemoveProduct}
                                    onChangeQuantity={openQuantityModal}
                                    onPositionChange={handlePositionChange}
                                    onResize={handleResize}
                                />
                            ) : null
                        )
                    )}
                </div>

                <div className="mt-4 text-center text-yellow-100 text-sm">
                    Đ/c: 1276 Kha Vạn Cân, P.Linh Trung, TP.Thủ Đức, TP.HCM.
                </div>
            </div>

            <div className="mt-4 text-right text-yellow-300 font-bold text-lg">
                <p>
                    Giá tham khảo: ~{formatCurrency(totalPrice)} (~
                    {totalWeight.toFixed(1)}
                    CHỈ)
                </p>
                <p>Tiền công: ~{formatCurrency(totalLabor)}</p>
                <p className="text-sm text-gray-400">
                    (Giá có thể thay đổi theo mỗi ngày)
                </p>
            </div>

            {quantityEditing && (
                <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
                    <div className="bg-gray-900 border border-yellow-600 rounded-lg p-4 w-80 shadow-2xl">
                        <h4 className="text-yellow-300 font-semibold text-lg mb-3">
                            Chỉnh số lượng sản phẩm
                        </h4>
                        <p className="text-sm text-gray-300 mb-2">
  Nhập số lượng (tối thiểu 1, có thể là 2, 5, 10...).
                        </p>
                        <input
                            type="number"
                            min={1}
  // bỏ max={10}
                            value={quantityEditing.value}
                            onChange={(e) =>
                                setQuantityEditing((prev) =>
                                    prev
                                        ? { ...prev, value: e.target.value }
                                        : quantityEditing
                                )
                            }
                            className="w-full rounded-md bg-black/40 border border-yellow-700 text-yellow-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
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
            )}
        </div>
    );
};

export default ProductBuilder;
