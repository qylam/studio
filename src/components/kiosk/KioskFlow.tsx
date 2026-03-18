"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Camera, Zap, ChevronLeft, ArrowLeft, RefreshCcw, Check, Loader2, Sparkles, Stars, Wand2, Film, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { generateThemedPhoto } from '@/ai/flows/generate-themed-photo';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { TranslationKey } from '@/i18n/dictionaries';
import { collection, addDoc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useFirestore, useAuth, errorEmitter, FirestorePermissionError } from '@/firebase';
import { startVideoGeneration, checkVideoJobStatus } from '@/ai/flows/video';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase/firestore/use-doc';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type KioskStep = 'capture' | 'review' | 'select-theme' | 'select-style' | 'processing' | 'results' | 'refine' | 'video-loading' | 'video-results' | 'thanks';

const STYLES = [
  { 
    id: 'style-figurine', 
    title: 'Figurine', 
    detail: 'Transform the person or group of people in this photo into a 1/7 scale commercialized figurine of the characters in the picture, in a realistic style, in a real environment. The figurine is placed on a computer desk. The figurine has a round transparent acrylic base with no text on the base. The content on the computer screen is the brush modeling process of this figurine. Packaging box printed with the original artwork.' 
  },
  { 
    id: 'style-keychain', 
    title: '3D Keychain', 
    detail: 'Transform the person or group of people in the image into a keychain character version of themselves, placed on a tabletop. Preserve recognizable features but redesign them in a kawaii, Pixar-inspired style — slightly oversized head, small body, soft rounded features, glossy expressive eyes, and a warm, heartwarming smile. The character should feel like a premium animated collectible toy, with smooth materials, soft shading, and subtle skin glow. Keep outfit colors and key visual identity, but simplify details into clean, cute shapes. Use soft cinematic lighting, shallow depth of field, warm tones, and a cozy tabletop setting. Ultra-detailed 3D render.' 
  },
  { 
    id: 'style-oil', 
    title: 'Oil Painting', 
    detail: 'Transform the person or group of people in this photo into a classic 19th-century oil painting on canvas. Use thick, visible impasto brushstrokes and a rich, deep color palette. The lighting should be dramatic chiaroscuro, with soft shadows and a warm glow on the persons face. The background should be a soft, textured abstract landscape or a dark studio setting. Ensure the final result looks like a physical painting with subtle canvas texture visible. Maintain their facial features.' 
  },
  { 
    id: 'style-clay', 
    title: 'Claymation', 
    detail: 'Transform the person or group of people in the image into a handcrafted stop-motion claymation miniature, reimagined as an eccentric character with elongated limbs, expressive eyes, and a warm, heartwarming smile in a style merging Tim Burtons and Edward Goreys illustrations. This ultra-detailed cinematic shot features a shallow depth of field, moody practical lighting with deep shadows, and a storybook palette of midnight blue, deep plum, and antique gold. Maintain their facial features.' 
  },
  { 
    id: 'style-editorial', 
    title: 'Magazine Editorial', 
    detail: 'Transform the person or group of people in the image into a High-end business magazine cover photoshoot, crisp studio lighting, sharp focus, hyper-detailed, sophisticated styling, GQ or Forbes aesthetic.' 
  },
  { 
    id: 'style-cinematic', 
    title: 'Cinematic Epic', 
    detail: 'Transform the person or group of people in the image into a Hollywood blockbuster cinematography, shot on 35mm anamorphic lens, dramatic rim lighting, epic scale, photorealistic, shallow depth of field.' 
  },
  { 
    id: 'style-noir', 
    title: 'Timeless Noir', 
    detail: 'Transform the person or group of people in the image into a Classic black and white film noir style, dramatic high-contrast lighting, sharp shadows, elegant, vintage Leica camera aesthetic, sophisticated and powerful.' 
  },
  { 
    id: 'style-visionary', 
    title: 'Tech Visionary', 
    detail: 'Transform the person or group of people in the image into a Sleek futuristic aesthetic, subtle glowing neon accents, clean high-tech environment, hyper-realistic 3D render, forward-thinking corporate leadership vibe.' 
  }
];

