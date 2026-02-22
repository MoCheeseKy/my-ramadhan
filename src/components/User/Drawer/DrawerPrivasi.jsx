'use client';

import { Shield } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

/**
 * DrawerPrivasi — informasi kebijakan privasi MyRamadhan.
 */
const DrawerPrivasi = ({ open, onClose }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    title='Kebijakan Privasi'
    icon={Shield}
    titleColor='text-emerald-500 dark:text-emerald-400'
  >
    <div className='space-y-4'>
      <p>Kenyamanan dan privasi Anda adalah prioritas mutlak kami:</p>

      {[
        {
          num: 1,
          title: '100% Local-First (Data di HP Anda)',
          desc: 'Semua data Anda (Profil, Jurnal, Tracker Ibadah, Siklus Haid) disimpan sepenuhnya secara lokal di memori perangkat Anda (menggunakan IndexedDB/localforage).',
        },
        {
          num: 2,
          title: 'Tidak Ada Database Server',
          desc: 'Kami sudah tidak lagi menggunakan database cloud pihak ketiga. Kami tidak mengumpulkan, melihat, atau menyimpan data pribadi Anda di server mana pun.',
        },
        {
          num: 3,
          title: 'Transfer Data Langsung (P2P)',
          desc: 'Saat Anda memindahkan data ke perangkat baru, data ditransfer secara langsung antar perangkat (Peer-to-Peer) tanpa perantara server.',
        },
        {
          num: 4,
          title: 'Tanpa Iklan & Pelacakan',
          desc: 'Aplikasi ini bersih dari iklan pihak ketiga dan skrip pelacak yang memata-matai aktivitas Anda.',
        },
      ].map(({ num, title, desc }) => (
        <div key={num} className='flex gap-3 items-start'>
          <div className='w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-1 font-bold text-sm'>
            {num}
          </div>
          <div>
            <h4 className='font-bold text-slate-800 dark:text-slate-100'>
              {title}
            </h4>
            <p className='text-[13px] mt-0.5'>{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </DrawerPanel>
);

export default DrawerPrivasi;
