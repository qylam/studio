const fs = require('fs');
const file = 'src/app/share/[id]/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Imports
content = content.replace(
  "import { Download, Instagram, Twitter, Facebook, Zap, Loader2 } from 'lucide-react';",
  "import { Download, Instagram, Twitter, Facebook, Zap, Loader2, Film } from 'lucide-react';"
);

// handleVideoDownload
const handleVideoDownload = `
  const handleVideoDownload = () => {
    if (!vision?.videoUrl) return;
    const link = document.createElement('a');
    link.href = vision.videoUrl;
    link.download = \`my-free-time-video-\${docId.slice(0, 5)}.mp4\`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
`;

content = content.replace(
  "if (!docId) return null;",
  handleVideoDownload + "\n\n  if (!docId) return null;"
);

// UI Update
const videoUI = `
        {vision.videoUrl && (
          <div className="relative group mb-8">
            <div className="absolute -inset-1 bg-[#9B72CB]/20 rounded-lg blur-lg"></div>
            <div className="relative rounded-xl shadow-2xl overflow-hidden bg-black border border-white/10 aspect-video">
              <video src={vision.videoUrl} autoPlay loop muted playsInline className="w-full h-full object-cover" />
            </div>
            <div className="mt-4">
              <Button 
                onClick={handleVideoDownload}
                className="w-full bg-[#9B72CB] hover:bg-[#9B72CB]/90 text-white py-6 text-xl h-auto rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Film className="mr-3 h-6 w-6" />
                Download Video
              </Button>
            </div>
          </div>
        )}

        <div className="relative group">
`;

content = content.replace(
  '<div className="relative group">',
  videoUI
);

fs.writeFileSync(file, content);
console.log('Share page patched!');
