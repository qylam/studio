
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCcw, Zap, ChevronLeft, QrCode, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { generateThemedPhoto } from '@/ai/flows/generate-themed-photo';
import { cn } from '@/lib/utils';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type KioskStep = 'capture' | 'theme' | 'refine' | 'processing' | 'result';

const THEME_OPTIONS = [
  { id: 'teaching', label: 'Level up my teaching', scene: 'in a modern classroom', activity: 'teaching complex science with holographic projections', seed: '101' },
  { id: 'recipe', label: 'Learn a new recipe', scene: 'in a professional gourmet kitchen', activity: 'preparing a masterpiece dish with fresh ingredients', seed: '102' },
  { id: 'zen', label: 'Find my zen', scene: 'in a serene Japanese garden', activity: 'meditating peacefully near a koi pond', seed: '103' },
  { id: 'active', label: 'Get more active', scene: 'on a scenic mountain trail', activity: 'running a marathon with determination', seed: '104' },
  { id: 'break', label: 'Take a well-earned break', scene: 'on a tropical beach at sunset', activity: 'relaxing in a hammock with a book', seed: '105' },
  { id: 'skill', label: 'Learn a new skill', scene: 'in a high-tech workshop', activity: 'building a custom robot', seed: '106' },
  { id: 'creative', label: 'Get more creative', scene: 'in a vibrant art studio', activity: 'painting a large abstract mural', seed: '107' },
  { id: 'imagination', label: 'Let my imagination loose', scene: 'in a fantastical steampunk city', activity: 'piloting a wooden airship', seed: '108' },
];

const AVAILABLE_DETAILS = [
  "an unimpressed tutor",
  "an Andy Warhol haircut",
  "a group of breakdancers",
  "glowing spores",
  "vaporwave lighting",
  "floating islands",
  "robotic assistant",
  "neon highlights",
  "cinematic lighting",
  "retro aesthetic",
  "cyberpunk style",
  "soft bokeh",
  "underwater bubbles",
  "digital oil painting",
  "3D claymation"
];

