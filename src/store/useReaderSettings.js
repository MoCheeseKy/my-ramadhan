'use client';

import { useState, useEffect } from 'react';
import localforage from 'localforage';
import { DEFAULT_READER_SETTINGS } from '@/data/quranConstants';

const useReaderSettings = () => {
  const [settings, setSettings] = useState(DEFAULT_READER_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await localforage.getItem('quran_settings');
        if (saved) setSettings(saved);
      } catch (error) {
        console.error(error);
      } finally {
        setLoaded(true);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localforage.setItem('quran_settings', settings).catch(console.error);
  }, [settings, loaded]);

  const toggleSetting = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const setArabSize = (sizeKey) =>
    setSettings((prev) => ({ ...prev, arabSize: sizeKey }));

  return { settings, toggleSetting, setArabSize };
};

export default useReaderSettings;
