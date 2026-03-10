'use client';

import { useEffect, useState } from 'react';
import {
  onSnapshot,
  doc,
  DocumentReference,
  DocumentData,
  Firestore,
} from 'firebase/firestore';

export function useDoc<T = DocumentData>(db: Firestore | null, path: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // If we don't have a valid db or path, reset everything and stop.
    if (!db || !path) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    const docRef = doc(db, path) as DocumentReference<T>;
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot.exists() ? (snapshot.data() as T) : null);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firebase useDoc error:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading, error };
}
