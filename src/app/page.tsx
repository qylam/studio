
"use client";

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const [showConsent, setShowConsent] = useState(false);
  const router = useRouter();

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
    <main className="min-h-screen bg-black text-white overflow-hidden flex flex-col md:flex-row">
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
            <span className="text-xl font-medium tracking-tight">Gemini for Education</span>
          </div>
        </header>

        <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">
          <h1 className="text-6xl md:text-8xl font-bold leading-[0.9] tracking-tighter">
            The free-time machine
          </h1>
          
          <p className="text-2xl md:text-3xl font-normal text-white max-w-lg leading-tight">
            Picture yourself with up to 10 hours back per week, thanks to Gemini.
          </p>

          <div className="pt-4">
            <Button 
              onClick={() => setShowConsent(true)}
              className="btn-google-blue h-auto"
            >
              Start
            </Button>
          </div>

          <div className="pt-8">
            <Link href="#" className="inline-flex items-center text-sm md:text-base font-medium group text-white/90 hover:text-white transition-colors">
              <ArrowRight className="mr-3 w-5 h-5 text-[#4285F4] group-hover:translate-x-1 transition-transform" />
              See how Gemini for Education is helping teachers save up to 10 hours per week
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
                  Before you begin
                </AlertDialogTitle>
                <AlertDialogDescription className="text-lg leading-relaxed text-zinc-600 font-medium">
                  The Gemini Free-Time Machine is an experiment using Nano Banana Pro, Google's latest generative image model.
                  <br /><br />
                  Take a photo and we'll create a picture using your selected effect. By submitting your photo, you confirm that you are 18 or older and consent to Google processing your image to generate your picture. To download it, simply scan the QR code provided at the end and check back to see when it's ready.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            
            <div className="flex flex-col gap-4 min-w-[280px]">
              <Button 
                onClick={() => router.push('/kiosk')}
                className="w-full py-8 text-xl font-bold rounded-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white shadow-lg shadow-blue-500/20"
              >
                Accept and proceed
              </Button>
              <Button 
                variant="outline"
                onClick={() => setShowConsent(false)}
                className="w-full py-8 text-xl font-bold rounded-full border-2 border-[#4285F4] text-[#4285F4] hover:bg-blue-50 bg-white"
              >
                Do not accept
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
