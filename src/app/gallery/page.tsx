"use client";

import React, { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { fetchVisionsImages, type VisionImage } from "@/lib/vision-service";
import { ImageDetailModal } from "@/components/image-detail-modal";
import { QRCodeSVG } from 'qrcode.react';

export default function GalleryPage() {
  const [images, setImages] = useState<VisionImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<VisionImage | null>(null);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
    async function loadData() {
      setLoading(true);
      try {
        const fetchedImages = await fetchVisionsImages();
        // We only show up to 6 to maintain the 3x2 grid perfectly
        setImages(fetchedImages.slice(0, 6));
      } catch (error) {
        console.error("Failed to fetch images:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="fixed inset-0 p-4 flex flex-col gap-4 overflow-hidden select-none bg-black">
      {/* Header */}
      <div className="flex justify-between items-center z-10 shrink-0 h-10">
        <div className="flex items-center h-8">
          <img 
            src="/images/Gemini_PrimaryLogo_FullColor_White.png" 
            alt="Logo" 
            className="h-full w-auto object-contain"
            onError={(e) => {
              // Fallback if logo.png isn't uploaded yet
              e.currentTarget.style.display = 'none';
              const parent = e.currentTarget.parentElement;
              if (parent) {
                const span = document.createElement('span');
                span.className = "text-[9px] uppercase tracking-[0.3em] font-medium text-white/50 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full";
                span.innerText = "Visions Stream";
                parent.appendChild(span);
              }
            }}
          />
        </div>
      </div>

      {/* 3x2 Grid - Fitted to screen */}
      <main className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 min-h-0 w-full overflow-hidden">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/5 rounded-[1.225rem] animate-pulse border border-white/5" />
          ))
        ) : images.length > 0 ? (
          images.map((img) => (
            <div 
              key={img.id} 
              className="relative rounded-[1.225rem] overflow-hidden bg-[#0A0C10] border border-white/5 cursor-pointer group"
              onClick={() => setSelectedImage(img)}
            >
              <img
                src={img.base64Data}
                alt={img.title || "Vision"}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* QR Code - Bottom Left */}
              <div className="absolute bottom-0 left-0 pt-3 pr-3 pb-4 pl-4 bg-white rounded-tr-3xl shadow-2xl z-20 hover:scale-105 transition-transform duration-300 origin-bottom-left"> 
                <QRCodeSVG 
                  value={`${origin}/download/${(img.fullPath?.replace(/[-_]?RAW/gi, '') || '').split('/').map(encodeURIComponent).join('/')}`} 
                  size={120}
                  level="M"
                  includeMargin={false}
                />
              </div>

              <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium mb-2">Storage Path</span>
                <span className="text-[9px] text-white/20 font-mono leading-relaxed break-all max-w-full px-4">
                  {img.fullPath}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 row-span-2 flex items-center justify-center border border-dashed border-white/10 rounded-[1.225rem]">
            <p className="text-white/20 text-[10px] uppercase tracking-[0.2em]">No visions found</p>
          </div>
        )}
      </main>

      <ImageDetailModal 
        image={selectedImage} 
        onClose={() => setSelectedImage(null)} 
      />
    </div>
  );
}

// "use client";

// import React, { useState, useEffect, useCallback, useMemo } from "react";
// import { Info, Loader2 } from "lucide-react";
// import { ImageDetailModal } from "@/components/image-detail-modal";
// import { QRCodeSVG } from 'qrcode.react';
// import { useVisions, type Vision } from '@/hooks/vision-flow/use-visions';

// // Helper to extract the raw Firebase Storage path from a download URL
// // e.g. "https://firebasestorage.googleapis.com/.../o/visions%2Fuid%2F123.jpg?alt=media..." -> "visions/uid/123.jpg"
// function getStoragePathFromUrl(url: string | undefined): string | null {
//   if (!url || !url.includes('/o/')) return null;
//   try {
//     const pathPart = url.split('/o/')[1].split('?')[0];
//     return decodeURIComponent(pathPart);
//   } catch (e) {
//     return null;
//   }
// }

// export default function GalleryPage() {
//   const { visions, loading } = useVisions();
//   const [displayVisions, setDisplayVisions] = useState<Vision[]>([]);
//   const [selectedImage, setSelectedImage] = useState<Vision | null>(null);
//   const [origin, setOrigin] = useState("");

//   // Only use images (no videos) and ensure they have a valid URL or fallback
//   const availableImages = useMemo(() => {
//     return visions
//       .filter(v => !v.isHidden && v.mediaType === 'image' && (v.mediaUrl || v.imageData))
//       .sort((a, b) => (new Date(b.createdAt).getTime() || 0) - (new Date(a.createdAt).getTime() || 0));
//   }, [visions]);

//   useEffect(() => {
//     // Allows testing on mobile via local network IP or live URL if running on localhost
//     setOrigin(process.env.NEXT_PUBLIC_SITE_URL || window.location.origin);
//   }, []);

//   // 1. Initial Load: Fill the 6 slots
//   useEffect(() => {
//     if (loading || availableImages.length === 0) return;

//     if (displayVisions.length === 0) {
//       const initialSet = [...availableImages.slice(0, 6)];
//       // Loop if we have fewer than 6 total images in the database
//       while (initialSet.length < 6 && availableImages.length > 0) {
//         initialSet.push(availableImages[initialSet.length % availableImages.length]);
//       }
//       setDisplayVisions(initialSet.slice(0, 6));
//     }
//   }, [availableImages, loading, displayVisions.length]);

