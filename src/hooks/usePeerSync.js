'use client';

import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

/**
 * Hook untuk manajemen koneksi P2P WebRTC
 * @returns {Object} State dan fungsi kontrol PeerJS
 */
export default function usePeerSync() {
  const [peerId, setPeerId] = useState('');
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [receivedData, setReceivedData] = useState(null);
  const [error, setError] = useState(null);

  const peerInstance = useRef(null);
  const connectionInstance = useRef(null);

  // SECTION: FUNGSI INISIALISASI PEER
  const initializePeer = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();

    const peer = new Peer(id);

    peer.on('open', (id) => {
      setPeerId(id);
      console.log('My peer ID is: ' + id);
    });

    peer.on('connection', (conn) => {
      setConnectionStatus('connected');
      connectionInstance.current = conn;

      conn.on('data', (data) => {
        console.log('Menerima data:', data);
        setReceivedData(data);
      });

      conn.on('close', () => setConnectionStatus('disconnected'));
    });

    peer.on('error', (err) => {
      setError(err.message);
      setConnectionStatus('disconnected');
    });

    peerInstance.current = peer;
  };

  // SECTION: FUNGSI KONEKSI KE PEER LAIN
  /**
   * @param {string} targetId
   */
  const connectToPeer = (targetId) => {
    if (!peerInstance.current) return;
    setConnectionStatus('connecting');

    const conn = peerInstance.current.connect(targetId);

    conn.on('open', () => {
      setConnectionStatus('connected');
      connectionInstance.current = conn;

      conn.on('data', (data) => {
        console.log('Menerima data:', data);
        setReceivedData(data);
      });
    });

    conn.on('close', () => setConnectionStatus('disconnected'));

    conn.on('error', (err) => {
      setError('Gagal terhubung: ' + err.message);
      setConnectionStatus('disconnected');
    });
  };

  // SECTION: FUNGSI MENGIRIM DATA P2P
  /**
   * @param {any} data
   */
  const sendData = (data) => {
    if (connectionInstance.current && connectionStatus === 'connected') {
      connectionInstance.current.send(data);
    } else {
      setError('Tidak ada koneksi aktif untuk mengirim data.');
    }
  };

  // SECTION: FUNGSI MENGHANCURKAN KONEKSI
  const destroyPeer = () => {
    if (connectionInstance.current) connectionInstance.current.close();
    if (peerInstance.current) peerInstance.current.destroy();
    setConnectionStatus('disconnected');
    setPeerId('');
  };

  // SECTION: CLEANUP SAAT UNMOUNT
  useEffect(() => {
    return () => destroyPeer();
  }, []);

  return {
    peerId,
    connectionStatus,
    receivedData,
    error,
    initializePeer,
    connectToPeer,
    sendData,
    destroyPeer,
  };
}
