"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Zap, ChevronLeft, ArrowLeft, RefreshCcw, Check, Loader2, Sparkles, Stars, Wand2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { generateThemedPhoto } from '@/ai/flows/generate-themed-photo';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { collection, addDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useFirestore, useAuth, errorEmitter, FirestorePermissionError } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type KioskStep = 'capture' | 'review' | 'select-theme' | 'select-style' | 'processing' | 'results' | 'refine' | 'thanks';

const STYLES = [
  { 
    id: 'style-editorial', 
    title: 'Magazine Editorial', 
    detail: 'High-end business magazine cover photoshoot, xrisp studio lighting, sharp focus, hyper-detailed, sophisticated styling, GQ or Forbes aesthetic.' 
  },
  { 
    id: 'style-cinematic', 
    title: 'Cinematic Epic', 
    detail: 'Hollywood blockbuster cinematography, shot on 35mm anamorphic lens, dramatic xrim lighting, epic scale, photorealistic, shallow depth of field.' 
  },
  { 
    id: 'style-noir', 
    title: 'Timeless Noir', 
    detail: 'Classic black and white film noir style, dramatic high-contrast lighting, sharp shadows, elegant, vintage Leica camera aesthetic, sophisticated and powerful.' 
  },
  { 
    id: 'style-masterpiece', 
    title: 'Museum Masterpiece', 
    detail: 'Classic 19th-century oil painting on canvas, thick impasto brushstrokes, dramatic chiaroscuro lighting, regal and prestigious atmosphere, gallery-quality art.' 
  },
  { 
    id: 'style-visionary', 
    title: 'Tech Visionary', 
    detail: 'Sleek futuristic aesthetic, subtle glowing neon accents, clean high-tech environment, hyper-realistic 3D render, forward-thinking corporate leadership vibe.' 
  },
  { 
    id: 'style-popart', 
    title: 'Modern Art Collector', 
    detail: 'Vibrant pop art style inspired by Andy Warhol, bold flat colors, high-contrast graphic aesthetic, iconic and modern.' 
  }
];

