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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!db || !path) return;

    const docRef = doc(db, path) as DocumentReference<T>;
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, path]);

  return { data, loading, error };
}
