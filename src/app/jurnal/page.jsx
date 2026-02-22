'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Heart,
  Wind,
  ChevronRight,
  PenLine,
  BookOpen,
  X,
  Sparkles,
} from 'lucide-react';
import { moods } from '@/data/journalPrompts';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import localforage from 'localforage';
import DrawerPanel from '@/components/_shared/DrawerPanel';

dayjs.locale('id');

const categories = [
  {
    id: 'daily',
    title: 'Refleksi Harian',
    subtitle: 'Cek perasaan hari ini',
    icon: PenLine,
    gradient: 'from-[#1e3a8a] to-indigo-700',
    bg: 'bg-blue-50 dark:bg-blue-900/40',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-100 dark:border-blue-800',
    accent: '#1e3a8a',
  },
  {
    id: 'syukur',
    title: 'Catatan Syukur',
    subtitle: 'Hitung nikmat hari ini',
    icon: Heart,
    gradient: 'from-emerald-400 to-teal-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-100 dark:border-emerald-800',
    accent: '#059669',
  },
  {
    id: 'ikhlaskan',
    title: 'Ruang Ikhlas',
    subtitle: 'Lepaskan beban & amarah',
    icon: Wind,
    gradient: 'from-rose-400 to-pink-600',
    bg: 'bg-rose-50 dark:bg-rose-900/40',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-100 dark:border-rose-800',
    accent: '#e11d48',
  },
  {
    id: 'bebas',
    title: 'Catatan Bebas',
    subtitle: 'Tulis ceritamu sendiri',
    icon: BookOpen,
    gradient: 'from-amber-400 to-orange-500',
    bg: 'bg-amber-50 dark:bg-amber-900/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-100 dark:border-amber-800',
    accent: '#d97706',
  },
];

export default function JurnalPage() {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Function untuk memuat list jurnal secara lokal
  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const data = (await localforage.getItem('journal_entries')) || [];
        const sortedData = data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );
        setEntries(sortedData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const handleDelete = async (id) => {
    try {
      const newEntries = entries.filter((e) => e.id !== id);
      await localforage.setItem('journal_entries', newEntries);
      setEntries(newEntries);
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  const getMood = (moodId) => moods.find((m) => m.id === moodId);
  const getCat = (catId) => categories.find((c) => c.id === catId);

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 pb-20'>
      <title>Jurnal Refleksi - MyRamadhan</title>
      <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => router.push('/')}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
          >
            <ArrowLeft
              size={20}
              className='text-slate-600 dark:text-slate-300'
            />
          </button>
          <h1 className='font-bold text-lg text-slate-800 dark:text-slate-100'>
            Jurnal Refleksi
          </h1>
        </div>
      </header>

      <main className='max-w-md md:max-w-3xl lg:max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8'>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className='pt-2 md:pt-4'
        >
          <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold mb-3 border border-indigo-100 dark:border-indigo-800'>
            <Sparkles size={12} /> Ruang Aman
          </div>
          <h2 className='text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100'>
            Bagaimana perasaanmu <br className='md:hidden' />{' '}
            <span className='text-[#1e3a8a] dark:text-blue-400'>hari ini?</span>
          </h2>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => router.push(`/jurnal/write/${cat.id}`)}
              className={`relative p-5 rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 text-left overflow-hidden ${cat.bg} ${cat.border}`}
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center mb-4 shadow-sm ${cat.text}`}
              >
                <cat.icon size={24} />
              </div>
              <h3 className={`font-bold text-lg mb-1 ${cat.text}`}>
                {cat.title}
              </h3>
              <p className='text-xs font-medium text-slate-500 dark:text-slate-400 opacity-80'>
                {cat.subtitle}
              </p>
              <ChevronRight
                size={18}
                className={`absolute bottom-5 right-5 ${cat.text} opacity-50`}
              />
            </motion.button>
          ))}
        </div>

        <div className='pt-4 border-t border-slate-200 dark:border-slate-800'>
          <h3 className='font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between'>
            <span>Catatan Sebelumnya</span>
            <span className='text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-full'>
              {entries.length} Catatan
            </span>
          </h3>

          {loading ? (
            <div className='space-y-4'>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className='h-32 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl'
                />
              ))}
            </div>
          ) : entries.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <AnimatePresence>
                {entries.map((entry) => {
                  const mood = getMood(entry.mood);
                  const cat = getCat(entry.category);
                  return (
                    <motion.div
                      key={entry.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedEntry(entry)}
                      className='bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm relative group cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors'
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Mencegah drawer terbuka saat klik tombol hapus
                          handleDelete(entry.id);
                        }}
                        className='absolute top-4 right-4 p-2 text-rose-500 bg-rose-50 dark:bg-rose-900/30 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10'
                      >
                        <X size={14} />
                      </button>
                      <div className='flex items-center gap-3 mb-3'>
                        <span className='text-2xl'>{mood?.icon || '💭'}</span>
                        <div>
                          <p
                            className={`text-[10px] font-bold uppercase tracking-wider ${cat?.text || 'text-slate-500'}`}
                          >
                            {cat?.title || 'Catatan'}
                          </p>
                          <p className='text-xs text-slate-400 dark:text-slate-500 font-medium'>
                            {dayjs(entry.created_at).format(
                              'DD MMM YYYY, HH:mm',
                            )}
                          </p>
                        </div>
                      </div>
                      <h4 className='font-bold text-slate-800 dark:text-slate-100 mb-2 pr-6'>
                        {entry.title}
                      </h4>
                      <p className='text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3'>
                        {entry.content}
                      </p>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className='text-center py-12 px-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl'>
              <div className='w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3'>
                <BookOpen
                  size={24}
                  className='text-slate-300 dark:text-slate-600'
                />
              </div>
              <h4 className='font-bold text-slate-700 dark:text-slate-200 mb-1'>
                Belum ada tulisan
              </h4>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Mulailah menulis apa yang kamu rasakan hari ini.
              </p>
            </div>
          )}
        </div>
      </main>

      <DrawerPanel
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title='Detail Catatan'
        icon={BookOpen}
        hideFooterButton
      >
        {selectedEntry && (
          <div className='space-y-5 pb-4'>
            <div className='flex items-center gap-3'>
              <span className='text-4xl'>
                {getMood(selectedEntry.mood)?.icon || '💭'}
              </span>
              <div>
                <h3 className='font-bold text-xl text-slate-800 dark:text-slate-100 leading-tight mb-1'>
                  {selectedEntry.title}
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400 font-medium'>
                  {dayjs(selectedEntry.created_at).format(
                    'DD MMMM YYYY, HH:mm',
                  )}
                </p>
              </div>
            </div>

            <div className='p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800'>
              <p className='text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap'>
                {selectedEntry.content}
              </p>
            </div>

            <button
              onClick={() => {
                sessionStorage.setItem(
                  'ramatalk_journal_context',
                  JSON.stringify(selectedEntry),
                );
                router.push('/ramatalk');
              }}
              className='w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95'
            >
              <Sparkles size={18} />
              Curhat ke Ramatalk
            </button>
          </div>
        )}
      </DrawerPanel>
    </div>
  );
}
