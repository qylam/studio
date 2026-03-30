
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, ChevronLeft, ArrowLeft, RefreshCcw, Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { generateThemedPhoto } from '@/ai/flows/generate-themed-photo';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/i18n/LanguageProvider';
import { dictionaries, TranslationKey } from '@/i18n/dictionaries';
import { collection, addDoc, doc } from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { ref, uploadString, getDownloadURL, uploadBytes } from 'firebase/storage';
import { useFirestore, useAuth, useStorage, useMemoFirebase } from '@/firebase';
import { startVideoGeneration, checkVideoJobStatus } from '@/ai/flows/video';
import { useDoc } from '@/firebase/firestore/use-doc';
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
  { id: 'style-figurine' },
  { id: 'style-keychain' },
  { id: 'style-oil' },
  { id: 'style-clay' },
  { id: 'style-editorial' },
  { id: 'style-cinematic' },
  { id: 'style-noir' },
  { id: 'style-visionary' } 
];

const THEMES = [
  { id: 'theme-recipe', variationCount: 3 },
  { id: 'theme-zen', variationCount: 3 },
  { id: 'theme-active', variationCount: 3 },
  { id: 'theme-break', variationCount: 3 },
  { id: 'theme-skill', variationCount: 3 },
  { id: 'theme-creative', variationCount: 3 },
  { id: 'theme-imagination', variationCount: 3 },
  { id: 'theme-green', variationCount: 3 },
  { id: 'theme-culinary', variationCount: 3 },
  { id: 'theme-warrior', variationCount: 3 },
  { id: 'theme-racing', variationCount: 3 },
  { id: 'theme-alpine', variationCount: 3 }   
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
  const [selectedVariationIdx, setSelectedVariationIdx] = useState<number | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [visionId, setVisionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  const [processingMsgIdx, setProcessingMsgIdx] = useState(0);
  
  const [videoStatus, setVideoStatus] = useState<'IDLE' | 'STARTING' | 'PENDING' | 'SUCCEEDED' | 'FAILED'>('IDLE');
  const [videoJobId, setVideoJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();
  const router = useRouter();
  const { t, language } = useLanguage();
  const db = useFirestore();
  const auth = useAuth();
  const storage = useStorage();

  const statsDocRef = useMemoFirebase(() => {
    if (!db) return null;
    return doc(db, 'metadata', 'globalStats');
  }, [db]);
  const { data: statsData } = useDoc<{videoCount: number}>(statsDocRef);
  const globalVideoCount = statsData?.videoCount || 0;

  const translatedProcessingMessages = [
    t('loading_message_0'),
    t('loading_message_1'),
    t('loading_message_2'),
    t('loading_message_3'),
    t('loading_message_4'),
  ];

  const toLowerFirst = (s: string | undefined | null) => {
    if (!s) return '';
    return s.charAt(0).toLowerCase() + s.slice(1);
  };

  const getDropdownText = (baseKey: string, isLowerFirst: boolean = false) => {
    if (language === 'ko') {
      const shortKey = `${baseKey}_short` as TranslationKey;
      const shortText = t(shortKey);
      if (shortText !== shortKey) {
        return shortText;
      }
    }
    const text = t(baseKey as TranslationKey);
    return isLowerFirst ? toLowerFirst(text) : text;
  };
  
  useEffect(() => {
    if (selectedTheme && selectedVariationIdx === null) {
      setSelectedVariationIdx(0);
    }
  }, [selectedTheme, selectedVariationIdx]);

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
  }, [videoStatus, videoJobId, visionId]);

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
    if (step === 'processing') {
      const timer = setInterval(() => {
        setProcessingMsgIdx((prev) => (prev + 1) % translatedProcessingMessages.length);
      }, 2500);
      return () => clearInterval(timer);
    }
  }, [step, translatedProcessingMessages.length]);

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

  const composePolaroid = async (imageUrl: string, themeId: string): Promise<string> => {
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
    const logoY = 32;
    
    const logoImg = new Image();
    logoImg.src = '/images/Gemini_PrimaryLogo_FullColor.png'; // Reusing branding logo
    await new Promise((resolve) => {
      logoImg.onload = resolve;
    });
    
    const logoAspectRatio = logoImg.width / logoImg.height;
    const drawHeight = 48;
    const drawWidth = drawHeight * logoAspectRatio;
    
    // Check if the logo is the "White" version and the canvas is white - might need a background or different logo version
    ctx.drawImage(logoImg, SIDE_MARGIN, logoY, drawWidth, drawHeight);
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

    const themeName = themeId ? themeId.split('-')[1] : '';
    const captionKey = themeName ? `caption_${themeName}` as TranslationKey : 'caption_default';

    let caption = t(captionKey);
    if (caption === captionKey) {
      caption = t('caption_default');
    } 
    
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
    const randomIndex = Math.floor(Math.random() * theme.variationCount);
    setSelectedVariationIdx(randomIndex); 
    setStep('select-style');
  };

  const generateVision = async (
    styleOverride?: typeof STYLES[0],
    themeOverride?: typeof THEMES[0],
    variationIdxOverride?: number
  ) => {
    const theme = themeOverride || selectedTheme;
    const style = styleOverride || selectedStyle;
    const variationIdx = variationIdxOverride !== undefined ? variationIdxOverride : selectedVariationIdx;

    if (!capturedImage || !theme || !isAuthReady || !style || variationIdx === null) return;
    
    setIsProcessing(true);
    setStep('processing');
    setVisionId(null);
    setVideoStatus('IDLE');
    setVideoJobId(null);
    setVideoUrl(null);
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);

    try {
      const enDict = dictionaries.en;
      const themeName = theme.id.split('-')[1];
      const styleName = style.id.split('-')[1];

      const sceneEn = enDict[`theme_${themeName}_var${variationIdx}_scene` as TranslationKey];
      const activityEn = enDict[`theme_${themeName}_var${variationIdx}_activity` as TranslationKey];
      const detailEn = enDict[`style_${styleName}_detail` as TranslationKey];
      const themeTitleEn = enDict[`theme_${themeName}_title` as TranslationKey];

      const details = [detailEn]; 
      if (isWheelchairUser) details.push('subject is using a wheelchair');
      
      const response = await generateThemedPhoto({
        photoDataUri: capturedImage,
        themeVariations: [], 
        scene: sceneEn,
        activity: activityEn,
        details: details,
      });
      
      if (!response.success || !response.data) {
        throw new Error(response.error || 'AI failed to generate vision.');
      }

      const aiResult = response.data;
      
      setSelectedVariationIdx(variationIdx);
      setSelectedStyle(style);

      const bakedPolaroid = await composePolaroid(aiResult.transformedPhotoDataUri, theme.id);
      setResultImage(bakedPolaroid);
      setStep('results');

      if (db && storage) {
        setIsSaving(true);
        try {
          const imagePath = `visions/${auth.currentUser?.uid || 'anonymous'}/${Date.now()}.jpg`;
          const rawImagePath = imagePath.replace('.jpg', '_raw.jpg');
          
          const imageRef = ref(storage, imagePath);
          const rawImageRef = ref(storage, rawImagePath);

          const uploadFlexibleImage = async (storageRef: any, source: string) => {
            if (source.startsWith('data:')) {
              await uploadString(storageRef, source, 'data_url');
            } else {
              const res = await fetch(source);
              const blob = await res.blob();
              await uploadBytes(storageRef, blob);
            }
          };

          await Promise.all([
            uploadString(imageRef, bakedPolaroid, 'data_url'),
            uploadFlexibleImage(rawImageRef, aiResult.transformedPhotoDataUri)
          ]);

          const [downloadUrl, rawDownloadUrl] = await Promise.all([
            getDownloadURL(imageRef),
            getDownloadURL(rawImageRef)
          ]);

          const data = {
            imageUrl: downloadUrl,
            rawImageUrl: rawDownloadUrl,
            activity: activityEn,
            theme: themeTitleEn,
            themeId: theme.id,
            createdAt: new Date().toISOString(),
            ownerId: auth.currentUser?.uid
          };
          const visionsRef = collection(db, 'visions');

          const docRef = await addDoc(visionsRef, data);
          setVisionId(docRef.id);
          setIsSaving(false);
          triggerVideoGeneration(docRef.id, aiResult.transformedPhotoDataUri);

        } catch (serverError) {
          console.error("STORAGE_OR_FIRESTORE_SAVE_ERROR:", serverError);
          setIsSaving(false);
          toast({ 
            variant: 'destructive', 
            title: 'Save Error', 
            description: 'Could not save your image to the cloud.' 
          });
        }
      }
    } catch (error: any) {
      console.error("VISION_GENERATION_FAILED:", error);
      setStep('select-style');
      toast({ 
        variant: 'destructive', 
        title: 'AI Generation Error', 
        description: error?.message || 'AI failed to generate vision. Please try again.' 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerInstantSurprise = () => {
    const randomTheme = THEMES[Math.floor(Math.random() * THEMES.length)];
    const randomIndex = Math.floor(Math.random() * randomTheme.variationCount);
    const randomStyle = STYLES[Math.floor(Math.random() * STYLES.length)];

    setSelectedTheme(randomTheme);
    setSelectedVariationIdx(randomIndex); 
    setSelectedStyle(randomStyle);

    generateVision(randomStyle, randomTheme, randomIndex);
  };

  const resetKiosk = () => {
    setStep('capture');
    setCapturedImage(null);
    setResultImage(null);
    setVisionId(null);
    setSelectedTheme(null);
    setSelectedStyle(null);
    setSelectedVariationIdx(null);
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
    return `${baseUrl}/share/${visionId}?lang=${language}`;
  };

  const getRefineGreeting = (themeId?: string) => {
    const themeName = themeId ? themeId.split('-')[1] : '';
    const greetingKey = themeName ? `refine_greet_${themeName}` as TranslationKey : 'refine_greet_default';
  
    let text = t(greetingKey);
    if (text === greetingKey) {
      text = t('refine_greet_default');
    }
  
    const parts = text.split('\n');
  
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && <br />}
          </React.Fragment>
        ))}
      </>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh] px-4">
      {step === 'capture' && (
        <div className="w-full space-y-8 text-center animate-in zoom-in duration-500">
          <h2 className="text-4xl md:text-7xl font-bold text-white font-headline">
            {countdown === 1 || countdown === 0 ? t('camera_smile' as TranslationKey) : t('camera_title' as TranslationKey)}
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
              {countdown !== null ? t('camera_rdy_title' as TranslationKey) : t('camera_btn_take' as TranslationKey)}
            </Button>
            <Button variant="ghost" onClick={() => router.push('/')} className="text-white/40 text-lg md:text-xl font-headline">
              <ArrowLeft className="mr-2 h-5 w-5 md:h-6 md:w-6" />
              {t('btn_back' as TranslationKey)}
            </Button>
          </div>
        </div>
      )}

      {step === 'review' && capturedImage && (
        <div className="w-full space-y-8 text-center animate-in zoom-in duration-500">
          <h2 className="text-4xl md:text-7xl font-bold text-white font-headline">{t('camera_continue_subtitle' as TranslationKey)}</h2>
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
              {t('camera_btn_retake' as TranslationKey)}
            </Button>
            <Button 
              onClick={() => setStep('select-theme')}
              className="w-full md:w-auto btn-google-blue h-auto py-4 px-8 md:py-6 md:px-12 text-xl md:text-2xl rounded-full"
            >
              <Check className="mr-3 h-6 w-6 md:h-8 md:w-8" />
              {t('camera_btn_continue' as TranslationKey)}
            </Button>
          </div>
        </div>
      )}

      {step === 'select-theme' && (
        <div className="w-full space-y-12 animate-in fade-in duration-500">
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-white font-headline leading-tight">{t('theme_title')}</h2>
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
                {t('btn_surprise' as TranslationKey)}
              </Button>
            </div>
          </div>
          
          <div className="w-full max-w-7xl mx-auto overflow-x-auto pb-8 snap-x scrollbar-subtle">
            <div className="flex gap-4 md:gap-6 px-4 md:px-12 min-w-full">
              {THEMES.map((theme) => (
                <div 
                  key={theme.id} 
                  onClick={() => handleThemeSelect(theme)} 
                  className={cn(
                    "group flex-shrink-0 cursor-pointer relative w-[240px] md:w-[320px] aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-zinc-900 snap-center",
                    selectedTheme?.id === theme.id 
                      ? "border-[#4285F4] scale-[1.02] shadow-[0_0_30px_rgba(66,133,244,0.3)]" 
                      : "border-transparent hover:border-[#4285F4]/50"
                  )}
                >
                  <img 
                    src={PlaceHolderImages.find(i => i.id === theme.id)?.imageUrl || ''} 
                    alt={t(`theme_${theme.id.split('-')[1]}_title` as TranslationKey)} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-white font-headline">{t(`theme_${theme.id.split('-')[1]}_title` as TranslationKey)}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-8">
             <Button variant="ghost" onClick={() => setStep('review')} className="text-white/40 text-lg md:text-xl font-headline">
               <ChevronLeft className="mr-2 h-5 w-5 md:h-6 md:w-6" />
               {t('btn_back' as TranslationKey)}
             </Button>
          </div>
        </div>
      )}

      {step === 'select-style' && (
        <div className="w-full space-y-12 animate-in fade-in duration-500">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-white font-headline">{t('style_title')}</h2>
          </div>

          <div className="w-full max-w-7xl mx-auto overflow-x-auto pb-8 snap-x scrollbar-subtle">
            <div className="flex gap-4 md:gap-6 px-4 md:px-12 min-w-full">
              {STYLES.map((style) => (
                <div 
                  key={style.id} 
                  onClick={() => generateVision(style)} 
                  className={cn(
                    "group flex-shrink-0 cursor-pointer relative w-[240px] md:w-[320px] aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-zinc-900 snap-center",
                    selectedStyle?.id === style.id 
                      ? "border-[#4285F4] scale-[1.02] shadow-[0_0_30px_rgba(66,133,244,0.3)]" 
                      : "border-transparent hover:border-[#4285F4]/50"
                  )}
                >
                  <img 
                    src={PlaceHolderImages.find(i => i.id === style.id)?.imageUrl || ''} 
                    alt={t(`style_${style.id.split('-')[1]}_title` as TranslationKey)} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-end p-4 md:p-6">
                    <h3 className="text-lg md:text-xl font-bold text-white font-headline">{t(`style_${style.id.split('-')[1]}_title` as TranslationKey)}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-8">
             <Button variant="ghost" onClick={() => setStep('select-theme')} className="text-white/40 text-lg md:text-xl font-headline">
               <ChevronLeft className="mr-2 h-5 w-5 md:h-6 md:w-6" />
               {t('btn_back' as TranslationKey)}
             </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="w-full space-y-12 text-center py-12 md:py-20 flex flex-col items-center">
          <div className="flex flex-col items-center gap-8 mb-8">
            <Loader2 className="w-24 h-24 text-[#4285F4] animate-spin" />
          </div>

          <div className="space-y-4 max-w-2xl px-4">
            <h2 className="text-3xl md:text-5xl text-white font-headline font-bold transition-all duration-500 min-h-[4rem] flex items-center justify-center">
              {translatedProcessingMessages[processingMsgIdx]}
            </h2>
            <p className="text-sm md:text-xl text-white/40 font-headline uppercase tracking-[0.2em] font-medium">
              {t('loading_subtitle' as TranslationKey)}
            </p>
          </div>
        </div>
      )}

      {step === 'results' && resultImage && (
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 animate-in fade-in zoom-in duration-700 py-8 px-4">
  
          {/* LEFT COLUMN: Image */}
          <div className="bg-white p-4 md:p-6 pb-12 md:pb-20 rounded-sm shadow-2xl transform rotate-1 w-full max-w-xs md:max-w-md lg:max-w-lg flex-shrink-0">
            <img src={resultImage} alt="AI Vision" className="w-full h-auto object-contain" />
          </div>

          {/* RIGHT COLUMN: Content */}
          <div className="flex-1 w-full flex flex-col items-center md:items-start space-y-8 text-center md:text-left">
            <h2 className="text-6xl md:text-8xl font-bold text-white font-headline">
              {t('result_title')}
            </h2>
            
            <div className="flex flex-col items-center md:items-start gap-8">
              <div className="relative bg-white p-4 rounded-2xl w-48 h-48 md:w-64 md:h-64 shadow-2xl flex items-center justify-center">
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
              
              <p className="text-xl md:text-2xl text-white/50 font-headline">
                {t('result_subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start w-full">
                <Button onClick={() => setStep('refine')} variant="outline" className="w-full sm:w-auto rounded-full px-8 py-6 text-xl border-white/20 hover:bg-white/5 text-white">
                  {t('btn_adjust_style')}
                </Button>
                <Button onClick={() => setStep('thanks')} className="w-full sm:w-auto bg-[#4285F4] hover:bg-[#4285F4]/90 rounded-full px-8 py-6 text-xl">
                  {t('btn_done')}
                </Button>
              </div>
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
              {t('refine_description')}
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
                  <span className="text-xl md:text-3xl font-bold text-white md:min-w-max md:text-right font-headline whitespace-nowrap flex-shrink-0">
                    {t('refine_label_imagine')}
                  </span>
                  <Select 
                    value={selectedTheme?.id} 
                    onValueChange={(val) => {
                      const theme = THEMES.find(themeItem => themeItem.id === val);
                      if (theme) {
                        setSelectedTheme(theme);
                        setSelectedVariationIdx(0);
                      }
                    }}
                  >
                    <SelectTrigger className="w-full flex-1 bg-transparent border-2 border-[#4285F4] hover:bg-[#4285F4]/5 text-white h-14 md:h-20 rounded-full px-6 md:px-8 text-lg md:text-2xl transition-all shadow-[0_0_15px_rgba(66,144,255,0.1)]">
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                      {THEMES.map(themeItem => (                                                                                                                                                 
                        <SelectItem key={themeItem.id} value={themeItem.id} className="text-lg md:text-xl py-3 md:py-4 focus:bg-[#4285F4] focus:text-white transition-colors cursor-pointer">      
                          {getDropdownText(`theme_${themeItem.id.split('-')[1]}_title`, true)} 
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 group w-full">
                  <div className="flex-1 w-full">
                    <Select 
                      value={selectedVariationIdx !== null ? selectedVariationIdx.toString() : ''}
                      onValueChange={(val) => setSelectedVariationIdx(parseInt(val, 10))}
                    >
                      <SelectTrigger className="w-full bg-transparent border-2 border-[#4285F4] hover:bg-[#4285F4]/5 text-white h-14 md:h-20 rounded-full px-6 md:px-8 text-lg md:text-2xl transition-all shadow-[0_0_15px_rgba(66,144,255,0.1)]">
                        <SelectValue placeholder="Select an activity" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                        {selectedTheme && Array.from({ length: selectedTheme.variationCount }).map((_, i) => (
                          <SelectItem key={i} value={i.toString()} className="text-lg md:text-xl py-3 md:py-4 focus:bg-[#4285F4] focus:text-white transition-colors cursor-pointer">  
                            {getDropdownText(`theme_${selectedTheme.id.split('-')[1]}_var${i}_activity`, true)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 group w-full">
                  <span className="text-xl md:text-3xl font-bold text-white md:min-w-max md:text-right font-headline whitespace-nowrap flex-shrink-0">
                    {t('refine_label_style')}
                  </span>
                  <div className="flex-1 w-full">
                    <Select 
                      value={selectedStyle?.id} 
                      onValueChange={(val) => {
                        const style = STYLES.find(s => s.id === val);
                        if (style) setSelectedStyle(style);
                      }}
                    >
                      <SelectTrigger className="w-full bg-transparent border-2 border-[#4285F4] hover:bg-[#4285F4]/5 text-white h-14 md:h-20 rounded-full px-6 md:px-8 text-lg md:text-2xl transition-all shadow-[0_0_15px_rgba(66,144,255,0.1)]">
                        <SelectValue placeholder="Select a style" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white rounded-2xl">
                        {STYLES.map(s => (
                          <SelectItem key={s.id} value={s.id} className="text-lg md:text-xl py-3 md:py-4 focus:bg-[#4285F4] focus:text-white transition-colors cursor-pointer">
                            {getDropdownText(`style_${s.id.split('-')[1]}_title`, false)}
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
                  {t('btn_generate')}
                </Button>
              </div>
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
