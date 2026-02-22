import { useState, useEffect } from 'react';
import localforage from 'localforage';
import { DEFAULT_READER_SETTINGS } from '@/data/quranConstants';

/**
 * useReaderSettings — mengelola state settings reader (arab/latin/terjemah/tajwid/arabSize).
 *
 * @param {object|null} user - User dari useUser()
 * @returns {{ settings, toggleSetting, setArabSize }}
 */
const useReaderSettings = (user) => {
  const [settings, setSettings] = useState(DEFAULT_READER_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storageKey = `myRamadhan_quran_settings_${user?.personal_code || 'local'}`;

        let saved = await localforage.getItem(storageKey);

        // Fallback ke localStorage
        if (!saved) {
          saved = JSON.parse(localStorage.getItem('myRamadhan_quran_settings'));
        }

        if (saved) setSettings(saved);
      } catch (error) {
        console.error('Error loading reader settings:', error);
      }
      setLoaded(true);
    };

    loadSettings();
  }, [user]);

  useEffect(() => {
    if (!loaded) return;

    try {
      const storageKey = `myRamadhan_quran_settings_${user?.personal_code || 'local'}`;

      localStorage.setItem(
        'myRamadhan_quran_settings',
        JSON.stringify(settings),
      );

      localforage
        .setItem(storageKey, settings)
        .catch((err) => console.error('Error saving to localforage:', err));

      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('reader_settings_updated', { detail: settings }),
        );
      }
    } catch (error) {
      console.error('Error syncing settings:', error);
    }
  }, [settings, loaded, user]);

  const toggleSetting = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  const setArabSize = (sizeKey) =>
    setSettings((prev) => ({ ...prev, arabSize: sizeKey }));

  return { settings, toggleSetting, setArabSize };
};

export default useReaderSettings;
