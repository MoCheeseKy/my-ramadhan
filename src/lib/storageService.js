import localforage from 'localforage';

// ─── KONFIGURASI DATABASE LOKAL (INDEXEDDB) ───
localforage.config({
  name: 'MyRamadhanApp',
  storeName: 'ramadhan_data',
});

export const StorageService = {
  // =====================================================================
  // 1. PROFIL & PREFERENSI
  // =====================================================================
  async getProfile() {
    return (
      (await localforage.getItem('profile')) || {
        name: 'Hamba Allah',
        location_city: 'Jakarta',
        app_theme: 'light',
      }
    );
  },

  async saveProfile(updateData) {
    const currentProfile = await this.getProfile();
    const newProfile = { ...currentProfile, ...updateData };
    await localforage.setItem('profile', newProfile);
    return newProfile;
  },

  // =====================================================================
  // 2. DAILY TRACKER (Ibadah Harian)
  // =====================================================================
  async getDailyTracker(date) {
    const trackers = (await localforage.getItem('trackers')) || {};
    return trackers[date] || null;
  },

  async saveDailyTracker(date, trackerData) {
    const trackers = (await localforage.getItem('trackers')) || {};
    trackers[date] = { ...trackers[date], ...trackerData, date };
    await localforage.setItem('trackers', trackers);
    return trackers[date];
  },

  // =====================================================================
  // 3. JURNAL REFLEKSI
  // =====================================================================
  async getJournals() {
    return (await localforage.getItem('journals')) || [];
  },

  async saveJournal(journalEntry) {
    const journals = await this.getJournals();

    // Jika entry baru
    if (!journalEntry.id) {
      journalEntry.id = Date.now().toString();
      journalEntry.created_at = new Date().toISOString();
      journals.unshift(journalEntry); // Taruh di paling atas
    } else {
      // Update entry lama
      const index = journals.findIndex((j) => j.id === journalEntry.id);
      if (index > -1) {
        journals[index] = { ...journals[index], ...journalEntry };
      }
    }
    await localforage.setItem('journals', journals);
    return journalEntry;
  },

  async deleteJournal(id) {
    const journals = await this.getJournals();
    const filteredJournals = journals.filter((j) => j.id !== id);
    await localforage.setItem('journals', filteredJournals);
    return true;
  },

  // =====================================================================
  // 4. HAID TRACKER
  // =====================================================================
  async getHaidData() {
    return (
      (await localforage.getItem('haid_data')) || { logs: [], settings: {} }
    );
  },

  async saveHaidData(haidData) {
    await localforage.setItem('haid_data', haidData);
    return haidData;
  },

  // =====================================================================
  // 5. BOOKMARK & PROGRESS BACAAN (Qur'an, Doa, Fiqih, dll)
  // =====================================================================
  async getUserMeta(columnKey) {
    const meta = (await localforage.getItem('user_meta')) || {};
    return meta[columnKey] || null;
  },

  async saveUserMeta(columnKey, value) {
    const meta = (await localforage.getItem('user_meta')) || {};
    meta[columnKey] = value;
    await localforage.setItem('user_meta', meta);
    return value;
  },

  // =====================================================================
  // 6. MESIN SINKRONISASI P2P (WEBRTC) & BACKUP
  // =====================================================================

  // Mengambil SEMUA data dari HP untuk dikirim via QR/File
  async getAllSyncData() {
    return {
      profile: await localforage.getItem('profile'),
      trackers: await localforage.getItem('trackers'),
      journals: await localforage.getItem('journals'),
      haid_data: await localforage.getItem('haid_data'),
      user_meta: await localforage.getItem('user_meta'),
      last_sync: new Date().toISOString(),
    };
  },

  // Menerima data dari HP lain dan MENIMPA data lokal
  async importSyncData(syncData) {
    if (!syncData) throw new Error('Data sinkronisasi kosong');

    if (syncData.profile)
      await localforage.setItem('profile', syncData.profile);
    if (syncData.trackers)
      await localforage.setItem('trackers', syncData.trackers);
    if (syncData.journals)
      await localforage.setItem('journals', syncData.journals);
    if (syncData.haid_data)
      await localforage.setItem('haid_data', syncData.haid_data);
    if (syncData.user_meta)
      await localforage.setItem('user_meta', syncData.user_meta);

    return true;
  },

  // =====================================================================
  // 7. FUNGSI RESET / DANGER ZONE
  // =====================================================================
  async clearAllData() {
    await localforage.removeItem('trackers');
    await localforage.removeItem('journals');
    await localforage.removeItem('haid_data');
    await localforage.removeItem('user_meta');
    // Profile sengaja tidak dihapus agar user tidak perlu seting lokasi & tema dari awal
    return true;
  },
};
