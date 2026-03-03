import KioskFlow from '@/components/kiosk/KioskFlow';
import { Clock } from 'lucide-react';
import Link from 'next/link';

export default function KioskPage() {
  return (
    <div className="min-h-screen bg-[#16181B] text-white p-8 flex flex-col">
      {/* Kiosk Header */}
      <header className="flex justify-between items-center mb-12">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-[#4290FF]/10 p-2 rounded-xl group-hover:bg-[#4290FF]/20 transition-colors">
            <Clock className="w-6 h-6 text-[#4290FF]" />
          </div>
          <span className="text-xl font-bold tracking-tight font-headline">
            Free-Time <span className="text-[#4290FF]">Machine</span>
          </span>
        </Link>
        <div className="text-xs font-mono text-[#ABDFE6]/60 uppercase tracking-widest hidden md:block">
          GEMINI • NANO BANANA 2
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center">
        <KioskFlow />
      </main>

      <footer className="mt-12 text-center text-white/20 text-xs uppercase tracking-widest font-bold">
        Google for Education
      </footer>
    </div>
  );
}
