import { ref, listAll, getBytes, getDownloadURL, type StorageReference } from "firebase/storage";
import { initializeFirebase } from "@/firebase";

export interface VisionImage {
  id: string;
  base64Data: string;
  title?: string;
  timestamp?: number;
  fullPath?: string;
}

/**
 * Fetches images from Firebase Storage bucket: gs://free-timemachine-ent-923-220cc.firebasestorage.app
 * Traverses 2 levels deep under the 'visions' folder.
 * Filters for images that have "RAW" in their name.
 */
export async function fetchVisionsImages(): Promise<VisionImage[]> {
  const { storage } = initializeFirebase();
  
  try {
    const rootRef = ref(storage, 'visions');
    let imageRefs: StorageReference[] = [];
    
    // Level 1 Traversal: Get subfolders under 'visions'
    const level1 = await listAll(rootRef);
    
    for (const l1Ref of level1.prefixes) {
      // Level 2 Traversal: Get files inside each subfolder
      const level2 = await listAll(l1Ref);
      
      // Filter for files that are marked "RAW" (case-insensitive check in filename)
      const rawImages = level2.items.filter(item => 
        item.name.toUpperCase().includes("RAW")
      );
      
      imageRefs.push(...rawImages);
      
      if (imageRefs.length >= 18) break;
    }

    if (imageRefs.length === 0) {
      console.warn("No 'RAW' images found 2 levels deep under /visions/");
      return [];
    }

    const images = await Promise.all(
      imageRefs.slice(0, 6).map(async (itemRef) => {
        try {
          const bytes = await getBytes(itemRef);
          
          let binary = '';
          const uint8 = new Uint8Array(bytes);
          for (let i = 0; i < uint8.byteLength; i++) {
            binary += String.fromCharCode(uint8[i]);
          }
          const b64 = window.btoa(binary);
          
          return {
            id: itemRef.name,
            base64Data: `data:image/jpeg;base64,${b64}`,
            title: itemRef.name.split('.')[0].replace(/[-_]/g, ' ') || "Vision",
            timestamp: Date.now(),
            fullPath: itemRef.fullPath
          };
        } catch (e) {
          console.error(`Error loading image ${itemRef.name}:`, e);
          return null;
        }
      })
    );

    return images.filter((img): img is VisionImage => img !== null);
  } catch (error) {
    console.error("Storage fetch error:", error);
    return [];
  }
}

/**
 * Gets a temporary public download URL for a storage path.
 */
export async function getVisionDownloadUrl(fullPath: string): Promise<string> {
  const { storage } = initializeFirebase();
  const fileRef = ref(storage, fullPath);
  return await getDownloadURL(fileRef);
}

