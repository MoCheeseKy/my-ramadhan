'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Search,
  BookOpen,
  Book,
  Bookmark,
  BarChart2,
  AlertCircle,
  X,
} from 'lucide-react';
import useUser from '@/hooks/useUser';
import useQuranStorage from '@/hooks/useQuranStorage';
import { getReadingHistory } from '@/lib/quranTrackerService';
import LastReadBanner from '@/components/Quran/LastReadBanner';
import BookmarkCard from '@/components/Quran/BookmarkCard';

import KhatamPlanCard from '@/components/Quran/KhatamPlanCard';
import HeatmapStatsDrawer from '@/components/Quran/Drawer/HeatmapStatsDrawer';

const TABS = [
  { key: 'surah', label: 'Surah' },
  { key: 'juz', label: 'Juz' },
];

const JUZ_LIST = Array.from({ length: 30 }, (_, i) => i + 1);

export default function QuranIndex() {
  const router = useRouter();
  const { user } = useUser();
  const storage = useQuranStorage(user);

  const [view, setView] = useState('home');
  const [activeTab, setActiveTab] = useState('surah');

  const [surahs, setSurahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [lastRead, setLastRead] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);

  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [reminderData, setReminderData] = useState(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const res = await fetch('https://equran.id/api/v2/surat');
        if (!res.ok) throw new Error('Gagal fetch data surah');
        const json = await res.json();
        setSurahs(json.data || []);
      } catch (err) {
        console.error('Error fetching surahs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      const data = await storage.loadQuranData();
      if (data.lastRead) setLastRead(data.lastRead);
      if (data.bookmarks) setBookmarks(data.bookmarks);
    };
    loadData();

    // Kalkulasi Banner Pengingat 3 Hari
    const history = getReadingHistory() || {};
    let totalSecs3Days = 0;
    let metTargetAnyDay = false;
    const today = new Date();

    for (let i = 0; i < 3; i++) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i,
        12,
        0,
        0,
      );
      const dateStr = d.toISOString().split('T')[0];
      const secs = history[dateStr] || 0;

      totalSecs3Days += secs;
      if (secs >= 180) metTargetAnyDay = true; // Minimal baca 3 menit
    }

    const avgSeconds = Math.floor(totalSecs3Days / 3);

    // Munculkan peringatan JIKA dalam 3 hari tidak ada yg melebihi 3 menit
    if (!metTargetAnyDay) {
      setReminderData({ avgSeconds });
    }
  }, [user]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (activeTab === 'juz') {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 1 && num <= 30) {
        router.push(`/quran/juz/${num}`);
      }
    }
  };

  const handleResetLastRead = async () => {
    await storage.saveLastRead(null);
    setLastRead(null);
  };

  // Function untuk mereset progress dan menghapus tanda terakhir dibaca saat khatam
  const handleFullReset = async () => {
    const isConfirmed = window.confirm(
      'Apakah kamu yakin ingin mereset seluruh progress membaca dan menghapus riwayat terakhir dibaca?',
    );

    if (isConfirmed) {
      setReadPages([]);
      setIsKhatam(false);
      await handleResetLastRead();
    }
  };

  const filteredSurahs = surahs.filter(
    (s) =>
      s.namaLatin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.arti.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRemoveBookmark = async (bookmarkToRemove) => {
    const newBookmarks = bookmarks.filter(
      (b) =>
        !(
          b.surahId === bookmarkToRemove.surahId &&
          b.ayahNumber === bookmarkToRemove.ayahNumber
        ),
    );
    setBookmarks(newBookmarks);

    await storage.saveBookmarksData(newBookmarks);
  };

  const handleContinue = () => {
    if (!lastRead) return;
    const url = lastRead.isJuz
      ? `/quran/juz/${lastRead.juzNumber || 1}#ayat-${lastRead.surahId}-${lastRead.ayahNumber}`
      : `/quran/surah/${lastRead.surahId}#ayat-${lastRead.ayahNumber}`;
    router.push(url);
  };

  const isSearching = searchQuery.trim().length > 0;

  // Formatter waktu untuk banner pengingat
  const formatAvgTime = (secs) => {
    if (secs < 60) return `${secs} detik`;
    return `${Math.floor(secs / 60)} menit`;
  };

  if (view === 'bookmarks') {
    // ... Bagian Bookmarks sama seperti kode aslimu ...
    return (
      <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20'>
        <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800'>
          <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 py-4 flex items-center gap-3'>
            <button
              onClick={() => setView('home')}
              className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
            >
              <ArrowLeft
                size={20}
                className='text-slate-600 dark:text-slate-300'
              />
            </button>
            <h1 className='font-bold text-xl flex items-center gap-2 text-[#1e3a8a] dark:text-blue-400'>
              <Bookmark size={22} /> Ayat Disimpan
            </h1>
          </div>
        </header>

        <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-6 lg:py-8 lg:px-6'>
          {bookmarks.length === 0 ? (
            <div className='text-center py-20 opacity-50'>
              <Bookmark
                size={64}
                className='mx-auto mb-4 text-slate-300 dark:text-slate-600'
              />
              <p className='text-base font-medium'>
                Belum ada ayat yang disimpan.
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5'>
              {bookmarks.map((b, i) => (
                <BookmarkCard
                  key={i}
                  bookmark={b}
                  onRemove={handleRemoveBookmark}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-20 selection:bg-blue-200 dark:selection:bg-blue-800 relative'>
      <header className='sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800'>
        <div className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between mb-4 lg:mb-5'>
            <div className='flex items-center gap-4'>
              <button
                onClick={() => router.push('/')}
                className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'
              >
                <ArrowLeft
                  size={20}
                  className='text-slate-600 dark:text-slate-300'
                />
              </button>
              <h1 className='font-bold text-xl flex items-center gap-2 text-[#1e3a8a] dark:text-blue-400'>
                <BookOpen size={24} /> Al-Qur'an
              </h1>
            </div>

            <div className='flex items-center gap-2'>
              <button
                onClick={() => setIsHeatmapOpen(true)}
                className='p-2 bg-blue-50 dark:bg-blue-500/20 text-[#1e3a8a] dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors'
              >
                <BarChart2 size={20} />
              </button>
              <button
                onClick={() => setView('bookmarks')}
                className='p-2 bg-blue-50 dark:bg-blue-500/20 text-[#1e3a8a] dark:text-blue-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-500/30 transition-colors'
              >
                <Bookmark size={20} />
              </button>
            </div>
          </div>

          <div className='flex flex-col md:flex-row gap-3 lg:gap-4'>
            <div className='relative flex-1'>
              <Search
                className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500'
                size={18}
              />
              <input
                type={activeTab === 'juz' ? 'number' : 'text'}
                placeholder={
                  activeTab === 'surah'
                    ? 'Cari nama surah atau arti...'
                    : 'Ketik angka Juz (1-30)...'
                }
                className='w-full pl-12 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl border-none focus:ring-2 focus:ring-[#1e3a8a] dark:focus:ring-blue-400 outline-none text-sm transition-all disabled:opacity-50'
                onChange={handleSearchChange}
                value={searchQuery}
                min={activeTab === 'juz' ? 1 : undefined}
                max={activeTab === 'juz' ? 30 : undefined}
              />
            </div>
            <div className='flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 md:w-64'>
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setActiveTab(key);
                    setSearchQuery('');
                  }}
                  className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all ${
                    activeTab === key
                      ? 'bg-white dark:bg-slate-900 text-[#1e3a8a] dark:text-blue-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className='max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-6 lg:py-8 lg:px-6'>
        {/* BANNER PENGINGAT 3 HARI */}
        {!isSearching && reminderData && (
          <div className='bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 mb-5 flex items-start gap-3 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm'>
            <div className='p-2 bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl shrink-0'>
              <AlertCircle size={20} />
            </div>
            <div className='pr-6'>
              <h3 className='font-bold text-amber-800 dark:text-amber-200 text-sm mb-1'>
                Jangan Lupa Sempatkan Waktu Ya!
              </h3>
              <p className='text-xs text-amber-700/90 dark:text-amber-300/90 leading-relaxed font-medium'>
                Dalam 3 hari kebelakang, rata-rata bacamu hanya{' '}
                <strong>{formatAvgTime(reminderData.avgSeconds)}</strong>.
                {reminderData.avgSeconds < 60
                  ? ' Yuk, sempatkan tilawah hari ini meski hanya satu ayat, insyaAllah berkah. Semangat!'
                  : ' Kelihatannya kamu lagi sibuk ya? Sempatkan waktu sedikit hari ini buat tilawah yuk!'}
              </p>
            </div>
            <button
              onClick={() => setReminderData(null)}
              className='absolute top-3 right-3 p-1 text-amber-500 hover:bg-amber-100 dark:hover:bg-amber-500/30 rounded-lg transition-colors'
            >
              <X size={16} />
            </button>
          </div>
        )}

        {!isSearching && (
          <div className='flex flex-col md:flex-row items-stretch gap-4 lg:gap-5 mb-5 lg:mb-6 mt-2'>
            <div className='w-full md:w-4/12 flex [&>*]:w-full [&>*]:h-full'>
              <LastReadBanner lastRead={lastRead} onContinue={handleContinue} />
            </div>
            <div className='w-full md:w-8/12 flex [&>*]:w-full [&>*]:h-full'>
              <KhatamPlanCard onResetLastRead={handleResetLastRead} />
            </div>
          </div>
        )}

        {/* ... TAB SURAH & JUZ (Kodenya 100% sama dengan milikmu sebelumnya) ... */}
        {activeTab === 'surah' && (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4'>
            {loading ? (
              [...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className='h-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl animate-pulse'
                />
              ))
            ) : filteredSurahs.length > 0 ? (
              filteredSurahs.map((s) => (
                <div
                  key={s.nomor}
                  onClick={() => router.push(`/quran/surah/${s.nomor}`)}
                  className='bg-white dark:bg-slate-900 p-4 lg:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#1e3a8a] dark:hover:border-blue-400 transition-all cursor-pointer flex items-center justify-between group'
                >
                  <div className='flex items-center gap-4'>
                    <div className='w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-blue-50 dark:bg-blue-500/20 flex items-center justify-center text-xs lg:text-sm font-bold text-slate-400 dark:text-slate-300 group-hover:bg-[#1e3a8a] group-hover:text-white transition-colors'>
                      {s.nomor}
                    </div>
                    <div>
                      <h3 className='font-bold text-slate-800 dark:text-slate-100 text-sm lg:text-base group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 transition-colors'>
                        {s.namaLatin}
                      </h3>
                      <p className='text-[10px] lg:text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5'>
                        {s.tempatTurun} • {s.jumlahAyat} Ayat
                      </p>
                    </div>
                  </div>
                  <div className='text-xl lg:text-2xl font-arabic text-[#1e3a8a] dark:text-blue-400 opacity-80 group-hover:opacity-100 transition-opacity'>
                    {s.nama}
                  </div>
                </div>
              ))
            ) : (
              <div className='text-center py-10 lg:col-span-full'>
                <p className='text-slate-500 dark:text-slate-400 text-sm'>
                  Surah tidak ditemukan.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'juz' && (
          <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4'>
            {JUZ_LIST.map((juz) => (
              <div
                key={juz}
                onClick={() => router.push(`/quran/juz/${juz}`)}
                className='bg-white dark:bg-slate-900 p-5 lg:p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[#1e3a8a] dark:hover:border-blue-400 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 lg:gap-3 group'
              >
                <div className='w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-blue-50 dark:bg-blue-500/20 text-[#1e3a8a] dark:text-blue-300 flex items-center justify-center group-hover:scale-110 transition-transform'>
                  <Book size={24} />
                </div>
                <h3 className='font-bold text-slate-800 dark:text-slate-100 group-hover:text-[#1e3a8a] dark:group-hover:text-blue-400 lg:text-lg'>
                  Juz {juz}
                </h3>
              </div>
            ))}
          </div>
        )}
      </main>

      <HeatmapStatsDrawer
        isOpen={isHeatmapOpen}
        onClose={() => setIsHeatmapOpen(false)}
      />
    </div>
  );
}
