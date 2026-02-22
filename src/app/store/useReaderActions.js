'use client';

import { useState } from 'react';
import useQuranStorage from '@/hooks/useQuranStorage';

const useReaderActions = ({
  bookmarks,
  setBookmarks,
  setLastRead,
  surahIdContext = null,
  surahContext = null,
  isJuzMode = false,
}) => {
  // Menggunakan hooks storage lokal yang sudah kita refactor sebelumnya
  const { saveBookmarksData, saveLastRead } = useQuranStorage();

  const [copiedId, setCopiedId] = useState(null);
  const [audioInfo, setAudioInfo] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const handleBookmark = async (ayat, surahId, surahName) => {
    const sid = surahId ?? surahIdContext;
    const name = surahName ?? surahContext?.namaLatin;

    const isMarked = bookmarks.some(
      (b) => b.surahId === sid && b.ayahNumber === ayat.nomorAyat,
    );

    const newBookmarks = isMarked
      ? bookmarks.filter(
          (b) => !(b.surahId === sid && b.ayahNumber === ayat.nomorAyat),
        )
      : [
          ...bookmarks,
          {
            surahId: sid,
            surahName: name,
            ayahNumber: ayat.nomorAyat,
            arab: ayat.teksArab,
            translation: ayat.teksIndonesia,
          },
        ];

    setBookmarks(newBookmarks);
    await saveBookmarksData(newBookmarks);
  };

  const handleLastReadContext = async (
    ayat,
    surahId,
    surahName,
    juzInfo = null,
  ) => {
    const sid = surahId ?? surahIdContext;
    const name = surahName ?? surahContext?.namaLatin;

    const data = {
      surahId: sid,
      surahName: name,
      ayahNumber: ayat.nomorAyat,
      isJuz: !!juzInfo,
      ...(juzInfo ?? {}),
    };

    setLastRead(data);
    await saveLastRead(data);
  };

  const handleCopy = (ayat, surahName, surahId) => {
    const name = surahName ?? surahContext?.namaLatin;
    const copyKey = isJuzMode ? `${surahId}-${ayat.nomorAyat}` : ayat.nomorAyat;

    const text = `${name} Ayat ${ayat.nomorAyat}\n\n${ayat.teksArab}\n\n${ayat.teksLatin}\n\n"${ayat.teksIndonesia}"\n\n(Sumber: MyRamadhan)`;
    navigator.clipboard.writeText(text);
    setCopiedId(copyKey);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePlayAudio = (ayat, surahId, surahName) => {
    const sid = surahId ?? surahIdContext;
    const name = surahName ?? surahContext?.namaLatin;

    const isSame =
      audioInfo?.ayat.nomorAyat === ayat.nomorAyat &&
      audioInfo?.surahId === sid;

    if (isSame && showPlayer) {
      setShowPlayer(false);
      setAudioInfo(null);
    } else {
      setAudioInfo({ ayat, surahId: sid, surahName: name });
      setShowPlayer(true);
    }
  };

  const closePlayer = () => {
    setShowPlayer(false);
    setAudioInfo(null);
  };

  return {
    copiedId,
    audioInfo,
    showPlayer,
    handleBookmark,
    handleLastRead: handleLastReadContext,
    handleCopy,
    handlePlayAudio,
    closePlayer,
  };
};

export default useReaderActions;
