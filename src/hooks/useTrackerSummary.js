'use client';

import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import dayjs from 'dayjs';

export default function useTrackerSummary() {
  const [summary, setSummary] = useState({
    totalDays: 0,
    puasaCompleted: 0,
    missedFasts: 0,
    haidMissedFasts: 0,
    tarawihCompleted: 0,
    quranCompleted: 0,
    sholatJamaah: 0,
  });
  const [taskProgress, setTaskProgress] = useState({ completed: 0, total: 9 });
  const [loading, setLoading] = useState(true);

  const fetchTrackerSummary = useCallback(async () => {
    setLoading(true);
    try {
      const trackerData = (await localforage.getItem('ramadhan_tracker')) || {};
      const customHabits = (await localforage.getItem('custom_habits')) || [];
      const haidLogs = (await localforage.getItem('haid_logs')) || [];

      const today = dayjs();
      const currentYear = today.year();
      const ramadhanStart = dayjs(`${currentYear}-02-19`);
      const ramadhanEnd = ramadhanStart.add(29, 'day');

      // --- 1. Kalkulasi Hutang Puasa karena Haid ---
      let haidMissedFasts = 0;
      haidLogs.forEach((log) => {
        if (log.start_date) {
          const start = dayjs(log.start_date).startOf('day');
          const end = log.end_date
            ? dayjs(log.end_date).endOf('day')
            : today.endOf('day');

          // Cek setiap hari di Ramadhan, apakah bertabrakan dengan masa haid
          for (let i = 0; i < 30; i++) {
            const rDay = ramadhanStart.add(i, 'day');
            const isPassed =
              rDay.isBefore(today, 'day') || rDay.isSame(today, 'day');
            const isMenstruating =
              (rDay.isAfter(start) || rDay.isSame(start, 'day')) &&
              (rDay.isBefore(end) || rDay.isSame(end, 'day'));

            if (isPassed && isMenstruating) {
              haidMissedFasts++;
            }
          }
        }
      });

      // --- 2. Kalkulasi Summary Keseluruhan ---
      let puasaCompleted = 0;
      let tarawihCompleted = 0;
      let quranCompleted = 0;
      let sholatJamaah = 0;

      let daysPassed = 0;
      if (today.isAfter(ramadhanStart)) {
        if (today.isAfter(ramadhanEnd)) {
          daysPassed = 30;
        } else {
          daysPassed = today.diff(ramadhanStart, 'day') + 1;
        }
      }

      Object.values(trackerData).forEach((day) => {
        if (day.is_puasa) puasaCompleted++;
        if (day.tarawih) tarawihCompleted++;
        if (day.quran) quranCompleted++;
        if (day.subuh && day.dzuhur && day.ashar && day.maghrib && day.isya) {
          sholatJamaah++;
        }
      });

      let missedFasts = daysPassed - puasaCompleted;
      if (missedFasts < 0) missedFasts = 0;

      setSummary({
        totalDays: daysPassed,
        puasaCompleted,
        missedFasts,
        haidMissedFasts,
        tarawihCompleted,
        quranCompleted,
        sholatJamaah,
      });

      // --- 3. Kalkulasi Daily Progress (Untuk Home) ---
      const todayStr = today.format('YYYY-MM-DD');
      const todayData = trackerData[todayStr] || {};

      let completed = 0;
      const defaultTasks = [
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
      const total = defaultTasks.length + customHabits.length;

      defaultTasks.forEach((key) => {
        if (todayData[key]) completed++;
      });

      customHabits.forEach((habit) => {
        if (todayData.custom_habits?.[habit.id]) completed++;
      });

      setTaskProgress({ completed, total });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackerSummary();
  }, [fetchTrackerSummary]);

  return { summary, taskProgress, loading, fetchTrackerSummary };
}
