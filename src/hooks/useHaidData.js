'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import localforage from 'localforage';
import dayjs from 'dayjs';

export function useHaidData() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const HAID_KEY = 'haid_logs';

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await localforage.getItem(HAID_KEY)) || [];
      const sorted = data.sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date),
      );
      setLogs(sorted);
    } catch (error) {
      console.error('Gagal memuat data haid lokal:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const saveDate = async (type, date) => {
    try {
      const currentLogs = (await localforage.getItem(HAID_KEY)) || [];
      let updatedLogs;

      if (type === 'start') {
        const newLog = {
          id: Date.now().toString(),
          start_date: date,
          end_date: null,
        };
        updatedLogs = [newLog, ...currentLogs];
      } else if (type === 'end') {
        const activeIndex = currentLogs.findIndex((log) => !log.end_date);
        if (activeIndex !== -1) {
          updatedLogs = [...currentLogs];
          updatedLogs[activeIndex] = {
            ...updatedLogs[activeIndex],
            end_date: date,
          };
        } else {
          return {
            success: false,
            error: 'Tidak ada siklus aktif yang bisa diakhiri.',
          };
        }
      }

      const sorted = updatedLogs.sort(
        (a, b) => new Date(b.start_date) - new Date(a.start_date),
      );

      await localforage.setItem(HAID_KEY, sorted);
      setLogs(sorted);

      window.dispatchEvent(new Event('user_profile_updated'));

      return { success: true, type };
    } catch (error) {
      return { success: false, error };
    }
  };

  const deleteLog = async (id) => {
    try {
      const currentLogs = (await localforage.getItem(HAID_KEY)) || [];
      const updatedLogs = currentLogs.filter((log) => log.id !== id);

      await localforage.setItem(HAID_KEY, updatedLogs);
      setLogs(updatedLogs);

      window.dispatchEvent(new Event('user_profile_updated'));

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  // --- Helpers ---
  const activePeriod = useMemo(() => {
    return logs.find((log) => !log.end_date) || null;
  }, [logs]);

  const getDuration = useCallback((startDate) => {
    if (!startDate) return 0;
    return dayjs().diff(dayjs(startDate), 'day') + 1;
  }, []);

  const getQadhaDays = useCallback((startDate, endDate) => {
    if (!startDate) return 0;

    // Rentang Ramadhan
    const ramadhanStart = dayjs('2026-02-19');
    const ramadhanEnd = dayjs('2026-03-20');
    const start = dayjs(startDate).startOf('day');
    const end = endDate ? dayjs(endDate).endOf('day') : dayjs().endOf('day');

    let qadha = 0;

    for (let i = 0; i <= ramadhanEnd.diff(ramadhanStart, 'day'); i++) {
      const rDay = ramadhanStart.add(i, 'day');

      if (rDay.isBefore(dayjs(), 'day') || rDay.isSame(dayjs(), 'day')) {
        const isMenstruating =
          (rDay.isAfter(start, 'day') || rDay.isSame(start, 'day')) &&
          (rDay.isBefore(end, 'day') || rDay.isSame(end, 'day'));
        if (isMenstruating) {
          qadha++;
        }
      }
    }
    return qadha;
  }, []);

  const totalMissedFasting = useMemo(() => {
    return logs.reduce(
      (total, log) => total + getQadhaDays(log.start_date, log.end_date),
      0,
    );
  }, [logs, getQadhaDays]);

  const saveLog = saveDate;

  return {
    logs,
    loading,
    activePeriod,
    saveDate,
    saveLog,
    deleteLog,
    getDuration,
    getQadhaDays,
    totalMissedFasting,
  };
}
