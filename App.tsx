import React, { useState, useEffect, useRef } from 'react';
import { User, Product, SavedCollection, Category } from './types';
import UserInfoModal from './components/UserInfoModal';
import Header from './components/Header';
import CategoryPanel from './components/CategoryPanel';
import ProductBuilder from './components/ProductBuilder';
import AiAssistant from './components/AiAssistant';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VolumeX, Volume2, LoaderCircle } from 'lucide-react';
import { fetchCategoriesWithProducts } from './services/strapiService';

const App: React.FC = () => {
    // SỬA 1: Đọc user từ localStorage khi khởi động
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('kimHanhUser');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(!user);
    const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
        setSelectedProducts(prev => [...prev, { ...product, instanceId: Date.now() }]);
    };

    // (Các hàm removeProduct, saveCollection, toggleMute giữ nguyên)
    const removeProductFromBuilder = (instanceId: number) => { setSelectedProducts(prev => prev.filter(p => p.instanceId !== instanceId)); };
    const handleSaveCollection = () => {
        if (!user || !user.phone) { alert("Please provide user information before saving."); return; }
        const savedCollectionsJSON = localStorage.getItem('jewelryCollections');
        let savedCollections: SavedCollection[] = savedCollectionsJSON ? JSON.parse(savedCollectionsJSON) : [];
        const existingIndex = savedCollections.findIndex(c => c.phone === user.phone);
        const newCollection: SavedCollection = { phone: user.phone, products: selectedProducts };
        if (existingIndex > -1) { savedCollections[existingIndex] = newCollection; } else { savedCollections.push(newCollection); }
        localStorage.setItem('jewelryCollections', JSON.stringify(savedCollections));
        alert("Bộ sưu tập đã được lưu!");
    };

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

        // SỬA 4: Nếu user là null, AI Assistant sẽ không được render
        return (
            <main className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-3">
                    <CategoryPanel categories={categories} onProductSelect={addProductToBuilder} />
                </div>
                <div className="lg:col-span-6">
                    <ProductBuilder
                        products={selectedProducts}
                        setProducts={setSelectedProducts}
                        onRemoveProduct={removeProductFromBuilder}
                        onSave={handleSaveCollection}
                    />
                </div>
                <div className="lg:col-span-3">
                    {user ? (
                        <AiAssistant
                            user={user}
                            categories={categories}
                            onProductSelect={addProductToBuilder}
                        />
                    ) : (
                        <div className="bg-black bg-opacity-40 border border-yellow-800 rounded-lg p-4 h-full max-h-[80vh] flex items-center justify-center">
                            <p className="text-yellow-300 text-center">Vui lòng <button onClick={() => setIsModalOpen(true)} className="font-bold underline">cung cấp thông tin</button> để nhận tư vấn từ AI.</p>
                        </div>
                    )}
                </div>
            </main>
        );
    }

    // SỬA 5: Restructure lại return để Modal nằm BÊN TRÊN
    return (
        <DndProvider backend={HTML5Backend}>
            {isModalOpen && <UserInfoModal onSubmit={handleUserSubmit} onClose={handleModalClose} />}

            <div className="min-h-screen bg-cover bg-center bg-fixed text-yellow-50" style={{backgroundImage: "url('/images/backgrounds/main-bg.jpg')"}}>
                <div className="min-h-screen bg-black bg-opacity-70 flex flex-col">
                    <Header onUpdateInfoClick={() => setIsModalOpen(true)} />
                    <div className="flex-grow flex items-center justify-center">
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
                    className="fixed top-4 left-4 z-50 bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110"
                    aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                    {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
            </div>
        </DndProvider>
    );
};

export default App;
