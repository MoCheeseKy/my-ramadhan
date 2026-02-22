'use client';

import { useState, useEffect, useCallback } from 'react';
import localforage from 'localforage';

export default function useHaidData() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const HAID_KEY = 'haid_logs';

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = (await localforage.getItem(HAID_KEY)) || [];
      const sorted = data.sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate),
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

  const saveLog = async (newLog) => {
    try {
      const currentLogs = (await localforage.getItem(HAID_KEY)) || [];
      let updatedLogs;

      if (newLog.id) {
        updatedLogs = currentLogs.map((log) =>
          log.id === newLog.id ? newLog : log,
        );
      } else {
        updatedLogs = [
          { ...newLog, id: Date.now().toString() },
          ...currentLogs,
        ];
      }

      const sorted = updatedLogs.sort(
        (a, b) => new Date(b.startDate) - new Date(a.startDate),
      );
      await localforage.setItem(HAID_KEY, sorted);
      setLogs(sorted);

      return { success: true };
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

      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { logs, loading, fetchLogs, saveLog, deleteLog };
}
