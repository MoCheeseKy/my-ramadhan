'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { ArrowLeft, Target, Plus, X, Trash2, Check } from 'lucide-react';
import localforage from 'localforage';
import { motion, AnimatePresence } from 'framer-motion';

dayjs.locale('id');

const CURRENT_YEAR = dayjs().year();
const RAMADHAN_START = dayjs(`${CURRENT_YEAR}-02-19`);
const RAMADHAN_DAYS = 30;

const TRACKER_KEYS = [
  'is_puasa',
  'subuh',
  'dzuhur',
  'ashar',
  'maghrib',
  'isya',
  'tarawih',
  'quran',
  'sedekah',
];
const TRACKER_LABELS = {
  is_puasa: 'Puasa',
  subuh: 'Subuh',
  dzuhur: 'Dzuhur',
  ashar: 'Ashar',
  maghrib: 'Maghrib',
  isya: 'Isya',
  tarawih: 'Tarawih',
  quran: "Qur'an",
  sedekah: 'Sedekah',
};

const RAMADHAN_DATES = Array.from({ length: RAMADHAN_DAYS }, (_, i) =>
  RAMADHAN_START.add(i, 'day'),
);

const getProgressColor = (percent) => {
  if (percent === 0)
    return 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500';
  if (percent < 40)
    return 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400';
  if (percent < 70)
    return 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400';
  if (percent < 100)
    return 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400';
  return 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400';
};

const getBarColor = (percent) => {
  if (percent === 0) return 'bg-slate-200 dark:bg-slate-700';
  if (percent < 40) return 'bg-rose-400';
  if (percent < 70) return 'bg-amber-400';
  if (percent < 100) return 'bg-blue-400';
  return 'bg-emerald-500';
};

