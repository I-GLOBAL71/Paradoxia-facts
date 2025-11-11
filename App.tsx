import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { ParanormalFact } from './types';
import { fetchParanormalFacts, generateImage } from './services/geminiService';
import DiscoveryView from './views/DiscoveryView';
import DetailView from './views/DetailView';
import Loader from './components/Loader';
import { getInitialLanguage, getTranslator } from './utils/i18n';
import SoundOnIcon from './components/icons/SoundOnIcon';
import SoundOffIcon from './components/icons/SoundOffIcon';
import BookmarkIcon from './components/icons/BookmarkIcon';
import FavoritesView, { FavoritesViewRef } from './views/FavoritesView';
import ShuffleIcon from './components/icons/ShuffleIcon';
import OnboardingView from './views/OnboardingView';

// A subtle, royalty-free spooky track
const MUSIC_URL = 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_b25184252a.mp3';

const App: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'fr'>(getInitialLanguage());
  const t = getTranslator(language);

  const [facts, setFacts] = useState<ParanormalFact[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [selectedFact, setSelectedFact] = useState<ParanormalFact | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true); // Start muted for better UX
  const [isTtsPlaying, setIsTtsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const favoritesViewRef = useRef<FavoritesViewRef>(null);

  const [view, setView] = useState<'discovery' | 'favorites'>('discovery');
  const [filteredFavoritesCount, setFilteredFavoritesCount] = useState(0);

  const [favorites, setFavorites] = useState<ParanormalFact[]>(() => {
    try {
      const saved = localStorage.getItem('favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => {
    try {
        return localStorage.getItem('onboardingComplete') !== 'true';
    } catch {
        return true;
    }
  });

  const favoriteIds = useMemo(() => new Set(favorites.map(f => f.id)), [favorites]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    audioRef.current = new Audio(MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3; // Keep it subtle
    audioRef.current.muted = isMuted; // Set initial muted state

    const playPromise = audioRef.current.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // This is expected if the user hasn't interacted with the page yet.
        // Muted autoplay is generally allowed, but some browsers might be stricter.
        console.log("Audio autoplay was prevented.");
      });
    }

    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []); // Only runs on mount

  useEffect(() => {
    if (audioRef.current) {
      // TTS playback should always override user's mute preference
      audioRef.current.muted = isMuted || isTtsPlaying;
    }
  }, [isMuted, isTtsPlaying]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Could not play audio:", e));
    }
    setIsMuted(prev => !prev);
  };

  const loadFacts = useCallback(async (langToLoad: 'en' | 'fr', append: boolean) => {
    setIsLoading(true);
    setError(null);
    if (!append) {
        setFacts([]);
    }
    try {
      setLoadingStatus(t('loadingFacts'));
      const factsData = await fetchParanormalFacts(langToLoad);
      
      setLoadingStatus(t('loadingImages'));
      
      for (const factData of factsData) {
        try {
          const base64Image = await generateImage(factData.imagePrompt);
          const newFact: ParanormalFact = {
            id: factData.id,
            title: factData.title,
            summary: factData.summary,
            details: factData.details,
            category: factData.category,
            videoUrl: factData.videoUrl,
            imageUrl: `data:image/png;base64,${base64Image}`,
          };
          
          setFacts(prevFacts => {
            // Prevent adding duplicates
            if (prevFacts.some(pf => pf.id === newFact.id)) {
              return prevFacts;
            }
            return [...prevFacts, newFact];
          });

        } catch (imageError) {
          console.error(`Failed to generate image for fact "${factData.title}":`, imageError);
          // Silently skip facts that fail image generation
        }
      }

    } catch (err) {
      setError(t('errorFetch'));
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  }, [t]);

  useEffect(() => {
    loadFacts(language, false);
  }, [language, loadFacts]);

  const handleLanguageToggle = () => {
    setLanguage(prev => prev === 'en' ? 'fr' : 'en');
  };

  const handleSelectFact = (fact: ParanormalFact) => {
    setSelectedFact(fact);
  };

  const handleBack = () => {
    setSelectedFact(null);
  };

  const toggleFavorite = (fact: ParanormalFact) => {
    setFavorites(prev => {
      const isFavorited = prev.some(f => f.id === fact.id);
      if (isFavorited) {
        return prev.filter(f => f.id !== fact.id);
      } else {
        return [...prev, fact];
      }
    });
  };
  
  const handleShuffleFavorites = () => {
    favoritesViewRef.current?.shuffle();
  };
  
  const handleSetView = (newView: 'discovery' | 'favorites') => {
    if (newView === 'discovery') {
      setFilteredFavoritesCount(0);
    }
    setView(newView);
  }

  const handleOnboardingComplete = () => {
    try {
        localStorage.setItem('onboardingComplete', 'true');
    } catch (e) {
        console.error("Could not save onboarding status to localStorage.", e);
    }
    setShowOnboarding(false);
  };

  const renderContent = () => {
    if (isLoading && facts.length === 0) {
      return <Loader message={loadingStatus} />;
    }

    if (error) {
      return (
        <div className="flex h-full w-full items-center justify-center text-center">
            <div className="text-red-400 p-8">
                <h2 className="text-2xl font-bold">{t('errorTitle')}</h2>
                <p>{error}</p>
            </div>
        </div>
      );
    }

    if (selectedFact) {
      return <DetailView fact={selectedFact} onBack={handleBack} onToggleFavorite={toggleFavorite} isFavorite={favoriteIds.has(selectedFact.id)} onTtsStateChange={setIsTtsPlaying} t={t} />;
    }
    
    if (view === 'favorites') {
      return <FavoritesView ref={favoritesViewRef} favorites={favorites} onSelectFact={handleSelectFact} onFilteredCountChange={setFilteredFavoritesCount} t={t} />
    }
    
    return <DiscoveryView key={language} facts={facts} onSelectFact={handleSelectFact} onLoadMore={() => loadFacts(language, true)} isLoading={isLoading} t={t} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} />;
  };

  return (
    <main className="h-screen w-screen bg-slate-900 text-white flex flex-col overflow-hidden">
       {showOnboarding && <OnboardingView onComplete={handleOnboardingComplete} t={t} />}
       <header className="flex-shrink-0 p-4 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm z-10 min-h-[64px]">
        <div className="flex items-center gap-2 w-1/3">
           {view === 'discovery' && (
            <>
              <button
                onClick={handleLanguageToggle}
                className="w-10 h-10 flex items-center justify-center font-bold text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full"
                aria-label={t('languageToggleAriaLabel')}
              >
                {language.toUpperCase()}
              </button>
              <button
                onClick={() => handleSetView('favorites')}
                className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full p-2"
                aria-label={t('goToFavoritesAriaLabel')}
                >
                <BookmarkIcon className="w-6 h-6" />
              </button>
            </>
           )}
        </div>
        <h1 className="text-2xl font-bold tracking-wider text-purple-300 drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] cursor-pointer text-center w-1/3" onClick={() => { handleSetView('discovery'); setSelectedFact(null); }}>
          {view === 'favorites' ? t('favoritesTitle') : t('appTitleParanormal')}
          {view === 'discovery' && <span className="font-light text-slate-300">{t('appTitle')}</span>}
        </h1>
        <div className="flex items-center justify-end gap-2 w-1/3">
          {view === 'favorites' && filteredFavoritesCount > 1 && (
            <button
              onClick={handleShuffleFavorites}
              className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full p-2"
              aria-label={t('shuffleAriaLabel')}
            >
              <ShuffleIcon className="w-6 h-6" />
            </button>
          )}
          <button
            onClick={toggleMute}
            className="text-slate-300 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-full p-2"
            aria-label={t(isMuted ? 'unmuteAriaLabel' : 'muteAriaLabel')}
          >
            {isMuted ? <SoundOffIcon className="w-6 h-6" /> : <SoundOnIcon className="w-6 h-6" />}
          </button>
        </div>
      </header>
      <div className="flex-grow relative">
        {renderContent()}
      </div>
    </main>
  );
};

export default App;