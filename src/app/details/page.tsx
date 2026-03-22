
"use client";

import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { TranslationKey } from '@/i18n/dictionaries';
import { useLanguage } from '@/i18n/LanguageProvider';

export default function DetailsPage() {
  const [showConsent, setShowConsent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleProceed = () => {
    setIsNavigating(true);
    router.push('/kiosk');
  };

  const handleDecline = () => {
    setShowConsent(false);
    router.push('/');
  };

  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Left Content */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left duration-700">
        <Link href="/" className="inline-flex items-center text-white/60 hover:text-white transition-colors group mb-8">
          <ArrowLeft className="mr-3 w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">{t('btn_back' as TranslationKey)}</span>
        </Link>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          {t('study_header' as TranslationKey)}
        </h1>

        <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium">
          {t('study_body_1' as TranslationKey)}
        </p>

        <ul className="space-y-6 pt-4">
          <li className="space-y-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#4285F4] rounded-full" />
              {t('study_head_2' as TranslationKey)}
            </h3>
            <p className="text-white/60 pl-4 leading-relaxed">
              {t('study_body_2' as TranslationKey)}
            </p>
          </li>
          <li className="space-y-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#4285F4] rounded-full" />
                {t('study_head_3' as TranslationKey)}
            </h3>
            <p className="text-white/60 pl-4 leading-relaxed">
              {t('study_body_3' as TranslationKey)}
            </p>
          </li>
          <li className="space-y-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#4285F4] rounded-full" />
              {t('study_head_4' as TranslationKey)}
            </h3>
            <p className="text-white/60 pl-4 leading-relaxed">
            {t('study_body_4' as TranslationKey)}
            </p>
          </li>
        </ul>

        <div className="pt-10">
          <Button 
            onClick={() => setShowConsent(true)}
            className="btn-google-blue h-auto px-16"
          >
            {t('btn_continue' as TranslationKey)}
          </Button>
        </div>
      </div>

      {/* Right Image */}
      <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-screen">
        <Image 
          src="/images/saving-time.webp"
          alt="Saving time with Gemini"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent hidden md:block" />
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
