'use client';
/**
 * @fileOverview A listener component that catches and surfaces Firestore permission errors.
 */

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, throwing this error will trigger the Next.js error overlay
      // providing the agent with the contextual metadata needed to fix rules.
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => errorEmitter.off('permission-error', handlePermissionError);
  }, []);

  return null;
}
