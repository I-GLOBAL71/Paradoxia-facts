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
    'UFO': 'bg-sky-500 text-sky-100',
    'Supernatural Phenomenon': 'bg-rose-500 text-rose-100',
    // French
    'Fantôme': 'bg-indigo-500 text-indigo-100',
    'Sorcellerie': 'bg-purple-600 text-purple-100',
    'Créature': 'bg-teal-500 text-teal-100',
    'OVNI': 'bg-sky-500 text-sky-100',
    'Phénomène Surnaturel': 'bg-rose-500 text-rose-100',
  };
  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${colors[category] || 'bg-gray-500 text-gray-100'}`}>
      {category}
    </span>
  );
};

const DetailView: React.FC<DetailViewProps> = ({ fact, onBack, isFavorite, onToggleFavorite, onTtsStateChange, t }) => {
  const [ttsState, setTtsState] = useState<TtsState>('idle');
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const playbackTimeRef = useRef(0); // Time in seconds where playback was paused

  useEffect(() => {
    // Initialize AudioContext on mount
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioContextRef.current = new AudioContext({ sampleRate: 24000 });
    }

    return () => {
      // Cleanup on unmount
      if (audioSourceRef.current) {
        audioSourceRef.current.onended = null;
        audioSourceRef.current.stop();
      }
      audioContextRef.current?.close();
      onTtsStateChange(false);
    };
  }, [onTtsStateChange]);
  
  const playAudio = (bufferToPlay: AudioBuffer, resumeTime = 0) => {
    if (!audioContextRef.current) return;

    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    // Stop any existing source to prevent overlaps
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null; // Important: remove old listener
      audioSourceRef.current.stop();
    }

    const source = audioContextRef.current.createBufferSource();
    source.buffer = bufferToPlay;
    source.connect(audioContextRef.current.destination);
    
    source.onended = () => {
        // This handler now only fires when audio finishes naturally,
        // as it's removed before manual stopping (pausing).
        setTtsState('idle');
        onTtsStateChange(false);
        playbackTimeRef.current = 0;
    };
    
    source.start(0, resumeTime);
    audioSourceRef.current = source;
    // Calculate start time relative to AudioContext time
    playbackTimeRef.current = audioContextRef.current.currentTime - resumeTime;
    setTtsState('playing');
    onTtsStateChange(true);
  };
  
  const pauseAudio = () => {
    if (!audioContextRef.current || !audioSourceRef.current) return;
    
    // Calculate how far into the track we were
    const elapsed = audioContextRef.current.currentTime - playbackTimeRef.current;
    playbackTimeRef.current = elapsed; // Save this for resuming
    
    // Remove the 'onended' handler to prevent it from firing and resetting state to 'idle'
    audioSourceRef.current.onended = null;
    audioSourceRef.current.stop();
    audioSourceRef.current = null;
    
    setTtsState('paused');
    onTtsStateChange(false);
  };

  const handleTtsToggle = async () => {
    if (!audioContextRef.current) {
        console.error("AudioContext not supported or initialized.");
        setTtsState('error');
        return;
    }

    switch (ttsState) {
        case 'playing':
            pauseAudio();
            break;
        case 'paused':
            if (audioBuffer) {
                playAudio(audioBuffer, playbackTimeRef.current);
            }
            break;
        case 'idle':
        case 'error':
            if (audioBuffer) {
                playAudio(audioBuffer, 0);
            } else {
                setTtsState('loading');
                onTtsStateChange(true); // Mute bg music while loading
                try {
                    const base64Audio = await generateSpeech(fact.details);
                    const newBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
                    setAudioBuffer(newBuffer); // Cache the buffer for future plays
                    playAudio(newBuffer, 0); // Play immediately
                } catch (error) {
                    console.error("TTS failed:", error);
                    setTtsState('error');
                    onTtsStateChange(false);
                }
            }
            break;
    }
  };

  const renderTtsButton = () => {
    let icon;
    let ariaLabelKey: TranslationKey = 'readAloudAriaLabel';

    switch (ttsState) {
        case 'playing':
            icon = <PauseIcon className="w-6 h-6" />;
            ariaLabelKey = 'pauseSpeechAriaLabel';
            break;
        case 'paused':
            icon = <SpeakerWaveIcon className="w-6 h-6" />;
            ariaLabelKey = 'resumeSpeechAriaLabel';
            break;
        case 'loading':
            icon = <div className="w-6 h-6 border-2 border-slate-500 border-t-purple-400 rounded-full animate-spin"></div>;
            break;
        case 'error':
             icon = <SpeakerWaveIcon className="w-6 h-6 text-red-500" />;
             break;
        default: // idle
            icon = <SpeakerWaveIcon className="w-6 h-6" />;
    }

    return (
        <button
            onClick={handleTtsToggle}
            className="text-slate-300 hover:text-white transition-colors p-1"
            aria-label={t(ariaLabelKey)}
            title={ttsState === 'error' ? t('ttsError') : ''}
        >
            {icon}
        </button>
    );
  }

  return (
    <div className="w-full h-full bg-slate-900 text-slate-200 overflow-y-auto">
      <div className="relative">
        <video
          className="w-full h-64 object-cover"
          src={fact.videoUrl}
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <button
          onClick={onBack}
          className="absolute top-4 left-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/75 transition-colors"
           aria-label={t('backAriaLabel')}
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl font-bold text-white mb-2 flex-grow">{fact.title}</h1>
            <div className="flex items-center flex-shrink-0 gap-2">
                {renderTtsButton()}
                <button 
                  onClick={() => onToggleFavorite(fact)} 
                  className="text-yellow-400 hover:text-yellow-300 transition-colors p-1"
                  aria-label={isFavorite ? t('unfavoriteAriaLabel') : t('favoriteAriaLabel')}
                >
                    {isFavorite ? <StarSolidIcon className="w-7 h-7" /> : <StarIcon className="w-7 h-7" />}
                </button>
                <CategoryBadge category={fact.category} />
            </div>
        </div>
        <p className="text-slate-400 mt-4 leading-relaxed whitespace-pre-wrap">{fact.details}</p>
      </div>
    </div>
  );
};

export default DetailView;