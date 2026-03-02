"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Check, RefreshCcw, Zap, Download, QrCode, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateThemedPhoto } from '@/ai/flows/generate-themed-photo';

const THEMES = [
  { id: 'break', label: 'Well-earned break', prompt: 'taking a well-earned break' },
  { id: 'zen', label: 'Find my zen', prompt: 'finding my zen' },
  { id: 'skill', label: 'Learn a new skill', prompt: 'learning a new skill' },
  { id: 'outdoor', label: 'Explore the outdoors', prompt: 'exploring the great outdoors' },
  { id: 'family', label: 'Time with family', prompt: 'spending time with family' },
  { id: 'creative', label: 'Get creative', prompt: 'getting creative' },
  { id: 'travel', label: 'Travel the world', prompt: 'traveling the world' },
  { id: 'hobby', label: 'Master a hobby', prompt: 'mastering a favorite hobby' },
];

const STYLE_OPTIONS = ['Cinematic Realism', 'Hyper-stylized Vector', 'Impressionist Oil', 'Cyberpunk Neon', 'Minimalist Flat Design', '3D Render Soft'];
const MOOD_OPTIONS = ['Energetic & Vibrant', 'Peaceful & Ethereal', 'Dreamy & Surreal', 'Moody & Contrast', 'Bright & Optimistic', 'Futuristic & Clean'];
const LIGHTING_OPTIONS = ['Neon Glow', 'Golden Hour', 'Soft Studio', 'Dramatic Shadows', 'Bioluminescent', 'Natural Daylight'];

type KioskStep = 'capture' | 'theme' | 'refine' | 'processing' | 'result';

