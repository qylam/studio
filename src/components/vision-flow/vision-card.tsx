
"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface VisionCardProps {
  mediaUrl: string;
  mediaType?: string;
  className?: string;
  style?: React.CSSProperties;
  onEnded?: () => void;
  loop?: boolean;
  muted?: boolean;
}

export function VisionCard({ 
  mediaUrl, 
  mediaType = 'video', 
  className, 
  style,
  onEnded,
  loop = false,
  muted = true,
}: VisionCardProps) {
  const [layers, setLayers] = useState<{ layerA: string; layerB: string }>({
    layerA: mediaUrl,
    layerB: '',
  });
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const lastIntendedUrl = useRef(mediaUrl);

  useEffect(() => {
    const currentActiveUrl = activeLayer === 'A' ? layers.layerA : layers.layerB;
    if (mediaUrl !== currentActiveUrl && mediaUrl !== lastIntendedUrl.current) {
      lastIntendedUrl.current = mediaUrl;
      if (activeLayer === 'A') {
        setLayers(prev => ({ ...prev, layerB: mediaUrl }));
      } else {
        setLayers(prev => ({ ...prev, layerA: mediaUrl }));
      }
    }
  }, [mediaUrl, activeLayer, layers]);

  const handlePlaying = useCallback((layer: 'A' | 'B') => {
    if (layer !== activeLayer) {
      setActiveLayer(layer);
    }
  }, [activeLayer]);

  const triggerSkip = useCallback(() => {
    if (onEnded && !loop) onEnded();
  }, [onEnded, loop]);

  if (mediaType === 'image') {
    return (
      <div className={cn("relative w-full h-full overflow-hidden bg-black", className)} style={style}>
        <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full overflow-hidden bg-black", className)} style={style}>
      {layers.layerA && (
        <video 
          key={`layer-a-${layers.layerA}`}
          src={layers.layerA} 
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-700", activeLayer === 'A' ? "opacity-100 z-10" : "opacity-0 z-0")}
          muted={muted} playsInline autoPlay loop={loop} preload="auto"
          onPlaying={() => handlePlaying('A')} onEnded={() => activeLayer === 'A' && triggerSkip()}
          onError={triggerSkip} onStalled={triggerSkip}
        />
      )}
      {layers.layerB && (
        <video 
          key={`layer-b-${layers.layerB}`}
          src={layers.layerB} 
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-700", activeLayer === 'B' ? "opacity-100 z-10" : "opacity-0 z-0")}
          muted={muted} playsInline autoPlay loop={loop} preload="auto"
          onPlaying={() => handlePlaying('B')} onEnded={() => activeLayer === 'B' && triggerSkip()}
          onError={triggerSkip} onStalled={triggerSkip}
        />
      )}
    </div>
  );
}
