
"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { useVisions, type Vision } from '@/hooks/vision-flow/use-visions';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trash2, 
  Film, 
  CheckCircle2, 
  Eye,
  EyeOff,
  LayoutDashboard,
  History,
  Video,
  Activity,
  ArrowLeft,
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

  const stats = useMemo(() => {
    const totalPhotos = visions.filter(v => v.mediaType === 'image' || v.imageData).length;
    const totalVideos = visions.filter(v => v.mediaType === 'video' && !v.imageData).length;
    return { totalPhotos, totalVideos };
  }, [visions]);

  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');

  const filteredVisions = useMemo(() => {
    const filtered = visions.filter(v => {
      if (visibilityFilter === 'hidden' && !v.isHidden) return false;
      if (visibilityFilter === 'visible' && v.isHidden) return false;

      if (mediaFilter === 'all') return true;
      // We interpret any non-video as an image for filtering purposes
      const isVideo = v.mediaType === 'video' && !v.imageData;
      if (mediaFilter === 'video') return isVideo;
      if (mediaFilter === 'image') return !isVideo;
      return true;
    });

    return filtered.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [visions, mediaFilter, visibilityFilter]);

  const handleHideAll = () => {
    if (!firestore) return;
    const toHide = filteredVisions.filter(v => !v.isHidden);
    if (toHide.length === 0) {
      toast({ title: "Nothing to hide", description: "All items matching the current filter are already hidden." });
      return;
    }
    if (window.confirm(`Are you sure you want to hide ${toHide.length} items?`)) {
      toHide.forEach(v => {
        setDocumentNonBlocking(doc(firestore, 'visions', v.id.replace(/\//g, '_')), {
          isHidden: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      });
      toast({ title: "Items Hidden", description: `Successfully hid ${toHide.length} items.` });
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
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 bg-[#0f172a] p-2 rounded-lg border border-white/5 w-fit">
                  <Button variant={mediaFilter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setMediaFilter('all')}>
                    All
                  </Button>
                  <Button variant={mediaFilter === 'image' ? 'default' : 'ghost'} size="sm" onClick={() => setMediaFilter('image')} className="gap-2">
                    <ImageIcon className="w-4 h-4" /> Images
                  </Button>
                  <Button variant={mediaFilter === 'video' ? 'default' : 'ghost'} size="sm" onClick={() => setMediaFilter('video')} className="gap-2">
                    <Film className="w-4 h-4" /> Videos
                  </Button>
                </div>

                <div className="flex items-center gap-2 bg-[#0f172a] p-2 rounded-lg border border-white/5 w-fit">
                  <Button variant={visibilityFilter === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setVisibilityFilter('all')}>
                    All
                  </Button>
                  <Button variant={visibilityFilter === 'visible' ? 'default' : 'ghost'} size="sm" onClick={() => setVisibilityFilter('visible')} className="gap-2">
                    <Eye className="w-4 h-4" /> Visible
                  </Button>
                  <Button variant={visibilityFilter === 'hidden' ? 'default' : 'ghost'} size="sm" onClick={() => setVisibilityFilter('hidden')} className="gap-2">
                    <EyeOff className="w-4 h-4" /> Hidden
                  </Button>
                </div>
              </div>

              <Button onClick={handleHideAll} variant="destructive" className="gap-2 whitespace-nowrap">
                <EyeOff className="w-4 h-4" /> Hide All {mediaFilter !== 'all' ? (mediaFilter === 'image' ? 'Images' : 'Videos') : 'Items'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredVisions.map(vision => (
                <Card key={vision.id} className="bg-[#0f172a] border-white/5 overflow-hidden">
                  <div className="aspect-video relative bg-black group">
                    {(vision.mediaType === 'video' && !vision.imageData) ? (
                      <>
                        <video src={vision.mediaUrl} className={cn("w-full h-full object-cover transition-all duration-300", vision.isHidden && "opacity-40 grayscale")} muted loop autoPlay />
                        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1 backdrop-blur-sm z-10">
                          <Film className="w-3 h-3" /> Video
                        </div>
                      </>
                    ) : (
                      <>
                        <img src={vision.mediaUrl} className={cn("w-full h-full object-cover transition-all duration-300", vision.isHidden && "opacity-40 grayscale")} />
                        <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1 backdrop-blur-sm z-10">
                          <ImageIcon className="w-3 h-3" /> Image
                        </div>
                      </>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="text-xs font-mono text-slate-300 space-y-2 flex-1 break-all pt-1">
                        <p>
                          {vision.fullPath ? `Path: ${vision.fullPath}` : `ID: ${vision.id}`}
                        </p>
                        <p className="text-slate-400">
                          Created: {vision.createdAt ? new Date(vision.createdAt).toLocaleString() : 'Unknown'}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => toggleVisibility(vision.id, !!vision.isHidden)} className={cn(vision.isHidden && "text-slate-500")}>
                          {vision.isHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteVision(vision.id, vision.title)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
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
