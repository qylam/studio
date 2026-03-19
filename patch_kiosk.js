const fs = require('fs');
const file = 'src/components/kiosk/KioskFlow.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace(
  "import { useFirestore, useAuth, errorEmitter, FirestorePermissionError } from '@/firebase';",
  `import { useFirestore, useAuth, errorEmitter, FirestorePermissionError } from '@/firebase';\nimport { startVideoGeneration, checkVideoJobStatus } from '@/ai/flows/video';\nimport { doc } from 'firebase/firestore';\nimport { useDoc } from '@/firebase/firestore/use-doc';`
);

content = content.replace(
  "import React, { useState, useRef, useEffect } from 'react';",
  "import React, { useState, useRef, useEffect, useMemo } from 'react';"
);

content = content.replace(
  "import { Camera, Zap, ChevronLeft, ArrowLeft, RefreshCcw, Check, Loader2, Sparkles, Stars, Wand2 } from 'lucide-react';",
  "import { Camera, Zap, ChevronLeft, ArrowLeft, RefreshCcw, Check, Loader2, Sparkles, Stars, Wand2, Film, PlayCircle } from 'lucide-react';"
);

content = content.replace(
  "type KioskStep = 'capture' | 'review' | 'select-theme' | 'select-style' | 'processing' | 'results' | 'refine' | 'thanks';",
  "type KioskStep = 'capture' | 'review' | 'select-theme' | 'select-style' | 'processing' | 'results' | 'refine' | 'video-loading' | 'video-results' | 'thanks';"
);

// State vars
const stateVarInjection = `
  const [processingMsgIdx, setProcessingMsgIdx] = useState(0);
  
  const [videoStatus, setVideoStatus] = useState<'IDLE' | 'STARTING' | 'PENDING' | 'SUCCEEDED' | 'FAILED'>('IDLE');
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const statsDocRef = useMemo(() => db ? doc(db, 'metadata', 'globalStats') : null, [db]);
  const { data: statsData } = useDoc<{videoCount: number}>(statsDocRef);
  const globalVideoCount = statsData?.videoCount || 0;
`;

content = content.replace(
  "const [processingMsgIdx, setProcessingMsgIdx] = useState(0);",
  stateVarInjection
);

// triggerVideoGeneration function
const triggerVideoGeneration = `
  const triggerVideoGeneration = async (vId: string, imgData: string) => {
    if (globalVideoCount >= 100) return;
    setVideoStatus('STARTING');
    try {
      const res = await startVideoGeneration(vId, imgData);
      if (res.success && res.operationId) {
        setVideoJobId(res.operationId);
        setVideoStatus('PENDING');
      } else {
        setVideoStatus('FAILED');
      }
    } catch (e) {
      setVideoStatus('FAILED');
    }
  };
`;

content = content.replace(
  "const performCapture = () => {",
  triggerVideoGeneration + "\n\n  const performCapture = () => {"
);

// Polling effect
const pollingEffect = `
  useEffect(() => {
    if (videoStatus === 'PENDING' && videoJobId && visionId) {
      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await checkVideoJobStatus(visionId, videoJobId);
          if (res.status === 'SUCCEEDED') {
            setVideoUrl(res.videoUrl || null);
            setVideoStatus('SUCCEEDED');
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
            // If user was waiting on the video-loading screen, transition them automatically
            if (step === 'video-loading') {
              setStep('video-results');
            }
          } else if (res.status === 'FAILED') {
            setVideoStatus('FAILED');
            if (pollTimerRef.current) clearInterval(pollTimerRef.current);
          }
        } catch (e) {
          console.error("Poll error", e);
        }
      }, 5000);
      
      return () => {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      };
    }
  }, [videoStatus, videoJobId, visionId, step]);
`;

content = content.replace(
  "useEffect(() => {\n    if (countdown === null) return;",
  pollingEffect + "\n\n  useEffect(() => {\n    if (countdown === null) return;"
);


// Clear video state on generateVision
content = content.replace(
  "setVisionId(null);",
  "setVisionId(null);\n    setVideoStatus('IDLE');\n    setVideoJobId(null);\n    setVideoUrl(null);\n    if (pollTimerRef.current) clearInterval(pollTimerRef.current);"
);

// Trigger video generation when saving to firestore
content = content.replace(
  "setVisionId(docRef.id);\n            setIsSaving(false);",
  "setVisionId(docRef.id);\n            setIsSaving(false);\n            triggerVideoGeneration(docRef.id, bakedPolaroid);"
);

// Reset video state on start over
content = content.replace(
  "setProcessingMsgIdx(0);\n  };",
  "setProcessingMsgIdx(0);\n    setVideoStatus('IDLE');\n    setVideoJobId(null);\n    setVideoUrl(null);\n    if (pollTimerRef.current) clearInterval(pollTimerRef.current);\n  };"
);

