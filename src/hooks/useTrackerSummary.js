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
      const ramadhanStart = dayjs('2026-02-19');
      const ramadhanEnd = dayjs('2026-03-20');

      let haidMissedFasts = 0;
      haidLogs.forEach((log) => {
        if (log.start_date) {
          const start = dayjs(log.start_date).startOf('day');
          const end = log.end_date
            ? dayjs(log.end_date).endOf('day')
            : today.endOf('day');

          for (let i = 0; i <= ramadhanEnd.diff(ramadhanStart, 'day'); i++) {
            const rDay = ramadhanStart.add(i, 'day');
            const isPassed =
              rDay.isBefore(today, 'day') || rDay.isSame(today, 'day');
            const isMenstruating =
              (rDay.isAfter(start, 'day') || rDay.isSame(start, 'day')) &&
              (rDay.isBefore(end, 'day') || rDay.isSame(end, 'day'));

            if (isPassed && isMenstruating) {
              haidMissedFasts++;
            }
          }
        }
      });

      let puasaCompleted = 0;
      let tarawihCompleted = 0;
      let quranCompleted = 0;
      let sholatJamaah = 0;
      let daysPassed = 0;

      if (
        today.isAfter(ramadhanStart, 'day') ||
        today.isSame(ramadhanStart, 'day')
      ) {
        if (today.isAfter(ramadhanEnd, 'day')) {
          daysPassed = ramadhanEnd.diff(ramadhanStart, 'day') + 1;
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

      let missedFasts = daysPassed - puasaCompleted - haidMissedFasts;
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
        if (todayData.custom_progress?.[habit.id]) completed++;
      });

      setTaskProgress({ completed, total });
    } catch (error) {
      console.error(error);
      setTaskProgress({ completed: 0, total: 9 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackerSummary();
    const handleProfileUpdate = () => {
      fetchTrackerSummary();
    };
    window.addEventListener('user_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('user_profile_updated', handleProfileUpdate);
    };
  }, [fetchTrackerSummary]);

  return { summary, taskProgress, loading, fetchTrackerSummary };
}
