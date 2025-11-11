import React, { useState, useEffect, useRef } from 'react';
import { User, Product, SavedCollection } from './types';
import UserInfoModal from './components/UserInfoModal';
import Header from './components/Header';
import CategoryPanel from './components/CategoryPanel';
import ProductBuilder from './components/ProductBuilder';
import AiAssistant from './components/AiAssistant';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { VolumeX, Volume2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

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

  const handleUserSubmit = (userInfo: User) => {
    setUser(userInfo);
  };

  const addProductToBuilder = (product: Product) => {
    setSelectedProducts(prev => [...prev, { ...product, instanceId: Date.now() }]);
  };

  const removeProductFromBuilder = (instanceId: number) => {
    setSelectedProducts(prev => prev.filter(p => p.instanceId !== instanceId));
  };
  
  const handleSaveCollection = () => {
    if (!user || !user.phone) {
      alert("Please provide user information before saving.");
      return;
    }
    const savedCollectionsJSON = localStorage.getItem('jewelryCollections');
    let savedCollections: SavedCollection[] = savedCollectionsJSON ? JSON.parse(savedCollectionsJSON) : [];
    
    const existingIndex = savedCollections.findIndex(c => c.phone === user.phone);
    const newCollection: SavedCollection = { phone: user.phone, products: selectedProducts };

    if (existingIndex > -1) {
      savedCollections[existingIndex] = newCollection;
    } else {
      savedCollections.push(newCollection);
    }
    
    localStorage.setItem('jewelryCollections', JSON.stringify(savedCollections));
    alert("Bộ sưu tập đã được lưu!");
  };

  const toggleMute = () => {
    if (audioRef.current) {
        audioRef.current.muted = !audioRef.current.muted;
        setIsMuted(audioRef.current.muted);
        if (!audioRef.current.muted && audioRef.current.paused) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        }
    }
  };


  if (!user) {
    return <UserInfoModal onSubmit={handleUserSubmit} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
        <div className="min-h-screen bg-cover bg-center bg-fixed text-yellow-50" style={{backgroundImage: "url('/images/backgrounds/main-bg.jpg')"}}>
            <div className="min-h-screen bg-black bg-opacity-70">
                <Header />
                <main className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-3">
                        <CategoryPanel onProductSelect={addProductToBuilder} />
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
                        <AiAssistant user={user} />
                    </div>
                </main>
            </div>
            <audio ref={audioRef} src="/music/background-music.mp3" loop muted />
            <button
                onClick={toggleMute}
                className="fixed bottom-4 right-4 bg-yellow-600 hover:bg-yellow-700 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
        </div>
    </DndProvider>
  );
};

export default App;