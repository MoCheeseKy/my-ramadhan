import { useState, useEffect } from 'react';
import {
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trophy,
  X,
} from 'lucide-react';
import { useKhatamPlan } from '@/hooks/useKhatamPlan';

export default function KhatamPlanCard() {
  const { khatamPlan, stats, createPlan, removePlan } = useKhatamPlan();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [targetDays, setTargetDays] = useState(30);
  const [showCongrats, setShowCongrats] = useState(false);

  // Cek jika pengguna sudah khatam (mencapai 6236 ayat)
  useEffect(() => {
    if (khatamPlan && khatamPlan.progressAyat >= 6236) {
      setShowCongrats(true);
    } else {
      setShowCongrats(false);
    }
  }, [khatamPlan?.progressAyat]);

  const handleStartPlan = () => {
    createPlan(targetDays);
    setIsSetupOpen(false);
  };

  // Fungsi untuk reset khatam sekaligus menghapus last read
  const handleResetAll = () => {
    removePlan();
    setShowCongrats(false);
  };

  // === RENDER JIKA BELUM ADA PROGRAM ===
  if (!khatamPlan) {
    return (
      <div className='bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col justify-between w-full h-full relative overflow-hidden group'>
        <div className='absolute -right-6 -bottom-6 opacity-[0.03] dark:opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-500'>
          <Target size={180} />
        </div>

        <div className='relative z-10 flex flex-col gap-1.5 w-full mb-4'>
          <div className='flex items-center gap-2'>
            <Target size={18} className='text-[#2563eb] dark:text-blue-400' />
            <h2 className='font-bold text-slate-800 dark:text-slate-100 text-base'>
              Program Khatam
            </h2>
          </div>
          <p className='text-slate-500 dark:text-slate-400 text-sm'>
            Buat target khatam Al-Quran dan pantau progress harianmu.
          </p>
        </div>

        {!isSetupOpen ? (
          <button
            onClick={() => setIsSetupOpen(true)}
            className='relative z-10 mt-auto shrink-0 bg-[#2563eb] hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors self-start md:self-end'
          >
            Mulai Program
          </button>
        ) : (
          <div className='relative z-10 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3'>
            <input
              type='number'
              min='1'
              max='365'
              value={targetDays}
              onChange={(e) => setTargetDays(Number(e.target.value))}
              className='w-20 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-sm outline-none focus:border-[#2563eb]'
            />
            <span className='text-sm font-medium text-slate-600 dark:text-slate-400'>
              Hari
            </span>
            <button
              onClick={handleStartPlan}
              className='ml-auto px-4 py-2 bg-[#2563eb] dark:bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors'
            >
              Simpan Target
            </button>
          </div>
        )}
      </div>
    );
  }

  // === RENDER JIKA ADA PROGRAM AKTIF ===
  return (
    <div className='bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 lg:p-6 shadow-sm flex flex-col w-full h-full relative'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 text-base'>
          <Target size={18} className='text-[#2563eb] dark:text-blue-400' />
          Progres Khatam
        </h3>
        <button
          onClick={handleResetAll}
          className='text-xs font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors'
        >
          Reset Target
        </button>
      </div>

      <div className='mb-4'>
        <div className='flex justify-between text-sm mb-1.5'>
          <span className='font-bold text-[#2563eb] dark:text-blue-400'>
            {stats?.percentage}%
          </span>
          <span className='text-slate-500 dark:text-slate-400 font-medium text-xs'>
            {khatamPlan.progressAyat} / 6236 Ayat
          </span>
        </div>
        <div className='w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden'>
          <div
            className='bg-[#2563eb] dark:bg-blue-500 h-2 rounded-full transition-all duration-500'
            style={{ width: `${Math.min(stats?.percentage || 0, 100)}%` }}
          ></div>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-3 mb-4'>
        <div className='bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50'>
          <p className='text-xs text-slate-500 dark:text-slate-400 mb-0.5'>
            Target Harian
          </p>
          <p className='font-bold text-slate-800 dark:text-slate-100 text-base'>
            {stats?.targetAyatPerDay}{' '}
            <span className='text-[10px] font-medium uppercase tracking-wider text-slate-500'>
              Ayat
            </span>
          </p>
        </div>
        <div className='bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50'>
          <p className='text-xs text-slate-500 dark:text-slate-400 mb-0.5'>
            Sisa Waktu
          </p>
          <p className='font-bold text-slate-800 dark:text-slate-100 text-base'>
            {stats?.daysRemaining}{' '}
            <span className='text-[10px] font-medium uppercase tracking-wider text-slate-500'>
              Hari
            </span>
          </p>
        </div>
      </div>

      <div
        className={`mt-auto p-3 rounded-xl flex gap-3 items-start ${
          stats?.status === 'BEHIND'
            ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
            : stats?.status === 'AHEAD'
              ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400'
              : 'bg-blue-50 dark:bg-blue-500/10 text-[#2563eb] dark:text-blue-400'
        }`}
      >
        {stats?.status === 'BEHIND' ? (
          <AlertCircle size={16} className='shrink-0 mt-0.5' />
        ) : stats?.status === 'AHEAD' ? (
          <TrendingUp size={16} className='shrink-0 mt-0.5' />
        ) : (
          <CheckCircle2 size={16} className='shrink-0 mt-0.5' />
        )}
        <p className='text-[11px] md:text-xs leading-relaxed font-medium'>
          {stats?.recommendation}
        </p>
      </div>

      {/* MODAL KHATAM */}
      {showCongrats && (
        <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm'>
          <div className='bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center border border-slate-100 dark:border-slate-800 relative animate-in zoom-in-95 duration-300'>
            <button
              onClick={() => setShowCongrats(false)}
              className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors'
            >
              <X size={20} />
            </button>
            <div className='w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner'>
              <Trophy size={48} className='text-amber-500' />
            </div>
            <h2 className='text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2'>
              Alhamdulillah!
            </h2>
            <p className='text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed'>
              MasyaAllah, kamu telah menyelesaikan bacaan Al-Qur'an. Semoga
              setiap huruf yang dibaca menjadi syafaat dan penerang di hari
              akhir kelak.
            </p>
            <button
              onClick={handleResetAll}
              className='w-full py-3.5 bg-[#2563eb] dark:bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20'
            >
              Selesai & Mulai Ulang
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
