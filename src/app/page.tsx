import Link from 'next/link';
import { Camera, Zap, Clock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-24 bg-[#16181B] text-white overflow-hidden relative">
      {/* Background Glow Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#4290FF]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#ABDFE6]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 text-center max-w-4xl space-y-12">
        <header className="space-y-4 animate-in fade-in slide-in-from-top duration-1000">
          <div className="inline-flex items-center justify-center p-3 mb-6 bg-primary/10 border border-primary/20 rounded-full">
            <Clock className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none font-headline uppercase italic">
            Free-Time <br />
            <span className="text-[#4290FF] italic">Machine</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto">
            Experience what it feels like to gain up to 10 hours back per week. 
            Snap a photo, choose your future, and let AI reveal your new lifestyle.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <div className="glass-panel p-8 space-y-4">
            <div className="bg-[#4290FF]/10 w-12 h-12 rounded-xl flex items-center justify-center">
              <Camera className="text-[#4290FF]" />
            </div>
            <h3 className="text-xl font-bold font-headline">Capture</h3>
            <p className="text-muted-foreground text-sm">Take a high-resolution snapshot in our digital photo booth.</p>
          </div>
          
          <div className="glass-panel p-8 space-y-4">
            <div className="bg-[#ABDFE6]/10 w-12 h-12 rounded-xl flex items-center justify-center">
              <Zap className="text-[#ABDFE6]" />
            </div>
            <h3 className="text-xl font-bold font-headline">Transform</h3>
            <p className="text-muted-foreground text-sm">Choose a theme and watch Gemini 2.5 transform your reality.</p>
          </div>

          <div className="glass-panel p-8 space-y-4">
            <div className="bg-[#4290FF]/10 w-12 h-12 rounded-xl flex items-center justify-center">
              <Share2 className="text-[#4290FF]" />
            </div>
            <h3 className="text-xl font-bold font-headline">Share</h3>
            <p className="text-muted-foreground text-sm">Instantly receive a QR code to download and share your creation.</p>
          </div>
        </div>

        <div className="pt-8 animate-in fade-in zoom-in duration-1000 delay-500">
          <Link href="/kiosk">
            <Button size="lg" className="btn-primary text-2xl h-auto py-8 px-16 group">
              Start Your Journey
              <Zap className="ml-3 group-hover:rotate-12 transition-transform" />
            </Button>
          </Link>
          <p className="mt-6 text-sm text-muted-foreground uppercase tracking-widest font-semibold opacity-50">
            Tap to begin
          </p>
        </div>
      </div>
      
      {/* Footer Branding */}
      <footer className="absolute bottom-10 text-center w-full opacity-30">
        <p className="text-xs uppercase tracking-tighter font-bold">Powered by Google Gemini 2.5 Flash</p>
      </footer>
    </main>
  );
}
