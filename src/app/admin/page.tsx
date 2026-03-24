
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { useVisions, type Vision } from '@/hooks/vision-flow/use-visions';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { generateVideo } from '@/ai/flows/generate-video-flow';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trash2, 
  Loader2, 
  Film, 
  CheckCircle2, 
  Zap, 
  LayoutDashboard,
  History,
  Video,
  Activity,
  ArrowLeft,
  Wand2,
  Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

export default function AdminPage() {
  const { visions, loading: visionsLoading } = useVisions();
  const firestore = useFirestore();
  
  const logsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'logs'), orderBy('createdAt', 'desc'), limit(100));
  }, [firestore]);
  const { data: logs, isLoading: logsLoading } = useCollection(logsQuery);

  const [videoPrompt, setVideoPrompt] = useState('');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const stats = useMemo(() => {
    const totalPhotos = visions.filter(v => v.mediaType === 'image' || v.imageData).length;
    const totalVideos = visions.filter(v => v.mediaType === 'video' && !v.imageData).length;
    return { totalPhotos, totalVideos };
  }, [visions]);

  const handleGenerateVideo = async () => {
    if (!videoPrompt || isGeneratingVideo) return;
    setIsGeneratingVideo(true);
    try {
      const result = await generateVideo({ prompt: videoPrompt });
      if (firestore && result.videoUrl) {
        const genId = `ai_gen_${Date.now()}`;
        setDocumentNonBlocking(doc(firestore, 'visions', genId), {
          title: `AI Generation: ${videoPrompt.slice(0, 20)}...`,
          description: videoPrompt,
          mediaUrl: result.videoUrl,
          mediaType: 'video',
          createdAt: new Date().toISOString(),
          isHidden: false
        }, { merge: true });
        toast({ title: "Video Generated", description: "Successfully added to the stream." });
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Generation Failed", description: error.message });
    } finally {
      setIsGeneratingVideo(false);
      setVideoPrompt('');
    }
  };

  const handleDeleteVision = (id: string, title: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'visions', id.replace(/\//g, '_')));
  };

  const toggleVisibility = (id: string, currentHidden: boolean) => {
    if (!firestore) return;
    setDocumentNonBlocking(doc(firestore, 'visions', id.replace(/\//g, '_')), {
      isHidden: !currentHidden,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  return (
    <div className="min-h-screen bg-[#020817] text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Activity className="w-8 h-8 text-primary animate-pulse" />
            <h1 className="text-2xl font-bold">Vision Flow Control</h1>
          </div>
          <Link href="/videos">
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> Live Stream</Button>
          </Link>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-[#1e293b] border-none p-1">
            <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="w-4 h-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="videos" className="gap-2"><Video className="w-4 h-4" /> Manage Stream</TabsTrigger>
            <TabsTrigger value="audit" className="gap-2"><History className="w-4 h-4" /> Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-[#0f172a] border-white/5"><CardContent className="p-6">
              <p className="text-xs text-slate-500 uppercase font-black">Videos</p><p className="text-3xl font-bold">{stats.totalVideos}</p>
            </CardContent></Card>
            <Card className="bg-[#0f172a] border-white/5"><CardContent className="p-6">
              <p className="text-xs text-slate-500 uppercase font-black">Images</p><p className="text-3xl font-bold">{stats.totalPhotos}</p>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <Card className="bg-[#0f172a] border-l-4 border-l-amber-500">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Wand2 className="w-5 h-5 text-amber-500" /> Synthesize AI Fragment</CardTitle></CardHeader>
              <CardContent className="flex gap-4">
                <Input placeholder="Describe a dream..." value={videoPrompt} onChange={(e) => setVideoPrompt(e.target.value)} />
                <Button onClick={handleGenerateVideo} disabled={!videoPrompt || isGeneratingVideo}>
                  {isGeneratingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : "Synthesize"}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {visions.map(vision => (
                <Card key={vision.id} className="bg-[#0f172a] border-white/5 overflow-hidden">
                  <div className="aspect-video relative bg-black">
                    {vision.mediaType === 'video' ? <video src={vision.mediaUrl} className="w-full h-full object-cover" muted loop autoPlay /> : <img src={vision.mediaUrl} className="w-full h-full object-cover" />}
                  </div>
                  <CardContent className="p-4 flex justify-between items-center">
                    <p className="text-xs font-bold truncate flex-1">{vision.title}</p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => toggleVisibility(vision.id, !!vision.isHidden)} className={cn(vision.isHidden && "text-slate-500")}><Zap className="w-4 h-4" /></Button>
                      <Button variant="destructive" size="icon" onClick={() => handleDeleteVision(vision.id, vision.title)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audit">
            <Card className="bg-[#0f172a] border-white/5">
              <CardContent className="p-0 max-h-[500px] overflow-y-auto">
                {logs?.map((log: any) => (
                  <div key={log.id} className="p-4 border-b border-white/5 flex justify-between text-xs">
                    <span className="font-mono text-slate-400">{log.message}</span>
                    <span className="text-slate-600">{log.createdAt && format(parseISO(log.createdAt), 'HH:mm:ss')}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
