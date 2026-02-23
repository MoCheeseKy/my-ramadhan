const isBrowser = typeof window !== 'undefined';

// Array jumlah ayat dari Surah 1 (Al-Fatihah) hingga 114 (An-Nas)
export const SURAH_AYAH_COUNTS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111,
  110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45,
  83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
  78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20,
  56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21,
  11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

// Function untuk menghitung total ayat absolut dari Al-Fatihah ayat 1
export const calculateAbsoluteAyah = (surahId, ayahNumber) => {
  let total = 0;
  for (let i = 0; i < surahId - 1; i++) {
    total += SURAH_AYAH_COUNTS[i];
  }
  total += ayahNumber;
  return total;
};

// Function untuk mendapatkan riwayat durasi membaca harian
export const getReadingHistory = () => {
  if (!isBrowser) return {};
  const history = localStorage.getItem('quran_reading_history');
  return history ? JSON.parse(history) : {};
};

// Function untuk menyimpan/menambah durasi membaca pada hari tertentu (dalam detik)
export const addReadingDuration = (dateString, seconds) => {
  if (!isBrowser) return;
  const history = getReadingHistory();
  const currentDuration = history[dateString] || 0;
  history[dateString] = currentDuration + seconds;
  localStorage.setItem('quran_reading_history', JSON.stringify(history));
};

export const getKhatamPlan = () => {
  if (!isBrowser) return null;
  const plan = localStorage.getItem('quran_khatam_plan');
  return plan ? JSON.parse(plan) : null;
};

export const saveKhatamPlan = (planData) => {
  if (!isBrowser) return;
  localStorage.setItem(
    'quran_khatam_plan',
    JSON.stringify({
      ...planData,
      startDate: new Date().toISOString(),
      progressAyat: planData.progressAyat || 0,
    }),
  );
  window.dispatchEvent(new Event('khatam_plan_updated'));
};

// Function untuk MENIMPA progress ayat (Kalkulasi Absolut)
export const setKhatamProgress = (absoluteAyahCount) => {
  if (!isBrowser) return;
  const plan = getKhatamPlan();
  if (plan) {
    plan.progressAyat = Math.min(6236, Math.max(0, absoluteAyahCount));
    localStorage.setItem('quran_khatam_plan', JSON.stringify(plan));
    window.dispatchEvent(new Event('khatam_plan_updated'));
  }
};

export const clearKhatamPlan = () => {
  if (!isBrowser) return;
  localStorage.removeItem('quran_khatam_plan');
  window.dispatchEvent(new Event('khatam_plan_updated'));
};
