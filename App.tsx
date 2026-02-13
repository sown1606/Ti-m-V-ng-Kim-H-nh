import React, { useState, useEffect, useRef } from 'react';
import { User, Product, SavedCollection, Category } from './types';
import UserInfoModal from './components/UserInfoModal';
import Header from './components/Header';
import CategoryPanel from './components/CategoryPanel';
import ProductBuilder from './components/ProductBuilder';
import AiAssistant from './components/AiAssistant';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VolumeX, Volume2, LoaderCircle, MessageCircle, X } from 'lucide-react';
import { fetchCategoriesWithProducts } from './services/strapiService';

const THEME_BG_URL = 'https://tiemvangkimhanh2.com/public/admin/images/goldtheme.jpg';

const App: React.FC = () => {
    // SỬA 1: Đọc user từ localStorage khi khởi động
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('kimHanhUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [isMuted, setIsMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const fetchedCategories = await fetchCategoriesWithProducts();
                setCategories(fetchedCategories);
            } catch (e) {
                setError('Không thể tải dữ liệu sản phẩm từ máy chủ. Vui lòng thử lại sau.');
                console.error(e);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (user?.phone) {
            const savedCollectionsJSON = localStorage.getItem('jewelryCollections');
            if (savedCollectionsJSON) {
                const savedCollections: SavedCollection[] = JSON.parse(savedCollectionsJSON);
                const userCollection = savedCollections.find(c => c.phone === user.phone);
                if (userCollection) {
                    setSelectedProducts(userCollection.products);
                }
            }
        }
    }, [user]);

    // SỬA 3: handleUserSubmit giờ sẽ LƯU vào localStorage và ĐÓNG modal
    const handleUserSubmit = (userInfo: User) => {
        localStorage.setItem('kimHanhUser', JSON.stringify(userInfo));
        setUser(userInfo);
        setIsModalOpen(false);
        // Thử play nhạc sau khi user tương tác lần đầu (nếu nó bị chặn)
        if (audioRef.current && audioRef.current.paused && !isMuted) {
             audioRef.current.play().catch(e => console.error("Play failed", e));
        }
    };

    // === THÊM MỚI: HÀM XỬ LÝ KHI BẤM NÚT X (CLOSE) ===
    const handleModalClose = () => {
        setIsModalOpen(false);
        // Thử play nhạc sau khi user tương tác (click X)
        if (audioRef.current && audioRef.current.paused && !isMuted) {
             audioRef.current.play().catch(e => console.error("Play failed after modal close", e));
        }
    };
    // === KẾT THÚC THÊM MỚI ===

    const addProductToBuilder = (product: Product) => {
        setSelectedProducts((prev) => {
            const index = prev.length;
            const baseX = 80;
            const baseY = 80;
            const offsetX = 180;
            const offsetY = 220;

            const x = baseX + (index % 3) * offsetX;
            const y = baseY + Math.floor(index / 3) * offsetY;

            return [
                ...prev,
                {
                    ...product,
                    instanceId: Date.now() + index,
                    quantity: 1,
                    x,
                    y,
                },
            ];
        });
    };

    const silentSaveCollection = React.useCallback(
        (phone: string, products: Product[]) => {
            const savedCollectionsJSON = localStorage.getItem('jewelryCollections');
            let savedCollections: SavedCollection[] = savedCollectionsJSON
                ? JSON.parse(savedCollectionsJSON)
                : [];
            const existingIndex = savedCollections.findIndex((c) => c.phone === phone);
            const newCollection: SavedCollection = { phone, products };
            if (existingIndex > -1) {
                savedCollections[existingIndex] = newCollection;
            } else {
                savedCollections.push(newCollection);
            }
            localStorage.setItem(
                'jewelryCollections',
                JSON.stringify(savedCollections)
            );
        },
        []
    );

    // (Các hàm removeProduct, saveCollection, toggleMute giữ nguyên)
    const removeProductFromBuilder = (instanceId: number) => { setSelectedProducts(prev => prev.filter(p => p.instanceId !== instanceId)); };
    const handleSaveCollection = () => {
        if (!user || !user.phone) {
            alert('Please provide user information before saving.');
            return;
        }

        silentSaveCollection(user.phone, selectedProducts);
        alert('Bộ sưu tập đã được lưu!');
    };

    useEffect(() => {
        if (!user?.phone) return;
        silentSaveCollection(user.phone, selectedProducts);
    }, [selectedProducts, user, silentSaveCollection]);

    // (Hàm toggleMute đã ĐÚNG, giữ nguyên)
    const toggleMute = () => {
        if (audioRef.current) {
            const newMutedState = !isMuted;
            setIsMuted(newMutedState);
            audioRef.current.muted = newMutedState;

            if (!newMutedState && audioRef.current.paused) {
                audioRef.current.play().catch(e => console.error("Audio play failed:", e));
            }
        }
    };

    // (renderContent giữ nguyên)
    const renderContent = () => {
        if (isLoadingCategories) {
            return (
                <div className="flex flex-col items-center justify-center h-full">
                    <LoaderCircle className="animate-spin text-yellow-400" size={48} />
                    <p className="mt-4 text-lg text-yellow-200">Đang tải dữ liệu sản phẩm...</p>
                </div>
            );
        }

        if (error) {
            return <div className="text-center text-red-400 text-xl p-4">{error}</div>;
        }

        return (
            <main className="w-full max-w-[1680px] p-3 md:p-4 grid grid-cols-1 xl:grid-cols-12 gap-3 md:gap-4">
                <div className="xl:col-span-3">
                    <CategoryPanel categories={categories} onProductSelect={addProductToBuilder} />
                </div>
                <div className="xl:col-span-9">
                    <ProductBuilder
                        products={selectedProducts}
                        setProducts={setSelectedProducts}
                        onRemoveProduct={removeProductFromBuilder}
                        onSave={handleSaveCollection}
                    />
                </div>
            </main>
        );
    }

    // SỬA 5: Restructure lại return để Modal nằm BÊN TRÊN
    return (
        <DndProvider backend={HTML5Backend}>
            {isModalOpen && (
                <UserInfoModal
                    initialUser={user}
                    onSubmit={handleUserSubmit}
                    onClose={handleModalClose}
                />
            )}
            <div
                className="min-h-screen bg-cover bg-center bg-fixed text-yellow-50 text-[13px] md:text-sm"
                style={{
                    backgroundImage: `url('${THEME_BG_URL}')`,
                }}
            >
                <div className="min-h-screen bg-black/30 flex flex-col">
                    <Header onUpdateInfoClick={() => setIsModalOpen(true)} />
                    <div className="flex-grow flex items-stretch justify-center">
                        {renderContent()}
                    </div>
                </div>

                {/* === SỬA LỖI Ở ĐÂY: Thêm muted={isMuted} === */}
                <audio
                  ref={audioRef}
                  src="/musics/background-music.mp3"
                  loop
                  autoPlay
                  muted={isMuted} // Đồng bộ state với thẻ audio
                />
                {/* === KẾT THÚC SỬA === */}

                <button
                    onClick={toggleMute}
                    className="fixed top-4 left-4 z-[95] bg-yellow-600 hover:bg-yellow-700 text-white p-2.5 rounded-full shadow-lg transition-transform transform hover:scale-110"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>

                {isAssistantOpen && (
                    <div className="fixed bottom-20 right-4 z-[92] w-[95vw] max-w-[430px] h-[72vh] max-h-[720px] rounded-xl p-0.5 shadow-2xl">
                        <button
                            type="button"
                            onClick={() => setIsAssistantOpen(false)}
                            className="absolute -top-3 -right-3 z-[93] bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded-full shadow-lg"
                            aria-label="Close AI assistant"
                        >
                            <X size={18} />
                        </button>

                        {user ? (
                            <AiAssistant
                                user={user}
                                categories={categories}
                                onProductSelect={addProductToBuilder}
                            />
                        ) : (
                            <div className="bg-slate-950 border border-yellow-800 rounded-lg p-4 h-full flex items-center justify-center">
                                <p className="text-yellow-300 text-center">
                                    Vui lòng{' '}
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="font-bold underline"
                                    >
                                        cung cấp thông tin
                                    </button>{' '}
                                    để nhận tư vấn từ AI.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    onClick={() => setIsAssistantOpen((prev) => !prev)}
                    className="fixed bottom-4 right-4 z-[95] bg-yellow-600 hover:bg-yellow-700 text-white px-3.5 py-2.5 rounded-full shadow-lg transition-transform transform hover:scale-105 flex items-center gap-2"
                    aria-label={isAssistantOpen ? 'Close AI assistant' : 'Open AI assistant'}
                >
                    {isAssistantOpen ? <X size={18} /> : <MessageCircle size={18} />}
                    <span className="font-semibold text-sm">AI</span>
                </button>
            </div>
        </DndProvider>
    );
};

export default App;
