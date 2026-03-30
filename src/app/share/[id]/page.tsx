
'use client';

import React from 'react';
import Image from 'next/image';
import { Download, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { TranslationKey } from '@/i18n/dictionaries';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function SharePortal() {
  const params = useParams();
  const db = useFirestore();

  const docId = params?.id as string;
  
  // Stabilize the document reference
  const visionRef = useMemoFirebase(() => {
    if (!db || !docId) return null;
    return doc(db, 'visions', docId);
  }, [db, docId]);
  
  const { data: vision, isLoading, error } = useDoc(visionRef);
  const { t } = useLanguage();

  let caption = t('caption_default');
  if (vision && vision.themeId) {
    const themeName = vision.themeId.split('-')[1];
    const captionKey = themeName ? `caption_${themeName}` as TranslationKey : 'caption_default';
    caption = t(captionKey);
    if (caption === captionKey) caption = t('caption_default'); // Fallback
  }

  const handleDownload = async () => {
    if (!vision) return;

    try {
      const imageUrl = vision.imageUrl || vision.imageData;
      if (!imageUrl) return;

      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-free-time-vision-${docId.slice(0, 5)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  if (!docId) return null;

  if (isLoading || (!vision && !error)) {
    return (
      <div className="min-h-screen bg-[#16181B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#4290FF] animate-spin" />
          <p className="text-white/40 font-medium animate-pulse">{t('loading_download_caption')}</p>
        </div>
      </div>
    );
  }

  if (error || !vision) {
    return (
      <div className="min-h-screen bg-[#16181B] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Zap className="w-12 h-12 text-red-500/50" />
        <h1 className="text-3xl font-bold text-white">Vision not found</h1>
        <p className="text-white/60 max-w-xs">We couldn't find the AI vision you're looking for.</p>
        <Button variant="outline" className="rounded-full px-8" onClick={() => window.location.href = '/'}>Back to Home</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#16181B] text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8 py-8 animate-in fade-in slide-in-from-bottom duration-700">
        <header className="text-center space-y-4">
          <Image 
            src="/images/Gemini_PrimaryLogo_FullColor_White.png" 
            alt="Gemini Connect" 
            width={120} 
            height={32} 
            className="h-10 w-auto object-contain mx-auto"
          />
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none font-headline">
            Free-Time <span className="text-[#4290FF]">Machine</span>
          </h1>
        </header>

        <div className="relative group">
          <div className="absolute -inset-1 bg-[#4290FF]/20 rounded-lg blur-lg"></div>
          <div className="relative rounded-sm shadow-2xl overflow-hidden bg-white p-2 pb-10">
            <img src={vision.imageUrl || vision.imageData} alt={caption} className="w-full h-auto" />
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleDownload}
            className="w-full bg-[#4290FF] hover:bg-[#4285F4] text-white py-8 text-xl h-auto rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Download className="mr-3 h-6 w-6" />
            {t('btn_download' as TranslationKey)}
          </Button>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {t('download_caption' as TranslationKey)}
          </p>
        </div>
      </div>
    </main>
  );
}
