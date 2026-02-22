import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

// Plugin ini wajib agar bisa membaca format tanggal DD-MM-YYYY dari API Aladhan
dayjs.extend(customParseFormat);

/**
 * GET Handler untuk mengambil jadwal sholat dari API Aladhan
 * @param {Request} request
 * @returns {NextResponse} JSON jadwal
 */
export async function GET(request) {
  // Mengambil parameter query (misal: ?city=Jakarta) di App Router
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'Jakarta';
  const country = 'Indonesia';

  // ─── KONFIGURASI TAHUN & TANGGAL ───
  const currentYear = 2026;
  const startDate = dayjs(`${currentYear}-02-19`);
  const daysTarget = 30;

  try {
    const month1 = 2; // Februari
    const month2 = 3; // Maret

    // Fetch Data Bulan Februari & Maret 2026
    const res1 = await fetch(
      `http://api.aladhan.com/v1/calendarByCity/${currentYear}/${month1}?city=${city}&country=${country}&method=20`,
    );
    const res2 = await fetch(
      `http://api.aladhan.com/v1/calendarByCity/${currentYear}/${month2}?city=${city}&country=${country}&method=20`,
    );

    if (!res1.ok || !res2.ok) {
      throw new Error('Gagal mengambil data dari API Aladhan');
    }

    const data1 = await res1.json();
    const data2 = await res2.json();

    const rawData = [...data1.data, ...data2.data];

    // ─── FILTERING LOGIC ───
    const schedule = [];
    let count = 0;

    for (const item of rawData) {
      if (count >= daysTarget) break;

      const itemDate = dayjs(item.date.gregorian.date, 'DD-MM-YYYY');

      if (
        itemDate.isSame(startDate, 'day') ||
        itemDate.isAfter(startDate, 'day')
      ) {
        schedule.push({
          date: item.date.readable,
          isoDate: itemDate.toISOString(),
          hijri: `${item.date.hijri.day} ${item.date.hijri.month.en} ${item.date.hijri.year}`,
          timings: {
            Imsak: item.timings.Imsak.split(' ')[0],
            Subuh: item.timings.Fajr.split(' ')[0],
            Dzuhur: item.timings.Dhuhr.split(' ')[0],
            Ashar: item.timings.Asr.split(' ')[0],
            Maghrib: item.timings.Maghrib.split(' ')[0],
            Isya: item.timings.Isha.split(' ')[0],
          },
        });
        count++;
      }
    }

    // ─── RETURN RESPONSE ───
    return NextResponse.json(
      {
        location: city,
        year: currentYear,
        info: 'Jadwal Ramadhan 2026 (Mulai 19 Feb)',
        schedule,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Gagal memuat jadwal sholat' },
      { status: 500 },
    );
  }
}
