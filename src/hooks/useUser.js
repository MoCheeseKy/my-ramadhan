'use client';

import { useState, useEffect } from 'react';
import { StorageService } from '@/lib/storageService';

/**
 * Hook untuk mengambil data profil pengguna dari penyimpanan lokal (IndexedDB)
 * @returns {{ user: object|null, loading: boolean, mutateUser: Function }}
 */
export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fungsi untuk memuat ulang data profil dari storage lokal secara asinkron
   */
  const mutateUser = async () => {
    setLoading(true);
    try {
      const profile = await StorageService.getProfile();

      profile.username = profile.name;

      setUser(profile);
    } catch (error) {
      console.error(error);
      setUser({
        name: 'Hamba Allah',
        username: 'Hamba Allah',
        location_city: 'Jakarta',
        app_theme: 'light',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    mutateUser();
  }, []);

  return { user, loading, mutateUser };
}
