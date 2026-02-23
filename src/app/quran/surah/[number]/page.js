'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  EyeOff,
  X,
  Trophy,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

import useUser from '@/hooks/useUser';
import useReaderSettings from '@/store/useReaderSettings';
import useQuranStorage from '@/hooks/useQuranStorage';
import useReaderActions from '@/store/useReaderActions';
import { useQuranTracker } from '@/hooks/useQuranTracker';
import { useKhatamPlan } from '@/hooks/useKhatamPlan';
import { calculateAbsoluteAyah } from '@/lib/quranTrackerService';

import SurahHeader from '@/components/Quran/SurahHeader';
import SurahHeroBanner from '@/components/Quran/SurahHeroBanner';
import AyatCard from '@/components/Quran/AyatCard';
import AudioPlayer from '@/components/Quran/AudioPlayer';

export default function SurahReader() {
  const router = useRouter();
  const { number } = useParams();
  const { user } = useUser();

  useQuranTracker(true);

  const [surah, setSurah] = useState(null);
  const [loading, setLoading] = useState(true);

  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [jumpNumber, setJumpNumber] = useState('');

  const { settings, toggleSetting, setArabSize } = useReaderSettings();
  const storage = useQuranStorage();

  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);

  // Hook untuk mengambil status Khatam harian
  const { stats } = useKhatamPlan();

  // State untuk mengontrol Modal Selesai Membaca & Doa
  const [showSessionEnd, setShowSessionEnd] = useState(false);
  const [sessionEndData, setSessionEndData] = useState({
    isKhatam: false,
    targetMet: false,
  });

  const {
    copiedId,
    audioInfo,
    showPlayer,
    handleBookmark,
    handleLastRead,
    handleCopy,
    handlePlayAudio,
    closePlayer,
  } = useReaderActions({
    bookmarks,
    setBookmarks,
    setLastRead,
    lastReadData: lastRead,
    surahIdContext: number ? Number(number) : null,
    surahContext: surah,
    isJuzMode: false,
  });

  useEffect(() => {
    if (!number) return;

    const fetchSurah = async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://equran.id/api/v2/surat/${number}`);
        const json = await res.json();
        setSurah(json.data);
      } catch (err) {
        console.error('Gagal fetch surah:', err);
      } finally {
        setLoading(false);
      }
    };

    const loadData = async () => {
      const data = await storage.loadQuranData();
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.lastRead) setLastRead(data.lastRead);
    };

    fetchSurah();
    loadData();
  }, [number, user]);

  useEffect(() => {
    if (!loading && surah && window.location.hash) {
      setTimeout(() => {
        const hashId = window.location.hash.replace('#', '');
        if (hashId) {
          const el = document.getElementById(hashId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 300);
    }
  }, [loading, surah]);

  const handleJumpToNumber = (e) => {
    e.preventDefault();
    const num = parseInt(jumpNumber, 10);
    if (!num || isNaN(num) || num < 1 || num > surah?.jumlahAyat) {
      alert(`Masukkan nomor ayat yang valid antara 1 - ${surah?.jumlahAyat}`);
      return;
    }
    const el = document.getElementById(`ayat-${num}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[#1e3a8a]');
      setTimeout(() => el.classList.remove('ring-4', 'ring-[#1e3a8a]'), 2000);
    }
    setJumpNumber('');
  };

  const handleAudioNext = () => {
    if (!surah || !audioInfo) return;
    const idx = surah.ayat.findIndex(
      (a) => a.nomorAyat === audioInfo.ayat.nomorAyat,
    );
    if (idx < surah.ayat.length - 1) {
      handlePlayAudio(surah.ayat[idx + 1]);
    }
  };

  const handleAudioPrev = () => {
    if (!surah || !audioInfo) return;
    const idx = surah.ayat.findIndex(
      (a) => a.nomorAyat === audioInfo.ayat.nomorAyat,
    );
    if (idx > 0) handlePlayAudio(surah.ayat[idx - 1]);
  };

  // Wrapper untuk menangkap aksi Last Read dan memunculkan Modal Sesi Selesai
  const handleMarkLastRead = (ayat) => {
    handleLastRead(ayat); // Simpan batas bacaan ke storage

    const absoluteAyah = calculateAbsoluteAyah(Number(number), ayat.nomorAyat);
    const isKhatam = absoluteAyah >= 6236; // 6236 adalah total ayat Al-Quran

    // Asumsi target harian terpenuhi jika status tidak 'BEHIND' (Berarti ON_TRACK atau AHEAD)
    const met = stats?.status === 'ON_TRACK' || stats?.status === 'AHEAD';

    setSessionEndData({ isKhatam, targetMet: met });
    setShowSessionEnd(true);
  };

  return (
    <div
      className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-200 selection:bg-blue-200 dark:selection:bg-blue-800 transition-colors duration-300'
      style={{ paddingBottom: showPlayer ? '160px' : '100px' }}
    >
      <SurahHeader
        surah={surah}
        loading={loading}
        hafalanMode={hafalanMode}
        onToggleHafalan={() => setHafalanMode((v) => !v)}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((v) => !v)}
        settings={settings}
        onSettingChange={toggleSetting}
        onSizeChange={setArabSize}
        jumpNumber={jumpNumber}
        setJumpNumber={setJumpNumber}
        onJumpSubmit={handleJumpToNumber}
      />

      <main className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-5 md:py-8 space-y-4 md:space-y-6 pt-6'>
        {!loading && <SurahHeroBanner surah={surah} />}

        {hafalanMode && (
          <div className='bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 flex items-center gap-3'>
            <EyeOff
              size={20}
              className='text-amber-600 dark:text-amber-400 shrink-0'
            />
            <p className='text-amber-700 dark:text-amber-300 text-xs md:text-sm font-bold'>
              Mode Hafalan aktif — klik "Intip Ayat" untuk melihat tiap ayat
            </p>
          </div>
        )}

        {loading &&
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className='h-48 md:h-56 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-3xl'
            />
          ))}

        {!loading &&
          surah?.ayat?.map((ayat) => (
            <AyatCard
              key={ayat.nomorAyat}
              ayat={ayat}
              surahName={surah.namaLatin}
              surahId={Number(number)}
              settings={settings}
              hafalanMode={hafalanMode}
              isBookmarked={bookmarks.some(
                (b) =>
                  b.surahId === Number(number) &&
                  b.ayahNumber === ayat.nomorAyat,
              )}
              isLastRead={
                lastRead?.surahId === Number(number) &&
                lastRead?.ayahNumber === ayat.nomorAyat
              }
              isPlaying={
                audioInfo?.ayat.nomorAyat === ayat.nomorAyat && showPlayer
              }
              isJuzMode={false}
              copiedId={copiedId}
              onBookmark={(a) => handleBookmark(a)}
              onLastRead={(a) => handleMarkLastRead(a)} // Gunakan fungsi wrapper yang baru
              onCopy={(a, name) => handleCopy(a, name)}
              onPlayAudio={(a) => handlePlayAudio(a)}
            />
          ))}

        {!loading && surah && (
          <div className='flex gap-3 md:gap-5 pt-6 md:pt-8'>
            {surah.suratSebelumnya && (
              <button
                onClick={() =>
                  router.push(`/quran/surah/${surah.suratSebelumnya.nomor}`)
                }
                className='flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-sm md:text-base font-bold text-slate-600 dark:text-slate-400 hover:border-[#1e3a8a] dark:hover:border-blue-500 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2'
              >
                <ArrowLeft size={18} />
                <span className='truncate'>
                  {surah.suratSebelumnya.namaLatin}
                </span>
              </button>
            )}
            {surah.suratSelanjutnya && (
              <button
                onClick={() =>
                  router.push(`/quran/surah/${surah.suratSelanjutnya.nomor}`)
                }
                className='flex-1 py-4 rounded-2xl bg-[#1e3a8a] dark:bg-blue-600 text-white text-sm md:text-base font-bold hover:bg-[#162d6e] dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-2'
              >
                <span className='truncate'>
                  {surah.suratSelanjutnya.namaLatin}
                </span>
                <ArrowLeft size={18} className='rotate-180' />
              </button>
            )}
          </div>
        )}
      </main>

      {/* POPUP MODAL SESI MEMBACA SELESAI */}
      {showSessionEnd && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
          <div className='bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-slate-100 dark:border-slate-800 relative animate-in zoom-in-95 duration-300'>
            <button
              onClick={() => setShowSessionEnd(false)}
              className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'
            >
              <X size={20} />
            </button>

            {/* Bagian Header: Pengecekan Khatam */}
            {sessionEndData.isKhatam ? (
              <>
                <div className='w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner'>
                  <Trophy size={40} className='text-amber-500' />
                </div>
                <h2 className='text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2'>
                  Alhamdulillah, Khatam!
                </h2>
                <p className='text-slate-500 dark:text-slate-400 text-sm mb-4 leading-relaxed'>
                  MasyaAllah, kamu telah menyelesaikan bacaan seluruh Al-Qur'an.
                </p>
              </>
            ) : (
              <>
                <div className='w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner'>
                  <BookOpen
                    size={40}
                    className='text-[#2563eb] dark:text-blue-400'
                  />
                </div>
                <h2 className='text-xl font-bold text-slate-800 dark:text-slate-100 mb-2'>
                  Batas Bacaan Disimpan
                </h2>
              </>
            )}

            {/* Banner Target Terpenuhi (Hanya Muncul Jika Target Tercapai & Belum Khatam) */}
            {sessionEndData.targetMet && !sessionEndData.isKhatam && (
              <div className='bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-2 rounded-xl mb-4 inline-flex items-center gap-1.5 shadow-sm'>
                <CheckCircle2 size={16} /> Target Khatam Harianmu Terpenuhi!
              </div>
            )}

            {/* Doa Setelah Membaca Al-Quran */}
            <div className='bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 md:p-5 text-left border border-slate-100 dark:border-slate-700 mb-5 relative overflow-hidden'>
              <p className='text-[10px] md:text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider text-center flex items-center justify-center gap-2'>
                <span className='w-6 md:w-8 h-px bg-slate-200 dark:bg-slate-700'></span>
                Doa Setelah Membaca Al-Quran
                <span className='w-6 md:w-8 h-px bg-slate-200 dark:bg-slate-700'></span>
              </p>
              <p className='font-arabic text-xl md:text-2xl text-right leading-loose text-[#2563eb] dark:text-blue-400 mb-3 mt-1'>
                اللَّهُمَّ ارْحَمْنِي بِالْقُرْآنِ وَاجْعَلْهُ لِي إِمَامًا
                وَنُورًا وَهُدًى وَرَحْمَةً
              </p>
              <p className='text-xs text-slate-600 dark:text-slate-300 italic mb-2 leading-relaxed font-medium'>
                "Allahummarhamni bil quran, waj'alhu li imaman wa nuran wa hudan
                wa rohmah."
              </p>
              <p className='text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed'>
                "Ya Allah, rahmatilah aku dengan Al-Qur'an. Jadikanlah ia
                sebagai pemimpin, cahaya, petunjuk, dan rahmat bagiku."
              </p>
            </div>

            <button
              onClick={() => {
                setShowSessionEnd(false);
                router.push('/quran');
              }}
              className='w-full py-3.5 bg-[#2563eb] dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm'
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}

      {showPlayer && audioInfo && (
        <AudioPlayer
          currentAyat={audioInfo.ayat}
          label={`${surah?.namaLatin} — Ayat ${audioInfo.ayat.nomorAyat}`}
          onPrev={handleAudioPrev}
          onNext={handleAudioNext}
          onClose={closePlayer}
        />
      )}
    </div>
  );
}