export default function KioskFlow() {
  const [step, setStep] = useState<KioskStep>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scene, setScene] = useState('');
  const [activity, setActivity] = useState('');
  const [details, setDetails] = useState<string[]>([]);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isWheelchairUser, setIsWheelchairUser] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (step === 'capture' && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Camera error:", err));
    }
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [step]);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      performCapture();
      setCountdown(null);
    }
  }, [countdown]);

  const startCountdown = () => {
    if (countdown !== null) return;
    setCountdown(3);
  };

  const performCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        setStep('theme');
      }
    }
  };

  const handleThemeSelect = (theme: typeof THEME_OPTIONS[0]) => {
    setScene(theme.scene);
    setActivity(theme.activity);
    
    // Initialize details with wheelchair status if selected
    const initialDetails = isWheelchairUser ? ['subject is using a wheelchair'] : [];
    setDetails(initialDetails);
    
    setStep('refine');
  };

  const handleGenerate = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setStep('processing');
    
    try {
      const response = await generateThemedPhoto({
        photoDataUri: capturedImage,
        scene,
        activity,
        details,
      });
      setResultImage(response.transformedPhotoDataUri);
      setStep('result');
    } catch (error) {
      console.error("Generation failed", error);
      setStep('refine');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetKiosk = () => {
    setStep('capture');
    setCapturedImage(null);
    setResultImage(null);
    setCountdown(null);
    setScene('');
    setActivity('');
    setDetails([]);
    setIsWheelchairUser(false);
  };

  const toggleDetail = (detail: string) => {
    if (details.includes(detail)) {
      setDetails(details.filter(d => d !== detail));
    } else {
      setDetails([...details, detail]);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[80vh]">
      
      {step === 'capture' && (
        <div className="w-full space-y-8 text-center animate-in zoom-in duration-500">
          <h2 className="text-6xl font-bold tracking-tight text-white font-headline">Strike a Pose</h2>
          <div className="relative overflow-hidden aspect-video max-w-4xl mx-auto rounded-[2rem] border-2 border-white/10 bg-zinc-900">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror transform -scale-x-100" />
            <canvas ref={canvasRef} className="hidden" />
            
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-50">
                <span className="text-[12rem] font-black italic font-headline text-white drop-shadow-[0_0_30px_rgba(66,133,244,0.8)] animate-in zoom-in duration-300">
                  {countdown > 0 ? countdown : "Smile!"}
                </span>
              </div>
            )}
          </div>
          <Button 
            onClick={startCountdown} 
            disabled={countdown !== null}
            className={cn(
              "btn-google-blue h-auto py-6 px-12 text-2xl rounded-full transition-all duration-300 font-bold tracking-tight font-headline",
              countdown !== null && "opacity-50 grayscale scale-95"
            )}
          >
            <Camera className="mr-3 h-8 w-8" />
            {countdown !== null ? 'Get Ready...' : 'Take your Photo'}
          </Button>
        </div>
      )}

      {step === 'theme' && (
        <div className="w-full h-full flex flex-col p-12 animate-in fade-in slide-in-from-right duration-500 relative bg-black">
          {/* Back Arrow */}
          <button 
            onClick={() => setStep('capture')}
            className="absolute top-12 left-12 text-white hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-12 h-12" />
          </button>

          {/* Header */}
          <div className="mb-12 space-y-2 pl-20">
            <h1 className="text-6xl font-bold tracking-tight text-white font-headline">
              What would you do<br />with your free time?
            </h1>
            <p className="text-xl text-white/60 font-medium">
              Picture yourself with up to 10 hours back per week.
            </p>
          </div>

          {/* Wheelchair Checkbox */}
          <div className="flex items-center space-x-4 mb-12 pl-20">
            <Checkbox 
              id="wheelchair" 
              checked={isWheelchairUser}
              onCheckedChange={(checked) => setIsWheelchairUser(!!checked)}
              className="w-8 h-8 rounded-md border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <label htmlFor="wheelchair" className="text-xl font-medium text-white/80 cursor-pointer">
              I'm a wheelchair user
            </label>
          </div>

          {/* Theme Carousel */}
          <div className="w-full relative px-20">
            <Carousel
              opts={{
                align: "start",
                loop: false,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-8">
                {THEME_OPTIONS.map((theme) => (
                  <CarouselItem key={theme.id} className="pl-8 basis-1/1 sm:basis-1/2 lg:basis-1/4">
                    <div 
                      onClick={() => handleThemeSelect(theme)}
                      className="group cursor-pointer space-y-6 transition-transform hover:scale-105"
                    >
                      <div className="aspect-square rounded-[2rem] overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl transition-all group-hover:border-white/30">
                        <img 
                          src={`https://picsum.photos/seed/${theme.seed}/600/600`} 
                          alt={theme.label} 
                          className="w-full h-full object-cover"
                          data-ai-hint="themed vision"
                        />
                      </div>
                      <h3 className="text-2xl font-bold text-center text-white leading-tight">
                        {theme.label}
                      </h3>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="bg-white/10 border-white/10 text-white hover:bg-white/20 left-4" />
              <CarouselNext className="bg-white/10 border-white/10 text-white hover:bg-white/20 right-4" />
            </Carousel>
          </div>

          {/* Footer Branding */}
          <div className="absolute bottom-8 left-12">
             <span className="text-xl font-bold text-white/20 font-headline">Google</span>
          </div>
          <div className="absolute bottom-8 right-12">
            <Sparkles className="w-10 h-10 text-white/20" />
          </div>
        </div>
      )}

      {step === 'refine' && (
        <div className="w-full animate-in fade-in slide-in-from-right duration-500">
          <button 
            onClick={() => setStep('theme')}
            className="flex items-center text-white/60 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft className="w-6 h-6 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xl font-medium font-headline">Back to Themes</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-7xl font-bold leading-tight tracking-tighter text-white font-headline">
                  Refine your<br />vision
                </h1>
                <p className="text-xl text-white/70 max-w-md leading-relaxed">
                  Tweak the details to make this masterpiece truly yours.
                </p>
              </div>
              <div className="aspect-square w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-900 border border-white/5">
                {capturedImage && (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover mirror transform -scale-x-100" />
                )}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-12">
              <div className="space-y-8">
                <div className="flex items-center space-x-6">
                  <span className="text-2xl font-medium text-white min-w-[140px] font-headline">Imagine me</span>
                  <div className="flex-grow">
                    <Input 
                      value={scene}
                      onChange={(e) => setScene(e.target.value)}
                      className="bg-transparent border-[#4285F4] text-xl py-6 rounded-full px-8 focus-visible:ring-1 focus-visible:ring-[#4285F4]"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <span className="text-2xl font-medium text-white min-w-[140px] font-headline">while</span>
                  <div className="flex-grow">
                    <Input 
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="bg-transparent border-[#4285F4] text-xl py-6 rounded-full px-8 focus-visible:ring-1 focus-visible:ring-[#4285F4]"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-6">
                  <div className="pt-3">
                    <span className="text-2xl font-medium text-white min-w-[140px] block font-headline">with</span>
                  </div>
                  <div className="flex-grow flex flex-wrap gap-3">
                    {AVAILABLE_DETAILS.map((detail) => (
                      <Button
                        key={detail}
                        variant="outline"
                        onClick={() => toggleDetail(detail)}
                        className={cn(
                          "rounded-full px-6 py-4 h-auto text-lg transition-all font-headline",
                          details.includes(detail) 
                            ? "bg-[#4285F4] border-[#4285F4] text-white hover:bg-[#4285F4]/90" 
                            : "bg-transparent border-white/10 text-white/70 hover:border-[#4285F4] hover:text-white"
                        )}
                      >
                        {detail}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <Button 
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white rounded-full px-12 py-8 text-2xl font-bold shadow-lg shadow-[#4285F4]/20 font-headline"
                >
                  <Zap className="mr-2 h-6 w-6" />
                  Generate Vision
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="w-full space-y-12 text-center py-20 animate-in fade-in duration-1000">
          <div className="relative inline-block">
            <div className="w-48 h-48 border-4 border-[#4285F4]/20 rounded-full animate-spin border-t-[#4285F4]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-16 h-16 text-[#4285F4] animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight text-white uppercase italic font-headline">AI is Dreaming...</h2>
            <p className="text-white/50 text-xl font-mono animate-pulse">Synthesizing your masterpiece...</p>
          </div>
        </div>
      )}

      {step === 'result' && resultImage && (
        <div className="w-full space-y-8 animate-in zoom-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-7xl font-bold tracking-tighter text-white leading-none font-headline">Your New Reality</h2>
                <p className="text-2xl text-[#4285F4] font-medium font-headline">Reimagined by Gemini</p>
              </div>
              
              <div className="p-10 bg-zinc-900/50 backdrop-blur-md rounded-[3rem] border border-white/10 space-y-8">
                <div className="flex items-center space-x-6">
                  <div className="bg-[#4285F4] p-5 rounded-3xl">
                    <QrCode className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-2xl font-bold font-headline">Scan to Download</h4>
                    <p className="text-white/50 text-lg leading-tight font-headline">Take your HD creation home and share the inspiration.</p>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] w-64 h-64 mx-auto flex items-center justify-center shadow-2xl">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/share/mock-id`} 
                    alt="QR Code" 
                    className="w-full h-full"
                  />
                </div>
              </div>

              <Button onClick={resetKiosk} className="w-full py-8 text-2xl font-bold rounded-full border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center font-headline">
                <RefreshCcw className="mr-3 h-6 w-6" />
                Create Another
              </Button>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#4285F4] to-[#9B72CB] rounded-[3.5rem] blur-2xl opacity-30"></div>
              <div className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden shadow-2xl border border-white/10">
                <img src={resultImage} alt="Transformation" className="w-full h-full object-cover" />
                <div className="absolute bottom-10 left-10 right-10">
                   <div className="bg-black/60 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex items-center justify-between">
                     <span className="text-sm uppercase tracking-[0.2em] font-black text-white/80 font-headline">Gemini 2.5 Flash</span>
                     <Zap className="w-6 h-6 text-[#4285F4]" />
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
