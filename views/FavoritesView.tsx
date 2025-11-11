import React, { useState, useMemo, useEffect, forwardRef, useImperativeHandle } from 'react';
import { ParanormalFact } from '../types';
import InfoIcon from '../components/icons/InfoIcon';
import { TranslationKey } from '../utils/i18n';
import SearchIcon from '../components/icons/SearchIcon';

interface FavoritesViewProps {
  favorites: ParanormalFact[];
  onSelectFact: (fact: ParanormalFact) => void;
  t: (key: TranslationKey, ...args: any[]) => string;
  onFilteredCountChange: (count: number) => void;
}

export interface FavoritesViewRef {
  shuffle: () => void;
}

const FavoritesView = forwardRef<FavoritesViewRef, FavoritesViewProps>(({ favorites, onSelectFact, t, onFilteredCountChange }, ref) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [displayedFavorites, setDisplayedFavorites] = useState<ParanormalFact[]>([]);

  const allCategories = useMemo(() => {
    const categories = new Set(favorites.map(f => f.category));
    return Array.from(categories).sort();
  }, [favorites]);

  const toggleCategory = (category: string) => {
    setActiveCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const clearCategories = () => {
    setActiveCategories(new Set());
  };

  const filteredFavorites = useMemo(() => {
    return favorites.filter(fact => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        fact.title.toLowerCase().includes(searchLower) ||
        fact.summary.toLowerCase().includes(searchLower) ||
        fact.details.toLowerCase().includes(searchLower);

      const matchesCategory =
        activeCategories.size === 0 || activeCategories.has(fact.category);
        
      return matchesSearch && matchesCategory;
    });
  }, [favorites, searchQuery, activeCategories]);
  
  useEffect(() => {
    setDisplayedFavorites(filteredFavorites);
  }, [filteredFavorites]);

  useEffect(() => {
    onFilteredCountChange(filteredFavorites.length);
  }, [filteredFavorites, onFilteredCountChange]);
  
  const handleShuffle = () => {
    const array = [...displayedFavorites];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    setDisplayedFavorites(array);
  };

  useImperativeHandle(ref, () => ({
    shuffle: handleShuffle,
  }));

  const renderContent = () => {
    if (favorites.length === 0) {
      return (
        <div className="flex-grow flex items-center justify-center text-center text-slate-400">
          <p>{t('favoritesEmpty')}</p>
        </div>
      );
    }
    if (filteredFavorites.length === 0) {
      return (
        <div className="flex-grow flex items-center justify-center text-center text-slate-400">
          <p>{t('noResultsFound')}</p>
        </div>
      );
    }
    return (
      <div className="flex-grow overflow-y-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayedFavorites.map(fact => (
            <div
              key={fact.id}
              onClick={() => onSelectFact(fact)}
              className="relative aspect-[3/4] bg-cover bg-center rounded-lg shadow-lg overflow-hidden cursor-pointer group"
              style={{ backgroundImage: `url(${fact.imageUrl})` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent transition-opacity group-hover:bg-black/40"></div>
              <div className="absolute bottom-0 left-0 p-3 text-white">
                <h3 className="font-bold text-sm leading-tight">{fact.title}</h3>
              </div>
              <div className="absolute top-2 right-2 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <InfoIcon className="w-6 h-6 pointer-events-none"/>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-4 bg-slate-900">
      {favorites.length > 0 && (
        <>
          <div className="relative mb-4 flex-shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchAriaLabel')}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <SearchIcon className="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
            <button
              onClick={clearCategories}
              className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                activeCategories.size === 0
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {t('allCategories')}
            </button>
            {allCategories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                  activeCategories.has(category)
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </>
      )}

      {renderContent()}
    </div>
  );
});

export default FavoritesView;