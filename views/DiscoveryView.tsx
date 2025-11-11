import React, { useState, useRef, useEffect, useMemo } from 'react';
import TinderCard from 'react-tinder-card';
import { ParanormalFact } from '../types';
import InfoIcon from '../components/icons/InfoIcon';
import ShareIcon from '../components/icons/ShareIcon';
import SparkleIcon from '../components/icons/SparkleIcon';
import StarIcon from '../components/icons/StarIcon';
import StarSolidIcon from '../components/icons/StarSolidIcon';
import { TranslationKey } from '../utils/i18n';
import Loader from '../components/Loader';

interface DiscoveryViewProps {
  facts: ParanormalFact[];
  onSelectFact: (fact: ParanormalFact) => void;
  onLoadMore: () => void;
  isLoading: boolean;
  t: (key: TranslationKey, ...args: any[]) => string;
  favoriteIds: Set<string>;
  onToggleFavorite: (fact: ParanormalFact) => void;
  onPreloadFact: (factId: string) => void;
}

const DiscoveryView: React.FC<DiscoveryViewProps> = ({ facts, onSelectFact, onLoadMore, isLoading, t, favoriteIds, onToggleFavorite, onPreloadFact }) => {
  const [currentIndex, setCurrentIndex] = useState(facts.length - 1);
  const currentIndexRef = useRef(currentIndex);

  useEffect(() => {
    // When the facts array changes (initial load, language change, load more),
    // reset the current index to the top of the stack.
    updateCurrentIndex(facts.length - 1);
  }, [facts]);

  const canSwipe = currentIndex >= 0;

  const childRefs = useMemo(
    () =>
      Array(facts.length)
        .fill(0)
        .map(() => React.createRef<any>()),
    [facts.length]
  );
    
  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const swiped = (index: number) => {
    updateCurrentIndex(index - 1);
    
    // Preload image for the card that will become visible next
    const preloadIndex = index - 2;
    if (preloadIndex >= 0 && facts[preloadIndex]) {
        onPreloadFact(facts[preloadIndex].id);
    }
  };

  const outOfFrame = (id: string, idx: number) => {
    console.log(`${id} (${idx}) left the screen!`);
  };

  const swipe = async (dir: 'left' | 'right') => {
    if (canSwipe && currentIndex < facts.length && childRefs[currentIndex]) {
      await childRefs[currentIndex].current.swipe(dir);
    }
  };

  const handleShare = async (e: React.MouseEvent, fact: ParanormalFact) => {
    e.stopPropagation();

    const shareData = {
        title: t('shareFactTitle', fact.title),
        text: fact.summary,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.error('Share failed:', err);
        }
    } else {
        try {
            await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`);
            alert(t('copySuccess'));
        } catch (err) {
            alert(t('copyFail'));
        }
    }
  };

  const currentFact = facts[currentIndex];
  const isCurrentFactFavorite = currentFact ? favoriteIds.has(currentFact.id) : false;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center font-sans">
      <div className="relative w-full max-w-sm h-[70vh] max-h-[600px]">
        {facts.length > 0 ? facts.map((fact, index) => {
          const stackPosition = currentIndex - index;

          // Fix: Add explicit React.CSSProperties return type to prevent type widening on 'pointerEvents'.
          const getCardStyle = (): React.CSSProperties => {
            if (stackPosition < 0) {
              return { zIndex: 0, opacity: 0, pointerEvents: 'none', transform: 'scale(0.8)' };
            }
            
            const isVisible = stackPosition < 3;
            const scale = 1 - stackPosition * 0.05;
            const translateY = -stackPosition * 15;

            return {
                transform: `translateY(${translateY}px) scale(${isVisible ? scale : 0.85})`,
                zIndex: facts.length - stackPosition,
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
            };
          };

          return (
            <TinderCard
              ref={childRefs[index]}
              key={fact.id}
              onSwipe={() => swiped(index)}
              onCardLeftScreen={() => outOfFrame(fact.title, index)}
              preventSwipe={['up', 'down']}
              className="absolute"
            >
              <div
                onClick={() => onSelectFact(fact)}
                className="relative w-[90vw] max-w-sm h-[70vh] max-h-[600px] bg-cover bg-center rounded-2xl shadow-2xl overflow-hidden cursor-pointer group origin-bottom bg-slate-800"
                style={{
                  backgroundImage: fact.imageUrl ? `url(${fact.imageUrl})` : 'none',
                  ...getCardStyle(),
                }}
              >
                {!fact.imageUrl && <div className="flex w-full h-full justify-center items-center"><Loader /></div>}
                {fact.imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>}
                
                <button
                  onClick={(e) => handleShare(e, fact)}
                  className="absolute top-4 left-4 z-20 bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label={t('shareAriaLabel')}
                >
                  <ShareIcon className="w-6 h-6 pointer-events-none" />
                </button>

                <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                  <h3 className="text-3xl font-bold tracking-tight text-shadow-lg">{fact.title}</h3>
                  <p className="mt-2 text-slate-200 text-shadow-md">{fact.summary}</p>
                  <div className="absolute top-4 right-4 text-white opacity-70 group-hover:opacity-100 transition-opacity">
                      <InfoIcon className="w-8 h-8 pointer-events-none"/>
                  </div>
                </div>
              </div>
            </TinderCard>
          );
        }) : (
          !isLoading && (
            <div className="text-center text-slate-400 p-8 flex flex-col items-center">
              <h2 className="text-2xl font-bold">{t('allSeenTitle')}</h2>
              <p className="mt-2 mb-8">{t('summonMessage')}</p>
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg shadow-purple-500/30 transform transition-all hover:scale-105 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-wait disabled:scale-100"
              >
                <SparkleIcon className="w-5 h-5" />
                {t('summonButton')}
              </button>
            </div>
          )
        )}
      </div>

      <div className="mt-8 flex space-x-4 items-center">
        <button
          onClick={() => swipe('left')}
          disabled={!canSwipe || isLoading}
          className="w-20 h-20 rounded-full bg-slate-800 text-red-500 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Swipe left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button
            onClick={() => onToggleFavorite(currentFact)}
            disabled={!canSwipe || isLoading}
            className="w-16 h-16 rounded-full bg-slate-800 text-yellow-400 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={isCurrentFactFavorite ? t('unfavoriteAriaLabel') : t('favoriteAriaLabel')}
        >
            {isCurrentFactFavorite ? <StarSolidIcon className="w-8 h-8 pointer-events-none" /> : <StarIcon className="w-8 h-8 pointer-events-none" />}
        </button>
        <button
          onClick={() => swipe('right')}
          disabled={!canSwipe || isLoading}
          className="w-20 h-20 rounded-full bg-slate-800 text-green-400 flex items-center justify-center shadow-lg transform transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Swipe right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default DiscoveryView;