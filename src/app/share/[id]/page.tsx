'use client';

import React from 'react';
import { Download, Share2, Instagram, Twitter, Facebook, ExternalLink, Zap, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    link.download = `my-free-time-vision.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <Button variant="outline" onClick={() => window.location.href = '/'}>Back to Home</Button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#16181B] text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8 py-8 animate-in fade-in slide-in-from-bottom duration-700">
        <header className="text-center space-y-2">
          <Zap className="w-10 h-10 text-[#4290FF] mx-auto" />
          <h1 className="text-3xl font-black italic tracking-tighter uppercase leading-none font-headline">
            Free-Time <span className="text-[#4290FF]">Vision</span>
          </h1>
        </header>

        {/* Polaroid Vision - Displayed directly as stored */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-[#4290FF]/20 rounded-lg blur-lg"></div>
          <div className="relative bg-white p-2 rounded-sm shadow-2xl">
            <img src={vision.imageData} alt="Your AI Vision" className="w-full h-auto" />
          </div>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={handleDownload}
            className="w-full bg-[#4290FF] hover:bg-[#4290FF]/90 text-white py-8 text-xl h-auto rounded-2xl flex items-center justify-center shadow-lg"
          >
            <Download className="mr-3 h-6 w-6" />
            Download Polaroid
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

        <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/5 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            This vision was created using Gemini 2.5 Flash, reimagining your free time based on your unique pose.
          </p>
        </div>

        <footer className="pt-8 text-center text-[10px] text-white/20 uppercase font-black tracking-widest">
          © 2024 FREE-TIME MACHINE PROJECT
        </footer>
      </div>
    </main>
  );
}