const THEMES = [
  { 
    id: 'theme-recipe', 
    title: 'Learn a new recipe', 
    variations: [
      { scene: 'rustic Italian villa kitchen', activity: 'kneading fresh pasta dough' },
      { scene: 'molecular gastronomy lab', activity: 'creating edible liquid nitrogen art' },
      { scene: 'bustling street food market', activity: 'tossing a perfect artisan pizza' }
    ]
  },
  { 
    id: 'theme-zen', 
    title: 'Find my zen', 
    variations: [
      { scene: 'misty mountaintop temple', activity: 'performing slow, graceful Tai Chi' },
      { scene: 'floating crystal lotus pod', activity: 'deep meditation in zero gravity' },
      { scene: 'glowing bioluminescent forest', activity: 'listening to the whispers of ancient trees' }
    ]
  },
  { 
    id: 'theme-active', 
    title: 'Get more active', 
    variations: [
      { scene: 'neon-lit urban rooftop', activity: 'mastering high-speed parkour' },
      { scene: 'underwater coral gymnasium', activity: 'swimming with mechanical dolphins' },
      { scene: 'desert canyon adventure', activity: 'rock climbing up a vertical mesa' }
    ]
  },
  { 
    id: 'theme-break', 
    title: 'Take a well-earned break', 
    variations: [
      { scene: 'luxury cloud resort', activity: 'lounging in a golden hammock' },
      { scene: 'secluded x hot spring cave', activity: 'soaking in steaming mineral waters' },
      { scene: 'vintage jazz lounge on Mars', activity: 'sipping a cosmic mocktail' }
    ]
  },
  { 
    id: 'theme-skill', 
    title: 'Learn a new skill', 
    variations: [
      { scene: 'master glassblower workshop', activity: 'shaping a molten glass phoenix' },
      { scene: 'grand symphony hall', activity: 'conducting an orchestra of musicians' },
      { scene: 'digital neon arcade', activity: 'winning a pro-gaming championship' }
    ]
  },
  { 
    id: 'theme-creative', 
    title: 'Get more creative', 
    variations: [
      { scene: 'rooftop garden studio', activity: 'sculpting a giant floral statue' },
      { scene: 'street art alleyway', activity: 'spray painting a vibrant mural' },
      { scene: 'grand symphony hall', activity: 'conducting an orchestra of lights' }
    ]
  },
  { 
    id: 'theme-imagination', 
    title: 'Let my imagination run loose', 
    variations: [
      { scene: 'steampunk airship bridge', activity: 'navigating through a thundercloud' },
      { scene: 'giant mushroom kingdom', activity: 'talking to a curious dragon' },
      { scene: 'floating clockwork city', activity: 'rewinding the gears of time' }
    ]
  },
  { 
    id: 'theme-green', 
    title: 'Master the Green', 
    variations: [
      { scene: 'lush, sun-drenched championship golf course', activity: 'sinking a perfect tournament-winning putt' },
      { scene: 'exclusive private grass tennis court at golden hour', activity: 'executing a flawless jumping backhand smash' },
      { scene: 'dramatic cliffside golf hole overlooking a crashing ocean', activity: 'teeing off into a spectacular sunset' }
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
      { scene: 'rugged, pine-covered mountain bike trail', activity: 'catching air over a massive dirt jump' },
      { scene: 'remote, untouched backcountry mountain peak', activity: 'carving fresh powder tracks on a snowboard' },
      { scene: 'roaring, crystal-clear white-water canyon river', activity: 'expertly navigating a sleek carbon-fiber kayak' }
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
    id: 'theme-alpine', 
    title: 'Conquer the Alpine peaks', 
    variations: [
      { scene: 'dramatic, snow-capped Swiss summit', activity: 'standing victorious with an ice axe in hand' },
      { scene: 'sheer, vertical granite rock face above the clouds', activity: 'free-climbing with intense focus and grip' },
      { scene: 'remote, untouched glacier in British Columbia', activity: 'carving the first tracks after a thrilling heli-drop' }
    ]
  }
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
  
  const [videoStatus, setVideoStatus] = useState<'IDLE' | 'STARTING' | 'PENDING' | 'SUCCEEDED' | 'FAILED'>('IDLE');
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { t } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  
  const statsDocRef = useMemo(() => db ? doc(db, 'metadata', 'globalStats') : null, [db]);
  const { data: statsData } = useDoc<{videoCount: number}>(statsDocRef);
  const globalVideoCount = statsData?.videoCount || 0;

  const translatedProcessingMessages = [
    t('loading_message_0'),
    t('loading_message_1'),
    t('loading_message_2'),
    t('loading_message_3'),
    t('loading_message_4'),
  ];

  const translatedStyles = STYLES.map(style => ({
    ...style,
    title: t(`style_${style.id.split('-')[1]}_title` as TranslationKey),
    detail: t(`style_${style.id.split('-')[1]}_detail` as TranslationKey)
  }));

  const translatedThemes = THEMES.map(theme => ({
    ...theme,
    title: t(`theme_${theme.id.split('-')[1]}_title` as TranslationKey),
    variations: theme.variations.map((v, idx) => ({
      scene: t(`theme_${theme.id.split('-')[1]}_var${idx}_scene` as TranslationKey),
      activity: t(`theme_${theme.id.split('-')[1]}_var${idx}_activity` as TranslationKey)
    }))
  }));

  const toLowerFirst = (s: string | undefined | null) => {
    if (!s) return '';
    return s.charAt(0).toLowerCase() + s.slice(1);
  };

  useEffect(() => {
    if (selectedTheme && selectedActivity) {
      const isValid = selectedTheme.variations.some(v => v.activity === selectedActivity);
      if (!isValid) {
        setSelectedActivity(selectedTheme.variations[0].activity);
        setSelectedScene(selectedTheme.variations[0].scene);
      }
    } else if (selectedTheme && !selectedActivity) {
      setSelectedActivity(selectedTheme.variations[0].activity);
      setSelectedScene(selectedTheme.variations[0].scene);
    }
  }, [selectedTheme, selectedActivity]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).then(() => {
          setIsAuthReady(true);
        }).catch((err) => {
          console.error("AUTH_INITIALIZATION_FAILED:", err);
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
        console.error("CAMERA_PERMISSION_ERROR:", error);
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
            if (step === 'video-loading') setStep('results');
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

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      performCapture();
      setCountdown(null);
    }
  }, [countdown]);

  useEffect(() => {
    if (step !== 'processing') return;
    const timer = setInterval(() => {
      setProcessingMsgIdx((prev) => (prev + 1) % translatedProcessingMessages.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [step]);

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
    ctx.font = 'bold 36px "Google Sans", sans-serif'; 
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
    ctx.font = 'bold 38px "Google Sans", sans-serif';
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
    setVideoStatus('IDLE');
    setVideoJobId(null);
    setVideoUrl(null);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

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
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'AI failed to generate vision.');
      }

      const aiResult = response.data;
      
      setSelectedActivity(aiResult.selectedActivity);
      setSelectedScene(aiResult.selectedScene);
      setSelectedStyle(style);

      const bakedPolaroid = await composePolaroid(aiResult.transformedPhotoDataUri, aiResult.selectedActivity);
      setResultImage(bakedPolaroid);
      setStep('results');

      if (db) {
        setIsSaving(true);
        const data = {
          imageData: bakedPolaroid,
          activity: aiResult.selectedActivity,
          theme: theme.title,
          createdAt: new Date().toISOString(),
          ownerId: auth.currentUser?.uid
        };
        const visionsRef = collection(db, 'visions');

        addDoc(visionsRef, data)
          .then((docRef) => {
            setVisionId(docRef.id);
            setIsSaving(false);
            triggerVideoGeneration(docRef.id, bakedPolaroid);
          })
          .catch(async (serverError) => {
            console.error("FIRESTORE_SAVE_ERROR:", serverError);
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
      console.error("VISION_GENERATION_FAILED:", error);
      setStep('select-style');
      toast({ 
        variant: 'destructive', 
        title: 'AI Generation Error', 
        description: error.message || 'AI failed to generate vision. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerInstantSurprise = () => {
    const randomTheme = translatedThemes[Math.floor(Math.random() * translatedThemes.length)];
    const randomVariation = randomTheme.variations[Math.floor(Math.random() * randomTheme.variations.length)];
    const randomStyle = translatedStyles[Math.floor(Math.random() * translatedStyles.length)];

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
    setVideoStatus('IDLE');
    setVideoJobId(null);
    setVideoUrl(null);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    router.push('/');
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
      case 'theme-racing': return <>Leading the<br />pack today!</>;
      case 'theme-alpine': return <>Reaching new<br />heights!</>;
      default: return <>Looking good,<br />good lookin'!</>;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4">
      {step === 'capture' && (
        <div className="w-full space-y-8 text-center animate-in zoom-in duration-500">
          <h2 className="text-4xl md:text-7xl font-bold text-white font-headline">
            {countdown === 1 || countdown === 0 ? "Smile!" : "Strike a Pose"}
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
                <label htmlFor="wheelchair" className="text-lg md:text-xl text-white/70 font-headline cursor-pointer">{t('camera_wheelchair')}</label>
              </div>
              <Button 
                onClick={triggerInstantSurprise}
                variant="outline"
                className="h-auto py-3 px-8 md:py-4 md:px-10 text-lg md:text-xl rounded-full bg-white text-black border-transparent hover:bg-zinc-100 font-bold transition-all shadow-xl group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-10 transition-opacity" />
                <Sparkles className="mr-2 h-5 w-5 md:h-6 md:w-6 text-purple-500" />
                Surprise me!
              </Button>
            </div>
          </div>
          
          <div className="w-full max-w-7xl mx-auto overflow-x-auto pb-8 snap-x scrollbar-subtle">
            <div className="flex gap-4 md:gap-6 px-4 md:px-12 min-w-full">
              {translatedThemes.map((theme) => (
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
              {translatedStyles.map((style) => (
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
          </div>

          <div className="space-y-4 max-w-2xl px-4">
            <h2 className="text-3xl md:text-5xl text-white font-headline font-bold">
              {translatedProcessingMessages[processingMsgIdx]}
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
            <h2 className="text-6xl md:text-8xl font-bold text-white font-headline">{t('result_title')}</h2>
            
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
            
            <p className="text-xl md:text-2xl text-white/50 font-headline">{t('result_subtitle')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button onClick={() => setStep('refine')} variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-xl border-white/20 hover:bg-white/5 text-white">{t('btn_adjust_style')}</Button>
              {globalVideoCount < 100 && videoStatus !== 'FAILED' ? (
                <Button 
                  onClick={() => {
                    if (videoStatus === 'SUCCEEDED') setStep('video-results');
                    else setStep('video-loading');
                  }} 
                  className="w-full sm:w-auto bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-full px-8 py-6 text-xl flex items-center gap-2"
                >
                  <Film className="w-5 h-5" />
                  Make it a Video
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
                 <span className="text-sm uppercase tracking-wider">{t('btn_generating_video')}</span>
               </div>
            )}
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
                      const theme = translatedThemes.find(t => t.id === val);
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
                      {translatedThemes.map(t => (
                        <SelectItem key={t.id} value={t.id} className="text-lg md:text-xl py-3 md:py-4 focus:bg-[#4285F4] focus:text-white transition-colors cursor-pointer">
                          {toLowerFirst(t.title)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 group w-full">
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
                            {toLowerFirst(v.activity)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 group w-full">
                  <span className="text-xl md:text-3xl font-bold text-white md:w-48 md:text-right font-headline whitespace-nowrap">in the style of</span>
                  <div className="flex-1 w-full">
                    <Select 
                      value={selectedStyle?.id} 
                      onValueChange={(val) => {
                        const style = translatedStyles.find(s => s.id === val);
                        if (style) setSelectedStyle(style);
                      }}
                    >
                      <SelectTrigger className="w-full bg-transparent border-2 border-[#4285F4] hover:bg-[#4285F4]/5 text-white h-14 md:h-20 rounded-full px-6 md:px-8 text-lg md:text-2xl transition-all shadow-[0_0_15px_rgba(66,144,255,0.1)]">
                        <SelectValue placeholder="Select a style" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                        {translatedStyles.map(s => (
                          <SelectItem key={s.id} value={s.id} className="text-lg md:text-xl py-3 md:py-4 focus:bg-[#4285F4] focus:text-white transition-colors cursor-pointer">
                            {s.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col pt-4">
                <Button 
                  onClick={() => generateVision()}
                  className="w-full h-20 md:h-32 text-2xl md:text-4xl rounded-full bg-gradient-to-r from-[#4285F4] to-[#4290FF] hover:opacity-90 text-white font-bold shadow-2xl transition-all active:scale-95"
                >
                  Make these updates
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {t('video_loading_title')}
            </h2>
            <p className="text-sm md:text-xl text-white/40 font-headline uppercase tracking-[0.2em] font-medium">
              {t('video_loading_subtitle')}
            </p>
          </div>
        </div>
      )}

      {step === 'video-results' && videoUrl && (
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700 py-8 text-center">
          {/* Row 1: Video */}
          <div className="bg-black p-4 rounded-xl shadow-2xl w-full max-w-4xl aspect-video overflow-hidden border border-white/10">
            <video src={videoUrl} autoPlay loop playsInline className="w-full h-full object-cover" />
          </div>
          
          {/* Row 2: Content */}
          <div className="space-y-8 flex flex-col items-center w-full">
            <h2 className="text-5xl md:text-7xl font-bold text-white font-headline">{t('video_result_title')}</h2>
            
            <div className="flex flex-col items-center gap-6">
              <div className="relative bg-white p-4 rounded-2xl w-48 h-48 md:w-64 md:h-64 shadow-2xl flex items-center justify-center">
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
              </div>
              <p className="text-xl md:text-2xl text-white/50 font-headline">{t('video_result_subtitle')}</p>
              <Button onClick={() => setStep('thanks')} className="bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-full px-12 py-6 text-xl font-bold shadow-xl transition-all active:scale-95">
                {t('btn_done')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'thanks' && (
        <div className="text-center space-y-10 animate-in zoom-in duration-500 py-20">
          <h2 className="text-5xl md:text-7xl font-bold text-white font-headline">{t('thanks_title')}</h2>
          <Button onClick={resetKiosk} className="bg-white text-[#4285F4] hover:bg-zinc-100 rounded-full px-12 py-6 md:px-16 md:py-8 text-xl md:text-2xl font-bold transition-all shadow-xl">{t('thanks_start_over')}</Button>
        </div>
      )}
    </div>
  );
}
