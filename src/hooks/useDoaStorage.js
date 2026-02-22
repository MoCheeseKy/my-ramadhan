import localforage from 'localforage';

/**
 * useDoaStorage — menyediakan fungsi baca/tulis data Doa secara lokal ONLY:
 * MIGRASI: Gunakan localforage + localStorage, NO Supabase
 *
 * @param {object|null} user - User dari useUser()
 * @returns {object}         - { loadDoaData, saveBookmarks, saveCustomDoas, saveSettings }
 */
const useDoaStorage = (user) => {
  // ─── Read ───────────────────────────────────────────���────────────────────────

  const loadDoaData = async () => {
    try {
      const userKey = user?.personal_code || 'local';

      // Load dari localforage
      const bookmarks =
        (await localforage.getItem(`doa_bookmarks_${userKey}`)) ||
        JSON.parse(localStorage.getItem('myRamadhan_doa_bookmarks')) ||
        [];

      const customDoas =
        (await localforage.getItem(`doa_custom_${userKey}`)) ||
        JSON.parse(localStorage.getItem('myRamadhan_doa_custom')) ||
        [];

      const settings =
        (await localforage.getItem(`doa_settings_${userKey}`)) ||
        JSON.parse(localStorage.getItem('myRamadhan_doa_settings')) ||
        null;

      return { bookmarks, customDoas, settings };
    } catch (error) {
      console.error('Error loading doa data:', error);
      return { bookmarks: [], customDoas: [], settings: null };
    }
  };

  // ─── Write bookmarks ─────────────────────────────────────────────────────────

  const saveBookmarks = async (newBookmarks) => {
    try {
      const userKey = user?.personal_code || 'local';

      // Simpan ke localStorage
      localStorage.setItem(
        'myRamadhan_doa_bookmarks',
        JSON.stringify(newBookmarks),
      );

      // Simpan ke localforage
      await localforage.setItem(`doa_bookmarks_${userKey}`, newBookmarks);

      // Trigger sync event
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('doa_bookmarks_updated', { detail: newBookmarks }),
        );
      }
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  };

  // ─── Write custom doas ───────────────────────────────────────────────────────

  const saveCustomDoas = async (newCustomDoas) => {
    try {
      const userKey = user?.personal_code || 'local';

      // Simpan ke localStorage
      localStorage.setItem(
        'myRamadhan_doa_custom',
        JSON.stringify(newCustomDoas),
      );

      // Simpan ke localforage
      await localforage.setItem(`doa_custom_${userKey}`, newCustomDoas);

      // Trigger sync event
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('doa_custom_updated', { detail: newCustomDoas }),
        );
      }
    } catch (error) {
      console.error('Error saving custom doas:', error);
    }
  };

  // ─── Write settings ──────────────────────────────────────────────────────────

  const saveSettings = async (newSettings) => {
    try {
      const userKey = user?.personal_code || 'local';

      // Simpan ke localStorage
      localStorage.setItem(
        'myRamadhan_doa_settings',
        JSON.stringify(newSettings),
      );

      // Simpan ke localforage
      await localforage.setItem(`doa_settings_${userKey}`, newSettings);

      // Trigger sync event
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('doa_settings_updated', { detail: newSettings }),
        );
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  return { loadDoaData, saveBookmarks, saveCustomDoas, saveSettings };
};

export default useDoaStorage;
