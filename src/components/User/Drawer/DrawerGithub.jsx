'use client';

import { Github, ExternalLink, Coffee } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

const DrawerGithub = ({ open, onClose }) => (
  <DrawerPanel
    open={open}
    onClose={onClose}
    title='Kode Sumber Aplikasi'
    icon={Github}
    hideFooterButton
  >
    <div className='space-y-4 pb-4'>
      <p className='text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl'>
        Kami menyediakan link source code untuk dipelajari bagi yang
        membutuhkan.
      </p>

      <div className='flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-xl border border-orange-100 dark:border-orange-800'>
        <Coffee className='text-orange-500 shrink-0 mt-0.5' size={18} />
        <p className='text-xs text-orange-800 dark:text-orange-300'>
          Sedikit pengingat: Jika kode ini bermanfaat bagi pembelajaran Anda,
          jangan lupa untuk cek traktir kopi ke pengembang ya! ☕
        </p>
      </div>

      <button
        onClick={() => {
          window.open(
            'https://github.com/MoCheeseKy/my-ramadhan-app',
            '_blank',
          );
          onClose();
        }}
        className='w-full mt-4 py-4 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 shadow-md active:scale-95'
      >
        Buka Repository GitHub <ExternalLink size={16} />
      </button>
    </div>
  </DrawerPanel>
);

export default DrawerGithub;
