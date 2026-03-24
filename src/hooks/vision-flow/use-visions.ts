
"use client"

import { useState, useEffect, useMemo } from 'react';
import { ref, listAll, getDownloadURL, getMetadata, FirebaseStorage } from 'firebase/storage';
import { useStorage, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export type Vision = {
  id: string;
  title: string;
  mediaUrl: string;
  mediaType: string;
  description?: string;
  createdAt?: any;
  isHidden?: boolean;
  isFallback?: boolean;
  fullPath?: string;
  imageData?: string;
};

const FALLBACK_SAMPLES: Vision[] = [
  {
    id: 'demo1',
    title: 'Demo Fragment Alpha',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    mediaType: 'video',
    description: 'System Fallback: Displayed when Storage bucket is empty.',
    createdAt: new Date().toISOString(),
    isHidden: false,
    isFallback: true
  },
  {
    id: 'demo2',
    title: 'Demo Fragment Beta',
    mediaUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    mediaType: 'video',
    description: 'System Fallback: Awaiting live .mp4 synchronization.',
    createdAt: new Date().toISOString(),
    isHidden: false,
    isFallback: true
  }
];

async function findFilesRecursively(storage: FirebaseStorage, folderPath: string, extensions: string[], maxDepth: number) {
  const results: Vision[] = [];
  
  async function traverse(currentRef: any, currentDepth: number) {
    if (currentDepth > maxDepth) return;
    
    try {
      const listResult = await listAll(currentRef);
      
      const filePromises = listResult.items
        .filter(item => {
          const lowerName = item.name.toLowerCase();
          if (lowerName.endsWith('_raw.jpg')) return false;
          return extensions.some(ext => lowerName.endsWith(ext));
        })
        .map(async (item) => {
          const [url, meta] = await Promise.all([
            getDownloadURL(item),
            getMetadata(item)
          ]);

          const isVideo = item.name.toLowerCase().endsWith('.mp4');
          const safeId = item.fullPath.replace(/\//g, '_');

          return {
            id: safeId,
            fullPath: item.fullPath,
            title: item.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
            mediaUrl: url,
            mediaType: isVideo ? 'video' : 'image',
            description: `Path: ${item.fullPath}`,
            createdAt: meta.timeCreated,
            isHidden: false,
            isFallback: false
          } satisfies Vision;
        });

      const files = await Promise.all(filePromises);
      results.push(...files);

      if (currentDepth < maxDepth) {
        const folderPromises = listResult.prefixes.map(prefix => traverse(prefix, currentDepth + 1));
        await Promise.all(folderPromises);
      }
    } catch (e) {}
  }

  await traverse(ref(storage, folderPath), 1);
  return results;
}

export function useVisions() {
  const storage = useStorage();
  const firestore = useFirestore();
  const [storageVideos, setStorageVideos] = useState<Vision[]>([]);
  const [storageImages, setStorageImages] = useState<Vision[]>([]);
  const [loadingStorage, setLoadingStorage] = useState(true);

  const visionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, 'visions');
  }, [firestore]);
  const { data: firestoreDocs, isLoading: loadingFirestore } = useCollection(visionsQuery);

  useEffect(() => {
    if (!storage) return;

    async function fetchAllMedia() {
      try {
        const [videos, images] = await Promise.all([
          findFilesRecursively(storage, 'videos', ['.mp4'], 5),
          findFilesRecursively(storage, 'visions', ['.jpg', '.png', '.jpeg', '.webp'], 5)
        ]);
        setStorageVideos(videos);
        setStorageImages(images);
      } catch (error) {
      } finally {
        setLoadingStorage(false);
      }
    }

    fetchAllMedia();
    const intervalId = setInterval(fetchAllMedia, 15000);
    return () => clearInterval(intervalId);
  }, [storage]);

  const mergedVisions = useMemo(() => {
    const storageAll = [...storageVideos, ...storageImages];
    const storageMapped = storageAll.map(v => {
      const fsDoc = firestoreDocs?.find(d => d.id === v.id);
      return {
        ...v,
        isHidden: fsDoc ? !!fsDoc.isHidden : false,
        title: fsDoc?.title || v.title,
        description: fsDoc?.description || v.description,
      };
    });

    const storageIdsSet = new Set(storageAll.map(v => v.id));
    const firestoreOnly = firestoreDocs?.filter(doc => !storageIdsSet.has(doc.id)).map(doc => ({
      id: doc.id,
      title: doc.title || 'Untitled Fragment',
      mediaUrl: doc.mediaUrl || (doc.imageData ? (doc.imageData.startsWith('data:') ? doc.imageData : `data:image/png;base64,${doc.imageData}`) : ''),
      mediaType: doc.mediaType || (doc.imageData ? 'image' : 'video'),
      description: doc.description || 'Persistent Cloud Vision',
      createdAt: doc.createdAt,
      isHidden: !!doc.isHidden,
      isFallback: false,
      imageData: doc.imageData
    } satisfies Vision)) || [];

    const all = [...storageMapped, ...firestoreOnly];
    const uniqueMap = new Map<string, Vision>();
    all.forEach(v => { if (!uniqueMap.has(v.id)) uniqueMap.set(v.id, v); });
    const result = Array.from(uniqueMap.values());
    
    return result.length === 0 && !loadingStorage && !loadingFirestore ? FALLBACK_SAMPLES : result;
  }, [storageVideos, storageImages, firestoreDocs, loadingStorage, loadingFirestore]);

  return { visions: mergedVisions, loading: loadingStorage || loadingFirestore };
}
