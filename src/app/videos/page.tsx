
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useVisions, type Vision } from '@/hooks/vision-flow/use-visions';
import { VisionCard } from '@/components/vision-flow/vision-card';
import { VisionPopup } from '@/components/vision-flow/vision-popup';
import { Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from "@/components/ui/button";

export default function NeuralStreamPage() {
  const { visions, loading } = useVisions();
  const [displayVisions, setDisplayVisions] = useState<Vision[]>([]);

  useEffect(() => {
    if (loading || visions.length === 0) return;
    const visibleVideos = visions.filter(v => !v.isHidden && v.mediaType === 'video' && v.mediaUrl).sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
    
    if (visibleVideos.length === 0) return;

    if (displayVisions.length === 0) {
      const initialSet = [...visibleVideos.slice(0, 4)];
      while (initialSet.length < 4 && visibleVideos.length > 0) {
        initialSet.push(visibleVideos[initialSet.length % visibleVideos.length]);
      }
      setDisplayVisions(initialSet.slice(0, 4));
    }
  }, [visions, loading, displayVisions.length]);

  const handleVideoEnded = useCallback((index: number) => {
    setDisplayVisions(prev => {
      const visibleVideos = visions.filter(v => !v.isHidden && v.mediaType === 'video' && v.mediaUrl);
      if (visibleVideos.length <= 4) return prev;
      const currentlyVisibleIds = new Set(prev.map(v => v.id));
      const pool = visibleVideos.filter(v => !currentlyVisibleIds.has(v.id));
      const nextVision = pool[Math.floor(Math.random() * pool.length)];
      if (nextVision) {
        const nextSet = [...prev];
        nextSet[index] = nextVision;
        return nextSet;
      }
      return prev;
    });
  }, [visions]);

  if (loading && displayVisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Initializing Stream...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-black p-4 md:p-8 overflow-hidden select-none">
      <VisionPopup visions={visions} loading={loading} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-[1800px] z-10 transition-all duration-1000">
        {displayVisions.map((vision, index) => (
          <div key={`${vision.id}-${index}`} className="relative group overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/5 shadow-2xl transition-all duration-700 hover:scale-[1.01] hover:border-primary/30">
            <VisionCard mediaUrl={vision.mediaUrl} mediaType={vision.mediaType} className="w-full aspect-video" onEnded={() => handleVideoEnded(index)} muted={index !== 0} />
          </div>
        ))}
      </div>
      <div className="fixed top-8 right-10 z-[100] group">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-black/60 backdrop-blur-3xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
            <Settings className="w-6 h-6 text-white/80" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
