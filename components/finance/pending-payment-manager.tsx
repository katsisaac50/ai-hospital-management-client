import { authFetch } from "@/lib/api";
import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
// Define your API base URL here or import from your config
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type PaymentStatus = 'pending' | 'completed' | 'failed';

interface PaymentRequest {
  status: PaymentStatus;
  expirationTime?: string;
  retryCount?: number;
  maxRetries?: number;
  canRetry?: boolean;
  // Add other properties as needed
}

export const PendingPaymentManager = ({ 
  paymentId, 
  onPaymentComplete,
  onPaymentFailed,
  onRetry, 
  usePaymentStatusTracker
}: {
  paymentId: string;
  onPaymentComplete: (payment: PaymentRequest) => void;
  onPaymentFailed: (payment: PaymentRequest) => void;
  onRetry: () => void;
  usePaymentStatusTracker: (callback: (payment: PaymentRequest) => void) => {
    startTracking: (paymentId: string) => void;
    stopTracking: () => void;
  };
}) => {
  const [payment, setPayment] = useState<PaymentRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { startTracking, stopTracking } = usePaymentStatusTracker((updatedPayment) => {
    setPayment(updatedPayment);
    
    if (updatedPayment.status === 'completed') {
      onPaymentComplete(updatedPayment);
    } else if (updatedPayment.status === 'failed') {
      onPaymentFailed(updatedPayment);
    }
  });

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        setLoading(true);
        const response = await authFetch(`${API_URL}/v1/payments/${paymentId}/status`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch payment status');
        }
        
        const result = await response.json();
        setPayment(result.data.payment);
        
        // Start tracking if payment is still pending
        if (result.data.statusInfo.status === 'pending') {
          startTracking(paymentId);
        } else if (result.data.statusInfo.status === 'completed') {
          onPaymentComplete(result.data.payment);
        } else if (result.data.statusInfo.status === 'failed') {
          onPaymentFailed(result.data.payment);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch payment status');
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) {
      fetchPaymentStatus();
    }

    return () => {
      stopTracking();
    };
  }, [paymentId, onPaymentComplete, onPaymentFailed, startTracking, stopTracking]);

  const handleRetry = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`${API_URL}/v1/payments/${paymentId}/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Failed to retry payment');
      }

      const result = await response.json();
      setPayment(result.data.payment);
      onRetry();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry payment');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setLoading(true);
      const response = await authFetch(`${API_URL}/v1/payments/${paymentId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Cancelled by user' })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel payment');
      }

      const result = await response.json();
      setPayment(result.data);
      onPaymentFailed(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading payment status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!payment) {
    return (
      <Alert variant="destructive" className="bg-red-900/20 border-red-800">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Payment not found</AlertDescription>
      </Alert>
    );
  }

  // Helper function to get badge color based on status
  function getStatusColor(status: PaymentStatus) {
    switch (status) {
      case 'pending':
        return 'bg-amber-600 text-white';
      case 'completed':
        return 'bg-green-600 text-white';
      case 'failed':
        return 'bg-red-600 text-white';
      case "refunded": 
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default:
        return 'bg-gray-600 text-white';
    }
  }

  // Format time remaining
const formatTimeRemaining = (expirationTime: Date) => {
  const now = new Date();
  const diff = expirationTime.getTime() - now.getTime();
  
  if (diff <= 0) return 'Expired';
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return `${minutes}m ${seconds}s`;
};

  return (
    <div className="space-y-4">
      <div className="bg-slate-700/20 p-4 rounded-lg">
        <h3 className="font-semibold text-white mb-2">Payment Status</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">Status:</span>
          <Badge className={getStatusColor(payment.status)}>
            {payment.status.toUpperCase()}
          </Badge>
        </div>
        
        {payment.status === 'pending' && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Expires in:</span>
              <span className="text-amber-400">
                {payment.expirationTime
                  ? Math.max(0, Math.floor((new Date(payment.expirationTime).getTime() - Date.now()) / 60000))
                  : 'N/A'} minutes
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Retries:</span>
              <span className="text-slate-300">
                {payment.retryCount} / {payment.maxRetries}
              </span>
            </div>
          </>
        )}
      </div>

      {payment.status === 'pending' && (
        <div className="flex gap-2">
          <Button 
            onClick={handleRetry} 
            disabled={!payment.canRetry || loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Retry Payment'}
          </Button>
          <Button 
            onClick={handleCancel} 
            variant="outline" 
            disabled={loading}
          >
            Cancel Payment
          </Button>
        </div>
      )}

      {payment.status === 'failed' && (
        <Button onClick={handleRetry} className="w-full">
          Try Again
        </Button>
      )}
    </div>
  );
};