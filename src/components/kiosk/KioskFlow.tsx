"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Zap, ChevronLeft, ArrowLeft, Sparkles, Download, RotateCcw } from 'lucide-react';
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
import { PlaceHolderImages } from '@/lib/placeholder-images';

type KioskStep = 'capture' | 'select-theme' | 'refine' | 'processing' | 'results' | 'thanks';

const AVAILABLE_DETAILS = [
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
  "digital oil painting"
];

const THEMES = [
  { id: 'theme-teaching', title: 'Level up my teaching', scene: 'in a modern, inspiring classroom', activity: 'teaching with digital holographic aids' },
  { id: 'theme-recipe', title: 'Learn a new recipe', scene: 'in a professional masterchef kitchen', activity: 'preparing a gourmet feast' },
  { id: 'theme-zen', title: 'Find my zen', scene: 'in a serene Japanese zen garden', activity: 'meditating by a peaceful waterfall' },
  { id: 'theme-active', title: 'Get more active', scene: 'on a high-altitude mountain peak', activity: 'completing a challenging rock climb' },
  { id: 'theme-break', title: 'Take a well-earned break', scene: 'on a luxury tropical private island', activity: 'relaxing in a hammock over crystal water' },
  { id: 'theme-skill', title: 'Learn a new skill', scene: 'in a high-tech robotics laboratory', activity: 'programming a friendly droid' },
  { id: 'theme-creative', title: 'Get more creative', scene: 'in a vibrant, sun-drenched art studio', activity: 'painting a massive impressionist mural' },
  { id: 'theme-imagination', title: 'Let my imagination loose', scene: 'aboard a majestic steampunk airship', activity: 'navigating through a sea of golden clouds' },
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
        setStep('select-theme');
      }
    }
  };

  const handleThemeSelect = async (theme: typeof THEMES[0]) => {
    setScene(theme.scene);
    setActivity(theme.activity);
    
    if (!capturedImage) return;
    setIsProcessing(true);
    setStep('processing');
    
    try {
      const finalDetails = isWheelchairUser ? [...details, 'subject is using a wheelchair'] : details;
      const response = await generateThemedPhoto({
        photoDataUri: capturedImage,
        scene: theme.scene,
        activity: theme.activity,
        details: finalDetails,
      });
      setResultImage(response.transformedPhotoDataUri);
      setStep('results');
    } catch (error) {
      console.error("Generation failed", error);
      setStep('refine');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerate = async () => {
    if (!capturedImage) return;
    setIsProcessing(true);
    setStep('processing');
    
    try {
      const finalDetails = isWheelchairUser ? [...details, 'subject is using a wheelchair'] : details;
      const response = await generateThemedPhoto({
        photoDataUri: capturedImage,
        scene,
        activity,
        details: finalDetails,
      });
      setResultImage(response.transformedPhotoDataUri);
      setStep('results');
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
          <h2 className="text-7xl font-bold tracking-tight text-white font-headline">Strike a Pose</h2>
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

      {step === 'select-theme' && (
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-right duration-500">
          <div className="text-center space-y-4">
            <h2 className="text-6xl font-bold tracking-tight text-white font-headline">What would you do with your free time?</h2>
            <p className="text-2xl text-white/60">Picture yourself with up to 10 hours back per week.</p>
          </div>

          <div className="flex justify-center">
            <div className="flex items-center space-x-3 bg-white/5 px-6 py-4 rounded-full border border-white/10">
              <Checkbox 
                id="wheelchair" 
                checked={isWheelchairUser} 
                onCheckedChange={(checked) => setIsWheelchairUser(checked === true)}
                className="w-6 h-6 rounded-md border-white/20 data-[state=checked]:bg-[#4285F4] data-[state=checked]:border-[#4285F4]"
              />
              <label htmlFor="wheelchair" className="text-xl text-white font-headline cursor-pointer select-none">
                I'm a wheelchair user
              </label>
            </div>
          </div>

          <Carousel className="w-full max-w-[90vw] mx-auto">
            <CarouselContent className="-ml-4">
              {THEMES.map((theme) => {
                const imageData = PlaceHolderImages.find(img => img.id === theme.id);
                return (
                  <CarouselItem key={theme.id} className="pl-4 md:basis-1/4">
                    <div 
                      onClick={() => handleThemeSelect(theme)}
                      className="group cursor-pointer relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-transparent hover:border-[#4285F4] transition-all duration-300"
                    >
                      <img 
                        src={imageData?.imageUrl} 
                        alt={theme.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-xl font-bold text-white font-headline leading-tight">{theme.title}</h3>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-8">
              <CarouselPrevious className="static translate-y-0 h-16 w-16 bg-white/5 border-white/10 hover:bg-white/10" />
              <CarouselNext className="static translate-y-0 h-16 w-16 bg-white/5 border-white/10 hover:bg-white/10" />
            </div>
          </Carousel>

          <div className="flex flex-col items-center gap-6 pt-8">
            <Button 
              variant="ghost" 
              onClick={() => setStep('capture')}
              className="text-white/40 hover:text-white hover:bg-transparent text-xl font-headline"
            >
              <ArrowLeft className="mr-2 h-6 w-6" />
              Back to camera
            </Button>
          </div>
        </div>
      )}

      {step === 'refine' && (
        <div className="w-full animate-in fade-in slide-in-from-right duration-500">
          <button 
            onClick={() => setStep('select-theme')}
            className="flex items-center text-white/60 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft className="w-6 h-6 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xl font-medium font-headline">Change Theme</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-8 sticky top-8">
              <div className="space-y-4">
                <h1 className="text-6xl font-bold leading-tight tracking-tighter text-white font-headline">
                  Refine your vision
                </h1>
              </div>

              <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-900 border border-white/5">
                {capturedImage && (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover mirror transform -scale-x-100" />
                )}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-12">
              <div className="space-y-8">
                <div className="flex items-center space-x-6">
                  <span className="text-2xl font-medium text-white min-w-[140px] font-headline">Imagine me</span>
                  <div className="flex-grow">
                    <input 
                      value={scene}
                      onChange={(e) => setScene(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-[#4285F4] text-xl py-4 px-2 outline-none focus:border-white transition-colors text-white"
                      placeholder="e.g. in a digital garden"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <span className="text-2xl font-medium text-white min-w-[140px] font-headline">while</span>
                  <div className="flex-grow">
                    <input 
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="w-full bg-transparent border-b-2 border-[#4285F4] text-xl py-4 px-2 outline-none focus:border-white transition-colors text-white"
                      placeholder="e.g. sketching new ideas"
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

              <div className="flex flex-col gap-4 pt-4">
                <Button 
                  onClick={handleGenerate}
                  disabled={isProcessing}
                  className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white rounded-full px-12 py-8 text-2xl font-bold shadow-lg shadow-[#4285F4]/20 font-headline h-auto w-full"
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

      {step === 'results' && resultImage && (
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24 animate-in fade-in zoom-in duration-700">
          {/* Left: Polaroid Frame */}
          <div className="relative">
            <button 
              onClick={() => setStep('select-theme')}
              className="absolute -left-16 top-0 p-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-10 h-10" />
            </button>
            
            <div className="bg-white p-6 pb-16 rounded-sm shadow-2xl transform -rotate-1 w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-[#4285F4]">Google</span>
                  <span className="text-lg text-black/60 font-medium">for Education</span>
                </div>
              </div>
              
              <div className="aspect-square bg-zinc-100 overflow-hidden relative">
                <img src={resultImage} alt="AI Vision" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <p className="text-3xl font-medium text-zinc-800 tracking-tight italic" style={{ fontFamily: 'var(--font-handwriting, cursive)' }}>
                  {activity.charAt(0).toUpperCase() + activity.slice(1)}, thanks to Gemini
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex-1 space-y-12 text-center md:text-left">
            <h2 className="text-8xl font-bold tracking-tighter text-white font-headline">Ta-da!</h2>
            
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl w-56 h-56 shadow-2xl mx-auto md:mx-0">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/share/session-${Date.now()}`} 
                  alt="QR Code" 
                  className="w-full h-full"
                />
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white font-headline">Those extra hours look great on you.</p>
                <p className="text-xl text-white/50 font-headline">Scan to save and share.</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 pt-8">
              <Button 
                onClick={() => setStep('refine')}
                variant="outline"
                className="border-white/20 text-white rounded-full px-12 py-8 text-xl font-bold hover:bg-white/10 font-headline h-auto min-w-[240px]"
              >
                Adjust photo
              </Button>
              <Button 
                onClick={() => setStep('thanks')}
                className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white rounded-full px-12 py-8 text-xl font-bold shadow-lg shadow-[#4285F4]/20 font-headline h-auto min-w-[240px]"
              >
                I've scanned the QR code
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === 'thanks' && resultImage && (
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-24 animate-in fade-in zoom-in duration-700">
          {/* Left: Polaroid Frame (Static) */}
          <div className="relative">
            <button 
              onClick={() => setStep('results')}
              className="absolute -left-16 top-0 p-2 text-white/60 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-10 h-10" />
            </button>
            <div className="absolute -left-16 -top-12 w-10 h-10 bg-[#4285F4] rounded-full flex items-center justify-center text-white text-xs font-bold">
              10
            </div>
            
            <div className="bg-white p-6 pb-16 rounded-sm shadow-2xl transform -rotate-1 w-full max-w-md mx-auto">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-[#4285F4]">Google</span>
                  <span className="text-lg text-black/60 font-medium">for Education</span>
                </div>
              </div>
              
              <div className="aspect-square bg-zinc-100 overflow-hidden relative">
                <img src={resultImage} alt="AI Vision" className="w-full h-full object-cover" />
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md p-2 rounded-full border border-white/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <p className="text-3xl font-medium text-zinc-800 tracking-tight italic" style={{ fontFamily: 'var(--font-handwriting, cursive)' }}>
                  {activity.charAt(0).toUpperCase() + activity.slice(1)}, thanks to Gemini
                </p>
              </div>
            </div>
          </div>

          {/* Right: Thanks message */}
          <div className="flex-1 space-y-12 text-center md:text-left">
            <h2 className="text-7xl font-bold tracking-tight text-white font-headline leading-none">
              Thanks for saving <br /> time with Gemini
            </h2>
            
            <p className="text-2xl text-white/60 font-headline max-w-md leading-relaxed">
              Share on social how you'll spend your free time and tag us for a chance to be featured!
            </p>

            <div className="pt-8">
              <Button 
                onClick={resetKiosk}
                className="bg-white text-[#4285F4] hover:bg-zinc-100 rounded-full px-16 py-8 text-2xl font-bold shadow-xl font-headline h-auto min-w-[240px]"
              >
                Start over
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
