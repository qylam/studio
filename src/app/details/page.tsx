
"use client";

import React, { useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export default function DetailsPage() {
  const [showConsent, setShowConsent] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleProceed = () => {
    setIsNavigating(true);
    router.push('/kiosk');
  };

  const handleDecline = () => {
    setShowConsent(false);
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Left Content */}
      <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center space-y-8 animate-in fade-in slide-in-from-left duration-700">
        <Link href="/" className="inline-flex items-center text-white/60 hover:text-white transition-colors group mb-8">
          <ArrowLeft className="mr-3 w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">Back</span>
        </Link>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
          Empowering Educators: How Gemini is Helping Transform the Classroom
        </h1>

        <p className="text-lg md:text-xl text-white/80 leading-relaxed font-medium">
          A recent six-month pilot program involving 100 teachers in Northern Ireland has revealed that integrating Gemini into the classroom doesn't just modernise education—it gives teachers their most valuable resource back: <span className="text-white font-bold italic">time.</span>
        </p>

        <ul className="space-y-6 pt-4">
          <li className="space-y-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#4285F4] rounded-full" />
              10 Hours Saved Per Week
            </h3>
            <p className="text-white/60 pl-4 leading-relaxed">
              On average, participating teachers saved 10 hours a week by using Gemini to handle time-consuming administrative tasks.
            </p>
          </li>
          <li className="space-y-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#4285F4] rounded-full" />
              More Time for Teaching
            </h3>
            <p className="text-white/60 pl-4 leading-relaxed">
              Teachers reinvested this saved time directly into student engagement and their own professional development.
            </p>
          </li>
          <li className="space-y-1">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-[#4285F4] rounded-full" />
              600+ Unique Use Cases
            </h3>
            <p className="text-white/60 pl-4 leading-relaxed">
              From drafting risk assessments to brainstorming creative content, educators found hundreds of ways to streamline their workload.
            </p>
          </li>
        </ul>

        <div className="pt-10">
          <Button 
            onClick={() => setShowConsent(true)}
            className="btn-google-blue h-auto px-16"
          >
            Continue
          </Button>
        </div>
      </div>

      {/* Right Image */}
      <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-screen">
        <Image 
          src="/images/saving-time.webp"
          alt="Saving time with Gemini"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent hidden md:block" />
      </div>

      {/* Consent Dialog */}
      <AlertDialog open={showConsent} onOpenChange={setShowConsent}>
        <AlertDialogContent className="max-w-4xl bg-[#F8F9FA] border-none rounded-[2rem] p-12 text-black shadow-2xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-6xl font-bold tracking-tight text-zinc-900">
                  Before you begin
                </AlertDialogTitle>
                <AlertDialogDescription className="text-lg leading-relaxed text-zinc-600 font-medium">
                  The Gemini Free-Time Machine is an experiment using Nano Banana 2, Google's latest generative model.
                  <br /><br />
                  Take a photo and we'll create a picture using your selected effect. By submitting your photo, you confirm that you are 18 or older and consent to Google processing your image to generate your picture. To download it, simply scan the QR code provided at the end.
                </AlertDialogDescription>
              </AlertDialogHeader>
            </div>
            
            <div className="flex flex-col gap-4 min-w-[280px]">
              <Button 
                onClick={handleProceed}
                disabled={isNavigating}
                className="w-full py-8 text-xl font-bold rounded-full bg-[#4285F4] hover:bg-[#4285F4]/90 text-white shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3"
              >
                {isNavigating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Accept and proceed'
                )}
              </Button>
              <Button 
                variant="outline"
                disabled={isNavigating}
                onClick={handleDecline}
                className="w-full py-8 text-xl font-bold rounded-full border-2 border-[#4285F4] text-[#4285F4] hover:bg-zinc-100 bg-white"
              >
                Do not accept
              </Button>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