//   // 2. The Rotation Interval (The "Pool and Replace" logic)
//   useEffect(() => {
//     if (availableImages.length <= 6) return; // No need to rotate if we don't have extra images

//     const interval = setInterval(() => {
//       setDisplayVisions(prev => {
//         // Find which images are NOT currently on screen
//         const currentlyVisibleIds = new Set(prev.map(v => v.id));
//         const pool = availableImages.filter(v => !currentlyVisibleIds.has(v.id));
        
//         if (pool.length === 0) return prev; // Should never happen if availableImages > 6

//         // Pick a random image from the pool
//         const nextImage = pool[Math.floor(Math.random() * pool.length)];
        
//         // Pick a random slot (0-5) to replace
//         const slotToReplace = Math.floor(Math.random() * 6);

//         // Swap it out
//         const nextSet = [...prev];
//         nextSet[slotToReplace] = nextImage;
//         return nextSet;
//       });
//     }, 4000); // Rotate one image every 4 seconds

//     return () => clearInterval(interval);
//   }, [availableImages]);

//   // Render loader while initializing
//   if (loading && displayVisions.length === 0) {
//     return (
//       <div className="fixed inset-0 bg-black flex flex-col items-center justify-center">
//         <Loader2 className="w-8 h-8 animate-spin text-[#4290FF] mb-4" />
//         <p className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/40">Loading Database...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 p-4 flex flex-col gap-4 overflow-hidden select-none bg-black">
//       {/* Header */}
//       <div className="flex justify-between items-center z-10 shrink-0 h-10">
//         <div className="flex items-center h-8">
//           <img 
//             src="/images/Gemini_PrimaryLogo_FullColor_White.png" 
//             alt="Logo" 
//             className="h-full w-auto object-contain"
//             onError={(e) => {
//               e.currentTarget.style.display = 'none';
//               const parent = e.currentTarget.parentElement;
//               if (parent) {
//                 const span = document.createElement('span');
//                 span.className = "text-[9px] uppercase tracking-[0.3em] font-medium text-white/50 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full";
//                 span.innerText = "Visions Stream";
//                 parent.appendChild(span);
//               }
//             }}
//           />
//         </div>
//       </div>

//       {/* 3x2 Grid - Fitted to screen */}
//       <main className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 min-h-0 w-full overflow-hidden">
//         {displayVisions.length > 0 ? (
//           displayVisions.map((vision, index) => {
//             // For the QR code download link, we need the raw storage path (e.g., visions/uid/123.jpg)
//             const storagePath = vision.fullPath || getStoragePathFromUrl(vision.mediaUrl);
            
//             // Format the path for the /download route
//             let downloadUrl = "";
//             if (storagePath) {
//                const cleanPath = storagePath.replace(/[-_]?RAW/gi, '');
//                downloadUrl = `${origin}/download/${cleanPath.split('/').map(encodeURIComponent).join('/')}`;
//             }

//             return (
//               <div 
//                 key={`${vision.id}-${index}`} // Using index in key forces re-render/animation on swap, or just vision.id for crossfade if set up
//                 className="relative rounded-[1.225rem] overflow-hidden bg-[#0A0C10] border border-white/5 cursor-pointer group animate-in fade-in zoom-in-95 duration-1000"
//                 onClick={() => setSelectedImage(vision)}
//               >
//                 <img
//                   // Fallback to legacy imageData if mediaUrl is missing
//                   src={vision.mediaUrl || vision.imageData}
//                   alt={vision.title || "Vision"}
//                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                 />
                
//                 {/* QR Code - Bottom Left (Flush) */}
//                 {downloadUrl && (
//                   <div className="absolute bottom-0 left-0 pt-3 pr-3 pb-4 pl-4 bg-white rounded-tr-3xl shadow-2xl z-20 hover:scale-105 transition-transform duration-300 origin-bottom-left">
//                     <QRCodeSVG 
//                       value={downloadUrl}
//                       size={120}
//                       level="M"
//                       includeMargin={false}
//                     />
//                   </div>
//                 )}

//                 <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center p-6 text-center">
//                   <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium mb-2">Theme</span>
//                   <span className="text-[12px] text-white/80 font-medium leading-relaxed max-w-full px-4">
//                     {vision.title || vision.description || 'Custom Creation'}
//                   </span>
//                 </div>
//               </div>
//             );
//           })
//         ) : (
//           <div className="col-span-3 row-span-2 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-[1.225rem]">
//             <p className="text-white/20 text-[10px] uppercase tracking-[0.2em] mb-2">No visions found</p>
//             <p className="text-white/10 text-xs text-center max-w-xs">Use the kiosk to generate some images!</p>
//           </div>
//         )}
//       </main>

//       {/* Image Detail Modal Integration (Adapted for the new Vision type) */}
//       {selectedImage && (
//         <ImageDetailModal 
//           // Map the new Vision object to the old VisionImage structure expected by the modal
//           image={{
//             id: selectedImage.id,
//             base64Data: selectedImage.mediaUrl || selectedImage.imageData || '',
//             title: selectedImage.title,
//             fullPath: selectedImage.fullPath || getStoragePathFromUrl(selectedImage.mediaUrl) || ''
//           }} 
//           onClose={() => setSelectedImage(null)} 
//         />
//       )}
//     </div>
//   );
// }
