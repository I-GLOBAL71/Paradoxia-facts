import React, { useState, useEffect, useRef } from 'react';
import { ParanormalFact } from '../types';
import ChevronLeftIcon from '../components/icons/ChevronLeftIcon';
import StarIcon from '../components/icons/StarIcon';
import StarSolidIcon from '../components/icons/StarSolidIcon';
import { TranslationKey } from '../utils/i18n';
import { generateSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';
import SpeakerWaveIcon from '../components/icons/SpeakerWaveIcon';
import PauseIcon from '../components/icons/PauseIcon';

interface DetailViewProps {
  fact: ParanormalFact;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (fact: ParanormalFact) => void;
  onTtsStateChange: (isPlaying: boolean) => void;
  t: (key: TranslationKey, ...args: any[]) => string;
}

type TtsState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => {
  const colors: { [key: string]: string } = {
    // English
    'Ghost': 'bg-indigo-500 text-indigo-100',
    'Witchcraft': 'bg-purple-600 text-purple-100',
    'Cryptid': 'bg-teal-500 text-teal-100',
    'UFO': 'bg-green-600 text-green-100',
    'Supernatural Phenomenon': 'bg-rose-600 text-rose-100',
    // French
    'Fantôme': 'bg-indigo-500 text-indigo-100',
    'Sorcellerie': 'bg-purple-600 text-purple-100',
    'Créature': 'bg-teal-500 text-teal-100',
    'OVNI': 'bg-green-600 text-green-100',
    'Phénomène Surnaturel': 'bg-rose-600 text-rose-100',
  };
  const color = colors[category] || 'bg-slate-500 text-slate-100';
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>{category}</span>;
};

const getYouTubeEmbedUrl = (url: string): string | null => {
  if (!url) return null;
  let videoId = '';
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname.includes('youtube.com')) {
      videoId = urlObj.searchParams.get('v') || '';
    }
  } catch (e) {
    console.error("Invalid video URL:", url, e);
    return null;
  }

  if (videoId) {
    // Loop requires playlist param. Mute is often needed for autoplay.
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`;
  }
  
  return null;
};


const DetailView: React.FC<DetailViewProps> = ({ fact, onBack, isFavorite, onToggleFavorite, onTtsStateChange, t }) => {
  const [ttsState, setTtsState] = useState<TtsState>('idle');
  const [errorTts, setErrorTts] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  useEffect(() => {
    return () => { // Cleanup on unmount
      onTtsStateChange(false);
      audioSourceRef.current?.stop();
      audioContextRef.current?.close();
    };
  }, [onTtsStateChange]);

  const handlePlayPause = async () => {
    setErrorTts(null);

    if (ttsState === 'playing') {
      audioSourceRef.current?.stop();
      setTtsState('paused');
      onTtsStateChange(false);
      return;
    }

    if (ttsState === 'paused' && audioBufferRef.current) {
        playAudio(audioBufferRef.current);
        return;
    }

    if (ttsState === 'idle' || ttsState === 'error') {
      try {
        setTtsState('loading');
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const textToSpeak = `${fact.title}. ${fact.details}`;
        const base64Audio = await generateSpeech(textToSpeak);
        const audioData = decode(base64Audio);
        const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
        audioBufferRef.current = buffer;
        playAudio(buffer);
      } catch (error) {
        console.error("TTS failed:", error);
        setTtsState('error');
        onTtsStateChange(false);
        setErrorTts(t('ttsError'));
      }
    }
  };

  const playAudio = (buffer: AudioBuffer) => {
    if (!audioContextRef.current) return;
    audioSourceRef.current?.disconnect();
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
        setTtsState('idle');
        onTtsStateChange(false);
    };
    source.start(0);
    audioSourceRef.current = source;
    setTtsState('playing');
    onTtsStateChange(true);
  };

  const embedUrl = getYouTubeEmbedUrl(fact.videoUrl);

  const renderTtsButtonIcon = () => {
    if (ttsState === 'loading') {
        return <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>;
    }
    if (ttsState === 'playing') {
        return <PauseIcon className="w-6 h-6" />;
    }
    return <SpeakerWaveIcon className="w-6 h-6" />;
  };

  const ttsAriaLabel = () => {
    if (ttsState === 'playing') return t('pauseSpeechAriaLabel');
    if (ttsState === 'paused') return t('resumeSpeechAriaLabel');
    return t('readAloudAriaLabel');
  }

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 animate-slide-in">
      <div className="relative w-full h-1/2 flex-shrink-0 bg-black">
        {embedUrl ? (
          <iframe
            key={fact.id}
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full border-0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            title={fact.title}
            sandbox="allow-scripts allow-same-origin"
          ></iframe>
        ) : (
          <img src={fact.imageUrl} alt={fact.title} className="w-full h-full object-cover" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/60 to-transparent">
          <button onClick={onBack} className="bg-black/40 text-white rounded-full p-2 hover:bg-black/60 transition-colors" aria-label={t('backAriaLabel')}>
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button onClick={() => onToggleFavorite(fact)} className="bg-black/40 text-yellow-400 rounded-full p-2 hover:bg-black/60 transition-colors" aria-label={isFavorite ? t('unfavoriteAriaLabel') : t('favoriteAriaLabel')}>
            {isFavorite ? <StarSolidIcon className="w-6 h-6" /> : <StarIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <div className="flex-grow p-6 overflow-y-auto">
        <div className="mb-4">
          <CategoryBadge category={fact.category} />
        </div>
        <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl font-bold text-white mb-4">{fact.title}</h1>
            <button
                onClick={handlePlayPause}
                disabled={ttsState === 'loading'}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-wait transition-colors"
                aria-label={ttsAriaLabel()}
            >
                {renderTtsButtonIcon()}
            </button>
        </div>
        {errorTts && <p className="text-red-400 text-sm mb-4">{errorTts}</p>}
        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{fact.details}</p>
      </div>
      <style>{`
        @keyframes slide-in {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
        }
        .animate-slide-in {
            animation: slide-in 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
      `}</style>
    </div>
  );
};

export default DetailView;