// Update results step UI
const newResultsUI = `
            <p className="text-xl md:text-2xl text-white/50 font-headline">Scan the code to download your masterpiece.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={() => setStep('refine')} variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-xl border-white/20 hover:bg-white/5 text-white">Adjust style</Button>
              {globalVideoCount < 100 && videoStatus !== 'FAILED' ? (
                <Button 
                  onClick={() => {
                    if (videoStatus === 'SUCCEEDED') setStep('video-results');
                    else setStep('video-loading');
                  }} 
                  className="w-full sm:w-auto bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-full px-8 py-6 text-xl flex items-center gap-2"
                >
                  <Film className="w-5 h-5" />
                  Animate Me!
                </Button>
              ) : globalVideoCount < 100 && videoStatus === 'FAILED' ? (
                <Button onClick={() => triggerVideoGeneration(visionId!, resultImage!)} className="w-full sm:w-auto bg-red-500/80 hover:bg-red-500 rounded-full px-8 py-6 text-xl">
                  Retry Video
                </Button>
              ) : (
                <Button onClick={() => setStep('thanks')} className="w-full sm:w-auto bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-full px-8 py-6 text-xl">
                  I'm done!
                </Button>
              )}
            </div>
            {globalVideoCount < 100 && (videoStatus === 'PENDING' || videoStatus === 'STARTING') && (
               <div className="flex items-center gap-2 text-white/50 justify-center lg:justify-start mt-4">
                 <Loader2 className="w-4 h-4 animate-spin" />
                 <span className="text-sm uppercase tracking-wider">Generating Video...</span>
               </div>
            )}
`;
content = content.replace(
  /<p className="text-xl md:text-2xl text-white\/50 font-headline">Scan the code to download your masterpiece\.<\/p>\s*<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">\s*<Button onClick=\{\(\) => setStep\('refine'\)\} variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-xl border-white\/20 hover:bg-white\/5 text-white">Adjust style<\/Button>\s*<Button onClick=\{\(\) => setStep\('thanks'\)\} className="w-full sm:w-auto bg-\[\#4285F4\] hover:bg-\[\#4285F4\]\/90 rounded-full px-8 py-6 text-xl">I'm done!<\/Button>\s*<\/div>/g,
  newResultsUI
);

// Add video-loading and video-results steps at the end before thanks step
const videoStepsUI = `
      {step === 'video-loading' && (
        <div className="w-full space-y-12 text-center py-12 md:py-20 flex flex-col items-center">
          <div className="relative w-32 h-32 md:w-48 md:h-48 mb-8">
            <div className="absolute inset-0 bg-[#9B72CB]/30 blur-[40px] md:blur-[60px] rounded-full animate-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Film className="w-16 h-16 md:w-24 md:h-24 text-white animate-bounce" />
            </div>
            <div className="absolute inset-0 animate-spin duration-[8s] linear infinite">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 p-2 md:p-4 rounded-full backdrop-blur-md">
                  <PlayCircle className="w-5 h-5 md:w-8 md:h-8 text-[#9B72CB]" />
               </div>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl px-4">
            <h2 className="text-3xl md:text-5xl text-white font-headline font-bold">
              Veo 3.1 is directing your cinematic shot...
            </h2>
            <p className="text-sm md:text-xl text-white/40 font-headline uppercase tracking-[0.2em] font-medium">
              This usually takes 1-2 minutes.
            </p>
          </div>
        </div>
      )}

      {step === 'video-results' && videoUrl && (
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 animate-in fade-in zoom-in duration-700 py-8">
          <div className="bg-black p-4 rounded-xl shadow-2xl w-full max-w-xs md:max-w-2xl aspect-video overflow-hidden border border-white/10">
            <video src={videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 space-y-8 text-center lg:text-left w-full">
            <h2 className="text-5xl md:text-7xl font-bold text-white font-headline">Action!</h2>
            
            <div className="relative bg-white p-4 rounded-2xl w-48 h-48 md:w-64 md:h-64 mx-auto lg:mx-0 shadow-2xl flex items-center justify-center">
              <a 
                href={getShareUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full h-full block cursor-pointer transition-transform hover:scale-105 active:scale-95"
                title="Tap to download"
              >
                <img 
                  src={\`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=\${encodeURIComponent(getShareUrl())}\`} 
                  alt="QR Code" 
                  className="w-full h-full" 
                />
              </a>
            </div>
            
            <p className="text-xl md:text-2xl text-white/50 font-headline">Scan to download your photo & video.</p>
            <div className="flex justify-center lg:justify-start">
              <Button onClick={() => setStep('thanks')} className="w-full sm:w-auto bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-full px-12 py-6 text-xl">
                I'm done!
              </Button>
            </div>
          </div>
        </div>
      )}
`;
content = content.replace(
  "{step === 'thanks' && (",
  videoStepsUI + "\n\n      {step === 'thanks' && ("
);

fs.writeFileSync(file, content);
console.log('KioskFlow patched!');
