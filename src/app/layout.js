import './globals.css'; // Pastikan Anda sudah memindahkan folder styles
import { Inter } from 'next/font/google';

// Kita gunakan font Inter bawaan Next.js agar loading lebih cepat
const inter = Inter({ subsets: ['latin'] });

// Ini menggantikan tag <Head> untuk SEO dan PWA Manifest
export const metadata = {
  title: 'MyRamadhan - Pendamping Ibadah',
  description:
    "Aplikasi pendamping ibadah Ramadhan lengkap dengan Al-Qur'an, Tracker, Jurnal, dan Jadwal Sholat secara offline.",
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/myramadhan-app-logo-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MyRamadhan',
  },
  formatDetection: {
    telephone: false,
  },
};

// Ini menggantikan tag <meta name="viewport">
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F6F9FC' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({ children }) {
  return (
    // Kita berikan class 'light' sebagai default, nanti bisa diubah ke 'dark' via state/localStorage
    <html lang='id' className='light' suppressHydrationWarning>
      <body
        className={`${inter.className} min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 selection:bg-blue-200 dark:selection:bg-blue-800 transition-colors duration-300 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
