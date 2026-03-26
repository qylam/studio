
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { useVisions, type Vision } from '@/hooks/vision-flow/use-visions';
import { VisionCard } from '@/components/vision-flow/vision-card';
import { VisionPopup } from '@/components/vision-flow/vision-popup';
import { Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

/**
 * Fisher-Yates shuffle algorithm to randomize an array.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function NeuralStreamPage() {
  const { visions, loading } = useVisions();
  const [displayVisions, setDisplayVisions] = useState<Vision[]>([]);

  useEffect(() => {
    if (loading || visions.length === 0) return;
    
    // Filter for visible videos with a valid URL
    const visibleVideos = visions.filter(v => 
      !v.isHidden && 
      v.mediaType === 'video' && 
      v.mediaUrl
    );
    
    if (visibleVideos.length === 0) return;

    // Only set initial display visions once or when list becomes significantly larger
    if (displayVisions.length === 0) {
      // Shuffle the available videos to ensure a randomized starting experience
      const randomizedPool = shuffleArray(visibleVideos);
      const initialSet = [...randomizedPool.slice(0, 4)];
      
      // If we have fewer than 4 unique videos, cycle through what we have to fill the slots
      while (initialSet.length < 4 && randomizedPool.length > 0) {
        initialSet.push(randomizedPool[initialSet.length % randomizedPool.length]);
      }
      
      setDisplayVisions(initialSet.slice(0, 4));
    }
  }, [visions, loading, displayVisions.length]);

  /**
   * When a video in a specific slot ends, pick a random video from the pool 
   * that isn't currently displayed in THAT slot.
   */
  const handleVideoEnded = useCallback((index: number) => {
    setDisplayVisions(prev => {
      const visibleVideos = visions.filter(v => !v.isHidden && v.mediaType === 'video' && v.mediaUrl);
      if (visibleVideos.length === 0) return prev;
      
      const currentInSlot = prev[index];
      const currentlyVisibleIds = new Set(prev.map(v => v.id));
      
      // Priority 1: Pick a video not visible in any slot
      let pool = visibleVideos.filter(v => !currentlyVisibleIds.has(v.id));
      
      // Priority 2: If everyone is already visible, just pick something other than what was just playing in this slot
      if (pool.length === 0) {
        pool = visibleVideos.filter(v => v.id !== currentInSlot?.id);
      }
      
      // Priority 3: Last resort (only 1 video exists), pick the same one to restart it
      if (pool.length === 0) {
        pool = visibleVideos;
      }
      
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
          <div 
            key={`${vision.id}-${index}`} 
            className="relative group overflow-hidden rounded-[2.5rem] bg-neutral-900 border border-white/5 shadow-2xl transition-all duration-700 hover:scale-[1.01] hover:border-primary/30"
          >
            <VisionCard 
              mediaUrl={vision.mediaUrl} 
              mediaType={vision.mediaType} 
              className="w-full aspect-video" 
              onEnded={() => handleVideoEnded(index)} 
              // Mute all except the first one to avoid audio chaos and satisfy browser autoplay policies
              muted={index !== 0} 
            />
            
            {/* Admin Info Overlay (Hidden unless hovered) */}
            <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-50">
              <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium mb-2">Source Path</span>
              <span className="text-[9px] text-white/20 font-mono leading-relaxed break-all max-w-full px-4">
                {vision.mediaUrl ? decodeURIComponent(vision.mediaUrl.split('/o/')[1]?.split('?')[0] || vision.mediaUrl) : 'Unknown Path'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Admin Quick Access */}
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
