import { useEffect } from 'react';
import { signalRService } from '../services/signalR';
import { BalloonUpdates, ToiletRequestUpdates } from '../types';

interface UseSignalRProps {
  onBalloonUpdates?: (updates: BalloonUpdates) => void;
  onToiletRequestUpdates?: (updates: ToiletRequestUpdates) => void;
}

export const useSignalR = ({ onBalloonUpdates, onToiletRequestUpdates }: UseSignalRProps = {}) => {
  useEffect(() => {
    let mounted = true;

    const initializeSignalR = async () => {
      try {
        await signalRService.startConnection();
        if (mounted) {
          if (onBalloonUpdates) {
            signalRService.onBalloonStatusChanged(onBalloonUpdates);
            signalRService.onReceiveBalloonUpdates(onBalloonUpdates);
          }
          if (onToiletRequestUpdates) {
            signalRService.onReceiveToiletRequestUpdates(onToiletRequestUpdates);
          }
        }
      } catch (error) {
        console.error('Failed to initialize SignalR:', error);
      }
    };

    initializeSignalR();

    return () => {
      mounted = false;
      if (signalRService.isConnected()) {
        if (onBalloonUpdates) {
          signalRService.offBalloonStatusChanged(onBalloonUpdates);
          signalRService.offReceiveBalloonUpdates(onBalloonUpdates);
        }
        if (onToiletRequestUpdates) {
          signalRService.offReceiveToiletRequestUpdates(onToiletRequestUpdates);
        }
        signalRService.stopConnection();
      }
    };
  }, [onBalloonUpdates, onToiletRequestUpdates]);
}; 