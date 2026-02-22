'use client';

import localforage from 'localforage';

export default function useHaditsStorage() {
  const BOOKMARKS_KEY = 'hadits_bookmarks';
  const LASTREAD_KEY = 'hadits_lastread';
  const SETTINGS_KEY = 'hadits_settings';

  const loadHaditsData = async () => {
    try {
      const bookmarks = (await localforage.getItem(BOOKMARKS_KEY)) || [];
      const lastRead = (await localforage.getItem(LASTREAD_KEY)) || null;
      const settings = (await localforage.getItem(SETTINGS_KEY)) || null;
      return { bookmarks, lastRead, settings };
    } catch (error) {
      return { bookmarks: [], lastRead: null, settings: null };
    }
  };

  const saveBookmarks = async (newBookmarks) => {
    try {
      await localforage.setItem(BOOKMARKS_KEY, newBookmarks);
      return true;
    } catch (error) {
      return false;
    }
  };

  const saveLastRead = async (lastReadData) => {
    try {
      await localforage.setItem(LASTREAD_KEY, lastReadData);
      return true;
    } catch (error) {
      return false;
    }
  };

  const saveSettings = async (settingsData) => {
    try {
      await localforage.setItem(SETTINGS_KEY, settingsData);
      return true;
    } catch (error) {
      return false;
    }
  };

  return { loadHaditsData, saveBookmarks, saveLastRead, saveSettings };
}
