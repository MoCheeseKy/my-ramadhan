'use client';

import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';
import dayjs from 'dayjs';

export default function useTrackerSummary() {
  const [taskProgress, setTaskProgress] = useState({ completed: 0, total: 9 });
  const [loading, setLoading] = useState(true);

  const fetchTrackerSummary = useCallback(async () => {
    setLoading(true);
    try {
      const trackerData = (await localforage.getItem('ramadhan_tracker')) || {};
      const customHabits = (await localforage.getItem('custom_habits')) || [];

      const todayStr = dayjs().format('YYYY-MM-DD');
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
      setTaskProgress({ completed: 0, total: 9 });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrackerSummary();
  }, [fetchTrackerSummary]);

  return { taskProgress, loading, fetchTrackerSummary };
}
