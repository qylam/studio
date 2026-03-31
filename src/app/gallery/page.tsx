"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Info, Loader2 } from "lucide-react";
import { useVisions, type Vision } from "@/hooks/vision-flow/use-visions";
import { getVisionDownloadUrl } from "@/lib/vision-service";
import { QRCodeSVG } from 'qrcode.react';

/**
 * Helper to shuffle an array.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GalleryPage() {
  const { visions, loading } = useVisions();
  
  const [displayVisions, setDisplayVisions] = useState<Vision[]>([]);
  const [rawUrls, setRawUrls] = useState<Record<string, string>>({});
  const [origin, setOrigin] = useState("");

  const prevVisionsLengthRef = useRef(0);

  useEffect(() => {
    setOrigin(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
  }, []);

  const availableImages = useMemo(() => {
    return visions.filter(v => 
      !v.isHidden && 
      v.mediaType === 'image' && 
      v.mediaUrl
    );
  }, [visions]);

  useEffect(() => {
    if (loading || availableImages.length === 0) return;

    if (
      displayVisions.length === 0 || 
      (availableImages.length > prevVisionsLengthRef.current && prevVisionsLengthRef.current > 0)
    ) {
      const randomizedPool = shuffleArray(availableImages);
      const initialSet = [...randomizedPool.slice(0, 6)];
      
      while (initialSet.length < 6 && randomizedPool.length > 0) {
        initialSet.push(randomizedPool[initialSet.length % randomizedPool.length]);
      }
      
      setDisplayVisions(initialSet.slice(0, 6));
      prevVisionsLengthRef.current = availableImages.length;
    }
  }, [availableImages, loading, displayVisions.length]);

  useEffect(() => {
    if (availableImages.length <= 6) return; 

    const interval = setInterval(() => {
      setDisplayVisions(prev => {
        if (prev.length < 6) return prev; // Prevent sparse arrays during initialization

        const currentlyVisibleIds = new Set(prev.map(v => v?.id));
        const pool = availableImages.filter(v => !currentlyVisibleIds.has(v.id));
        
        if (pool.length === 0) return prev;

        const nextVision = pool[Math.floor(Math.random() * pool.length)];
        const slotToReplace = Math.floor(Math.random() * 6);
        
        const nextSet = [...prev];
        nextSet[slotToReplace] = nextVision;
        return nextSet;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [availableImages]);

  // Function to instantly swap out a vision that fails the strict "Raw Only" check
  const replaceFailedVision = (failedId: string) => {
    setDisplayVisions(prev => {
      const currentlyVisibleIds = new Set(prev.map(v => v?.id));
      // Make sure we don't accidentally pick the same broken one again
      currentlyVisibleIds.add(failedId); 
      
      const pool = availableImages.filter(v => !currentlyVisibleIds.has(v.id));
      if (pool.length === 0) return prev; // Cannot replace if pool is empty

      const nextVision = pool[Math.floor(Math.random() * pool.length)];
      return prev.map(v => (v?.id === failedId ? nextVision : v));
    });
  };

  // Fetch raw URLs for currently displayed visions (Strict Raw Only)
  useEffect(() => {
    displayVisions.forEach(async (v) => {
      if (!v) return;
      if (v.fullPath && !rawUrls[v.id]) {
        try {
          const rawPath = v.fullPath.replace('.jpg', '_raw.jpg');
          const rawUrl = await getVisionDownloadUrl(rawPath);
          setRawUrls(prev => ({ ...prev, [v.id]: rawUrl }));
        } catch (e) {
          // STRICT RULE: If the raw image doesn't exist, we reject this vision completely
          // and ask the gallery to swap it for a new random one. No bordered fallbacks!
          console.warn(`Raw image fetch failed for ${v.id}. Swapping...`);
          replaceFailedVision(v.id);
        }
      }
    });
  }, [displayVisions, rawUrls, availableImages]);

  if (loading && displayVisions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Initializing Gallery...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-white p-4 md:p-6 flex flex-col overflow-hidden">
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-rows-6 sm:grid-rows-3 lg:grid-rows-2 gap-4 md:gap-6 w-full min-h-0 pb-2">
        {displayVisions.map((v, index) => {
          if (!v) return null; // Protective check for sparse array

          const downloadUrl = v.fullPath ? `${origin}/download/${v.fullPath}` : `${origin}/share/${v.id}`;
          const displayImage = rawUrls[v.id]; // STRICT: Only use the raw URL

          return (
            <div 
              key={`${v.id}-${index}`}
              className="relative w-full h-full overflow-hidden rounded-2xl md:rounded-3xl bg-neutral-900 border border-white/10 transition-all duration-1000 group"
            >
              {displayImage ? (
                <img 
                  src={displayImage} 
                  alt={v.title || "Generated Vision"} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-neutral-900 animate-pulse">
                  <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
                </div>
              )}
              
              {displayImage && (
                <div className="absolute bottom-0 left-0 z-10 pointer-events-auto">
                  <div className="bg-white p-2 md:p-3 rounded-tr-2xl shadow-2xl flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95 flex-shrink-0">
                    <QRCodeSVG value={downloadUrl} size={90} className="md:w-[110px] md:h-[110px] hidden md:block" />
                    <QRCodeSVG value={downloadUrl} size={60} className="md:hidden block" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}