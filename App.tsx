import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { User, Product, SavedCollection, Category } from './types';
import UserInfoModal from './components/UserInfoModal';
import Header from './components/Header';
import CategoryPanel from './components/CategoryPanel';
import ProductBuilder from './components/ProductBuilder';
import AiAssistant from './components/AiAssistant';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  LoaderCircle,
  ListMusic,
  MessageCircle,
  Music2,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { fetchCategoriesWithProducts } from './services/strapiService';

const THEME_BG_URL = 'https://tiemvangkimhanh2.com/public/admin/images/goldtheme.jpg';

interface TrackItem {
  id: string;
  label: string;
  src: string;
}

const MUSIC_PLAYLIST: TrackItem[] = [
  {
    id: 'nhac-1',
    label: 'DUYÊN THẮM TRẦU CAU – TÔN CÁT TƯỜNG x KIM HẠNH | OFFICIAL MUSIC VIDEO',
    src: '/musics/nhacnen1.mp3',
  },
  {
    id: 'nhac-2',
    label: 'ANH HỨA NHA ANH – TÔN CÁT TƯỜNG x KIM HẠNH',
    src: '/musics/nhacnen2.mp3',
  },
];

const readStoredUser = (): User | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem('kimHanhUser');
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? (parsed as User) : null;
  } catch (error) {
    console.error('Cannot parse saved user:', error);
    return null;
  }
};

