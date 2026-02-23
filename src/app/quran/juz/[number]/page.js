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
import { JUZ_MAPPING } from '@/data/juzMapping';

import JuzHeader from '@/components/Quran/JuzHeader';
import JuzHeroBanner from '@/components/Quran/JuzHeroBanner';
import SurahSeparator from '@/components/Quran/SurahSeparator';
import AyatCard from '@/components/Quran/AyatCard';
import AudioPlayer from '@/components/Quran/AudioPlayer';

export default function JuzReader() {
  const router = useRouter();
  const { number } = useParams();
  const { user } = useUser();

  useQuranTracker(true);

  const [juzSurahs, setJuzSurahs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [hafalanMode, setHafalanMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [jumpSurah, setJumpSurah] = useState('');
  const [jumpAyat, setJumpAyat] = useState('');

  const { settings, toggleSetting, setArabSize } = useReaderSettings();
  const storage = useQuranStorage();

  const [bookmarks, setBookmarks] = useState([]);
  const [lastRead, setLastRead] = useState(null);

  // Hook Khatam Plan untuk melihat status bacaan
  const { stats } = useKhatamPlan();

  // State untuk mengontrol Modal Selesai Membaca & Doa
  const [showSessionEnd, setShowSessionEnd] = useState(false);
  const [sessionEndData, setSessionEndData] = useState({
    isKhatam: false,
    targetMet: false,
  });

  const allAyatFlat = juzSurahs.flatMap((s) =>
    s.ayat.map((a) => ({ ...a, surahId: s.surahId, surahName: s.namaLatin })),
  );

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
    isJuzMode: true,
  });

  const fetchJuz = async (juzNum) => {
    setLoading(true);
    setJuzSurahs([]);

    const segments = JUZ_MAPPING[juzNum];
    if (!segments) {
      setLoading(false);
      return;
    }

    const surahIds = [...new Set(segments.map((s) => s.surahId))];
    try {
      const surahDataMap = {};
      await Promise.all(
        surahIds.map(async (id) => {
          const res = await fetch(`https://equran.id/api/v2/surat/${id}`);
          const json = await res.json();
          surahDataMap[id] = json.data;
        }),
      );

      const result = segments
        .map(({ surahId, from, to }) => {
          const data = surahDataMap[surahId];
          if (!data) return null;
          const filtered = data.ayat.filter(
            (a) => a.nomorAyat >= from && (to === null || a.nomorAyat <= to),
          );
          return {
            surahId,
            namaLatin: data.namaLatin,
            nama: data.nama,
            ayat: filtered,
          };
        })
        .filter(Boolean);

      setJuzSurahs(result);
    } catch (err) {
      console.error('Gagal fetch juz:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!number) return;

    const loadData = async () => {
      const data = await storage.loadQuranData();
      if (data.bookmarks) setBookmarks(data.bookmarks);
      if (data.lastRead) setLastRead(data.lastRead);
    };

    fetchJuz(Number(number));
    loadData();
  }, [number, user]);

  useEffect(() => {
    if (juzSurahs.length > 0 && window.location.hash) {
      const hashId = window.location.hash.replace('#', '');
      if (hashId) {
        setTimeout(() => {
          const el = document.getElementById(hashId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 500);
      }
    }
  }, [juzSurahs]);

  const handleJump = (e) => {
    e.preventDefault();
    if (!jumpSurah || !jumpAyat) {
      alert('Pilih Surah dan masukkan nomor Ayat.');
      return;
    }
    const el = document.getElementById(`ayat-${jumpSurah}-${jumpAyat}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('ring-4', 'ring-[#1e3a8a]');
      setTimeout(() => el.classList.remove('ring-4', 'ring-[#1e3a8a]'), 2000);
    } else {
      alert('Ayat tidak ditemukan di Juz ini.');
    }
    setJumpAyat('');
  };

  const handleAudioNav = (dir) => {
    if (!audioInfo) return;
    const idx = allAyatFlat.findIndex(
      (a) =>
        a.nomorAyat === audioInfo.ayat.nomorAyat &&
        a.surahId === audioInfo.surahId,
    );
    const next = allAyatFlat[idx + dir];
    if (next) {
      handlePlayAudio(next, next.surahId, next.surahName);
    }
  };

  // Wrapper untuk menangkap aksi Last Read di halaman Juz
  const handleMarkLastRead = (ayat, surahId, surahName) => {
    handleLastRead(ayat, surahId, surahName, { juzNumber: Number(number) });

    const absoluteAyah = calculateAbsoluteAyah(surahId, ayat.nomorAyat);
    const isKhatam = absoluteAyah >= 6236;

    // Cek apakah target harian khatam terpenuhi
    const met = stats?.status === 'ON_TRACK' || stats?.status === 'AHEAD';

    setSessionEndData({ isKhatam, targetMet: met });
    setShowSessionEnd(true);
  };

  return (
    <div
      className='min-h-screen bg-[#F6F9FC] dark:bg-slate-900 text-slate-800 dark:text-slate-100 selection:bg-blue-200 dark:selection:bg-blue-900'
      style={{ paddingBottom: showPlayer ? '160px' : '100px' }}
    >
      <JuzHeader
        juzNumber={number}
        juzSurahs={juzSurahs}
        loading={loading}
        hafalanMode={hafalanMode}
        onToggleHafalan={() => setHafalanMode((v) => !v)}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((v) => !v)}
        settings={settings}
        onSettingChange={toggleSetting}
        onSizeChange={setArabSize}
        jumpSurah={jumpSurah}
        setJumpSurah={setJumpSurah}
        jumpAyat={jumpAyat}
        setJumpAyat={setJumpAyat}
        onJumpSubmit={handleJump}
      />

      <main className='max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto p-5 md:py-8 space-y-3 md:space-y-5'>
        <JuzHeroBanner juzNumber={number} juzSurahs={juzSurahs} />

        {hafalanMode && (
          <div className='bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl px-5 py-4 flex items-center gap-3'>
            <EyeOff
              size={20}
              className='text-amber-600 dark:text-amber-400 shrink-0'
            />
            <p className='text-amber-700 dark:text-amber-400 text-xs md:text-sm font-bold'>
              Mode Hafalan aktif — klik "Intip Ayat" untuk melihat tiap ayat
            </p>
          </div>
        )}

        {loading && (
          <div className='space-y-4 md:space-y-6'>
            <div className='h-8 w-48 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-full mx-auto mb-6' />
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className='h-48 md:h-56 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-3xl'
              />
            ))}
          </div>
        )}

        {!loading &&
          juzSurahs.map((surah) => (
            <div key={surah.surahId} className='md:mt-6'>
              <SurahSeparator
                namaArab={surah.nama}
                namaLatin={surah.namaLatin}
              />

              <div className='space-y-4 md:space-y-6'>
                {surah.ayat.map((ayat) => (
                  <AyatCard
                    key={`${surah.surahId}-${ayat.nomorAyat}`}
                    ayat={ayat}
                    surahName={surah.namaLatin}
                    surahId={surah.surahId}
                    settings={settings}
                    hafalanMode={hafalanMode}
                    isBookmarked={bookmarks.some(
                      (b) =>
                        b.surahId === surah.surahId &&
                        b.ayahNumber === ayat.nomorAyat,
                    )}
                    isLastRead={
                      lastRead?.surahId === surah.surahId &&
                      lastRead?.ayahNumber === ayat.nomorAyat
                    }
                    isPlaying={
                      audioInfo?.ayat.nomorAyat === ayat.nomorAyat &&
                      audioInfo?.surahId === surah.surahId &&
                      showPlayer
                    }
                    isJuzMode={true}
                    copiedId={copiedId}
                    onBookmark={(a) =>
                      handleBookmark(a, surah.surahId, surah.namaLatin)
                    }
                    onLastRead={(a) =>
                      handleMarkLastRead(a, surah.surahId, surah.namaLatin)
                    }
                    onCopy={(a, name) => handleCopy(a, name, surah.surahId)}
                    onPlayAudio={(a) =>
                      handlePlayAudio(a, surah.surahId, surah.namaLatin)
                    }
                  />
                ))}
              </div>
            </div>
          ))}

        {!loading && (
          <div className='flex gap-4 md:gap-5 pt-6 md:pt-8'>
            {Number(number) > 1 && (
              <button
                onClick={() => router.push(`/quran/juz/${Number(number) - 1}`)}
                className='flex-1 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-600 text-sm md:text-base font-bold text-slate-600 dark:text-slate-300 hover:border-[#1e3a8a] dark:hover:border-blue-600 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-all flex items-center justify-center gap-2'
              >
                <ArrowLeft size={18} /> Juz {Number(number) - 1}
              </button>
            )}
            {Number(number) < 30 && (
              <button
                onClick={() => router.push(`/quran/juz/${Number(number) + 1}`)}
                className='flex-1 py-4 rounded-2xl bg-[#1e3a8a] dark:bg-blue-700 text-white text-sm md:text-base font-bold hover:bg-[#162d6e] dark:hover:bg-blue-800 transition-all flex items-center justify-center gap-2'
              >
                Juz {Number(number) + 1}
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

            {/* Banner Target Terpenuhi */}
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
          label={`${audioInfo.surahName} — Ayat ${audioInfo.ayat.nomorAyat}`}
          onPrev={() => handleAudioNav(-1)}
          onNext={() => handleAudioNav(1)}
          onClose={closePlayer}
        />
      )}
    </div>
  );
}
