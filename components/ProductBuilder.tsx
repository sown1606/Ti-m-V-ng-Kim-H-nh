import React, {useRef, useCallback, useState, useEffect, useMemo} from 'react';
import {GoldPrice, Product} from '../types';
import { useDrop, useDrag, DropTargetMonitor } from 'react-dnd';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Download, Image as ImageIcon, Trash2, Save } from 'lucide-react';
import {fetchGoldPrice} from "@/services/strapiService.ts";

interface Props {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  onRemoveProduct: (instanceId: number) => void;
  onSave: () => void;
}

interface DraggableProductProps {
    product: Product;
    index: number;
    moveProduct: (dragIndex: number, hoverIndex: number) => void;
    onRemove: (instanceId: number) => void;
}

const DraggableProduct: React.FC<DraggableProductProps> = ({ product, index, moveProduct, onRemove }) => {
    const ref = useRef<HTMLDivElement>(null);

    const [, drop] = useDrop({
        accept: 'product',
        hover(item: { index: number }, monitor: DropTargetMonitor) {
            if (!ref.current) return;
            const dragIndex = item.index;
            const hoverIndex = index;
            if (dragIndex === hoverIndex) return;
            moveProduct(dragIndex, hoverIndex);
            item.index = hoverIndex;
        },
    });

    const [{ isDragging }, drag] = useDrag({
        type: 'product',
        item: { index },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(drop(ref));

    return (
        <div
            ref={ref}
            style={{ opacity: isDragging ? 0.5 : 1 }}
            className="relative p-1 bg-white/10 rounded-lg cursor-move group"
        >
            <img src={product.imageUrl} alt={product.name} className="w-20 h-20 object-cover rounded" />
             <button
                onClick={() => onRemove(product.instanceId!)}
                className="absolute top-0 right-0 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                aria-label="Remove item"
             >
                <Trash2 size={12} />
            </button>
        </div>
    );
};


const ProductBuilder: React.FC<Props> = ({ products, setProducts, onRemoveProduct, onSave }) => {
    const builderRef = useRef<HTMLDivElement>(null);
    const [goldPrice, setGoldPrice] = useState<GoldPrice | null>(null);

    // 1. Fetch giá vàng khi component mount
    useEffect(() => {
        const loadGoldPrice = async () => {
            const price = await fetchGoldPrice();
            setGoldPrice(price);
        };
        loadGoldPrice();
    }, []);

    const moveProduct = useCallback((dragIndex: number, hoverIndex: number) => {
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            const [draggedProduct] = newProducts.splice(dragIndex, 1);
            newProducts.splice(hoverIndex, 0, draggedProduct);
            return newProducts;
        });
    }, [setProducts]);

    // 2. Tính toán tổng giá trị (dùng useMemo để tối ưu)
    const { totalLabor, totalWeight, totalPrice } = useMemo(() => {
        // SỬA Ở ĐÂY: 1 Lượng = 10 Chỉ
        const pricePerChi = (goldPrice?.sell_price || 0) / 10; // (Giá 1 Lượng / 10)

        const totalLabor = products.reduce((sum, p) => sum + (p.labor_cost || 0), 0);
        const totalWeight = products.reduce((sum, p) => sum + (p.weight || 0), 0);
        const totalGoldValue = totalWeight * pricePerChi; // (Tổng số chỉ * giá 1 chỉ)
        const totalPrice = totalGoldValue + totalLabor;

        return { totalLabor, totalWeight, totalPrice };
    }, [products, goldPrice]);

    // 3. Hàm format tiền
    const formatCurrency = (value: number) => {
        if (value === 0) return '0Tr';
        return `${(value / 1000000).toFixed(1)}Tr`;
    };

    const exportAs = async (format: 'png' | 'pdf') => {
        if (!builderRef.current) return;
        const canvas = await html2canvas(builderRef.current, { backgroundColor: '#7f1d1d' });
        const dataUrl = canvas.toDataURL(`image/${format === 'pdf' ? 'jpeg' : 'png'}`);

        if (format === 'png') {
            const link = document.createElement('a');
            link.download = 'bo-trang-suc.png';
            link.href = dataUrl;
            link.click();
        } else {
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            pdf.addImage(dataUrl, 'JPEG', 0, 0, canvas.width, canvas.height);
            pdf.save('bo-trang-suc.pdf');
        }
    };

  return (
    <div className="bg-black bg-opacity-40 border border-yellow-800 rounded-lg p-4 flex flex-col h-full max-h-[80vh]">
        <div className="flex justify-between items-center mb-4 border-b border-yellow-700 pb-2">
            <h3 className="text-xl font-bold text-yellow-400">Bộ Sưu Tập Của Bạn</h3>
            <div className="flex space-x-2">
                <button onClick={onSave} className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded-md transition-transform transform hover:scale-105"><Save size={16} /><span>Lưu BST</span></button>
                <button onClick={() => exportAs('png')} className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md transition-transform transform hover:scale-105"><ImageIcon size={16} /><span>Xuất ảnh</span></button>
                <button onClick={() => exportAs('pdf')} className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md transition-transform transform hover:scale-105"><Download size={16} /><span>Xuất PDF</span></button>
            </div>
        </div>
        <div ref={builderRef} className="flex-grow bg-red-900 rounded-lg p-4 flex flex-wrap gap-4 content-start items-start">
            {products.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center">
                    <p className="text-yellow-200 text-lg">Chọn sản phẩm từ cột bên trái để bắt đầu.</p>
                </div>
            ) : (
                products.map((product, index) => (
                    <DraggableProduct
                        key={product.instanceId}
                        product={product}
                        index={index}
                        moveProduct={moveProduct}
                        onRemove={onRemoveProduct}
                    />
                ))
            )}
        </div>
        <div className="mt-4 text-right text-yellow-300 font-bold text-lg">
             <p>Giá tham khảo: ~{formatCurrency(totalPrice)} (~{totalWeight.toFixed(1)}CHỈ)</p>
             <p>Tiền công: ~{formatCurrency(totalLabor)}</p>
             <p className="text-sm text-gray-400">(Giá có thể thay đổi theo mỗi ngày)</p>
        </div>
    </div>
  );
};

export default ProductBuilder;
