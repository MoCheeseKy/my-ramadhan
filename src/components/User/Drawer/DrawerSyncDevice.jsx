'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Scanner } from '@yudiel/react-qr-scanner';
import {
  ScanLine,
  Smartphone,
  ArrowDownToLine,
  ArrowUpFromLine,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronLeft,
} from 'lucide-react';

import DrawerPanel from '@/components/_shared/DrawerPanel';
import usePeerSync from '@/hooks/usePeerSync';
import { StorageService } from '@/lib/storageService';

/**
 * DrawerSyncDevice — Laci utama untuk fitur Transfer Data WebRTC (P2P).
 * Menangani mode 'Kirim Data' (Generate QR) dan 'Terima Data' (Scan QR).
 *
 * @prop {boolean} open
 * @prop {Function} onClose
 */
const DrawerSyncDevice = ({ open, onClose }) => {
  const [mode, setMode] = useState('select');
  const [syncStatus, setSyncStatus] = useState('idle');
  const [alertMsg, setAlertMsg] = useState(null);

  const {
    peerId,
    connectionStatus,
    receivedData,
    error: peerError,
    initializePeer,
    connectToPeer,
    sendData,
    destroyPeer,
  } = usePeerSync();

  // SECTION: RESET STATE SAAT LACI DITUTUP
  useEffect(() => {
    if (!open) {
      setMode('select');
      setSyncStatus('idle');
      setAlertMsg(null);
      destroyPeer();
    }
  }, [open]);

  // SECTION: HANDLER ERROR DARI PEER
  useEffect(() => {
    if (peerError) {
      setSyncStatus('error');
      setAlertMsg(peerError);
    }
  }, [peerError]);

  // SECTION: LOGIKA MODE PENGIRIM (SENDER)
  useEffect(() => {
    if (mode === 'send' && connectionStatus === 'connected') {
      const executeSend = async () => {
        try {
          setSyncStatus('syncing');
          const dataToSync = await StorageService.getAllSyncData();
          sendData(dataToSync);
          setSyncStatus('success');
          setAlertMsg('Data berhasil dikirim ke perangkat baru!');
        } catch (err) {
          setSyncStatus('error');
          setAlertMsg('Gagal membaca data lokal untuk dikirim.');
        }
      };
      executeSend();
    }
  }, [mode, connectionStatus]);

  // SECTION: LOGIKA MODE PENERIMA (RECEIVER)
  useEffect(() => {
    if (mode === 'receive' && receivedData) {
      const executeReceive = async () => {
        try {
          setSyncStatus('syncing');
          await StorageService.importSyncData(receivedData);
          setSyncStatus('success');
          setAlertMsg('Data berhasil diterima dan disimpan! Memuat ulang...');

          setTimeout(() => {
            window.location.reload();
          }, 2500);
        } catch (err) {
          setSyncStatus('error');
          setAlertMsg('Gagal memproses data yang diterima.');
        }
      };
      executeReceive();
    }
  }, [mode, receivedData]);

  /**
   * Fungsi untuk berpindah ke Mode Kirim (Generate QR)
   */
  const handleStartSending = () => {
    setMode('send');
    setSyncStatus('waiting');
    initializePeer();
  };

  /**
   * Fungsi untuk berpindah ke Mode Terima (Buka Kamera)
   */
  const handleStartReceiving = () => {
    setMode('receive');
    setSyncStatus('scanning');
    initializePeer();
  };

  /**
   * Fungsi callback saat QR Scanner berhasil membaca kode
   */
  const handleScanSuccess = (result) => {
    if (result && result.length > 0 && syncStatus === 'scanning') {
      const scannedId = result[0].rawValue;
      setSyncStatus('connecting');
      connectToPeer(scannedId);
    }
  };

  return (
    <DrawerPanel
      open={open}
      onClose={onClose}
      title={
        mode === 'select'
          ? 'Sinkronisasi Perangkat'
          : mode === 'send'
            ? 'Kirim Data'
            : 'Terima Data'
      }
      icon={ScanLine}
      hideFooterButton
    >
      <div className='pb-6 min-h-[300px]'>
        {/* SECTION: TOMBOL KEMBALI */}
        {mode !== 'select' && syncStatus !== 'success' && (
          <button
            onClick={() => {
              destroyPeer();
              setMode('select');
              setSyncStatus('idle');
            }}
            className='flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors'
          >
            <ChevronLeft size={16} /> Kembali
          </button>
        )}

        {/* SECTION: MODE SELECTOR (AWAL) */}
        {mode === 'select' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className='space-y-4'
          >
            <p className='text-sm text-slate-600 dark:text-slate-400 mb-6 text-center px-4'>
              Pindahkan data Jurnal, Tracker, dan Pengaturan dari perangkat lama
              ke perangkat baru tanpa internet/server.
            </p>

            <button
              onClick={handleStartSending}
              className='w-full p-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 flex items-center gap-4 transition-all group'
            >
              <div className='w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform'>
                <ArrowUpFromLine size={24} />
              </div>
              <div className='text-left'>
                <h3 className='font-bold text-slate-800 dark:text-slate-100'>
                  Kirim Data (Perangkat Lama)
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                  Tampilkan QR Code untuk di-scan
                </p>
              </div>
            </button>

            <button
              onClick={handleStartReceiving}
              className='w-full p-4 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 flex items-center gap-4 transition-all group'
            >
              <div className='w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform'>
                <ArrowDownToLine size={24} />
              </div>
              <div className='text-left'>
                <h3 className='font-bold text-slate-800 dark:text-slate-100'>
                  Terima Data (Perangkat Baru)
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400 mt-0.5'>
                  Buka kamera untuk scan QR Code
                </p>
              </div>
            </button>
          </motion.div>
        )}

        {/* SECTION: MODE SEND (QR GENERATOR) */}
        {mode === 'send' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col items-center justify-center'
          >
            {syncStatus === 'waiting' && peerId ? (
              <>
                <div className='bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-6'>
                  <QRCodeSVG value={peerId} size={200} level='H' />
                </div>
                <div className='flex items-center gap-3 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-4 py-2.5 rounded-full'>
                  <Loader2 size={16} className='animate-spin shrink-0' />
                  <span className='text-xs font-bold'>
                    Menunggu perangkat lain untuk scan...
                  </span>
                </div>
              </>
            ) : syncStatus === 'waiting' ? (
              <div className='py-20 flex flex-col items-center text-slate-400'>
                <Loader2 size={32} className='animate-spin mb-4' />
                <p className='text-sm font-bold'>Membuat kode unik...</p>
              </div>
            ) : null}
          </motion.div>
        )}

        {/* SECTION: MODE RECEIVE (QR SCANNER) */}
        {mode === 'receive' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className='flex flex-col items-center'
          >
            {syncStatus === 'scanning' ? (
              <div className='w-full max-w-[280px] aspect-square rounded-2xl overflow-hidden shadow-inner border-4 border-slate-100 dark:border-slate-800 relative bg-black'>
                <Scanner
                  onScan={handleScanSuccess}
                  onError={(err) => console.error(err)}
                  components={{ audio: false, finder: false }}
                />
                <div className='absolute inset-0 border-2 border-emerald-500/50 m-8 rounded-xl z-10' />
              </div>
            ) : syncStatus === 'connecting' ? (
              <div className='py-20 flex flex-col items-center text-slate-400'>
                <Loader2
                  size={32}
                  className='animate-spin mb-4 text-emerald-500'
                />
                <p className='text-sm font-bold'>
                  Terhubung dengan pengirim...
                </p>
              </div>
            ) : null}

            {syncStatus === 'scanning' && (
              <p className='text-xs font-bold text-slate-500 text-center mt-6'>
                Arahkan kamera ke QR Code di perangkat lama
              </p>
            )}
          </motion.div>
        )}

        {/* SECTION: STATUS FEEDBACK (SYNCING / SUCCESS / ERROR) */}
        <AnimatePresence mode='wait'>
          {(syncStatus === 'syncing' ||
            syncStatus === 'success' ||
            syncStatus === 'error') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-5 rounded-2xl flex flex-col items-center text-center ${
                syncStatus === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30'
                  : syncStatus === 'error'
                    ? 'bg-rose-50 dark:bg-rose-950/30'
                    : 'bg-blue-50 dark:bg-blue-950/30'
              }`}
            >
              {syncStatus === 'syncing' && (
                <Loader2
                  size={32}
                  className='animate-spin text-blue-500 mb-3'
                />
              )}
              {syncStatus === 'success' && (
                <CheckCircle2 size={40} className='text-emerald-500 mb-3' />
              )}
              {syncStatus === 'error' && (
                <XCircle size={40} className='text-rose-500 mb-3' />
              )}

              <p
                className={`font-bold text-sm ${
                  syncStatus === 'success'
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : syncStatus === 'error'
                      ? 'text-rose-700 dark:text-rose-400'
                      : 'text-blue-700 dark:text-blue-400'
                }`}
              >
                {syncStatus === 'syncing' ? 'Mentransfer Data...' : alertMsg}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DrawerPanel>
  );
};

export default DrawerSyncDevice;
