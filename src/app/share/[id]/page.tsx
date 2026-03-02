
import { Download, Share2, Instagram, Twitter, Facebook, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function SharePortal({ params }: { params: { id: string } }) {
  // In a real app, we would fetch the image data from Firestore using the ID
  const mockImageUrl = "https://picsum.photos/seed/sharing-preview/1280/720";

  return (
    <main className="min-h-screen bg-[#16181B] text-white p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8 py-8 animate-in fade-in slide-in-from-bottom duration-700">
        
        <header className="text-center space-y-2">
          <div className="inline-flex items-center justify-center p-2 mb-2 bg-[#4290FF]/10 rounded-lg">
            <Zap className="w-6 h-6 text-[#4290FF]" />
          </div>
          <h1 className="text-3xl font-black font-headline italic tracking-tighter uppercase leading-none">
            Your Free-Time <span className="text-[#4290FF]">Vision</span>
          </h1>
          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Created at the Kiosk</p>
        </header>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-[#4290FF] to-[#ABDFE6] rounded-[2rem] blur opacity-20"></div>
          <Card className="relative overflow-hidden rounded-[2rem] border-white/10 bg-black/40 shadow-2xl">
            <img 
              src={mockImageUrl} 
              alt="Your Free-Time Transformation" 
              className="w-full aspect-video object-cover"
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Button className="w-full btn-primary py-8 text-xl h-auto rounded-2xl flex items-center justify-center">
            <Download className="mr-3 h-6 w-6" />
            Download HD Image
          </Button>
          
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="h-16 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Instagram className="h-6 w-6" />
            </Button>
            <Button variant="outline" className="h-16 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Twitter className="h-6 w-6" />
            </Button>
            <Button variant="outline" className="h-16 rounded-xl border-white/10 bg-white/5 hover:bg-white/10">
              <Facebook className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="glass-panel p-6 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#ABDFE6]">About This Vision</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This image was generated using Google Gemini 2.5 Flash, reimagining how you would spend 10 extra hours per week based on your unique pose and choice of theme.
          </p>
          <div className="pt-2 flex items-center text-[10px] font-mono text-white/30 uppercase tracking-tighter">
            <span className="mr-2">Session ID: {params.id}</span>
            <span>•</span>
            <span className="ml-2">Generated 2m ago</span>
          </div>
        </div>

        <footer className="pt-8 text-center">
          <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">
            © 2024 FREE-TIME MACHINE PROJECT
          </p>
        </footer>
      </div>
    </main>
  );
}
