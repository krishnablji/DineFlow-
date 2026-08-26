import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    newSocket.on('connect', () => {
      console.log(`[Socket Connected]: ${newSocket.id}`);
      setIsConnected(true);

      // Automatically join room if user is logged in
      if (user) {
        newSocket.emit('join_room', {
          role: user.role,
          userId: user.id || user._id,
        });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('[Socket Disconnected]');
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Update room subscriptions on user login/switch
  useEffect(() => {
    if (socket && isConnected && user) {
      socket.emit('join_room', {
        role: user.role,
        userId: user.id || user._id,
      });
    }
  }, [socket, isConnected, user]);

  // Method to join a specific table room
  const joinTableRoom = (tableNumber) => {
    if (socket && isConnected && tableNumber) {
      socket.emit('join_room', { tableNumber });
    }
  };

  // Play subtle gourmet audio ping for kitchen/waiters
  const playAlertSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio notification unavailable:', e);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinTableRoom,
        playAlertSound,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
