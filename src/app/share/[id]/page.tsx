
'use client';

import React from 'react';
import { Download, Share2, Instagram, Twitter, Facebook, ExternalLink, Zap, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useDoc, useFirestore } from '@/firebase';
import { useParams } from 'next/navigation';

export default function SharePortal() {
  const { id } = useParams();
  const db = useFirestore();
  const { data: vision, loading, error } = useDoc(db ? `visions/${id}` : null);

  const handleDownload = () => {
    if (!vision?.imageData) return;
    const link = document.createElement('a');
    link.href = vision.imageData;
    link.download = `free-time-vision-${id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getCleanText = (text: string) => {
    if (!text) return '';
    return text.replace(/^Variation \d+ (Scene|Activity): /i, '').trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#16181B] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#4290FF] animate-spin" />
      </div>
    );
  }

  if (error || !vision) {
    return (
      <div className="min-h-screen bg-[#16181B] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">Vision not found</h1>
        <p className="text-white/60">We couldn't find the vision you're looking for. It may have expired or the link is incorrect.</p>
        <Button variant="outline" onClick={() => window.location.href = '/'}>Back to Home</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#16181B] text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8 py-8 animate-in fade-in slide-in-from-bottom duration-700">
        
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 mb-2 bg-[#4290FF]/10 rounded-lg">
            <Zap className="w-6 h-6 text-[#4290FF]" />
          </div>
          <h1 className="text-3xl font-black font-headline italic tracking-tighter uppercase leading-none">
            Your Free-Time <span className="text-[#4290FF]">Vision</span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Created at the Kiosk</p>
        </header>

        {/* Polaroid Vision */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-[#4290FF] to-[#ABDFE6] rounded-[1rem] blur opacity-10"></div>
          <div className="bg-white p-4 pb-12 rounded-sm shadow-2xl transform rotate-1 w-full">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-[#4290FF]">Google</span>
                <span className="text-xs text-black/60 font-medium">for Education</span>
              </div>
            </div>
            
            <div className="aspect-square bg-zinc-100 overflow-hidden relative">
              <img src={vision.imageData} alt="AI Vision" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2 bg-white/10 backdrop-blur-md p-1.5 rounded-full border border-white/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            </div>
            
            <div className="mt-8 text-center px-2">
              <p className="text-2xl font-medium text-zinc-800 tracking-tight italic" style={{ fontFamily: 'var(--font-handwriting, cursive)' }}>
                {(() => {
                  const cleanActivity = getCleanText(vision.activity);
                  return cleanActivity.charAt(0).toUpperCase() + cleanActivity.slice(1);
                })()}, thanks to Gemini
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <Button 
            onClick={handleDownload}
            className="w-full bg-[#4290FF] hover:bg-[#4290FF]/90 text-white py-8 text-xl h-auto rounded-2xl flex items-center justify-center shadow-lg shadow-[#4290FF]/20"
          >
            <Download className="mr-3 h-6 w-6" />
            Download HD Image
          </Button>
          
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="h-16 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Instagram className="h-6 w-6" />
            </Button>
            <Button variant="outline" className="h-16 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Twitter className="h-6 w-6" />
            </Button>
            <Button variant="outline" className="h-16 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Facebook className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#ABDFE6]">About This Vision</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This image was generated using Google Gemini 2.5 Flash, reimagining how you would spend 10 extra hours per week based on your unique pose and choice of theme.
          </p>
          <div className="pt-2 flex items-center text-[10px] font-mono text-white/30 uppercase tracking-tighter">
            <span className="mr-2">Session ID: {id}</span>
            <span>•</span>
            <span className="ml-2">Gemini 2.5 Flash Image</span>
          </div>
        </div>

        <footer className="pt-8 text-center">
          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">
            © 2024 FREE-TIME MACHINE PROJECT
          </p>
        </footer>
      </div>
    </main>
  );
}