const readSavedCollections = (): SavedCollection[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem('jewelryCollections');
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedCollection[]) : [];
  } catch (error) {
    console.error('Cannot parse saved collections:', error);
    return [];
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => readStoredUser());
  const [isModalOpen, setIsModalOpen] = useState<boolean>(true);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlayerExpanded, setIsPlayerExpanded] = useState<boolean>(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const fetchedCategories = await fetchCategoriesWithProducts();
        setCategories(fetchedCategories);
      } catch (loadError) {
        console.error(loadError);
        setError('Không thể tải dữ liệu sản phẩm từ máy chủ. Vui lòng thử lại sau.');
      } finally {
        setIsLoadingCategories(false);
      }
    };

    void loadCategories();
  }, []);

  useEffect(() => {
    if (!user?.phone) {
      setSelectedProducts([]);
      return;
    }

    const savedCollections = readSavedCollections();
    const userCollection = savedCollections.find((collection) => collection?.phone === user.phone);
    setSelectedProducts(Array.isArray(userCollection?.products) ? userCollection.products : []);
  }, [user?.phone]);

  const persistCollection = useCallback((phone: string, products: Product[]) => {
    if (!phone || typeof window === 'undefined') {
      return;
    }

    const savedCollections = readSavedCollections();
    const existingIndex = savedCollections.findIndex((collection) => collection?.phone === phone);
    const nextCollection: SavedCollection = { phone, products };

    if (existingIndex >= 0) {
      savedCollections[existingIndex] = nextCollection;
    } else {
      savedCollections.push(nextCollection);
    }

    window.localStorage.setItem('jewelryCollections', JSON.stringify(savedCollections));
  }, []);

  useEffect(() => {
    if (!hasAudioPermission || isMuted) {
      return;
    }

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((playError) => {
        console.error('Background music play failed:', playError);
      });
    }
  }, [currentTrackIndex, hasAudioPermission, isMuted]);

  useEffect(() => {
    if (!user?.phone) {
      return;
    }
    persistCollection(user.phone, selectedProducts);
  }, [persistCollection, selectedProducts, user?.phone]);

  const handleUserSubmit = (userInfo: User) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('kimHanhUser', JSON.stringify(userInfo));
    }
    setUser(userInfo);
    setIsModalOpen(false);
    setHasAudioPermission(true);
    setIsMuted(false);

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.muted = false;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((playError) => {
        console.error('Autoplay workaround failed:', playError);
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setHasAudioPermission(true);
    setIsMuted(false);

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.muted = false;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((playError) => {
        console.error('Autoplay workaround failed:', playError);
      });
    }
  };

  const addProductToBuilder = (product: Product) => {
    setSelectedProducts((previousProducts) => {
      const index = previousProducts.length;
      const x = 80 + (index % 3) * 180;
      const y = 80 + Math.floor(index / 3) * 220;

      return [
        ...previousProducts,
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

  const removeProductFromBuilder = (instanceId: number) => {
    setSelectedProducts((previousProducts) =>
      previousProducts.filter((product) => product?.instanceId !== instanceId)
    );
  };

  const handleSaveCollection = () => {
    if (!user?.phone) {
      alert('Vui lòng cập nhật thông tin khách trước khi lưu bộ sưu tập.');
      return;
    }
    persistCollection(user.phone, selectedProducts);
    alert('Bộ sưu tập đã được lưu.');
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);

    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.muted = nextMuted;
    if (!nextMuted && hasAudioPermission && audio.paused) {
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((playError) => {
          console.error('Cannot resume music:', playError);
        });
      }
    }
  };

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      setHasAudioPermission(true);
      setIsMuted(false);
      audio.muted = false;
      const playPromise = audio.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch((playError) => {
          console.error('Cannot start playback:', playError);
        });
      }
      return;
    }

    audio.pause();
  };

  const selectTrack = useCallback((index: number) => {
    if (index < 0 || index >= MUSIC_PLAYLIST.length) {
      return;
    }
    setCurrentTrackIndex(index);
  }, []);

  const playPreviousTrack = () => {
    setCurrentTrackIndex((previousIndex) =>
      previousIndex <= 0 ? MUSIC_PLAYLIST.length - 1 : previousIndex - 1
    );
  };

  const playNextTrack = () => {
    setCurrentTrackIndex((previousIndex) => (previousIndex + 1) % MUSIC_PLAYLIST.length);
  };

  const currentTrack = useMemo(() => {
    return MUSIC_PLAYLIST[currentTrackIndex] || MUSIC_PLAYLIST[0];
  }, [currentTrackIndex]);

  const renderContent = () => {
    if (isLoadingCategories) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <LoaderCircle className="animate-spin text-yellow-400" size={42} />
          <p className="mt-3 text-sm md:text-base text-yellow-100">Đang tải dữ liệu sản phẩm...</p>
        </div>
      );
    }

    if (error) {
      return <div className="text-center text-red-300 text-sm md:text-base p-4">{error}</div>;
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
  };

  return (
    <DndProvider backend={HTML5Backend}>
      {isModalOpen ? (
        <UserInfoModal
          initialUser={user}
          onSubmit={handleUserSubmit}
          onClose={handleModalClose}
        />
      ) : null}

      <div
        className="min-h-screen bg-cover bg-center bg-fixed text-yellow-50 text-[12px] md:text-sm"
        style={{ backgroundImage: `url('${THEME_BG_URL}')` }}
      >
        <div className="min-h-screen bg-black/20 flex flex-col">
          <Header onUpdateInfoClick={() => setIsModalOpen(true)} />
          <div className="flex-grow flex items-stretch justify-center">{renderContent()}</div>
        </div>

        <audio
          ref={audioRef}
          src={currentTrack?.src || '/musics/nhacnen1.mp3'}
          muted={isMuted}
          preload="auto"
          onEnded={playNextTrack}
          onError={() => {
            console.error(`Audio source failed: ${currentTrack?.src || 'unknown source'}`);
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        <div className="fixed top-4 left-4 z-[96] w-[228px] rounded-xl border border-yellow-700/70 bg-gradient-to-b from-black/85 to-slate-950/85 backdrop-blur-md p-2 shadow-2xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-yellow-200 font-semibold text-[11px] tracking-wide uppercase">
              <Music2 size={15} />
              <span>Kim Hạnh Melody</span>
            </div>
            <button
              type="button"
              onClick={() => setIsPlayerExpanded((previous) => !previous)}
              className="text-yellow-200 hover:text-yellow-50 p-1 rounded border border-yellow-700/50 hover:border-yellow-500/70"
              aria-label={isPlayerExpanded ? 'Collapse player' : 'Expand player'}
            >
              <ListMusic size={14} />
            </button>
          </div>

          <p className="mt-1 text-[11px] text-slate-200 truncate">{currentTrack?.label || 'No track'}</p>

          <div className="mt-2 grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={playPreviousTrack}
              className="inline-flex items-center justify-center bg-slate-800/85 hover:bg-slate-700 text-yellow-100 rounded-md py-1.5"
              aria-label="Previous track"
            >
              <SkipBack size={13} />
            </button>
            <button
              type="button"
              onClick={togglePlayback}
              className="inline-flex items-center justify-center bg-yellow-600 hover:bg-yellow-500 text-black rounded-md py-1.5"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button
              type="button"
              onClick={playNextTrack}
              className="inline-flex items-center justify-center bg-slate-800/85 hover:bg-slate-700 text-yellow-100 rounded-md py-1.5"
              aria-label="Next track"
            >
              <SkipForward size={13} />
            </button>
            <button
              type="button"
              onClick={toggleMute}
              className="inline-flex items-center justify-center bg-slate-800/85 hover:bg-slate-700 text-yellow-100 rounded-md py-1.5"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
            </button>
          </div>

          {isPlayerExpanded ? (
            <>
              <div className="mt-2 max-h-24 overflow-y-auto pr-1 space-y-1">
                {MUSIC_PLAYLIST.map((track, index) => {
                  const isActive = index === currentTrackIndex;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => selectTrack(index)}
                      className={`w-full text-left px-2 py-1.5 rounded text-[11px] transition ${
                        isActive
                          ? 'bg-yellow-500 text-black font-semibold border border-yellow-300/70'
                          : 'bg-slate-800/80 text-slate-100 hover:bg-slate-700 border border-slate-600/60'
                      }`}
                    >
                      {index + 1}. {track.label}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </div>

        {isAssistantOpen ? (
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
              <AiAssistant user={user} categories={categories} onProductSelect={addProductToBuilder} />
            ) : (
              <div className="bg-slate-950 border border-yellow-800 rounded-lg p-4 h-full flex items-center justify-center">
                <p className="text-yellow-300 text-center">
                  Vui lòng{' '}
                  <button onClick={() => setIsModalOpen(true)} className="font-bold underline">
                    cung cấp thông tin
                  </button>{' '}
                  để nhận tư vấn từ AI.
                </p>
              </div>
            )}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setIsAssistantOpen((previous) => !previous)}
          className="fixed bottom-4 right-4 z-[95] bg-yellow-600 hover:bg-yellow-700 text-white px-3.5 py-2.5 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
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
