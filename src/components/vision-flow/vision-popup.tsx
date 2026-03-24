
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { type Vision } from '@/hooks/vision-flow/use-visions';

interface VisionPopupProps {
  visions: Vision[];
  loading: boolean;
}

export function VisionPopup({ visions, loading }: VisionPopupProps) {
  const [activeVision, setActiveVision] = useState<Vision | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const seenIds = useRef<Set<string>>(new Set());
  const hasInitialized = useRef(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setActiveVision(null);
      setIsExiting(false);
    }, 700);
  };

  useEffect(() => {
    if (loading || !visions || visions.length === 0) return;
    const currentImages = visions.filter(v => !v.isHidden && (v.mediaType === 'image' || v.imageData));
    if (!hasInitialized.current) {
      currentImages.forEach(v => seenIds.current.add(v.id));
      hasInitialized.current = true;
      return;
    }
    if (activeVision || isExiting) return;
    const newVision = currentImages.find(v => !seenIds.current.has(v.id));
    if (newVision) {
      seenIds.current.add(newVision.id);
      setActiveVision(newVision);
      setIsExiting(false);
    }
  }, [visions, loading, activeVision, isExiting]);
  
  useEffect(() => {
    if (activeVision && !isExiting) {
      const timer = setTimeout(() => handleClose(), 5500);
      return () => clearTimeout(timer);
    }
  }, [activeVision, isExiting]);

  if (!activeVision) return null;

  const imageSrc = activeVision.mediaUrl || (activeVision.imageData ? (activeVision.imageData.startsWith('data:') ? activeVision.imageData : `data:image/png;base64,${activeVision.imageData}`) : '');
  if (!imageSrc) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 pointer-events-none">
      <div className={cn("absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-500", isExiting && "animate-out fade-out duration-500")} />
      <div className={cn("relative aspect-square w-full max-w-[600px] bg-black rounded-[3rem] overflow-hidden border-2 border-primary/30 shadow-2xl animate-in zoom-in slide-in-from-bottom-10 duration-700", isExiting && "animate-out zoom-out slide-out-to-bottom-10 fade-out duration-700", "pointer-events-auto")}>
        <img src={imageSrc} alt="" className="w-full h-full object-cover animate-float" />
        <div className="absolute inset-0 p-6 flex justify-end items-start">
          <button onClick={handleClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"><X className="w-5 h-5" /></button>
        </div>
      </div>
    </div>
  );
}
