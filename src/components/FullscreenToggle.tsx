'use client';

import { useState, useEffect } from 'react';


export function FullscreenToggle() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Listen for changes (e.g., user pressing ESC to exit fullscreen)
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    // Check initial state
    setIsFullscreen(!!document.fullscreenElement);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="absolute top-0 right-0 w-16 h-16 bg-transparent opacity-0 cursor-default focus:outline-none z-[100]"
      aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    />
  );
}
