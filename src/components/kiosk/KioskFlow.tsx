"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Zap, ChevronLeft, ArrowLeft, Sparkles, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { generateThemedPhoto } from '@/ai/flows/generate-themed-photo';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useFirestore, useAuth, errorEmitter, FirestorePermissionError } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';

type KioskStep = 'capture' | 'select-theme' | 'select-style' | 'processing' | 'results' | 'thanks';

const STYLES = [
  { 
    id: 'style-keychain', 
    title: 'Cute Keychain', 
    detail: 'Kawaii KEYCHAIN CHARACTER, Pixar-inspired style, soft rounded features, glossy eyes, high-detail 3D render.' 
  },
  { 
    id: 'style-oil', 
    title: 'Oil Painting', 
    detail: 'Classic 19th-century oil painting on canvas, thick impasto brushstrokes, dramatic chiaroscuro lighting.' 
  },
  { 
    id: 'style-steampunk', 
    title: 'Steampunk', 
    detail: 'High-detail steampunk character, Victorian attire, brass buckles, goggles, sepia palette.' 
  },
  { 
    id: 'style-clay', 
    title: 'Claymation', 
    detail: 'Handcrafted stop-motion claymation miniature, Tim Burton style, expressive eyes, moody lighting.' 
  },
];

const THEMES = [
  { 
    id: 'theme-teaching', 
    title: 'Level up my teaching', 
    variations: [
      { scene: 'modern high-tech classroom', activity: 'demonstrating holographic physics' },
      { scene: 'cozy storybook library', activity: 'reading an enchanted glowing book' },
    ]
  },
  { 
    id: 'theme-recipe', 
    title: 'Learn a new recipe', 
    variations: [
      { scene: 'rustic Italian villa kitchen', activity: 'kneading fresh pasta dough' },
      { scene: 'molecular gastronomy lab', activity: 'creating edible liquid nitrogen art' },
    ]
  },
  { 
    id: 'theme-zen', 
    title: 'Find my zen', 
    variations: [
      { scene: 'misty mountaintop temple', activity: 'performing slow Tai Chi' },
      { scene: 'glowing bioluminescent forest', activity: 'listening to whispers of ancient trees' },
    ]
  },
  { 
    id: 'theme-active', 
    title: 'Get more active', 
    variations: [
      { scene: 'neon-lit urban rooftop', activity: 'mastering high-speed parkour' },
      { scene: 'desert canyon adventure', activity: 'rock climbing up a mesa' },
    ]
  },
];

