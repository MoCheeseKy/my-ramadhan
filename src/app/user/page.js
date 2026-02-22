'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Smartphone } from 'lucide-react';
import localforage from 'localforage';

import useUser from '@/hooks/useUser';

import UserProfileCard from '@/components/User/UserProfileCard';
import PreferensiMenuSection from '@/components/User/PreferensiMenuSection';
import BantuanMenuSection from '@/components/User/BantuanMenuSection';

import DrawerConfirmReset from '@/components/User/Drawer/DrawerConfirmReset';
import DrawerEditProfil from '@/components/User/Drawer/DrawerEditProfil';
import DrawerDataManagement from '@/components/User/Drawer/DrawerDataManagement';
import DrawerTema from '@/components/User/Drawer/DrawerTema';
import DrawerBantuan from '@/components/User/Drawer/DrawerBantuan';
import DrawerPrivasi from '@/components/User/Drawer/DrawerPrivasi';
import DrawerTentang from '@/components/User/Drawer/DrawerTentang';
import DrawerPengembang from '@/components/User/Drawer/DrawerPengembang';
import DrawerDonasi from '@/components/User/Drawer/DrawerDonasi';
import DrawerSyncDevice from '@/components/User/Drawer/DrawerSyncDevice';

const DRAWERS = {
  EDIT_PROFIL: 'edit_profil',
  TEMA: 'tema',
  DATA_MANAGEMENT: 'data_management',
  CONFIRM_RESET: 'confirm_reset',
  BANTUAN: 'bantuan',
  PRIVASI: 'privasi',
  TENTANG: 'tentang',
  PENGEMBANG: 'pengembang',
  DONASI: 'donasi',
  SYNC_DEVICE: 'sync_device',
};