export default function TrackerKalender() {
  const router = useRouter();
  const [allData, setAllData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    dayjs().format('YYYY-MM-DD'),
  );
  const [customHabits, setCustomHabits] = useState([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  // Function untuk memuat data dari memori lokal
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const trackerData = (await localforage.getItem('ramadhan_tracker')) || {};
      const habitsData = (await localforage.getItem('custom_habits')) || [];
      setAllData(trackerData);
      setCustomHabits(habitsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleAddCustomHabit = async (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    const newHabit = { id: Date.now().toString(), name: newHabitName.trim() };
    const updatedHabits = [...customHabits, newHabit];
    await localforage.setItem('custom_habits', updatedHabits);
    setCustomHabits(updatedHabits);
    setNewHabitName('');
    setShowAddHabit(false);
  };

  const handleDeleteCustomHabit = async (habitId) => {
    const updatedHabits = customHabits.filter((h) => h.id !== habitId);
    await localforage.setItem('custom_habits', updatedHabits);
    setCustomHabits(updatedHabits);
  };

  // Function untuk mengubah dan menyimpan status checklist ibadah
  const toggleItem = async (dateStr, key, isCustom = false) => {
    const currentDayData = allData[dateStr] || {};
    const currentValue = isCustom
      ? currentDayData.custom_habits?.[key] || false
      : currentDayData[key] || false;

    const updatedDayData = { ...currentDayData };
    if (isCustom) {
      updatedDayData.custom_habits = {
        ...(updatedDayData.custom_habits || {}),
        [key]: !currentValue,
      };
    } else {
      updatedDayData[key] = !currentValue;
    }

    const newAllData = { ...allData, [dateStr]: updatedDayData };
    setAllData(newAllData);
    await localforage.setItem('ramadhan_tracker', newAllData);
  };

  const calculateDailyProgress = (dateStr) => {
    const dayData = allData[dateStr];
    if (!dayData) return 0;
    let completed = 0;
    let total = TRACKER_KEYS.length + customHabits.length;

    TRACKER_KEYS.forEach((k) => {
      if (dayData[k]) completed++;
    });
    customHabits.forEach((h) => {
      if (dayData.custom_habits?.[h.id]) completed++;
    });

    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const dailyProgress = calculateDailyProgress(selectedDate);
  const isFuture = dayjs(selectedDate).isAfter(dayjs(), 'day');

  const firstDayOfWeek = RAMADHAN_START.day();
  const gridCells = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...RAMADHAN_DATES,
  ];

  return (
    <main className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 pb-24 transition-colors duration-300'>
      <title>Tracker Ibadah - MyRamadhan</title>
      <header className='sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => router.push('/')}
            className='p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800'
          >
            <ArrowLeft
              size={20}
              className='text-slate-600 dark:text-slate-300'
            />
          </button>
          <h1 className='font-bold text-lg text-slate-800 dark:text-slate-100'>
            Tracker Ibadah
          </h1>
        </div>
      </header>

      <div className='max-w-md md:max-w-2xl lg:max-w-4xl mx-auto p-4 space-y-6'>
        <div className='bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-800'>
          <div className='grid grid-cols-7 gap-1 md:gap-2 mb-2'>
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((d) => (
              <div
                key={d}
                className='text-center text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 py-2'
              >
                {d}
              </div>
            ))}
          </div>
          <div className='grid grid-cols-7 gap-1 md:gap-2'>
            {gridCells.map((dateObj, idx) => {
              if (!dateObj) return <div key={`empty-${idx}`} />;
              const dateStr = dateObj.format('YYYY-MM-DD');
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === dayjs().format('YYYY-MM-DD');
              const percent = calculateDailyProgress(dateStr);
              const isFutureDate = dateObj.isAfter(dayjs(), 'day');

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  disabled={isFutureDate}
                  className={`relative flex flex-col items-center justify-center h-11 md:h-14 lg:h-16 rounded-xl md:rounded-2xl transition-all font-bold ${isFutureDate ? 'opacity-30 cursor-not-allowed' : 'hover:scale-105 active:scale-95'} ${isSelected ? 'bg-[#1e3a8a] text-white shadow-lg shadow-blue-900/20' : isToday ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                >
                  <span className='text-sm md:text-base'>
                    {dateObj.format('D')}
                  </span>
                  {!isFutureDate && (
                    <div className='absolute bottom-1.5 md:bottom-2 left-1/2 -translate-x-1/2 w-4 md:w-6 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden'>
                      <div
                        className={`h-full ${getBarColor(percent)}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className='bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 shadow-sm border border-slate-100 dark:border-slate-800'>
          <div className='flex items-end justify-between mb-6'>
            <div>
              <h2 className='text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-1'>
                {dayjs(selectedDate).format('DD MMMM YYYY')}
              </h2>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                {isFuture ? 'Belum tersedia' : 'Catat amal yaumiyahmu'}
              </p>
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2 ${getProgressColor(dailyProgress)}`}
            >
              <Target size={16} />
              {dailyProgress}%
            </div>
          </div>

          <div className='space-y-3'>
            {TRACKER_KEYS.map((key) => {
              const isChecked = allData[selectedDate]?.[key] || false;
              return (
                <button
                  key={key}
                  onClick={() => toggleItem(selectedDate, key, false)}
                  disabled={isFuture}
                  className={`w-full relative flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 rounded-2xl border-2 transition-all ${isFuture ? 'opacity-50 cursor-not-allowed border-slate-100 dark:border-slate-800' : isChecked ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                >
                  <span
                    className={`font-bold text-sm md:text-base ${isChecked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}
                  >
                    {TRACKER_LABELS[key]}
                  </span>
                  <div
                    className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-transparent'}`}
                  >
                    <Check size={14} className='md:w-4 md:h-4' />
                  </div>
                </button>
              );
            })}

            {customHabits.map((habit) => {
              const isChecked =
                allData[selectedDate]?.custom_habits?.[habit.id] || false;
              return (
                <div key={habit.id} className='flex items-center gap-2'>
                  <button
                    onClick={() => toggleItem(selectedDate, habit.id, true)}
                    disabled={isFuture}
                    className={`flex-1 relative flex items-center justify-between px-4 md:px-5 py-3.5 md:py-4 rounded-2xl border-2 transition-all ${isFuture ? 'opacity-50 cursor-not-allowed border-slate-100 dark:border-slate-800' : isChecked ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'}`}
                  >
                    <span
                      className={`font-bold text-sm md:text-base ${isChecked ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {habit.name}
                    </span>
                    <div
                      className={`w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center transition-colors ${isChecked ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-transparent'}`}
                    >
                      <Check size={14} className='md:w-4 md:h-4' />
                    </div>
                  </button>
                  <button
                    onClick={() => handleDeleteCustomHabit(habit.id)}
                    className='p-3.5 md:p-4 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              );
            })}

            <button
              onClick={() => setShowAddHabit(true)}
              className='w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors'
            >
              <Plus size={18} /> Tambah Target Sendiri
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showAddHabit && (
          <div className='fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddHabit(false)}
              className='absolute inset-0 bg-slate-900/50 backdrop-blur-sm'
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              className='relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl'
            >
              <div className='flex justify-between items-center mb-6'>
                <h3 className='font-bold text-lg text-slate-800 dark:text-slate-100'>
                  Target Baru
                </h3>
                <button
                  onClick={() => setShowAddHabit(false)}
                  className='p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400'
                >
                  <X size={16} />
                </button>
              </div>
              <form onSubmit={handleAddCustomHabit} className='space-y-4'>
                <input
                  type='text'
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder='Contoh: Sholat Dhuha, Baca Buku'
                  className='w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#1e3a8a] text-slate-800 dark:text-slate-100 placeholder:text-slate-400'
                  autoFocus
                />
                <button
                  type='submit'
                  disabled={!newHabitName.trim()}
                  className='w-full py-3.5 bg-[#1e3a8a] text-white font-bold rounded-xl disabled:opacity-50'
                >
                  Simpan Target
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