export default function KioskFlow() {
  const [step, setStep] = useState<KioskStep>('capture');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [selectedTheme, setSelectedTheme] = useState(THEMES[0]);
  const [refinements, setRefinements] = useState({
    style: STYLE_OPTIONS[0],
    mood: MOOD_OPTIONS[0],
    lighting: LIGHTING_OPTIONS[0],
  });
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize webcam
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
        setStep('theme');
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
        theme: selectedTheme.prompt,
        styleOption1: refinements.style,
        styleOption2: refinements.mood,
        styleOption3: refinements.lighting,
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
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-[80vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
      
      {/* Step Indicator */}
      <div className="flex items-center space-x-4 mb-8">
        {['capture', 'theme', 'refine', 'result'].map((s, idx) => (
          <React.Fragment key={s}>
            <div className={`w-3 h-3 rounded-full ${step === s ? 'bg-[#4290FF] ring-4 ring-[#4290FF]/20' : 'bg-muted'}`} />
            {idx < 3 && <div className="w-12 h-[2px] bg-muted" />}
          </React.Fragment>
        ))}
      </div>

      {step === 'capture' && (
        <div className="w-full space-y-8 text-center animate-in zoom-in duration-500">
          <h2 className="text-4xl font-black font-headline uppercase italic">Strike a Pose</h2>
          <div className="relative glass-panel overflow-hidden aspect-video max-w-4xl mx-auto neon-glow border-2 border-primary/20">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover mirror transform -scale-x-100" />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-[40px] border-transparent pointer-events-none" />
          </div>
          <Button onClick={capturePhoto} size="lg" className="btn-primary py-8 px-12 text-2xl">
            <Camera className="mr-2 h-6 w-6" />
            Take Snapshot
          </Button>
        </div>
      )}

      {step === 'theme' && (
        <div className="w-full space-y-8 text-center animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <h2 className="text-4xl font-black font-headline uppercase italic">Choose Your Vibe</h2>
            <p className="text-muted-foreground">Select a theme for your extra 10 hours per week.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                className={`p-6 rounded-2xl glass-panel text-center transition-all duration-300 border-2 ${selectedTheme.id === t.id ? 'border-[#4290FF] bg-[#4290FF]/10 ring-4 ring-[#4290FF]/10' : 'border-transparent hover:border-white/20'}`}
              >
                <div className="text-lg font-bold font-headline">{t.label}</div>
              </button>
            ))}
          </div>
          <div className="pt-4 flex justify-center space-x-4">
            <Button variant="ghost" onClick={() => setStep('capture')} className="text-muted-foreground">Back</Button>
            <Button onClick={() => setStep('refine')} size="lg" className="btn-primary">
              Next Step
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      {step === 'refine' && (
        <div className="w-full space-y-8 text-center animate-in slide-in-from-right duration-500">
          <div className="space-y-2">
            <h2 className="text-4xl font-black font-headline uppercase italic">Refine Art Style</h2>
            <p className="text-muted-foreground">Add those final artistic touches to your masterpiece.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="space-y-3 text-left">
              <label className="text-xs font-bold uppercase tracking-widest text-[#ABDFE6]">Artistic Style</label>
              <Select value={refinements.style} onValueChange={(v) => setRefinements(prev => ({...prev, style: v}))}>
                <SelectTrigger className="h-14 bg-card border-white/10 rounded-xl">
                  <SelectValue placeholder="Style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 text-left">
              <label className="text-xs font-bold uppercase tracking-widest text-[#ABDFE6]">Visual Mood</label>
              <Select value={refinements.mood} onValueChange={(v) => setRefinements(prev => ({...prev, mood: v}))}>
                <SelectTrigger className="h-14 bg-card border-white/10 rounded-xl">
                  <SelectValue placeholder="Mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOOD_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3 text-left">
              <label className="text-xs font-bold uppercase tracking-widest text-[#ABDFE6]">Environment Light</label>
              <Select value={refinements.lighting} onValueChange={(v) => setRefinements(prev => ({...prev, lighting: v}))}>
                <SelectTrigger className="h-14 bg-card border-white/10 rounded-xl">
                  <SelectValue placeholder="Lighting" />
                </SelectTrigger>
                <SelectContent>
                  {LIGHTING_OPTIONS.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="pt-4 flex justify-center space-x-4">
            <Button variant="ghost" onClick={() => setStep('theme')} className="text-muted-foreground">Back</Button>
            <Button onClick={handleGenerate} size="lg" className="btn-primary py-8 px-12 group">
              <Zap className="mr-2 h-6 w-6 group-hover:fill-current" />
              Generate Magic
            </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="w-full space-y-12 text-center py-20 animate-in fade-in duration-1000">
          <div className="relative inline-block">
            <div className="w-48 h-48 border-4 border-[#4290FF]/20 rounded-full animate-spin border-t-[#4290FF]" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="w-16 h-16 text-[#4290FF] animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black font-headline uppercase italic">AI is Dreaming...</h2>
            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-[#ABDFE6] font-mono text-sm animate-pulse-subtle">
                Preserving facial likeness...
              </p>
              <p className="text-[#ABDFE6] font-mono text-sm animate-pulse-subtle delay-150">
                Applying {refinements.style} textures...
              </p>
              <p className="text-[#ABDFE6] font-mono text-sm animate-pulse-subtle delay-300">
                Optimizing for {selectedTheme.label}...
              </p>
            </div>
          </div>
        </div>
      )}

      {step === 'result' && resultImage && (
        <div className="w-full space-y-8 animate-in zoom-in duration-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-5xl font-black font-headline uppercase italic leading-none">Your New Reality</h2>
                <p className="text-xl text-[#ABDFE6]">{selectedTheme.label}</p>
              </div>
              <div className="p-6 glass-panel space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-[#4290FF] p-3 rounded-xl">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold">Scan to Download</h4>
                    <p className="text-sm text-muted-foreground">Take your HD creation with you and share the inspiration.</p>
                  </div>
                </div>
                {/* QR Code Placeholder - In a real app we'd generate a link to /share/[id] */}
                <div className="bg-white p-4 rounded-xl w-48 h-48 mx-auto flex items-center justify-center shadow-inner">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin + '/share/mock-id')}`} 
                    alt="QR Code" 
                    className="w-full h-full"
                  />
                </div>
              </div>
              <Button onClick={resetKiosk} variant="outline" className="w-full py-8 text-lg rounded-2xl border-white/10 hover:bg-white/5">
                <RefreshCcw className="mr-2 h-5 w-5" />
                Create Another
              </Button>
            </div>
            
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#4290FF] to-[#ABDFE6] rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                <img src={resultImage} alt="Your AI Transformation" className="w-full h-full object-cover" />
                <div className="absolute bottom-6 left-6 right-6">
                   <div className="glass-panel p-4 backdrop-blur-md flex items-center justify-between">
                     <span className="text-xs uppercase tracking-widest font-bold text-white/70">Generated by Gemini 2.5</span>
                     <Zap className="w-4 h-4 text-[#4290FF]" />
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
