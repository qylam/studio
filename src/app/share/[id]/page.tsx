'use client';

import React from 'react';
import { Download, Instagram, Twitter, Facebook, Zap, Loader2, Film } from 'lucide-react';
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

  const handleDownload = async () => {
    if (!vision?.imageData) return;

    try {
      // Convert base64 data to a Blob for a more reliable download
      const parts = vision.imageData.split(',');
      const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(parts[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const url = URL.createObjectURL(blob);

      // Create a temporary link and trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-free-time-vision-${docId.slice(0, 5)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the object URL to free memory
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  
  const [isVideoDownloading, setIsVideoDownloading] = React.useState(false);

  const handleVideoDownload = async () => {
    if (!vision?.videoUrl || isVideoDownloading) return;
    
    try {
      setIsVideoDownloading(true);
      
      const response = await fetch(vision.videoUrl);
      if (!response.ok) throw new Error('Network response was not ok');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `my-free-time-video-${docId.slice(0, 5)}.mp4`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading video (CORS block or network issue):', error);
      window.open(vision.videoUrl, '_blank');
    } finally {
      setIsVideoDownloading(false);
    }
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

        
        {vision.videoUrl && (
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-[#9B72CB]/20 rounded-lg blur-lg"></div>
            <div className="relative rounded-xl shadow-2xl overflow-hidden bg-black border border-white/10 aspect-video">
              <video src={vision.videoUrl} autoPlay loop playsInline className="w-full h-full object-cover" />
            </div>
            <div className="mt-4 relative z-10">
              <Button 
                onClick={handleVideoDownload}
                disabled={isVideoDownloading}
                className="w-full bg-[#9B72CB] hover:bg-[#9B72CB]/90 text-white py-6 text-xl h-auto rounded-2xl flex items-center justify-center shadow-lg transition-all"
              >
                {isVideoDownloading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Saving Video...
                  </>
                ) : (
                  <>
                    <Film className="mr-3 h-6 w-6" />
                    Download Video
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

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
