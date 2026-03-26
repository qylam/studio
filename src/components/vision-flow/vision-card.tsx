
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

/**
 * A media container that handles both images and videos.
 * For videos, it implements a cross-fading mechanism between two layers
 * to ensure smooth transitions when the media source changes.
 */
export function VisionCard({ 
  mediaUrl, 
  mediaType = 'video', 
  className, 
  style,
  onEnded,
  loop = false,
  muted = true,
}: VisionCardProps) {
  const videoRefA = useRef<HTMLVideoElement>(null);
  const videoRefB = useRef<HTMLVideoElement>(null);

  const [layers, setLayers] = useState<{ layerA: string; layerB: string }>({
    layerA: mediaUrl,
    layerB: '',
  });
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const lastIntendedUrl = useRef(mediaUrl);

  // Sync URLs and trigger cross-fade when mediaUrl prop changes
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

  // Robust Playback Handler: Ensures videos play even if browser blocks autoplay with sound
  useEffect(() => {
    const playVideo = async (ref: React.RefObject<HTMLVideoElement | null>) => {
      if (ref.current) {
        try {
          // Explicitly set muted state before play attempt
          ref.current.muted = muted;
          await ref.current.play();
        } catch (err) {
          // If play with sound is blocked (NotAllowedError), retry muted
          if (!muted) {
            ref.current.muted = true;
            try {
              await ref.current.play();
            } catch (retryErr) {
              // Final fallback to prevent stalling
              console.error("Video playback failed entirely:", retryErr);
            }
          }
        }
      }
    };

    if (activeLayer === 'A') playVideo(videoRefA);
    else playVideo(videoRefB);
  }, [activeLayer, layers, muted]);

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
          ref={videoRefA}
          key={`layer-a-${layers.layerA}`}
          src={layers.layerA} 
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-1000", activeLayer === 'A' ? "opacity-100 z-10" : "opacity-0 z-0")}
          muted={muted} 
          playsInline 
          autoPlay 
          loop={loop} 
          preload="auto"
          onPlaying={() => handlePlaying('A')} 
          onEnded={() => activeLayer === 'A' && triggerSkip()}
          onError={triggerSkip} 
          onStalled={triggerSkip}
        />
      )}
      {layers.layerB && (
        <video 
          ref={videoRefB}
          key={`layer-b-${layers.layerB}`}
          src={layers.layerB} 
          className={cn("absolute inset-0 w-full h-full object-cover transition-opacity duration-1000", activeLayer === 'B' ? "opacity-100 z-10" : "opacity-0 z-0")}
          muted={muted} 
          playsInline 
          autoPlay 
          loop={loop} 
          preload="auto"
          onPlaying={() => handlePlaying('B')} 
          onEnded={() => activeLayer === 'B' && triggerSkip()}
          onError={triggerSkip} 
          onStalled={triggerSkip}
        />
      )}
    </div>
  );
}
