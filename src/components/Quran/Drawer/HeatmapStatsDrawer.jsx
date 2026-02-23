import { useState, useEffect } from 'react';
import { X, Clock, CalendarDays } from 'lucide-react';
import { getReadingHistory } from '@/lib/quranTrackerService';

const formatTime = (seconds) => {
  if (!seconds) return '0 menit';
  if (seconds < 60) return `${seconds} detik`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h} jam ${m} menit`;
  return `${m} menit`;
};

export default function HeatmapStatsDrawer({ isOpen, onClose }) {
  const [history, setHistory] = useState({});
  const [selectedDay, setSelectedDay] = useState(null);

  // Ambil data terbaru setiap kali drawer dibuka
  useEffect(() => {
    if (isOpen) {
      setHistory(getReadingHistory() || {});
      setSelectedDay(null); // Reset pilihan
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = date.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  // Gradasi warna berdasarkan durasi membaca
  const getColor = (seconds) => {
    if (!seconds || seconds === 0)
      return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50';
    if (seconds < 180)
      return 'bg-green-300 dark:bg-green-800/60 border-green-400 dark:border-green-700'; // < 3 menit
    if (seconds < 900)
      return 'bg-green-400 dark:bg-green-600 border-green-500 dark:border-green-500'; // < 15 menit
    if (seconds < 1800)
      return 'bg-green-500 dark:bg-green-500 border-green-600 dark:border-green-400'; // < 30 menit
    return 'bg-green-600 dark:bg-green-400 border-green-700 dark:border-green-300'; // > 30 menit
  };

  return (
    <>
      <div
        className='fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='fixed z-50 bg-white dark:bg-slate-900 flex flex-col w-full bottom-0 left-0 max-h-[85vh] rounded-t-2xl md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[450px] md:max-h-[80vh] md:rounded-2xl shadow-2xl transition-all border border-slate-100 dark:border-slate-800'>
        <div className='flex justify-center pt-3 pb-1 md:hidden'>
          <div className='w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full' />
        </div>

        <div className='flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800'>
          <div>
            <h2 className='text-lg font-bold text-slate-800 dark:text-slate-100'>
              Statistik Bacaan
            </h2>
            <p className='text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5'>
              {monthName}
            </p>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors'
          >
            <X size={18} className='text-slate-600 dark:text-slate-300' />
          </button>
        </div>

        <div className='p-4 overflow-y-auto'>
          {/* Heatmap Grid */}
          <div className='grid grid-cols-7 gap-1.5 md:gap-2'>
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const d = new Date(year, month, day, 12, 0, 0);
              const dateStr = d.toISOString().split('T')[0];
              const secs = history[dateStr] || 0;

              const isSelected = selectedDay?.day === day;

              return (
                <button
                  key={day}
                  onClick={() =>
                    setSelectedDay({ day, dateString: dateStr, seconds: secs })
                  }
                  className={`w-full aspect-square rounded-md border transition-all hover:scale-105 duration-200 ${getColor(secs)} ${
                    isSelected
                      ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900 scale-110 shadow-md z-10'
                      : ''
                  }`}
                  title={`${day} ${monthName}: ${formatTime(secs)}`}
                >
                  <span className='sr-only'>{day}</span>
                </button>
              );
            })}
          </div>

          {/* GitHub-style Legend Palette */}
          <div className='flex items-center justify-end gap-2 mt-3 mb-5 text-[11px] font-medium text-slate-500 dark:text-slate-400'>
            <span>Sedikit</span>
            <div className='flex gap-1.5'>
              <div
                className='w-3.5 h-3.5 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50'
                title='0 menit'
              ></div>
              <div
                className='w-3.5 h-3.5 rounded-sm bg-green-300 dark:bg-green-800/60 border border-green-400 dark:border-green-700'
                title='< 3 menit'
              ></div>
              <div
                className='w-3.5 h-3.5 rounded-sm bg-green-400 dark:bg-green-600 border border-green-500 dark:border-green-500'
                title='< 15 menit'
              ></div>
              <div
                className='w-3.5 h-3.5 rounded-sm bg-green-500 dark:bg-green-500 border border-green-600 dark:border-green-400'
                title='< 30 menit'
              ></div>
              <div
                className='w-3.5 h-3.5 rounded-sm bg-green-600 dark:bg-green-400 border border-green-700 dark:border-green-300'
                title='> 30 menit'
              ></div>
            </div>
            <span>Banyak</span>
          </div>

          {/* Kotak Detail Interaktif */}
          <div className='bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 min-h-[96px] flex flex-col justify-center transition-all'>
            {selectedDay ? (
              <div className='flex items-start gap-3 animate-in fade-in duration-300'>
                <div className='p-2.5 bg-blue-100 dark:bg-blue-900/30 text-[#2563eb] dark:text-blue-400 rounded-xl shadow-sm'>
                  <CalendarDays size={22} />
                </div>
                <div>
                  <p className='text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1'>
                    Tanggal {selectedDay.day}
                  </p>
                  <div className='flex items-center gap-1.5 text-slate-900 dark:text-slate-100'>
                    <Clock
                      size={18}
                      className={
                        selectedDay.seconds > 0
                          ? 'text-[#2563eb] dark:text-blue-400'
                          : 'text-slate-400'
                      }
                    />
                    <span className='text-lg font-bold'>
                      {formatTime(selectedDay.seconds)}
                    </span>
                  </div>
                  {selectedDay.seconds === 0 && (
                    <p className='text-xs text-slate-500 mt-1.5 font-medium'>
                      Belum ada aktivitas membaca di hari ini.
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className='flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 animate-in fade-in'>
                <Clock size={24} className='mb-2 opacity-50' />
                <p className='text-[13px] text-center font-medium leading-relaxed'>
                  Ketuk salah satu kotak di atas untuk
                  <br />
                  melihat rincian waktu membaca.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
