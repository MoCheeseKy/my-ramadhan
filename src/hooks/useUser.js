'use client';

import { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function useUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadLocalUser = async () => {
    try {
      let localUser = await localforage.getItem('user_profile');

      if (!localUser) {
        localUser = {
          name: 'Sahabat',
          avatar: null,
          location: 'Bandung',
          createdAt: new Date().toISOString(),
        };
        await localforage.setItem('user_profile', localUser);
      }

      setUser(localUser);
    } catch (error) {
      console.error('Gagal memuat profil pengguna lokal:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocalUser();

    const handleProfileUpdate = () => {
      loadLocalUser();
    };

    window.addEventListener('user_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('user_profile_updated', handleProfileUpdate);
    };
  }, []);

  return { user, loading, refetchUser: loadLocalUser };
}
