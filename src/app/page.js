'use client';

import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

import useUser from '@/hooks/useUser';
import { studyMaterials } from '@/data/studyMaterials';
import { quotesData } from '@/data/quotes';

import useHijriDate from '@/hooks/useHijriDate';
import usePrayerTimes from '@/hooks/usePrayerTimes';
import useHeroMode from '@/hooks/useHeroMode';
import useNotifications from '@/hooks/useNotifications';
import useTrackerSummary from '@/hooks/useTrackerSummary';

import HomeHeader from '@/components/Home/HomeHeader';
import HeroCard from '@/components/Home/HeroCard';
import DailyGoalTracker from '@/components/Home/DailyGoalTracker';
import ToolGrid from '@/components/Home/ToolGrid';
import DailyKnowledge from '@/components/Home/DailyKnowledge';
import JurnalCard from '@/components/Home/JurnalCard';
import RamaTalkCard from '@/components/Home/RamaTalkCard';
import QuoteCard from '@/components/Home/QuoteCard';

import TrackerDrawer from '@/components/TrackerDrawer';
import ScheduleDrawer from '@/components/ScheduleDrawer';
import NotificationDrawer from '@/components/NotificationDrawer';

dayjs.locale('id');
dayjs.extend(relativeTime);
dayjs.extend(duration);

/**
 * Halaman Beranda Utama Aplikasi MyRamadhan (App Router)
 * Bertugas mengoordinasikan seluruh state global untuk dashboard harian
 */
export default function MyRamadhanHome() {
  const { user } = useUser();

  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(dayjs());

  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [quoteOfTheDay, setQuoteOfTheDay] = useState(quotesData[0]);
  const [isSpinning, setIsSpinning] = useState(false);

  const { hijriDate, hijriDay } = useHijriDate();
  const { prayerTimes, userCity, fetchPrayerTimes } = usePrayerTimes();
  const { taskProgress, fetchTrackerSummary } = useTrackerSummary(user, true);
  const { notifications, hasUnreadNotif, markAsRead } = useNotifications(
    mounted,
    hijriDay,
    prayerTimes,
    currentTime,
  );

  const hero = useHeroMode(prayerTimes, currentTime);

  /**
   * Mengacak kutipan harian dengan animasi jeda
   */
  const randomizeQuote = () => {
    setIsSpinning(true);
    setTimeout(() => {
      setQuoteOfTheDay(
        quotesData[Math.floor(Math.random() * quotesData.length)],
      );
      setIsSpinning(false);
    }, 500);
  };

  /**
   * Membuka laci notifikasi dan menandai semua sebagai telah dibaca
   */
  const handleOpenNotification = () => {
    setIsNotificationOpen(true);
    markAsRead();
  };

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    randomizeQuote();
    fetchPrayerTimes();

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTrackerSummary();
    }
  }, [user]);

  const dailyTopic =
    studyMaterials.find((m) => m.day === hijriDay) || studyMaterials[0];

  if (!mounted) return null;

  return (
    <main className='min-h-screen bg-[#F6F9FC] dark:bg-slate-950 text-slate-800 dark:text-slate-100 pb-16 selection:bg-blue-200 dark:selection:bg-blue-800 transition-colors duration-300'>
      {/* SECTION: BACKGROUND DECORATION */}
      <div className='fixed inset-0 -z-10 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-indigo-100/50 dark:bg-indigo-900/20 rounded-full blur-3xl opacity-60' />
      </div>

      {/* SECTION: MAIN CONTENT CONTAINER */}
      <div className='w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-5 md:py-8 lg:py-10 lg:px-8'>
        <HomeHeader
          user={user}
          hijriDate={hijriDate}
          hasUnreadNotif={hasUnreadNotif}
          onOpenNotification={handleOpenNotification}
        />

        <div className='flex flex-col lg:flex-row gap-5 md:gap-6 lg:gap-8 animate-fadeUp'>
          {/* SECTION: LEFT COLUMN (HERO & TOOLS) */}
          <div className='flex-1 flex flex-col gap-5 md:gap-6 lg:gap-6'>
            <HeroCard
              hero={hero}
              userCity={userCity}
              onOpenSchedule={() => setIsScheduleOpen(true)}
            />
            <DailyGoalTracker
              taskProgress={taskProgress}
              onClick={() => setIsTrackerOpen(true)}
            />
            <ToolGrid />
          </div>

          {/* SECTION: RIGHT COLUMN (CARDS) */}
          <div className='w-full lg:w-[350px] xl:w-[380px] flex-shrink-0 grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-col gap-5 md:gap-6 lg:gap-6'>
            <DailyKnowledge hijriDay={hijriDay} dailyTopic={dailyTopic} />
            <JurnalCard user={user} />
            <RamaTalkCard />
            <QuoteCard
              quote={quoteOfTheDay}
              isSpinning={isSpinning}
              onRefresh={randomizeQuote}
            />
          </div>
        </div>
      </div>

      {/* SECTION: DRAWERS */}
      <TrackerDrawer
        isOpen={isTrackerOpen}
        onClose={() => setIsTrackerOpen(false)}
        onUpdate={fetchTrackerSummary}
      />
      <ScheduleDrawer
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onUpdate={fetchPrayerTimes}
      />
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
      />
    </main>
  );
}