export default function KioskFlow() {
  const [step, setStep] = useState<KioskStep>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isWheelchairUser, setIsWheelchairUser] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<typeof THEMES[0] | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<typeof STYLES[0] | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [visionId, setVisionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const db = useFirestore();
  const auth = useAuth();

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((err) => {
          console.error("Auth failed:", err);
        });
      }
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    const getCameraPermission = async () => {
      if (step !== 'capture') return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 1280, height: 720 } 
        });
        setHasCameraPermission(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (error) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please allow camera access in your browser settings.',
        });
      }
    };
    getCameraPermission();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [step, toast]);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      performCapture();
      setCountdown(null);
    }
  }, [countdown]);

  const performCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvasRef.current.toDataURL('image/jpeg', 0.8));
        setStep('select-theme');
      }
    }
  };

  const getCleanText = (text: string) => text.replace(/^Variation \d+ (Scene|Activity): /i, '').trim();

  const composePolaroid = async (imageUrl: string, rawActivity: string): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageUrl;

    canvas.width = 800;
    canvas.height = 1000;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = imageUrl;
    });

    const margin = 40;
    const imgWidth = canvas.width - (margin * 2);
    ctx.drawImage(img, margin, margin, imgWidth, imgWidth);

    ctx.fillStyle = '#27272a';
    ctx.font = 'italic 50px Caveat, cursive';
    ctx.textAlign = 'center';
    
    const cleanActivity = getCleanText(rawActivity);
    const caption = `${cleanActivity.charAt(0).toUpperCase() + cleanActivity.slice(1)}, thanks to Gemini`;
    
    await document.fonts.ready;
    ctx.fillText(caption, canvas.width / 2, imgWidth + margin + 120);

    return canvas.toDataURL('image/jpeg', 0.7);
  };

  const handleThemeSelect = (theme: typeof THEMES[0]) => {
    setSelectedTheme(theme);
    setStep('select-style');
  };

  const generateVision = async (style: typeof STYLES[0]) => {
    if (!capturedImage || !selectedTheme) return;
    
    setIsProcessing(true);
    setStep('processing');
    setVisionId(null);

    try {
      if (auth && !auth.currentUser) {
        await signInAnonymously(auth);
      }

      const details = [style.detail];
      if (isWheelchairUser) details.push('subject is using a wheelchair');
      
      const response = await generateThemedPhoto({
        photoDataUri: capturedImage,
        themeVariations: selectedTheme.variations,
        details: details,
      });
      
      const bakedPolaroid = await composePolaroid(response.transformedPhotoDataUri, response.selectedActivity);
      setResultImage(bakedPolaroid);
      setStep('results');

      if (db) {
        setIsSaving(true);
        const data = {
          imageData: bakedPolaroid,
          activity: response.selectedActivity,
          theme: selectedTheme.title,
          createdAt: serverTimestamp()
        };
        const visionsRef = collection(db, 'visions');

        addDoc(visionsRef, data)
          .then((docRef) => {
            setVisionId(docRef.id);
            setIsSaving(false);
          })
          .catch(async (serverError) => {
            setIsSaving(false);
            const permissionError = new FirestorePermissionError({
              path: 'visions',
              operation: 'create',
              requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
      }
    } catch (error: any) {
      setStep('select-style');
      toast({ 
        variant: 'destructive', 
        title: 'AI Generation Error', 
        description: error.message || 'AI failed to generate vision.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetKiosk = () => {
    setStep('capture');
    setCapturedImage(null);
    setResultImage(null);
    setVisionId(null);
    setSelectedTheme(null);
    setSelectedStyle(null);
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined' || !visionId) return '';
    return `${window.location.origin}/share/${visionId}`;
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      {step === 'capture' && (
        <div className="w-full space-y-8 text-center animate-in zoom-in duration-500">
          <h2 className="text-7xl font-bold text-white font-headline">Strike a Pose</h2>
          <div className="relative overflow-hidden aspect-video max-w-4xl mx-auto rounded-[2rem] border-2 border-white/10 bg-zinc-900">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror transform -scale-x-100" />
            <canvas ref={canvasRef} className="hidden" />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
                <span className="text-[12rem] font-black italic font-headline text-white drop-shadow-xl">
                  {countdown > 0 ? countdown : "Smile!"}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-6">
            <Button onClick={() => setCountdown(3)} disabled={countdown !== null || hasCameraPermission === false} className="btn-google-blue h-auto py-6 px-12 text-2xl rounded-full">
              <Camera className="mr-3 h-8 w-8" />
              {countdown !== null ? 'Get Ready...' : 'Take your Photo'}
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')} className="text-white/40 text-xl font-headline">
              <ArrowLeft className="mr-2 h-6 w-6" />
              Back to home
            </Button>
          </div>
        </div>
      )}

      {step === 'select-theme' && (
        <div className="w-full space-y-12 animate-in fade-in duration-500">
          <div className="text-center space-y-4">
            <h2 className="text-6xl font-bold text-white font-headline">What would you do with your free time?</h2>
            <div className="flex justify-center mt-6">
              <div className="flex items-center space-x-3 bg-white/5 px-6 py-4 rounded-full border border-white/10">
                <Checkbox id="wheelchair" checked={isWheelchairUser} onCheckedChange={(c) => setIsWheelchairUser(!!c)} className="w-6 h-6 border-white/20" />
                <label htmlFor="wheelchair" className="text-xl text-white/70 font-headline cursor-pointer">I'm a wheelchair user</label>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
            {THEMES.map((theme) => (
              <div key={theme.id} onClick={() => handleThemeSelect(theme)} className="group cursor-pointer relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#4285F4] transition-all">
                <img src={PlaceHolderImages.find(i => i.id === theme.id)?.imageUrl || ''} alt={theme.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                  <h3 className="text-xl font-bold text-white font-headline">{theme.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'select-style' && (
        <div className="w-full space-y-12 animate-in fade-in duration-500">
          <div className="text-center">
            <h2 className="text-6xl font-bold text-white font-headline">Select your style</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto px-4">
            {STYLES.map((style) => (
              <div key={style.id} onClick={() => generateVision(style)} className="group cursor-pointer relative aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#4285F4] transition-all">
                <img src={PlaceHolderImages.find(i => i.id === style.id)?.imageUrl || ''} alt={style.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/40 flex items-end p-6">
                  <h3 className="text-xl font-bold text-white font-headline">{style.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="w-full space-y-12 text-center py-20 animate-pulse">
          <Zap className="w-24 h-24 text-[#4285F4] mx-auto" />
          <h2 className="text-5xl text-white font-headline">Gemini is imagining your dream life...</h2>
        </div>
      )}

      {step === 'results' && resultImage && (
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 animate-in fade-in zoom-in duration-700">
          <div className="bg-white p-6 pb-20 rounded-sm shadow-2xl transform -rotate-1 w-full max-w-md">
            <img src={resultImage} alt="AI Vision" className="w-full h-auto object-contain" />
          </div>
          <div className="flex-1 space-y-8 text-center md:text-left">
            <h2 className="text-8xl font-bold text-white font-headline">Ta-da!</h2>
            
            <div className="relative bg-white p-4 rounded-2xl w-64 h-64 mx-auto md:mx-0 shadow-2xl flex items-center justify-center">
              {isSaving || !visionId ? (
                <div className="flex flex-col items-center gap-3 text-zinc-400">
                  <Loader2 className="w-10 h-10 animate-spin text-[#4285F4]" />
                  <span className="text-sm font-bold uppercase tracking-widest">Generating Link...</span>
                </div>
              ) : (
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getShareUrl())}`} 
                  alt="QR Code" 
                  className="w-full h-full" 
                />
              )}
            </div>
            
            <p className="text-2xl text-white/50 font-headline">Scan the code to download your masterpiece.</p>
            <div className="flex gap-4 justify-center md:justify-start">
              <Button onClick={() => setStep('select-style')} variant="outline" className="rounded-full px-8 py-6 text-xl border-white/20 hover:bg-white/5 text-white">Adjust style</Button>
              <Button onClick={() => setStep('thanks')} className="bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-full px-8 py-6 text-xl">I'm done!</Button>
            </div>
          </div>
        </div>
      )}

      {step === 'thanks' && (
        <div className="text-center space-y-10 animate-in zoom-in duration-500">
          <h2 className="text-7xl font-bold text-white font-headline">Enjoy your free time!</h2>
          <Button onClick={resetKiosk} className="bg-white text-[#4285F4] hover:bg-zinc-100 rounded-full px-16 py-8 text-2xl font-bold transition-all shadow-xl">Start over</Button>
        </div>
      )}
    </div>
  );
}
