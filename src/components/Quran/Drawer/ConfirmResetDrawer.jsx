'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';
import DrawerPanel from '@/components/_shared/DrawerPanel';

export default function ConfirmResetDrawer({
  isOpen,
  onClose,
  onConfirm,
  title = 'Reset Progress?',
  description = 'Apakah kamu yakin ingin mereset data ini? Tindakan ini tidak dapat dibatalkan.',
}) {
  return (
    <DrawerPanel
      open={isOpen}
      onClose={onClose}
      title={title}
      icon={AlertTriangle}
      titleColor='text-rose-600 dark:text-rose-400'
      hideFooterButton
    >
      <div className='flex flex-col items-center text-center mt-2'>
        <div className='w-16 h-16 bg-rose-100 dark:bg-rose-900/40 text-rose-500 flex items-center justify-center rounded-full mb-4'>
          <Trash2 size={32} />
        </div>

        <p className='text-sm text-slate-600 dark:text-slate-300 leading-relaxed px-2'>
          <strong>PERINGATAN!</strong> {description} <br />
          <br />
          <span className='text-rose-600 dark:text-rose-400 font-semibold'>
            Tindakan ini permanen dan data tidak dapat dikembalikan.
          </span>
        </p>

        <div className='flex gap-3 w-full mt-6'>
          <button
            onClick={onClose}
            className='flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors'
          >
            Batal
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className='flex-1 py-3.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition-colors shadow-md'
          >
            Ya, Reset
          </button>
        </div>
      </div>
    </DrawerPanel>
  );
}
