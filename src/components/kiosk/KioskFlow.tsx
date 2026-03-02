"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCcw, Zap, ChevronLeft, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateThemedPhoto } from '@/ai/flows/generate-themed-photo';
import { cn } from '@/lib/utils';

type KioskStep = 'capture' | 'refine' | 'processing' | 'result';

const SURPRISE_PRESETS = [
  { scene: 'at an improv theatre class', activity: 'reciting Hamlet', details: ['an unimpressed tutor', 'an Andy Warhol haircut', 'a group of breakdancers'] },
  { scene: 'exploring a bioluminescent jungle', activity: 'riding a neon dragon', details: ['glowing spores', 'vaporwave lighting', 'floating islands'] },
  { scene: 'in a high-tech orbital kitchen', activity: 'baking zero-gravity cookies', details: ['panoramic Earth view', 'floating chocolate chips', 'robotic assistant'] },
];

export default function KioskFlow() {
  const [step, setStep] = useState<KioskStep>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [scene, setScene] = useState('at an improv theatre class');
  const [activity, setActivity] = useState('reciting Hamlet');
  const [details, setDetails] = useState(['an unimpressed tutor', 'an Andy Warhol haircut', 'a group of breakdancers']);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const capturePhoto = () => {
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

  const handleSurprise = () => {
    const preset = SURPRISE_PRESETS[Math.floor(Math.random() * SURPRISE_PRESETS.length)];
    setScene(preset.scene);
    setActivity(preset.activity);
    setDetails(preset.details);
    handleGenerate();
  };

  const resetKiosk = () => {
    setStep('capture');
    setCapturedImage(null);
    setResultImage(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[70vh] flex flex-col items-center justify-center space-y-8">
      
      {step === 'capture' && (
        <div className="w-full space-y-8 text-center animate-in zoom-in duration-500">
          <h2 className="text-6xl font-black font-headline uppercase italic tracking-tighter">Strike a Pose</h2>
          <div className="relative overflow-hidden aspect-video max-w-4xl mx-auto rounded-[2rem] border-2 border-white/10 bg-zinc-900">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror transform -scale-x-100" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <Button onClick={capturePhoto} className="btn-google-blue h-auto py-6 px-12 text-2xl rounded-full">
            <Camera className="mr-3 h-8 w-8" />
            Capture Photo
          </Button>
        </div>
      )}

      {step === 'refine' && (
        <div className="w-full animate-in fade-in slide-in-from-right duration-500">
          <button 
            onClick={() => setStep('capture')}
            className="flex items-center text-white/60 hover:text-white transition-colors mb-8 group"
          >
            <ChevronLeft className="w-6 h-6 mr-1 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xl font-medium">Back</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: Headline and Image */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-7xl font-bold leading-tight tracking-tighter text-white">
                  You&apos;re a<br />work of art!
                </h1>
                <p className="text-xl text-white/70 max-w-md leading-relaxed">
                  Now for the fun part. Refine your prompt to create your masterpiece.
                </p>
              </div>
              <div className="aspect-square w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl bg-zinc-900 border border-white/5">
                {capturedImage && (
                  <img src={capturedImage} alt="Captured" className="w-full h-full object-cover mirror transform -scale-x-100" />
                )}
              </div>
            </div>

            {/* Right: Prompt Builder UI */}
            <div className="bg-black/40 backdrop-blur-xl p-10 rounded-[3rem] border border-white/5 space-y-12">
              <div className="space-y-8">
                {/* Imagine Row */}
                <div className="flex items-center space-x-6">
                  <span className="text-2xl font-medium text-white min-w-[140px]">Imagine me</span>
                  <div className="flex-grow">
                    <Input 
                      value={scene}
                      onChange={(e) => setScene(e.target.value)}
                      className="bg-transparent border-[#4285F4] text-xl py-6 rounded-full px-8 focus-visible:ring-1 focus-visible:ring-[#4285F4]"
                    />
                  </div>
                </div>

                {/* While Row */}
                <div className="flex items-center space-x-6">
                  <span className="text-2xl font-medium text-white min-w-[140px]">while</span>
                  <div className="flex-grow">
                    <Input 
                      value={activity}
                      onChange={(e) => setActivity(e.target.value)}
                      className="bg-transparent border-[#4285F4] text-xl py-6 rounded-full px-8 focus-visible:ring-1 focus-visible:ring-[#4285F4]"
                    />
                  </div>
                </div>

                {/* With Row */}
                <div className="flex items-start space-x-6">
                  <div className="pt-3">
                    <span className="text-2xl font-medium text-white min-w-[140px] block">with</span>
                  </div>
                  <div className="flex-grow space-y-4 relative">
                    {/* Vertical line connecting 'with' inputs */}
                    <div className="absolute left-[-3rem] top-8 bottom-8 w-[1px] bg-white/10" />
                    {details.map((detail, idx) => (
                      <Input 
                        key={idx}
                        value={detail}
                        onChange={(e) => {
                          const newDetails = [...details];
                          newDetails[idx] = e.target.value;
                          setDetails(newDetails);
                        }}
                        className="bg-transparent border-[#4285F4]/40 text-lg py-6 rounded-full px-8 focus-visible:ring-1 focus-visible:ring-[#4285F4]"
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSurprise}
                  className="bg-[#4285F4] hover:bg-[#4285F4]/90 text-white rounded-full px-12 py-8 text-2xl font-bold shadow-lg shadow-[#4285F4]/20"
                >
                  Surprise me!
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
            <h2 className="text-5xl font-black font-headline uppercase italic tracking-tighter">AI is Dreaming...</h2>
            <p className="text-white/50 text-xl font-mono animate-pulse">Synthesizing your masterpiece...</p>
          </div>
        </div>
      )}

      {step === 'result' && resultImage && (
        <div className="w-full space-y-8 animate-in zoom-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-10">
              <div className="space-y-4">
                <h2 className="text-7xl font-black font-headline uppercase italic leading-none tracking-tighter">Your New Reality</h2>
                <p className="text-2xl text-[#4285F4] font-medium">Reimagined by Gemini</p>
              </div>
              
              <div className="p-10 bg-zinc-900/50 backdrop-blur-md rounded-[3rem] border border-white/10 space-y-8">
                <div className="flex items-center space-x-6">
                  <div className="bg-[#4285F4] p-5 rounded-3xl">
                    <QrCode className="w-10 h-10 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-2xl font-bold">Scan to Download</h4>
                    <p className="text-white/50 text-lg leading-tight">Take your HD creation home and share the inspiration.</p>
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

              <Button onClick={resetKiosk} className="w-full py-8 text-2xl font-bold rounded-full border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center">
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
                     <span className="text-sm uppercase tracking-[0.2em] font-black text-white/80">Gemini 2.5 Flash</span>
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
