import { NextRequest, NextResponse } from 'next/server';
import { adminStorage } from '@/firebase/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    
    if (!path || path.length === 0) {
      return new NextResponse('Missing file path', { status: 400 });
    }

    // Reconstruct the full path to the file in Firebase Storage
    // Example path array: ['visions', 'user123', '123456.jpg']
    const fullPath = path.join('/');

    const bucket = adminStorage.bucket();
    let file = bucket.file(fullPath);

    // Check if the file exists
    let [exists] = await file.exists();

    // Fallback: If the framed polaroid doesn't exist, try the _raw version
    // This happens if an older upload failed halfway and only saved the raw image
    if (!exists && !fullPath.includes('_raw')) {
      const rawPath = fullPath.replace('.jpg', '_raw.jpg');
      const rawFile = bucket.file(rawPath);
      const [rawExists] = await rawFile.exists();
      if (rawExists) {
        file = rawFile;
        exists = true;
      }
    }

    if (!exists) {
        return new NextResponse('File not found in storage', { status: 404 });
    }

    // Get metadata to determine content type and size
    const [metadata] = await file.getMetadata();

    // Create a read stream from the Firebase Storage file
    const stream = file.createReadStream();

    // Use filename from the last part of the path, or a default
    const filename = path[path.length - 1] || 'vision.jpg';

    // The stream is technically a Node.js Readable stream. 
    // Next.js (Node 18+) Response expects a Web ReadableStream. 
    // We can convert it or just cast it, but Node 18+ Response handles Node streams reasonably well.
    // A safer way is using the new Web Streams API approach or just passing the stream.
    
    return new NextResponse(stream as any, {
      headers: {
        'Content-Type': metadata.contentType || 'image/jpeg',
        // Force the browser to download the file instead of opening it
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