const THEMES = [
  { 
    id: 'theme-green', 
    title: 'Master the Green', 
    variations: [
      { scene: 'lush, sun-drenched championship golf course', activity: 'sinking a perfect tournament-winning putt' },
      { scene: 'exclusive private grass tennis court at golden hour', activity: 'executing a flawless jumping backhand smash' },
      { scene: 'dramatic xcliffside golf hole overlooking a crashing ocean', activity: 'teeing off into a spectacular sunset' }
    ]
  },
  { 
    id: 'theme-culinary', 
    title: 'Indulge my inner foodie', 
    variations: [
      { scene: 'exclusive Chef\'s table in a Michelin-star kitchen', activity: 'tasting a masterpiece of molecular gastronomy' },
      { scene: 'sunlit luxury terrace overlooking the Amalfi coast', activity: 'enjoying a perfectly plated truffle risotto' },
      { scene: 'misty, ancient forest in the Piedmont region', activity: 'foraging for rare white truffles with a master guide' }
    ]
  },
  { 
    id: 'theme-warrior', 
    title: 'Unleash the weekend warrior', 
    variations: [
      { scene: 'rugged, pine-covered mountain bike trail', activity: 'catching air over a massive xdirt jump' },
      { scene: 'remote, untouched backcountry mountain peak', activity: 'carving fresh powder tracks on a snowboard' },
      { scene: 'roaring, crystal-clear white-water canyon river', activity: 'expertly navigating a sleek carbon-fiber kayak' }
    ]
  },
  { 
    id: 'theme-deepsea', 
    title: 'Explore the deep sea', 
    variations: [
      { scene: 'panoramic glass bubble of a high-tech submersible', activity: 'navigating through glowing bioluminescent coral reefs' },
      { scene: 'ancient, submerged shipwreck in crystal-clear water', activity: 'swimming alongside a majestic giant manta ray' },
      { scene: 'mysterious, illuminated underwater cenote cave', activity: 'free-diving gracefully through beams of sunlight' }
    ]
  },
  { 
    id: 'theme-racing', 
    title: 'Chase the Grand Prix thrill', 
    variations: [
      { scene: 'sweeping corner of a sunlit private race circuit', activity: 'steering a roaring vintage Ferrari' },
      { scene: 'glamorous Monaco street circuit at dusk', activity: 'celebrating a first-place podium finish' },
      { scene: 'pristine, high-tech luxury racing garage', activity: 'analyzing telemetry data next to a Le Mans hypercar' }
    ]
  },
  { 
    id: 'theme-vineyard', 
    title: 'Tend to my private vineyard', 
    variations: [
      { scene: 'rolling hills of a Tuscan private estate', activity: 'inspecting sun-ripened Sangiovese grapes' },
      { scene: 'rustic, candlelit Napa Valley wine cave', activity: 'expertly blending a custom reserve vintage' },
      { scene: 'elegant, sun-dappled chateau courtyard', activity: 'hosting an exclusive tasting of a private reserve vintage' }
    ]
  },
  { 
    id: 'theme-alpine', 
    title: 'Conquer the Alpine peaks', 
    variations: [
      { scene: 'dramatic, snow-capped Swiss summit', activity: 'standing victorious with an ice axe in hand' },
      { scene: 'sheer, vertical granite rock face above the clouds', activity: 'free-climbing with intense focus and grip' },
      { scene: 'remote, untouched glacier in British Columbia', activity: 'carving the first tracks after a thrilling heli-drop' }
    ]
  },
  { 
    id: 'theme-space', 
    title: 'Oversee from orbit', 
    variations: [
      { scene: 'luxurious private space module with a massive window', activity: 'floating weightlessly while gazing at the Earth\'s curvature' },
      { scene: 'futuristic lunar resort lounge', activity: 'sipping espresso while watching a brilliant Earthrise' },
      { scene: 'sleek, zero-gravity orbital botanical garden', activity: 'tending to futuristic glowing plants while floating' }
    ]
  },
];

