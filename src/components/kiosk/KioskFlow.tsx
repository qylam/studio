
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Zap, ChevronLeft, ArrowLeft, Sparkles, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { generateThemedPhoto } from '@/ai/flows/generate-themed-photo';
import { cn } from '@/lib/utils';

type KioskStep = 'capture' | 'refine' | 'processing';

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

export default function KioskFlow() {
  const [step, setStep] = useState<KioskStep>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scene, setScene] = useState('in a futuristic city');
  const [activity, setActivity] = useState('exploring the neon streets');
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
        setStep('refine');
      }
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
      setStep('refine');
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
    setScene('in a futuristic city');
    setActivity('exploring the neon streets');
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

      {step === 'refine' && (
        <div className="w-full animate-in fade-in slide-in-from-right duration-500">
          <button 
            onClick={resetKiosk}
            className="flex items-center text-white/60 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft className="w-6 h-6 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xl font-medium font-headline">Back to Camera</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column: Image Area */}
            <div className="space-y-8 sticky top-8">
              <div className="space-y-4">
                <h1 className="text-6xl font-bold leading-tight tracking-tighter text-white font-headline">
                  {resultImage ? "Your vision is ready!" : "Refine your vision"}
                </h1>
              </div>

              {resultImage ? (
                /* Polaroid Frame for Results */
                <div id="polaroid-frame" className="bg-[#F8F9FA] p-6 pb-12 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform -rotate-1 w-full max-w-lg mx-auto">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-black/60">Google</span>
                      <span className="text-xs text-black/40">for Education</span>
                    </div>
                  </div>
                  <div className="aspect-square bg-zinc-200 overflow-hidden rounded-sm relative">
                    <img src={resultImage} alt="AI Vision" className="w-full h-full object-cover" />
                    <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md p-1.5 rounded-full">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-2xl font-medium text-zinc-800 tracking-tight italic" style={{ fontFamily: 'var(--font-handwriting, cursive)' }}>
                      Exploring new horizons, thanks to Gemini
                    </p>
                  </div>
                </div>
              ) : (
                /* Standard Preview for Input */
                <div className="aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-900 border border-white/5">
                  {capturedImage && (
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover mirror transform -scale-x-100" />
                  )}
                </div>
              )}

              {resultImage && (
                <div className="flex flex-col items-center gap-6 pt-8 animate-in fade-in slide-in-from-bottom duration-500">
                  <div className="bg-white p-4 rounded-2xl w-48 h-48 shadow-2xl">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}/share/session-${Date.now()}`} 
                      alt="QR Code" 
                      className="w-full h-full"
                    />
                  </div>
                  <p className="text-white/60 text-center text-lg font-headline">Scan to save and share your masterpiece.</p>
                </div>
              )}
            </div>

            {/* Right Column: Controls */}
            <div className="bg-white/5 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-12">
              
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <Checkbox 
                    id="wheelchair-refine" 
                    checked={isWheelchairUser}
                    onCheckedChange={(checked) => setIsWheelchairUser(!!checked)}
                    className="w-6 h-6 rounded border-white/20 data-[state=checked]:bg-[#4285F4] data-[state=checked]:border-[#4285F4]"
                  />
                  <label htmlFor="wheelchair-refine" className="text-lg font-medium text-white/80 cursor-pointer">
                    I'm a wheelchair user
                  </label>
                </div>

                <div className="flex items-center space-x-6">
                  <span className="text-2xl font-medium text-white min-w-[140px] font-headline">Imagine me</span>
                  <div className="flex-grow">
                    <Input 
                      value={scene}
                      onChange={(e) => setScene(e.target.value)}
                      className="bg-transparent border-[#4285F4] text-xl py-6 rounded-full px-8 focus-visible:ring-1 focus-visible:ring-[#4285F4]"
                      placeholder="e.g. in a digital garden"
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
                  {resultImage ? "Regenerate Vision" : "Generate Vision"}
                </Button>
                
                {resultImage && (
                  <Button 
                    onClick={resetKiosk}
                    variant="outline"
                    className="border-white/20 text-white rounded-full px-12 py-6 text-xl font-bold hover:bg-white/10 font-headline h-auto w-full"
                  >
                    <RotateCcw className="mr-2 h-5 w-5" />
                    New Photo
                  </Button>
                )}
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
    </div>
  );
}
