import { useState, useEffect } from 'react';
import {
  getKhatamPlan,
  saveKhatamPlan,
  clearKhatamPlan,
} from '../lib/quranTrackerService';

const TOTAL_AYAT_QURAN = 6236;

// Function untuk mengelola logika, kalkulasi, dan rekomendasi program khatam
export const useKhatamPlan = () => {
  const [khatamPlan, setKhatamPlan] = useState(null);
  const [stats, setStats] = useState(null);

  // Function untuk memuat data dari storage
  const loadPlan = () => {
    const plan = getKhatamPlan();
    setKhatamPlan(plan);
    if (plan) calculateStats(plan);
  };

  // Function untuk menghitung sisa target dan rekomendasi
  const calculateStats = (plan) => {
    const startDate = new Date(plan.startDate);
    const today = new Date();
    const daysElapsed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));

    const daysRemaining = Math.max(1, plan.targetDays - daysElapsed);
    const ayatRemaining = Math.max(0, TOTAL_AYAT_QURAN - plan.progressAyat);

    const targetAyatPerDay = Math.ceil(ayatRemaining / daysRemaining);
    const expectedProgress = Math.ceil(
      (TOTAL_AYAT_QURAN / plan.targetDays) * daysElapsed,
    );

    let status = 'ON_TRACK';
    let recommendation = '';

    if (plan.progressAyat < expectedProgress - 50) {
      status = 'BEHIND';
      recommendation = `Target harianmu naik menjadi ${targetAyatPerDay} ayat. Coba bagi waktu membaca setelah setiap shalat wajib (sekitar ${Math.ceil(targetAyatPerDay / 5)} ayat per shalat).`;
    } else if (plan.progressAyat > expectedProgress + 50) {
      status = 'AHEAD';
      recommendation = `MasyaAllah, bacaanmu lebih cepat dari target! Kamu bisa mempertahankan ritme santai ini.`;
    } else {
      status = 'ON_TRACK';
      recommendation = `Konsistensi yang hebat! Tetap pertahankan membaca sekitar ${targetAyatPerDay} ayat setiap harinya.`;
    }

    setStats({
      daysRemaining,
      ayatRemaining,
      targetAyatPerDay,
      status,
      recommendation,
      percentage: ((plan.progressAyat / TOTAL_AYAT_QURAN) * 100).toFixed(1),
    });
  };

  // Function untuk membuat rencana khatam baru
  const createPlan = (targetDays) => {
    const newPlan = { targetDays, progressAyat: 0 };
    saveKhatamPlan(newPlan);
  };

  // Function untuk menghapus rencana khatam
  const removePlan = () => {
    clearKhatamPlan();
    setKhatamPlan(null);
    setStats(null);
  };

  useEffect(() => {
    loadPlan();

    const handleStorageUpdate = () => loadPlan();
    window.addEventListener('khatam_plan_updated', handleStorageUpdate);

    return () => {
      window.removeEventListener('khatam_plan_updated', handleStorageUpdate);
    };
  }, []);

  return { khatamPlan, stats, createPlan, removePlan, reloadPlan: loadPlan };
};
