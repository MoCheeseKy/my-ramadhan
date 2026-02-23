import { useEffect, useRef, useState } from 'react';
import { addReadingDuration } from '../lib/quranTrackerService';

// Function untuk melacak waktu membaca secara otomatis berdasarkan visibilitas halaman
export const useQuranTracker = (isReadingActive = true) => {
  const [sessionDuration, setSessionDuration] = useState(0);
  const timerRef = useRef(null);
  const lastTickRef = useRef(null);

  // Function untuk memulai timer
  const startTracking = () => {
    if (timerRef.current) return;
    lastTickRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const delta = Math.floor((now - lastTickRef.current) / 1000);
      if (delta > 0) {
        setSessionDuration((prev) => prev + delta);

        const today = new Date().toISOString().split('T')[0];
        addReadingDuration(today, delta);

        lastTickRef.current = now;
      }
    }, 5000);
  };

  // Function untuk menghentikan timer
  const stopTracking = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (!isReadingActive) {
      stopTracking();
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        startTracking();
      } else {
        stopTracking();
      }
    };

    if (document.visibilityState === 'visible') {
      startTracking();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopTracking();
    };
  }, [isReadingActive]);

  return { sessionDuration };
};
