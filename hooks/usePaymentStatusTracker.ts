// hooks/usePaymentStatusTracker.ts
import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const usePaymentStatusTracker = (callback: (payment: any) => void) => {
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const startTracking = useCallback((paymentId: string) => {
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }

    // Set up new interval to check payment status
    const id = setInterval(async () => {
      try {
        const response = await authFetch(`${API_URL}/v1/payments/${paymentId}/status`);
        if (response.ok) {
          const data = await response.json();
          callback(data.data.payment);
          
          // Stop tracking if payment is completed or failed
          if (data.data.payment.status === 'completed' || data.data.payment.status === 'failed') {
            stopTracking();
          }
        }
      } catch (error) {
        console.error('Error tracking payment status:', error);
      }
    }, 5000); // Check every 5 seconds

    setIntervalId(id);
  }, [callback, intervalId]);

  const stopTracking = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  useEffect(() => {
    return () => stopTracking();
  }, [stopTracking]);

  return { startTracking, stopTracking };
};