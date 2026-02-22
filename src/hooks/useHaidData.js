import { useState, useEffect } from 'react';
import localforage from 'localforage';
import dayjs from 'dayjs';
import {
  RAMADHAN_START,
  RAMADHAN_END,
} from '@/components/HaidTracker/Constants';

/**
 * Mengelola semua operasi data haid: fetch, tambah, update, dan delete.
 * Data di-sync via P2P untuk multi-device
 */
export function useHaidData(user, isPWA) {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [activePeriod, setActivePeriod] = useState(null);

  useEffect(() => {
    // Load data dari localforage (berlaku untuk PWA dan Web mode)
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Semua data disimpan di localforage dengan key yang user-specific
      const storageKey = `haid_logs_${user?.personal_code || 'local'}`;
      const localHaid = (await localforage.getItem(storageKey)) || [];

      setLogs(localHaid);
      setActivePeriod(localHaid.find((item) => item.end_date === null) || null);
    } catch (error) {
      console.error('Error fetching haid data from localforage:', error);
      setLogs([]);
      setActivePeriod(null);
    }
    setLoading(false);
  };

  /** Menyimpan tanggal mulai atau selesai siklus */
  const saveDate = async (actionType, inputDate) => {
    if (!user) return { success: false };

    try {
      const storageKey = `haid_logs_${user.personal_code || 'local'}`;
      const localHaid = (await localforage.getItem(storageKey)) || [];

      if (actionType === 'start') {
        const newLog = {
          id: Date.now().toString(),
          start_date: inputDate,
          end_date: null,
          created_at: dayjs().toISOString(),
          updated_at: dayjs().toISOString(),
        };
        const updated = [newLog, ...localHaid];
        await localforage.setItem(storageKey, updated);
        setActivePeriod(newLog);
        setLogs(updated);

        // Trigger P2P sync event jika tersedia
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent('haid_data_updated', {
              detail: { type: 'start', data: newLog },
            }),
          );
        }

        return { success: true, type: 'start' };
      }

      if (actionType === 'end' && activePeriod) {
        const updated = localHaid.map((l) =>
          l.id === activePeriod.id
            ? {
                ...l,
                end_date: inputDate,
                updated_at: dayjs().toISOString(),
              }
            : l,
        );
        await localforage.setItem(storageKey, updated);
        setLogs(updated);
        setActivePeriod(null);

        // Trigger P2P sync event
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(
            new CustomEvent('haid_data_updated', {
              detail: { type: 'end', data: updated[0] },
            }),
          );
        }

        return { success: true, type: 'end' };
      }
    } catch (error) {
      console.error('Error saving date:', error);
    }

    return { success: false };
  };

  /** Hapus log */
  const deleteLog = async (id) => {
    try {
      const storageKey = `haid_logs_${user?.personal_code || 'local'}`;
      const localHaid = (await localforage.getItem(storageKey)) || [];

      const updated = localHaid.filter((l) => l.id !== id);
      await localforage.setItem(storageKey, updated);
      setLogs(updated);

      // Trigger P2P sync event
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent('haid_data_updated', {
            detail: { type: 'delete', id },
          }),
        );
      }
    } catch (error) {
      console.error('Error deleting log:', error);
    }
  };

  /** Hitung durasi siklus dalam hari */
  const getDuration = (startDate) => {
    if (!startDate) return 0;
    return dayjs().diff(dayjs(startDate), 'day') + 1;
  };

  /** Hitung jumlah hari qadha */
  const getQadhaDays = (log) => {
    if (!log.start_date || !log.end_date) return 0;
    const diff = dayjs(log.end_date).diff(dayjs(log.start_date), 'day') + 1;
    return Math.max(0, diff - 7); // Haid normal 7 hari
  };

  /** Total hari puasa yang terlewat (qadha) */
  const totalMissedFasting = logs.reduce((sum, log) => {
    return sum + getQadhaDays(log);
  }, 0);

  return {
    loading,
    logs,
    activePeriod,
    saveDate,
    deleteLog,
    getDuration,
    getQadhaDays,
    totalMissedFasting,
    refetchData: fetchData,
  };
}
