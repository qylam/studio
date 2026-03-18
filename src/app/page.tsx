
"use client";

import Link from 'next/link';
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [showConsent, setShowConsent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();

  const handleProceed = () => {
    setIsNavigating(true);
    router.push('/kiosk');
  };

  const polaroids = [
    { seed: '10', rotate: '-6deg', delay: '0ms' },
    { seed: '21', rotate: '8deg', delay: '100ms' },
    { seed: '32', rotate: '-4deg', delay: '200ms' },
    { seed: '43', rotate: '12deg', delay: '300ms' },
    { seed: '54', rotate: '-8deg', delay: '400ms' },
    { seed: '65', rotate: '5deg', delay: '500ms' },
    { seed: '76', rotate: '-10deg', delay: '600ms' },
    { seed: '87', rotate: '15deg', delay: '700ms' },
    { seed: '98', rotate: '-3deg', delay: '800ms' },
  ];

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden flex flex-col md:flex-row relative">
      
      {/* Language Dropdown */}
      <div className="absolute top-8 left-8 z-50">
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value as any)}
          className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm rounded-full focus:ring-[#4285F4] focus:border-[#4285F4] block w-full py-2.5 pl-6 pr-10 outline-none appearance-none cursor-pointer hover:bg-white/20 transition-all font-medium"
        >
          <option value="en" className="text-black">English</option>
          <option value="ko" className="text-black">한국어</option>
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>

      {/* Left Content Column */}
      <div className="w-full md:w-2/5 p-8 md:p-24 flex flex-col justify-center relative z-20">
        <header className="mb-12 flex items-center gap-2">
          <div className="flex items-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 mr-1" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="url(#gemini-grad)" />
              <defs>
                <linearGradient id="gemini-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4285F4" />
                  <stop offset="0.5" stopColor="#9B72CB" />
                  <stop offset="1" stopColor="#D96570" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-xl font-medium tracking-tight text-white">{t('home_title_sub')}</span>
          </div>
        </header>

        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
          <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter text-white">
            {t('home_title_main')}
          </h1>
          
          <p className="text-2xl md:text-3xl font-normal text-white max-w-lg leading-tight">
            {t('home_description')}
          </p>

          <div className="pt-4">
            <Button 
              onClick={() => setShowConsent(true)}
              className="btn-google-blue h-auto"
            >
              {t('home_start_button')}
            </Button>
          </div>

          <div className="pt-8">
            <Link href="/details" className="inline-flex items-center text-sm md:text-base font-medium group text-white/90 hover:text-white transition-colors">
              <ArrowRight className="mr-3 w-5 h-5 text-[#4285F4] group-hover:translate-x-1 transition-transform" />
              {t('home_link_details')}
            </Link>
          </div>
        </div>
      </div>

      {/* Right Image Grid Column */}
      <div className="w-full md:w-3/5 relative min-h-[500px] md:min-h-screen bg-black overflow-hidden pointer-events-none">
        <div className="absolute inset-0 grid grid-cols-3 gap-8 p-12 transform rotate-12 scale-110 -translate-y-12 translate-x-12 opacity-90">
          {polaroids.map((p, idx) => (
            <div 
              key={idx} 
              className="polaroid animate-in fade-in zoom-in duration-1000"
              style={{ 
                transform: `rotate(${p.rotate})`,
                animationDelay: p.delay
              }}
            >
              <img 
                src={`https://picsum.photos/seed/${p.seed}/600/600`} 
                alt="Transformation vision"
                className="w-full"
                data-ai-hint="lifestyle photo"
              />
            </div>
          ))}
          {polaroids.map((p, idx) => (
            <div 
              key={`dup-${idx}`} 
              className="polaroid opacity-50"
              style={{ 
                transform: `rotate(${p.rotate})`,
              }}
            >
              <img 
                src={`https://picsum.photos/seed/${p.seed}0/600/600`} 
                alt="Transformation vision"
                className="w-full"
                data-ai-hint="lifestyle photo"
              />
            </div>
          ))}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent z-10 hidden md:block" />
      </div>

      {/* Consent Dialog */}
      <AlertDialog open={showConsent} onOpenChange={setShowConsent}>
        <AlertDialogContent className="max-w-4xl bg-[#F8F9FA] border-none rounded-[2rem] p-12 text-black shadow-2xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-6xl font-bold tracking-tight text-zinc-900">
                  {t('home_consent_title')}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-lg leading-relaxed text-zinc-600 font-medium whitespace-pre-wrap">
                  {t('home_consent_desc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            
            <div className="flex flex-col gap-4 min-w-[280px]">
              <Button 
                onClick={handleProceed}
                disabled={isNavigating}
                className="w-full py-8 text-xl font-bold rounded-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3"
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    {t('home_consent_loading')}
                  </>
                ) : (
                  t('home_consent_accept')
                )}
              </Button>
              <Button 
                variant="outline"
                disabled={isNavigating}
                onClick={() => setShowConsent(false)}
                className="w-full py-8 text-xl font-bold rounded-full border-2 border-[#4285F4] text-[#4285F4] hover:bg-zinc-100 bg-white"
              >
                {t('home_consent_decline')}
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
