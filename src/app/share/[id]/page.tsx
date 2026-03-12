'use client';

import React from 'react';
import { Download, Instagram, Twitter, Facebook, Zap, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';

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

  // Helper function to convert base64 to a File object for native sharing
  const dataURLtoFile = (dataurl: string, filename: string) => {
    let arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg',
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
  }

  const handleDownload = async () => {
    if (!vision?.imageData) return;

    try {
      if (navigator.share) {
        const file = dataURLtoFile(vision.imageData, 'my-free-time-vision.jpg');
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'My Free-Time Vision',
            text: 'Check out my AI-generated vision!',
          });
          return;
        }
      }
    } catch (err) {
      console.log('Sharing failed or was cancelled by user', err);
      if ((err as Error).name === 'AbortError') return; 
    }

    const link = document.createElement('a');
    link.href = vision.imageData;
    link.download = `my-free-time-vision.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!docId) return null;

  // Render loader while loading OR if we have no data yet and no error
  if (isLoading || (!vision && !error)) {
    return (
      <div className="min-h-screen bg-[#16181B] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#4290FF] animate-spin" />
          <p className="text-white/40 font-medium animate-pulse">Retrieving your vision...</p>
        </div>
      </div>
    );
  }

  if (error || !vision) {
    return (
      <div className="min-h-screen bg-[#16181B] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <Zap className="w-12 h-12 text-red-500/50" />
        <h1 className="text-3xl font-bold text-white">Vision not found</h1>
        <p className="text-white/60 max-w-xs">We couldn't find the AI vision you're looking for. It may have been deleted or the link might be incorrect.</p>
        <Button variant="outline" className="rounded-full px-8" onClick={() => window.location.href = '/'}>Back to Home</Button>
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

        <div className="relative group">
          <div className="absolute -inset-1 bg-[#4290FF]/20 rounded-lg blur-lg"></div>
          <div className="relative rounded-sm shadow-2xl overflow-hidden bg-white p-2 pb-10">
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
            This vision was created using Gemini, reimagining your free time based on your unique pose.
          </p>
        </div>

        <footer className="pt-8 text-center text-[10px] text-white/20 uppercase font-black tracking-widest">
          © 2024 FREE-TIME MACHINE PROJECT
        </footer>
      </div>
    </main>
  );
}
