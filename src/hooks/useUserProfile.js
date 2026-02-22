'use client';

import { useState, useEffect } from 'react';
import localforage from 'localforage';

export default function useUserProfile() {
  const [profile, setProfile] = useState({
    name: 'Hamba Allah',
    email: '',
    targetKhatam: 1,
    avatarId: 1,
    joinDate: new Date().toISOString(),
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const storedProfile = await localforage.getItem(
        'myramadhan_user_profile',
      );

      if (storedProfile) {
        setProfile(storedProfile);
      } else {
        await localforage.setItem('myramadhan_user_profile', profile);
      }
    } catch (error) {
      console.error('Gagal memuat profil lokal:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (newProfileData) => {
    try {
      const updatedProfile = { ...profile, ...newProfileData };
      await localforage.setItem('myramadhan_user_profile', updatedProfile);
      setProfile(updatedProfile);
      return { success: true };
    } catch (error) {
      console.error('Gagal update profil lokal:', error);
      return { success: false, error };
    }
  };

  return { profile, loading, updateProfile };
}
