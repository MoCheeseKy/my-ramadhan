'use client';

import React from 'react';
import Image from 'next/image';
import { User, Edit3, ShieldCheck } from 'lucide-react';

/**
 * UserProfileCard — Menampilkan ringkasan profil pengguna.
 * @param {Object} props
 * @param {Object} props.user - Objek user dari useUser()
 * @param {Function} props.onEditProfile - Handler untuk membuka drawer edit
 */
const UserProfileCard = ({ user, onEditProfile }) => {
  // SECTION: FALLBACK LOADING STATE
  if (!user) {
    return (
      <div className='bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-pulse'>
        <div className='flex items-center gap-5'>
          <div className='w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full' />
          <div className='flex-1 space-y-3'>
            <div className='h-5 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2' />
            <div className='h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3' />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden group'>
      {/* SECTION: DECORATION */}
      <div className='absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/10 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110' />

      <div className='flex items-center gap-5 relative z-10'>
        {/* SECTION: AVATAR */}
        <div className='w-20 h-20 bg-gradient-to-tr from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center text-[#1e3a8a] dark:text-blue-400 shadow-inner shrink-0 relative overflow-hidden border-4 border-white dark:border-slate-800'>
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt='Profile'
              fill
              className='object-cover'
            />
          ) : (
            <User size={32} />
          )}
        </div>

        {/* SECTION: USER INFO */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-2 mb-1'>
            <h2 className='text-xl font-black text-slate-800 dark:text-slate-100 truncate'>
              {user.name || user.username || 'Hamba Allah'}
            </h2>
            <ShieldCheck size={16} className='text-blue-500 shrink-0' />
          </div>

          <div className='flex flex-wrap items-center gap-x-3 gap-y-1'>
            <span className='text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1'>
              ID:{' '}
              <span className='text-slate-700 dark:text-slate-200'>
                {user.personal_code || 'LOCAL_USER'}
              </span>
            </span>
            <span className='w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full hidden sm:block' />
            <span className='text-xs font-bold text-slate-500 dark:text-slate-400'>
              {user.location_city || 'Jakarta'}
            </span>
          </div>
        </div>

        {/* SECTION: EDIT BUTTON */}
        <button
          onClick={onEditProfile}
          className='w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all border border-transparent hover:border-blue-100 dark:hover:border-blue-800'
        >
          <Edit3 size={18} />
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard;
