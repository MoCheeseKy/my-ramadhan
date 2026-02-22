'use client';

import { HelpCircle } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerBantuan — konten FAQ penggunaan MyRamadhan.
 */
const DrawerBantuan = ({ open, onClose }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    title='Bantuan & FAQ'
    icon={HelpCircle}
    titleColor='text-blue-500 dark:text-blue-400'
  >
    <div className='space-y-4'>
      <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl'>
        <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2'>
          <span className='text-blue-500 font-black'>Q.</span> Kenapa data saya
          tidak ada di HP lain?
        </h4>
        <p className='text-[13px] mt-1.5'>
          Karena aplikasi ini 100% berjalan offline (Local-First). Data Anda
          tersimpan aman di memori HP tempat Anda mengisinya, tidak di server.
        </p>
      </div>
      <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl'>
        <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2'>
          <span className='text-blue-500 font-black'>Q.</span> Bagaimana cara
          pindah HP tanpa hilang data?
        </h4>
        <p className='text-[13px] mt-1.5'>
          Anda bisa menggunakan fitur "Sinkronisasi Perangkat (P2P)" di menu
          profil untuk memindahkan data langsung via QR Code/Link, atau
          menggunakan "Manajemen Data" untuk ekspor/impor file.
        </p>
      </div>
      <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl'>
        <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2'>
          <span className='text-blue-500 font-black'>Q.</span> Kenapa lokasi
          sholat saya salah?
        </h4>
        <p className='text-[13px] mt-1.5'>
          Anda bisa mengubah lokasi kota secara manual melalui tombol "Edit
          Profil" (ikon pensil) yang ada di bagian atas halaman Profil ini.
        </p>
      </div>
      <div className='bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl'>
        <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-1 flex items-center gap-2'>
          <span className='text-blue-500 font-black'>Q.</span> Apakah aplikasi
          ini butuh kuota internet?
        </h4>
        <p className='text-[13px] mt-1.5'>
          Setelah Anda membukanya pertama kali (atau di-install sebagai PWA),
          sebagian besar fitur (Al-Qur'an, Hadits, Tracker) bisa berjalan tanpa
          internet. Internet hanya butuh untuk AI Ramatalk dan pembaruan jadwal
          sholat.
        </p>
      </div>
    </div>
  </DrawerPanel>
);

export default DrawerBantuan;