const PROCESSING_MESSAGES = [
  "Gemini is imagining your dream life...",
  "Analyzing your unique pose...",
  "Crafting the perfect environment...",
  "Polishing the cinematic details...",
  "Developing your free-time vision...",
  "Applying high-end artistic styles..."
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
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedScene, setSelectedScene] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [visionId, setVisionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [processingMsgIdx, setProcessingMsgIdx] = useState(0);
  
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
        signInAnonymously(auth).then(() => {
          setIsAuthReady(true);
        }).catch((err) => {
          console.error("Auth initialization failed:", err);
        });
      } else {
        setIsAuthReady(true);
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
    } else if (countdown === 0) {
      const timer = setTimeout(() => {
        performCapture();
        setCountdown(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (step !== 'processing') return;
    const timer = setInterval(() => {
      setProcessingMsgIdx((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [step]);

  const performCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        setCapturedImage(canvasRef.current.toDataURL('image/jpeg', 0.8));
        setStep('review');
      }
    }
  };

  const getCleanText = (text: string) => text.replace(/^Variation \d+ (Scene|Activity): /i, '').trim();

  const composePolaroid = async (imageUrl: string, rawActivity: string): Promise<string> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return imageUrl;

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 1000;
    const TOP_PADDING = 110; 
    const SIDE_MARGIN = 40;
    const IMG_SIZE = CANVAS_WIDTH - (SIDE_MARGIN * 2);
    const BOTTOM_AREA_START = TOP_PADDING + IMG_SIZE;
    
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    const logoX = SIDE_MARGIN;
    const logoY = 40;
    ctx.fillStyle = '#4285F4';
    ctx.beginPath();
    ctx.moveTo(logoX + 22, logoY);
    ctx.lineTo(logoX + 28, logoY + 18);
    ctx.lineTo(logoX + 46, logoY + 22);
    ctx.lineTo(logoX + 28, logoY + 26);
    ctx.lineTo(logoX + 22, logoY + 46);
    ctx.lineTo(logoX + 16, logoY + 26);
    ctx.lineTo(logoX, logoY + 22);
    ctx.lineTo(logoX + 16, logoY + 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#27272a';
    ctx.font = 'bold 36px Inter, sans-serif'; 
    ctx.textAlign = 'left';
    ctx.fillText('Chrome Connect', logoX + 60, logoY + 36);
    ctx.restore();

    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = imageUrl;
    });
    ctx.drawImage(img, SIDE_MARGIN, TOP_PADDING, IMG_SIZE, IMG_SIZE);

    ctx.fillStyle = '#27272a';
    ctx.font = 'italic 38px Caveat, cursive';
    ctx.textAlign = 'center';
    
    const cleanActivity = getCleanText(rawActivity);
    const caption = `${cleanActivity.charAt(0).toUpperCase() + cleanActivity.slice(1)}, thanks to Gemini`;
    
    await document.fonts.ready;

    const wrapText = (text: string, maxWidth: number) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0];

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + " " + word).width;
        if (width < maxWidth) {
          currentLine += " " + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      lines.push(currentLine);
      return lines;
    };

    const maxTextWidth = IMG_SIZE - 20;
    const lines = wrapText(caption, maxTextWidth);
    const lineHeight = 45;
    
    lines.forEach((line, index) => {
      const yOffset = BOTTOM_AREA_START + 100 + (index * lineHeight);
      ctx.fillText(line, CANVAS_WIDTH / 2, yOffset);
    });

    return canvas.toDataURL('image/jpeg', 0.7);
  };

  const handleThemeSelect = (theme: typeof THEMES[0]) => {
    setSelectedTheme(theme);
    setStep('select-style');
  };

  const generateVision = async (
    styleOverride?: typeof STYLES[0],
    themeOverride?: typeof THEMES[0],
    sceneOverride?: string,
    activityOverride?: string
  ) => {
    const theme = themeOverride || selectedTheme;
    const style = styleOverride || selectedStyle;
    const scene = sceneOverride || selectedScene;
    const activity = activityOverride || selectedActivity;

    if (!capturedImage || !theme || !isAuthReady || !style) return;
    
    setIsProcessing(true);
    setStep('processing');
    setVisionId(null);

    try {
      const details = [style.detail];
      if (isWheelchairUser) details.push('subject is using a wheelchair');
      
      const response = await generateThemedPhoto({
        photoDataUri: capturedImage,
        themeVariations: theme.variations,
        scene: scene || undefined,
        activity: activity || undefined,
        details: details,
      });
      
      setSelectedActivity(response.selectedActivity);
      setSelectedScene(response.selectedScene);
      setSelectedStyle(style);

      const bakedPolaroid = await composePolaroid(response.transformedPhotoDataUri, response.selectedActivity);
      setResultImage(bakedPolaroid);
      setStep('results');

      if (db) {
        setIsSaving(true);
        const data = {
          imageData: bakedPolaroid,
          activity: response.selectedActivity,
          theme: theme.title,
          createdAt: new Date().toISOString()
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

  const handleSurpriseMe = () => {
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const randomVariation = randomTheme.variations[Math.floor(Math.random() * randomTheme.variations.length)];
    const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];

    setSelectedTheme(randomTheme);
    setSelectedScene(randomVariation.scene);
    setSelectedActivity(randomVariation.activity);
    setSelectedStyle(randomStyle);
  };

  const triggerInstantSurprise = () => {
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const randomVariation = randomTheme.variations[Math.floor(Math.random() * randomTheme.variations.length)];
    const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];

    setSelectedTheme(randomTheme);
    setSelectedScene(randomVariation.scene);
    setSelectedActivity(randomVariation.activity);
    setSelectedStyle(randomStyle);

    generateVision(randomStyle, randomTheme, randomVariation.scene, randomVariation.activity);
  };

  const resetKiosk = () => {
    setStep('capture');
    setCapturedImage(null);
    setResultImage(null);
    setVisionId(null);
    setSelectedTheme(null);
    setSelectedStyle(null);
    setSelectedActivity(null);
    setSelectedScene(null);
    setProcessingMsgIdx(0);
  };

  const getShareUrl = () => {
    if (typeof window === 'undefined' || !visionId) return '';
    const baseUrl = window.location.origin;
    return `${baseUrl}/share/${visionId}`;
  };

  const getRefineGreeting = (themeId: string | undefined) => {
    switch (themeId) {
      case 'theme-green': return <>Looking sharp,<br />pro player!</>;
      case 'theme-culinary': return <>What's cookin',<br />good lookin'!</>;
      case 'theme-warrior': return <>Ready for<br />the wild?</>;
      case 'theme-deepsea': return <>Making a<br />big splash!</>;
      case 'theme-racing': return <>Leading the<br />pack today!</>;
      case 'theme-vineyard': return <>A vintage<br />look, indeed!</>;
      case 'theme-alpine': return <>Reaching new<br />heights!</>;
      case 'theme-space': return <>Looking out<br />of this world!</>;
      default: return <>Looking good,<br />good lookin'!</>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4">
      {step === 'capture' && (
        <div className="w-full space-y-8 text-center animate-in zoom-in duration-500">
          <h2 className="text-4xl md:text-7xl font-bold text-white font-headline">
            {countdown === 1 ? "Smile!" : "Strike a Pose"}
          </h2>
          <div className="relative overflow-hidden aspect-video w-full max-w-4xl mx-auto rounded-2xl md:rounded-[2rem] border-2 border-white/10 bg-zinc-900">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror transform -scale-x-100" />
            <canvas ref={canvasRef} className="hidden" />
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-50">
                <span className="text-8xl md:text-[12rem] font-black italic font-headline text-white drop-shadow-xl">
                  {countdown}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-6">
            <Button 
              onClick={() => setCountdown(3)} 
              disabled={countdown !== null || hasCameraPermission === false || !isAuthReady} 
              className="btn-google-blue h-auto py-4 px-8 md:py-6 md:px-12 text-xl md:text-2xl rounded-full"
            >
              <Camera className="mr-3 h-6 w-6 md:h-8 md:w-8" />
              {countdown !== null ? 'Get Ready...' : 'Take your Photo'}
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')} className="text-white/40 text-lg md:text-xl font-headline">
              <ArrowLeft className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              Back to home
            </Button>
          </div>
        </div>
      )}

      {step === 'review' && capturedImage && (
        <div className="w-full space-y-8 text-center animate-in zoom-in duration-500">
          <h2 className="text-4xl md:text-7xl font-bold text-white font-headline">Looking good?</h2>
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl md:rounded-[2rem] border-2 border-white/10 bg-zinc-900 overflow-hidden aspect-video">
             <img src={capturedImage} alt="Captured" className="w-full h-full object-cover transform -scale-x-100" />
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            <Button 
              variant="outline"
              onClick={() => {
                setCapturedImage(null);
                setStep('capture');
              }}
              className="w-full md:w-auto h-auto py-4 px-8 md:py-6 md:px-10 text-xl md:text-2xl rounded-full border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCcw className="mr-3 h-5 w-5 md:h-6 md:w-6" />
              Retake Photo
            </Button>
            <Button 
              onClick={() => setStep('select-theme')}
              className="w-full md:w-auto btn-google-blue h-auto py-4 px-8 md:py-6 md:px-12 text-xl md:text-2xl rounded-full"
            >
              <Check className="mr-3 h-6 w-6 md:h-8 md:w-8" />
              Looks Great!
            </Button>
          </div>
        </div>
      )}

      {step === 'select-theme' && (
        <div className="w-full space-y-12 animate-in fade-in duration-500">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white font-headline leading-tight">What would you do with your free time?</h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-6">
              <div className="flex items-center space-x-3 bg-white/5 px-4 py-3 md:px-6 md:py-4 rounded-full border border-white/10">
                <Checkbox id="wheelchair" checked={isWheelchairUser} onCheckedChange={(c) => setIsWheelchairUser(!!c)} className="w-5 h-5 md:w-6 md:h-6 border-white/20" />
                <label htmlFor="wheelchair" className="text-lg md:text-xl text-white/70 font-headline cursor-pointer">I'm a wheelchair user</label>
              </div>
              <Button 
                onClick={triggerInstantSurprise}
                variant="outline"
                className="h-auto py-3 px-8 md:py-4 md:px-10 text-lg md:text-xl rounded-full bg-white text-black border-transparent hover:bg-zinc-100 font-bold transition-all shadow-xl group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6 text-purple-500" />
                Surprise me!
              </Button>
            </div>
          </div>
          
          <div className="w-full max-w-7xl mx-auto overflow-x-auto pb-8 snap-x scrollbar-subtle">
            <div className="flex gap-4 md:gap-6 px-4 md:px-12 min-w-full">
              {THEMES.map((theme) => (
                <div 
                  key={theme.id} 
                  onClick={() => handleThemeSelect(theme)} 
                  className="group flex-shrink-0 cursor-pointer relative w-[240px] md:w-[320px] aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#4285F4] transition-all bg-zinc-900 snap-center"
                >
                  <img 
                    src={PlaceHolderImages.find(i => i.id === theme.id)?.imageUrl || ''} 
                    alt={theme.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-white font-headline">{theme.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-8">
             <Button variant="ghost" onClick={() => setStep('review')} className="text-white/40 text-lg md:text-xl font-headline">
               <ChevronLeft className="mr-2 h-5 w-5 md:h-6 md:w-6" />
               Back to photo
             </Button>
          </div>
        </div>
      )}

      {step === 'select-style' && (
        <div className="w-full space-y-12 animate-in fade-in duration-500">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white font-headline">Select your style</h2>
          </div>

          <div className="w-full max-w-7xl mx-auto overflow-x-auto pb-8 snap-x scrollbar-subtle">
            <div className="flex gap-4 md:gap-6 px-4 md:px-12 min-w-full">
              {STYLES.map((style) => (
                <div 
                  key={style.id} 
                  onClick={() => generateVision(style)} 
                  className="group flex-shrink-0 cursor-pointer relative w-[240px] md:w-[320px] aspect-square rounded-2xl overflow-hidden border-2 border-transparent hover:border-[#4285F4] transition-all bg-zinc-900 snap-center"
                >
                  <img 
                    src={PlaceHolderImages.find(i => i.id === style.id)?.imageUrl || ''} 
                    alt={style.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-white font-headline">{style.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-8">
             <Button variant="ghost" onClick={() => setStep('select-theme')} className="text-white/40 text-lg md:text-xl font-headline">
               <ChevronLeft className="mr-2 h-5 w-5 md:h-6 md:w-6" />
               Back to themes
             </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="w-full space-y-12 text-center py-12 md:py-20 flex flex-col items-center">
          <div className="relative w-32 h-32 md:w-48 md:h-48 mb-8">
            <div className="absolute inset-0 bg-[#4285F4]/30 blur-[40px] md:blur-[60px] rounded-full animate-glow" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-16 h-16 md:w-24 md:h-24 text-white animate-pulse" />
            </div>
            <div className="absolute inset-0 animate-spin duration-[8s] linear infinite">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/10 p-2 md:p-4 rounded-full backdrop-blur-md">
                  <Zap className="w-5 h-5 md:w-8 md:h-8 text-[#4285F4]" />
               </div>
            </div>
            <div className="absolute inset-0 animate-spin duration-[12s] linear infinite reverse">
               <div className="absolute bottom-0 right-1/4 bg-white/10 p-2 md:p-3 rounded-full backdrop-blur-md">
                  <Stars className="w-4 h-4 md:w-6 md:h-6 text-[#9B72CB]" />
               </div>
            </div>
            <div className="absolute inset-0 animate-spin duration-[10s] linear infinite">
               <div className="absolute left-0 top-1/4 bg-white/10 p-2 md:p-3 rounded-full backdrop-blur-md">
                  <Wand2 className="w-4 h-4 md:w-6 md:h-6 text-[#D96570]" />
               </div>
            </div>
          </div>

          <div className="space-y-4 max-w-2xl px-4">
            <h2 className="text-3xl md:text-5xl text-white font-headline font-bold transition-all duration-500 min-h-[4rem] flex items-center justify-center">
              {PROCESSING_MESSAGES[processingMsgIdx]}
            </h2>
            <p className="text-sm md:text-xl text-white/40 font-headline uppercase tracking-[0.2em] font-medium">
              Powered by Nano Banana 2
            </p>
          </div>
        </div>
      )}

      {step === 'results' && resultImage && (
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 animate-in fade-in zoom-in duration-700 py-8">
          <div className="bg-white p-4 md:p-6 pb-12 md:pb-20 rounded-sm shadow-2xl transform lg:-rotate-1 w-full max-w-xs md:max-w-md">
            <img src={resultImage} alt="AI Vision" className="w-full h-auto object-contain" />
          </div>
          <div className="flex-1 space-y-8 text-center lg:text-left w-full">
            <h2 className="text-6xl md:text-8xl font-bold text-white font-headline">Ta-da!</h2>
            
            <div className="relative bg-white p-4 rounded-2xl w-48 h-48 md:w-64 md:h-64 mx-auto lg:mx-0 shadow-2xl flex items-center justify-center">
              {isSaving || !visionId ? (
                <div className="flex flex-col items-center gap-3 text-zinc-400">
                  <Loader2 className="w-8 h-8 md:w-10 md:h-10 animate-spin text-[#4290FF]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Link...</span>
                </div>
              ) : (
                <a 
                  href={getShareUrl()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full h-full block cursor-pointer transition-transform hover:scale-105 active:scale-95"
                  title="Tap to download"
                >
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getShareUrl())}`} 
                    alt="QR Code" 
                    className="w-full h-full" 
                  />
                </a>
              )}
            </div>
            
            <p className="text-xl md:text-2xl text-white/50 font-headline">Scan the code to download your masterpiece.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={() => setStep('refine')} variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-xl border-white/20 hover:bg-white/5 text-white">Adjust style</Button>
              <Button onClick={() => setStep('thanks')} className="w-full sm:w-auto bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-full px-8 py-6 text-xl">I'm done!</Button>
            </div>
          </div>
        </div>
      )}

      {step === 'refine' && resultImage && (
        <div className="w-full max-w-7xl px-4 md:px-8 animate-in fade-in duration-700 py-8">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 mb-12">
            <h2 className="text-4xl md:text-7xl lg:text-8xl font-bold text-white leading-[0.9] font-headline">
              {getRefineGreeting(selectedTheme?.id)}
            </h2>
            <p className="text-lg md:text-2xl text-white/60 max-w-sm mt-auto pb-2">
              Now for the fun part. Refine your prompt to create your masterpiece.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5 flex justify-center lg:justify-start">
              <div className="bg-zinc-800/50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 backdrop-blur-sm w-full max-w-[450px]">
                <div className="bg-white p-3 md:p-4 pb-8 md:pb-12 rounded-sm shadow-2xl transform lg:-rotate-1 w-full">
                  <img src={resultImage} alt="Current Vision" className="w-full h-auto" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-8 md:space-y-12">
              <div className="space-y-6 md:space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 group w-full">
                  <span className="text-xl md:text-3xl font-bold text-white md:w-48 md:text-right font-headline whitespace-nowrap">Imagine me</span>
                  <Select 
                    value={selectedTheme?.id} 
                    onValueChange={(val) => {
                      const theme = THEMES.find(t => t.id === val);
                      if (theme) {
                        setSelectedTheme(theme);
                        setSelectedActivity(theme.variations[0].activity);
                        setSelectedScene(theme.variations[0].scene);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full flex-1 bg-transparent border-2 border-[#4285F4] hover:bg-[#4285F4]/5 text-white h-14 md:h-20 rounded-full px-6 md:px-8 text-lg md:text-2xl transition-all shadow-[0_0_15px_rgba(66,144,255,0.1)]">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                      {THEMES.map(t => (
                        <SelectItem key={t.id} value={t.id} className="text-lg md:text-xl py-3 md:py-4 focus:bg-[#4285F4] focus:text-white transition-colors cursor-pointer">
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 group w-full">
                  <span className="text-xl md:text-3xl font-bold text-white md:w-48 md:text-right font-headline whitespace-nowrap">
                    {selectedTheme?.id === 'theme-culinary' ? 'cooking' : ''}
                  </span>
                  <div className="flex-1 w-full">
                    <Select 
                      value={selectedActivity || ''} 
                      onValueChange={(val) => {
                        setSelectedActivity(val);
                        const variation = selectedTheme?.variations.find(v => v.activity === val);
                        if (variation) setSelectedScene(variation.scene);
                      }}
                    >
                      <SelectTrigger className="w-full bg-transparent border-2 border-[#4285F4] hover:bg-[#4285F4]/5 text-white h-14 md:h-20 rounded-full px-6 md:px-8 text-lg md:text-2xl transition-all shadow-[0_0_15px_rgba(66,144,255,0.1)]">
                        <SelectValue placeholder="Select an activity" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                        {selectedTheme?.variations.map((v, i) => (
                          <SelectItem key={i} value={v.activity} className="text-lg md:text-xl py-3 md:py-4 focus:bg-[#4285F4] focus:text-white transition-colors cursor-pointer">
                            {v.activity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 group w-full">
                  <span className="text-xl md:text-3xl font-bold text-white md:w-48 md:text-right font-headline whitespace-nowrap">in the style of</span>
                  <Select 
                    value={selectedStyle?.id} 
                    onValueChange={(val) => {
                      const style = STYLES.find(s => s.id === val);
                      if (style) setSelectedStyle(style);
                    }}
                  >
                    <SelectTrigger className="w-full flex-1 bg-transparent border-2 border-[#4285F4] hover:bg-[#4285F4]/5 text-white h-14 md:h-20 rounded-full px-6 md:px-8 text-lg md:text-2xl transition-all shadow-[0_0_15px_rgba(66,144,255,0.1)]">
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                      {STYLES.map(s => (
                        <SelectItem key={s.id} value={s.id} className="text-lg md:text-xl py-3 md:py-4 focus:bg-[#4285F4] focus:text-white transition-colors cursor-pointer">
                          {s.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 md:gap-6 pt-4">
                <Button 
                  onClick={handleSurpriseMe}
                  variant="outline"
                  className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-12 text-xl md:text-2xl rounded-full bg-white text-black border-transparent hover:bg-zinc-100 transition-all font-bold shadow-xl relative group overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                  Surprise me!
                </Button>
                <Button 
                  onClick={() => generateVision()}
                  className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-12 text-xl md:text-2xl rounded-full bg-gradient-to-r from-[#4285F4] to-[#4290FF] hover:opacity-90 text-white font-bold shadow-2xl transition-all active:scale-95"
                >
                  Make these updates
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'thanks' && (
        <div className="text-center space-y-10 animate-in zoom-in duration-500 py-20">
          <h2 className="text-5xl md:text-7xl font-bold text-white font-headline">Enjoy your free time!</h2>
          <Button onClick={resetKiosk} className="bg-white text-[#4285F4] hover:bg-zinc-100 rounded-full px-12 py-6 md:px-16 md:py-8 text-xl md:text-2xl font-bold transition-all shadow-xl">Start over</Button>
        </div>
      )}
    </div>
  );
}