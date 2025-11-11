import React, { useState } from 'react';
import { TranslationKey } from '../utils/i18n';
import SparkleIcon from '../components/icons/SparkleIcon';
import StarSolidIcon from '../components/icons/StarSolidIcon';
import SwipeLeftIcon from '../components/icons/SwipeLeftIcon';
import SwipeRightIcon from '../components/icons/SwipeRightIcon';
import TapIcon from '../components/icons/TapIcon';
import BookmarkIcon from '../components/icons/BookmarkIcon';
import SoundOnIcon from '../components/icons/SoundOnIcon';


interface OnboardingViewProps {
  onComplete: () => void;
  t: (key: TranslationKey, ...args: any[]) => string;
}

const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, t }) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      icon: <SparkleIcon className="w-16 h-16 text-purple-400" />,
      title: t('onboardingTitle1'),
      text: t('onboardingText1'),
    },
    {
      icon: <div className="flex gap-8"><SwipeLeftIcon className="w-16 h-16 text-red-500" /><SwipeRightIcon className="w-16 h-16 text-green-500" /></div>,
      title: t('onboardingTitle2'),
      text: t('onboardingText2'),
    },
    {
      icon: <TapIcon className="w-16 h-16 text-sky-400" />,
      title: t('onboardingTitle3'),
      text: t('onboardingText3'),
    },
    {
      icon: <StarSolidIcon className="w-16 h-16 text-yellow-400" />,
      title: t('onboardingTitle4'),
      text: t('onboardingText4'),
    },
    {
      icon: (
        <div className="flex items-center justify-center gap-4 text-slate-300 h-16">
            <div className="w-10 h-10 flex items-center justify-center font-bold text-slate-300 border-2 border-slate-500 rounded-full">
                <span className="text-sm">EN/FR</span>
            </div>
            <BookmarkIcon className="w-10 h-10 text-slate-300" />
            <SoundOnIcon className="w-10 h-10 text-slate-300" />
        </div>
      ),
      title: t('onboardingTitle5'),
      text: t('onboardingText5'),
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setStep(prev => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full p-8 text-center flex flex-col items-center border border-slate-700">
        <div className="mb-6 h-16 flex items-center justify-center">{currentStep.icon}</div>
        <h2 className="text-2xl font-bold text-white mb-2">{currentStep.title}</h2>
        <p className="text-slate-300 mb-8 min-h-[40px]">{currentStep.text}</p>
        
        <div className="flex gap-2 mb-6">
            {steps.map((_, index) => (
                <div key={index} className={`w-2 h-2 rounded-full transition-colors ${index === step ? 'bg-purple-500' : 'bg-slate-600'}`}></div>
            ))}
        </div>

        <button 
          onClick={handleNext}
          className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg shadow-lg shadow-purple-500/30 transform transition-all hover:scale-105 hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
        >
          {isLastStep ? t('onboardingFinish') : t('onboardingNext')}
        </button>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out;
        }
       `}</style>
    </div>
  );
};

export default OnboardingView;
