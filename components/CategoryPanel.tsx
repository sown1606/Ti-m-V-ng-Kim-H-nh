import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
  categories: Category[];
  onProductSelect: (product: Product) => void;
}

const CategoryPanel: React.FC<Props> = ({ categories, onProductSelect }) => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !openCategory) {
      setOpenCategory(categories[0].name);
    }
  }, [categories, openCategory]);

  useEffect(() => {
    const urls: string[] = [];
    categories.forEach((c) => {
      c.products.forEach((p: any) => {
        if (p.imageUrl) {
          urls.push(p.imageUrl);
        }
      });
    });

    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, [categories]);

  const toggleCategory = (name: string) => {
    setOpenCategory((prev) => (prev === name ? null : name));
  };

  if (categories.length === 0) {
    return (
        <div className="bg-black bg-opacity-40 border border-yellow-800 rounded-lg p-4 h-full max-h-[80vh] overflow-y-auto">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-yellow-700 pb-2">
            Sản phẩm
          </h3>
          <p className="text-yellow-200">Không có sản phẩm nào.</p>
        </div>
    );
  }

  return (
      <div className="bg-black bg-opacity-40 border border-yellow-800 rounded-lg p-4 h-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-xl font-bold text-yellow-400 mb-4 border-b border-yellow-700 pb-2">
          Sản phẩm
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
              <div key={category.name}>
                <button
                    onClick={() => toggleCategory(category.name)}
                    className="w-full text-left flex justify-between items-center p-2 bg-yellow-900 bg-opacity-50 hover:bg-opacity-75 rounded-md text-yellow-300"
                >
                  <span className="font-semibold">{category.name}</span>
                  {openCategory === category.name ? (
                      <ChevronDown size={20} />
                  ) : (
                      <ChevronRight size={20} />
                  )}
                </button>
                {openCategory === category.name && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2 p-2 bg-gray-900 bg-opacity-50 rounded">
                      {category.products.map((product: Product) => (
                          <div
                              key={product.id}
                              className="cursor-pointer p-1 border-2 border-transparent hover:border-yellow-400 rounded-md transition-all transform hover:scale-105"
                              onClick={() => onProductSelect(product)}
                              title={`Thêm ${product.name}`}
                          >
                            <img
                                src={(product as any).imageUrl}
                                alt={product.name}
                                className="w-full h-auto rounded"
                                loading="lazy"
                            />
                          </div>
                      ))}
                    </div>
                )}
              </div>
          ))}
        </div>
      </div>
  );
};

export default CategoryPanel;