export default function UserProfile() {
  const router = useRouter();
  const { user, loading } = useUser();

  const [activeDrawer, setActiveDrawer] = useState(null);
  const closeDrawer = () => setActiveDrawer(null);

  const [theme, setTheme] = useState('light');
  const [editName, setEditName] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Function untuk memuat data pengguna secara lokal
  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditLocation(user.location || '');
      setAvatar(user.avatar || null);
    }
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
  }, [user]);

  // Function untuk mengganti tema aplikasi
  const toggleTheme = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Function untuk mengonversi foto profil menjadi base64
  const handleUploadPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // Function untuk menyimpan pembaruan profil ke penyimpanan lokal
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const updatedUser = {
        ...user,
        name: editName,
        location: editLocation,
        avatar,
      };
      await localforage.setItem('user_profile', updatedUser);

      window.dispatchEvent(new Event('user_profile_updated'));

      closeDrawer();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Function untuk mengekspor data lokal menjadi file JSON
  const handleExportData = async () => {
    try {
      const keys = await localforage.keys();
      const exportData = {};
      for (const key of keys) {
        exportData[key] = await localforage.getItem(key);
      }
      const blob = new Blob([JSON.stringify(exportData)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_myramadhan_${new Date().getTime()}.json`;
      a.click();
    } catch (error) {
      console.error('Export gagal', error);
    }
  };

  // Function untuk mengimpor data dari file JSON ke penyimpanan lokal
  const handleImportData = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result);
        for (const key of Object.keys(data)) {
          await localforage.setItem(key, data[key]);
        }
        alert('Data berhasil diimpor! Aplikasi akan dimuat ulang.');
        window.location.reload();
      } catch (error) {
        alert('Format file tidak valid!');
      }
    };
    reader.readAsText(file);
  };

  // Function untuk menghapus semua data aplikasi
  const executeResetData = async () => {
    await localforage.clear();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 flex justify-center items-center'>
        <div className='w-8 h-8 border-4 border-[#1e3a8a] dark:border-blue-400 border-t-transparent rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-24 transition-colors duration-300'>
      <header className='sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto flex items-center gap-3 w-full'>
          <button
            onClick={() => router.push('/')}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            <ArrowLeft
              size={20}
              className='text-slate-600 dark:text-slate-300'
            />
          </button>
          <h1 className='font-bold text-xl text-[#1e3a8a] dark:text-white'>
            User Profile
          </h1>
        </div>
      </header>

      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 space-y-6 mt-2'>
        <UserProfileCard
          user={user}
          profileData={user}
          locationName={editLocation}
          onEditProfile={() => setActiveDrawer(DRAWERS.EDIT_PROFIL)}
        />

        <div className='flex flex-col md:grid md:grid-cols-2 gap-6 items-start'>
          <div className='space-y-6 w-full order-1'>
            <PreferensiMenuSection
              theme={theme}
              onOpenTema={() => setActiveDrawer(DRAWERS.TEMA)}
              onOpenData={() => setActiveDrawer(DRAWERS.DATA_MANAGEMENT)}
              onOpenReset={() => setActiveDrawer(DRAWERS.CONFIRM_RESET)}
            />
            <div className='w-full'>
              <button
                onClick={() => setActiveDrawer(DRAWERS.SYNC_DEVICE)}
                className='w-full py-4 bg-[#1e3a8a] text-white font-bold rounded-2xl shadow-md hover:bg-blue-800 transition-all flex items-center justify-center gap-2'
              >
                <Smartphone size={18} /> Sinkronisasi Perangkat (P2P)
              </button>
            </div>
          </div>

          <div className='w-full order-2'>
            <BantuanMenuSection
              onOpenBantuan={() => setActiveDrawer(DRAWERS.BANTUAN)}
              onOpenPrivasi={() => setActiveDrawer(DRAWERS.PRIVASI)}
              onOpenTentang={() => setActiveDrawer(DRAWERS.TENTANG)}
              onOpenPengembang={() => setActiveDrawer(DRAWERS.PENGEMBANG)}
              onOpenDonasi={() => setActiveDrawer(DRAWERS.DONASI)}
            />
          </div>
        </div>

        <p className='text-center text-[10px] font-medium text-slate-400 dark:text-slate-600 mt-6 md:mt-10 mb-2'>
          MyRamadhan App v1.1.0 &copy; {new Date().getFullYear()}
        </p>
      </main>

      <DrawerConfirmReset
        open={activeDrawer === DRAWERS.CONFIRM_RESET}
        onClose={closeDrawer}
        onConfirm={() => executeResetData()}
      />
      <DrawerEditProfil
        open={activeDrawer === DRAWERS.EDIT_PROFIL}
        onClose={closeDrawer}
        profileData={user || {}}
        editName={editName}
        setEditName={setEditName}
        editLocation={editLocation}
        setEditLocation={setEditLocation}
        isUploading={isUploading}
        isSaving={isSaving}
        onUploadPhoto={handleUploadPhoto}
        onSaveProfile={handleSaveProfile}
      />
      <DrawerDataManagement
        open={activeDrawer === DRAWERS.DATA_MANAGEMENT}
        onClose={closeDrawer}
        onExport={handleExportData}
        onImport={handleImportData}
      />
      <DrawerTema
        open={activeDrawer === DRAWERS.TEMA}
        onClose={closeDrawer}
        theme={theme}
        onToggleTheme={(t) => {
          toggleTheme(t);
          closeDrawer();
        }}
      />
      <DrawerBantuan
        open={activeDrawer === DRAWERS.BANTUAN}
        onClose={closeDrawer}
      />
      <DrawerPrivasi
        open={activeDrawer === DRAWERS.PRIVASI}
        onClose={closeDrawer}
      />
      <DrawerTentang
        open={activeDrawer === DRAWERS.TENTANG}
        onClose={closeDrawer}
      />
      <DrawerPengembang
        open={activeDrawer === DRAWERS.PENGEMBANG}
        onClose={closeDrawer}
      />
      <DrawerDonasi
        open={activeDrawer === DRAWERS.DONASI}
        onClose={closeDrawer}
      />
      <DrawerSyncDevice
        open={activeDrawer === DRAWERS.SYNC_DEVICE}
        onClose={closeDrawer}
      />
    </div>
  );
}
