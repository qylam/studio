import React from "react";
import { VisionImage } from "@/lib/vision-service";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ImageDetailModalProps {
  image: VisionImage | null;
  onClose: () => void;
}

export function ImageDetailModal({ image, onClose }: ImageDetailModalProps) {
  if (!image) return null;

  return (
    <Dialog open={!!image} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden bg-black border-none shadow-2xl rounded-[0.98rem]">
        <div className="relative flex flex-col w-full h-full">
          <div className="absolute right-6 top-6 z-10">
            <button 
              onClick={onClose}
              className="bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-md transition-colors border border-white/10"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-center bg-black h-full w-full">
            <img
              src={image.base64Data}
              alt={image.title || "Detail view"}
              className="max-h-[85vh] max-w-full object-contain"
            />
          </div>
          
          {image.title && (
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
              <h2 className="text-xl font-medium text-white/90">{image.title}</h2>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}