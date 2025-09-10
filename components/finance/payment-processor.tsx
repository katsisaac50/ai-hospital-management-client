"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {PendingPaymentManager} from '@/components/finance/pending-payment-manager';
import { usePaymentStatusTracker } from '@/hooks/usePaymentStatusTracker';
import { loadStripe } from "@stripe/stripe-js";
import { Elements, useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { authFetch } from '@/lib/api'
import { AlertCircle, Info, CreditCard, DollarSign, Smartphone, QrCode } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL; 
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Billing = {
  id: string;
  invoiceNumber: string;
  patient: {
    id: string;
    name: string;
  };
  total: number;
  balanceDue: number;
  status: string;
  items: Array<{
    description: string;
    amount: number;
  }>;
};

type Payment = {
  id: string;
  billingId: string;
  invoiceNumber: string;
  patientName: string;
  amount: number;
  method: string;
  status: string;
  date: string;
  transactionId: string;
};

type PaymentProvider = 'mpesa' | 'airtel' | 'orange' | 'mtn' | 'mobilepay' | 'applepay' | 'googlepay';

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'processing';

type PaymentRequest = {
  id: string;
  billingId: string;
  amount: number;
  provider: PaymentProvider;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: Date;
};

interface UpdateBackendPaymentStatusParams {
  paymentIntentId?: string;
  billingId?: string;
  amount: number;
  method: string;
  transactionId?: string;
}

// Payment method types
type PaymentMethod = 'card' | 'cash' | 'mobilepay' | 'applepay' | 'googlepay' | 'bank_transfer' | 'mpesa' | 'airtel' | 'orange' | 'mtn';

const usePaymentStatusTracker = (onPaymentUpdate: (payment: PaymentRequest) => void) => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const checkPaymentStatus = async (paymentId: string) => {
    try {
      const response = await authFetch(`${API_URL}/v1/payments/status/${paymentId}`);
      if (response.ok) {
        const paymentData = await response.json();
        onPaymentUpdate(paymentData.data);
        
        // Stop checking if payment is completed or failed
        if (['completed', 'failed'].includes(paymentData.data.status)) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const startTracking = (paymentId: string) => {
    // Check immediately first
    checkPaymentStatus(paymentId);
    
    // Then set up interval for checking every 5 seconds
    intervalRef.current = setInterval(() => {
      checkPaymentStatus(paymentId);
    }, 5000);
  };

  const stopTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  return { startTracking, stopTracking };
};

const CheckoutForm = ({ 
  amount, 
  billingId,
  onSuccess,
  onClose,
  onValidation
}: {
  amount: number;
  billingId: string;
  onSuccess: () => void;
  onClose: () => void;
  onValidation: () => boolean;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    // Validate amount before proceeding
    if (!onValidation()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First submit the payment element to gather payment details
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw submitError;
      }

      const response = await authFetch(`${API_URL}/v1/payments/${billingId}/payments/intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) throw new Error('Failed to create payment intent');
      
      const paymentData = await response.json();
      const clientSecret = paymentData.data.clientSecret;

      const { paymentIntent, error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
          receipt_email: 'katsisaac50@gmail.com', // Get from patient data
        },
        redirect: 'if_required',
      });

      if (stripeError) {
        throw stripeError;
      }

      // Handle successful payment
      if (paymentIntent?.status === 'succeeded') {
        await updateBackendPaymentStatus({
          paymentIntentId: paymentIntent.id,
          amount,
          method: 'card'
        });
        onSuccess();
        onClose();
      } else {
        throw new Error('Payment not completed successfully');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Update backend payment status
  const updateBackendPaymentStatus = async (params: UpdateBackendPaymentStatusParams): Promise<void> => {
    const response: Response = await authFetch(`${API_URL}/v1/payments/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error('Payment verification failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-700/20 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Paying:</span>
          <span className="text-green-400 font-medium">${amount.toFixed(2)}</span>
        </div>
      </div>

      <PaymentElement options={{ layout: 'tabs' }} />
      
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
        </Button>
      </div>
    </form>
  );
};

// Cash Payment Component
const CashPaymentForm = ({ 
  amount, 
  billingId,
  onSuccess,
  onClose,
  onValidation,
}: {
  amount: number;
  billingId: string;
  onSuccess: (successData: any) => void;
  onClose: () => void;
  onValidation: () => boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cashReceived, setCashReceived] = useState(amount);
  const [changeDue, setChangeDue] = useState(0);

  useEffect(() => {
    const change = cashReceived - amount;
    setChangeDue(change > 0 ? change : 0);
  }, [cashReceived, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount before proceeding
    if (!onValidation()) {
      return;
    }

    if (cashReceived < amount) {
      setError(`Cash received ($${cashReceived.toFixed(2)}) is less than amount due ($${amount.toFixed(2)})`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate a transaction ID for cash payment
      const transactionId = `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const result= await updateBackendPaymentStatus({
        amount,
        billingId, 
        method: 'cash',
        transactionId
      });

      console.log('results', result)

       // Notify parent component about payment creation if callback provided
      // if (onPaymentCreation && result.data) {
      //   onPaymentCreation(result.data);
      // }
      
      onSuccess(result.data);
      onClose();
    } catch (err) {
      console.error('Cash payment error:', err);
      setError(err instanceof Error ? err.message : 'Cash payment failed');
    } finally {
      setLoading(false);
    }
  };

  // Update backend payment status
  const updateBackendPaymentStatus = async (params: UpdateBackendPaymentStatusParams): Promise<void> => {
    try {
    const response: Response = await authFetch(`${API_URL}/v1/payments/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      throw new Error('Payment verification failed');
    }
    const data = await response.json();
    return data; 
    } catch (error) {
    console.error('Payment processing error:', error);
    throw error; // Re-throw to handle in the calling function
  }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-700/20 p-3 rounded-lg">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Amount Due:</span>
          <span className="text-white font-medium">${amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Change Due:</span>
          <span className="text-green-400 font-medium">${changeDue.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cashReceived">Cash Received</Label>
        <Input
          id="cashReceived"
          type="number"
          value={cashReceived}
          onChange={(e) => setCashReceived(parseFloat(e.target.value) || 0)}
          min={amount}
          step="0.01"
          className="bg-slate-700 border-slate-600 text-white"
        />
      </div>
      
      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Processing...' : `Confirm Cash Payment`}
        </Button>
      </div>
    </form>
  );
};

// MobilePay Payment Component
const MobilePayPaymentForm = ({ 
  amount, 
  billingId,
  onSuccess,
  onClose,
  onValidation
}: {
  amount: number;
  billingId: string;
  onSuccess: () => void;
  onClose: () => void;
  onValidation: () => boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  
  const { startTracking } = usePaymentStatusTracker((updatedPayment) => {
    if (updatedPayment.status === 'completed') {
      onSuccess();
    } else if (updatedPayment.status === 'failed') {
      setError('MobilePay payment failed. Please try again.');
      setLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onValidation()) {
      return;
    }

    if (!phoneNumber) {
      setError('Phone number is required for MobilePay');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${API_URL}/v1/payments/mobilepay/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          billingId, 
          amount,
          phoneNumber 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate MobilePay payment');
      }

      const result = await response.json();
      setPaymentRequest(result.data);
      
      // Start tracking payment status
      if (result.data.id) {
        startTracking(result.data.id);
      }
      
      // For MobilePay, we might redirect or show instructions
      if (result.data.redirectUrl) {
        window.location.href = result.data.redirectUrl;
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'MobilePay payment initiation failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-700/20 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Paying with MobilePay:</span>
          <span className="text-green-400 font-medium">${amount.toFixed(2)}</span>
        </div>
      </div>

      {!paymentRequest ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="mobilepay-phone">MobilePay Registered Phone Number</Label>
            <Input
              id="mobilepay-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+45 12 34 56 78"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
            <p className="text-xs text-slate-400">
              Enter the phone number registered with your MobilePay account
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Initializing...' : `Pay with MobilePay`}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="bg-blue-900/20 p-4 rounded-lg">
            <p className="text-blue-300">Payment request sent to your MobilePay app</p>
            <p className="text-sm text-slate-400 mt-2">
              Please check your MobilePay app to complete the payment
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </form>
  );
};


// Mobile Money Payment Component
const MobileMoneyPaymentForm = ({ 
  amount, 
  billingId,
  onSuccess,
  onClose,
  onValidation
}: {
  amount: number;
  billingId: string;
  onSuccess: () => void;
  onClose: () => void;
  onValidation: () => boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<PaymentProvider>('mpesa');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  
  const { startTracking } = usePaymentStatusTracker((updatedPayment) => {
    if (updatedPayment.status === 'completed') {
      onSuccess();
    } else if (updatedPayment.status === 'failed') {
      setError('Mobile money payment failed. Please try again.');
      setLoading(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onValidation()) {
      return;
    }

    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${API_URL}/v1/payments/mobilemoney/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          billingId, 
          amount,
          provider,
          phoneNumber 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to initiate mobile money payment');
      }

      const result = await response.json();
      setPaymentRequest(result.data);
      
      // Start tracking payment status
      if (result.data.id) {
        startTracking(result.data.id);
      }
      
      // For some providers, we might need to show instructions
      if (result.data.customerMessage) {
        // Show message to user
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mobile money payment initiation failed');
      setLoading(false);
    }
  };

  const getProviderName = (provider: PaymentProvider) => {
    switch (provider) {
      case 'mpesa': return 'M-Pesa';
      case 'airtel': return 'Airtel Money';
      case 'orange': return 'Orange Money';
      case 'mtn': return 'MTN Mobile Money';
      default: return provider;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-700/20 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Paying with Mobile Money:</span>
          <span className="text-green-400 font-medium">${amount.toFixed(2)}</span>
        </div>
      </div>

      {!paymentRequest ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="mobilemoney-provider">Mobile Money Provider</Label>
            <Select value={provider} onValueChange={(value: PaymentProvider) => setProvider(value)}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
                <SelectItem value="mpesa">M-Pesa (Kenya)</SelectItem>
                <SelectItem value="airtel">Airtel Money (Africa)</SelectItem>
                <SelectItem value="orange">Orange Money (Africa/France)</SelectItem>
                <SelectItem value="mtn">MTN Mobile Money (Africa)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobilemoney-phone">Phone Number</Label>
            <Input
              id="mobilemoney-phone"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g., 0712 345 678"
              className="bg-slate-700 border-slate-600 text-white"
              required
            />
            <p className="text-xs text-slate-400">
              Enter your mobile money registered phone number
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Processing...' : `Pay with ${getProviderName(provider)}`}
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center space-y-4">
          <div className="bg-blue-900/20 p-4 rounded-lg">
            <p className="text-blue-300">Payment request sent to your phone</p>
            <p className="text-sm text-slate-400 mt-2">
              Please check your phone and confirm the payment request
            </p>
          </div>
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      )}
    </form>
  );
};

// Apple Pay Payment Component
const ApplePayPaymentForm = ({ 
  amount, 
  billingId,
  onSuccess,
  onClose,
  onValidation
}: {
  amount: number;
  billingId: string;
  onSuccess: () => void;
  onClose: () => void;
  onValidation: () => boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isApplePayAvailable, setIsApplePayAvailable] = useState(false);

  useEffect(() => {
    // Check if Apple Pay is available
    if (window.ApplePaySession && ApplePaySession.canMakePayments()) {
      setIsApplePayAvailable(true);
    }
  }, []);

  const handleApplePay = async () => {
    if (!onValidation()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First validate merchant
      const validationResponse = await authFetch(`${API_URL}/v1/payments/applepay/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          validationURL: 'https://apple-pay-gateway.apple.com/paymentservices/paymentSession'
        })
      });

      if (!validationResponse.ok) {
        throw new Error('Apple Pay merchant validation failed');
      }

      const merchantSession = await validationResponse.json();

      // Create Apple Pay session
      const paymentRequest = {
        countryCode: 'US',
        currencyCode: 'USD',
        merchantCapabilities: ['supports3DS'],
        supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
        total: {
          label: 'Healthcare Payment',
          amount: amount.toString()
        }
      };

      const session = new ApplePaySession(3, paymentRequest);
      
      session.onvalidatemerchant = (event) => {
        session.completeMerchantValidation(merchantSession);
      };

      session.onpaymentauthorized = async (event) => {
        try {
          const response = await authFetch(`${API_URL}/v1/payments/applepay/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              billingId,
              amount,
              paymentToken: event.payment.token
            })
          });

          if (response.ok) {
            session.completePayment(ApplePaySession.STATUS_SUCCESS);
            onSuccess();
          } else {
            session.completePayment(ApplePaySession.STATUS_FAILURE);
            throw new Error('Apple Pay payment failed');
          }
        } catch (err) {
          session.completePayment(ApplePaySession.STATUS_FAILURE);
          setError('Apple Pay payment failed');
          setLoading(false);
        }
      };

      session.begin();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Apple Pay initialization failed');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-700/20 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Paying with Apple Pay:</span>
          <span className="text-green-400 font-medium">${amount.toFixed(2)}</span>
        </div>
      </div>

      {!isApplePayAvailable ? (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Apple Pay is not available in your browser. Please use Safari on Apple devices.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {error && (
            <Alert variant="destructive" className="bg-red-900/20 border-red-800">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleApplePay} 
              disabled={loading}
              className="bg-black text-white hover:bg-gray-800"
            >
              {loading ? 'Processing...' : `Pay with Apple Pay`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};


export function PaymentProcessor() {
  const [billings, setBillings] = useState<Billing[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [loading, setLoading] = useState({ billings: true, payments: true });
  const [error, setError] = useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('card');
  const [showOutstandingInvoices, setShowOutstandingInvoices] = useState(false);
  const [pendingPaymentId, setPendingPaymentId] = useState<string | null>(null);
  const [showPendingPaymentModal, setShowPendingPaymentModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(prev => ({ ...prev, billings: true, payments: true }));
      
      // Fetch billings with outstanding balances
      const billingsRes = await authFetch(`${API_URL}/v1/financial/unpaid`);
      const billingsData = await billingsRes.json();
      setBillings(billingsData.data);
      
      // Fetch payment history
      const paymentsRes = await authFetch(`${API_URL}/v1/payments`);
      const paymentsData = await paymentsRes.json();
      setPayments(paymentsData.data);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(prev => ({ ...prev, billings: false, payments: false }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNewPayment = (billing: Billing) => {
    setSelectedBilling(billing);
    setPaymentAmount(billing.balanceDue);
    setIsCustomAmount(false);
    setAmountError('');
    setSelectedPaymentMethod('card');
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    fetchData(); // Refresh data
    setPaymentDialogOpen(false);
    setPaymentAmount(0);
    setIsCustomAmount(false);
    setAmountError('');
    setShowPendingPaymentModal(false);
    setPendingPaymentId(null);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setPaymentAmount(value);
      validateAmount(value);
    } else {
      setPaymentAmount(0);
      setAmountError('Please enter a valid amount');
    }
  };

  const handleFullAmountClick = () => {
    if (selectedBilling) {
      setPaymentAmount(selectedBilling.balanceDue);
      setIsCustomAmount(false);
      setAmountError('');
    }
  };

  const handleCustomAmountClick = () => {
    setIsCustomAmount(true);
    if (selectedBilling) {
      setPaymentAmount(selectedBilling.balanceDue);
    }
  };

  const handlePaymentCreation = (paymentData: any) => {
    console.log('paymentData', paymentData)
    if (paymentData.paymentId) {
      setPendingPaymentId(paymentData.paymentId);
      setShowPendingPaymentModal(true);
    }
  };

  const handlePaymentFailed = (payment: PaymentRequest) => {
    // Handle failed payment (show message, etc.)
    console.log('Payment failed:', payment);
    setShowPendingPaymentModal(false);
    setPendingPaymentId(null);
  };

  const handleRetryPayment = () => {
    // Refresh the pending payment modal
    setShowPendingPaymentModal(true);
  };

  const paymentStatusTracker = usePaymentStatusTracker((updatedPayment) => {
  // This callback will be called with updated payment data
  console.log('Payment status updated:', updatedPayment);
  
  if (updatedPayment.status === 'completed') {
    handlePaymentSuccess();
  } else if (updatedPayment.status === 'failed') {
    handlePaymentFailed(updatedPayment);
  }
});

  const validateAmount = (amount: number) => {
    if (!selectedBilling) return false;

    if (amount <= 0) {
      setAmountError('Payment amount must be greater than 0');
      return false;
    }
    if (amount > selectedBilling.balanceDue + 0.01) {
      setAmountError('Payment amount cannot exceed the total due');
      return false;
    }
    if (amount < selectedBilling.balanceDue * 0.1) {
      setAmountError('Minimum payment is 10% of the total due');
      return false;
    }
    setAmountError('');
    return true;
  };

  const validatePaymentAmount = () => {
    return validateAmount(paymentAmount);
  };

  const toggleOutstandingInvoices = () => {
    setShowOutstandingInvoices(prev => !prev);
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'card': return <CreditCard className="h-5 w-5" />;
      case 'cash': return <DollarSign className="h-5 w-5" />;
      case 'mobilepay': 
      case 'applepay': 
      case 'googlepay': return <Smartphone className="h-5 w-5" />;
      case 'bank_transfer': return <QrCode className="h-5 w-5" />;
      default: return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPaymentMethodName = (method: PaymentMethod) => {
    switch (method) {
      case 'card': return 'Credit/Debit Card';
      case 'cash': return 'Cash';
      case 'mobilepay': return 'MobilePay';
      case 'applepay': return 'Apple Pay';
      case 'googlepay': return 'Google Pay';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  };

  if (loading.billings || loading.payments) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-cyan-400">Payment Processing</CardTitle>
            <div className="flex gap-3">
              <Button 
                onClick={toggleOutstandingInvoices}
                className="bg-cyan-600 hover:bg-cyan-700"
                disabled={billings.length === 0}
              >
                {showOutstandingInvoices ? 'Hide Outstanding Invoices' : 'View Outstanding Invoices'}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {showOutstandingInvoices && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Outstanding Invoices</h3>
              {billings.length === 0 ? (
                <p className="text-slate-400">No outstanding invoices</p>
              ) : (
                <div className="space-y-3">
                  {billings.map(billing => (
                    <div key={billing.id} className="bg-slate-700/30 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium text-white">
                            {billing.invoiceNumber} - {billing.patient?.name}
                          </h4>
                          <p className="text-sm text-slate-400">
                            Balance Due: ${billing.balanceDue.toFixed(2)}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => handleNewPayment(billing)}
                        >
                          Pay Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
            {payments.length === 0 ? (
              <p className="text-slate-400">No payment history</p>
            ) : (
              <div className="space-y-3">
                {payments.map(payment => (
                  <div key={payment.id} className="bg-slate-700/30 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white">{payment.patientName}</h4>
                        <p className="text-sm text-slate-400">
                          Invoice: {payment.invoiceNumber} • ${payment.amount.toFixed(2)}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          {getPaymentMethodIcon(payment.method as PaymentMethod)}
                          <span className="text-xs text-slate-400">
                            {getPaymentMethodName(payment.method as PaymentMethod)}
                          </span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Pending Payment Modal */}
      <Dialog open={showPendingPaymentModal} onOpenChange={setShowPendingPaymentModal}>
        <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-cyan-400">Payment Status</DialogTitle>
            <DialogDescription className="text-slate-400">
              Tracking your payment progress
            </DialogDescription>
          </DialogHeader>
          
          {pendingPaymentId && (
            <PendingPaymentManager
              paymentId={pendingPaymentId}
              onPaymentComplete={handlePaymentSuccess}
              onPaymentFailed={handlePaymentFailed}
              onRetry={handleRetryPayment}
              usePaymentStatusTracker={() => paymentStatusTracker}
            />
          )}
        </DialogContent>
      </Dialog>

      {selectedBilling && (
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent className="sm:max-w-[500px] bg-slate-800 border-slate-700 max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-cyan-400">
                Pay Invoice #{selectedBilling.invoiceNumber}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Patient: {selectedBilling.patient?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {/* Billing Summary */}
              <div className="bg-slate-700/30 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-slate-400">Total Due:</span>
                  <span className="text-white">${selectedBilling.balanceDue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Minimum Payment:</span>
                  <span className="text-amber-400">
                    ${(selectedBilling.balanceDue * 0.1).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Amount Selection */}
              <div className="space-y-3">
                <Label className="text-slate-300">Payment Amount</Label>
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={!isCustomAmount ? "default" : "outline"}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-xs sm:text-sm"
                    onClick={handleFullAmountClick}
                  >
                    Pay Full Amount (${selectedBilling.balanceDue.toFixed(2)})
                  </Button>
                  <Button
                    type="button"
                    variant={isCustomAmount ? "default" : "outline"}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-xs sm:text-sm"
                    onClick={handleCustomAmountClick}
                  >
                    Custom Amount
                  </Button>
                </div>

                {isCustomAmount && (
                  <div className="space-y-2">
                    <Input
                      type="number"
                      value={paymentAmount}
                      onChange={handleAmountChange}
                      min={selectedBilling.balanceDue * 0.1}
                      max={selectedBilling.balanceDue}
                      step="0.01"
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Enter payment amount"
                    />
                    <div className="flex justify-between text-sm text-slate-400">
                      <span>Min: ${(selectedBilling.balanceDue * 0.1).toFixed(2)}</span>
                      <span>Max: ${selectedBilling.balanceDue.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {amountError && (
                  <Alert variant="destructive" className="bg-red-900/20 border-red-800">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{amountError}</AlertDescription>
                  </Alert>
                )}

                {isCustomAmount && paymentAmount > 0 && !amountError && (
                  <Alert className="bg-blue-900/20 border-blue-800">
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      You will have a remaining balance of: $
                      {(selectedBilling.balanceDue - paymentAmount).toFixed(2)}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Payment Method Selection */}
              {paymentAmount > 0 && !amountError && (
                <div className="space-y-3">
                  <Label className="text-slate-300">Payment Method</Label>
                  <Select
                    value={selectedPaymentMethod}
                    onValueChange={(value: PaymentMethod) => setSelectedPaymentMethod(value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      <SelectItem value="card">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>Credit/Debit Card</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span>Cash</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="mobilepay">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span>MobilePay</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="applepay">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span>Apple Pay</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="googlepay">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          <span>Google Pay</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="bank_transfer">
                        <div className="flex items-center gap-2">
                          <QrCode className="h-4 w-4" />
                          <span>Bank Transfer</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Payment Form based on selected method */}
              {paymentAmount > 0 && !amountError && (
                <div className="pt-4">
                  {selectedPaymentMethod === 'card' && (
                    <Elements 
                      stripe={stripePromise} 
                      options={{
                        mode: 'payment',
                        amount: Math.round(paymentAmount * 100),
                        currency: 'usd',
                      }}
                    >
                      <CheckoutForm 
                        amount={paymentAmount}
                        billingId={selectedBilling.id}
                        onSuccess={handlePaymentSuccess}
                        onClose={() => setPaymentDialogOpen(false)}
                        onValidation={validatePaymentAmount}
                        onPaymentCreation={handlePaymentCreation}
                      />
                    </Elements>
                  )}
                  
                  {selectedPaymentMethod === 'cash' && (
                    <CashPaymentForm 
                      amount={paymentAmount}
                      billingId={selectedBilling.id}
                      onSuccess={handlePaymentSuccess}
                      onClose={() => setPaymentDialogOpen(false)}
                      onValidation={validatePaymentAmount}
                    />
                  )}
                  
                  {/* {(selectedPaymentMethod === 'mobilepay' || 
                    selectedPaymentMethod === 'applepay' || 
                    selectedPaymentMethod === 'googlepay' ||
                    selectedPaymentMethod === 'bank_transfer') && (
                    <MobilePaymentForm 
                      amount={paymentAmount}
                      billingId={selectedBilling.id}
                      method={selectedPaymentMethod}
                      onSuccess={handlePaymentSuccess}
                      onClose={() => setPaymentDialogOpen(false)}
                      onValidation={validatePaymentAmount}
                    />
                  )} */}
                  {selectedPaymentMethod === 'mobilepay' && (
  <MobilePayPaymentForm 
    amount={paymentAmount}
    billingId={selectedBilling.id}
    onSuccess={handlePaymentSuccess}
    onClose={() => setPaymentDialogOpen(false)}
    onValidation={validatePaymentAmount}
    onPaymentCreation={handlePaymentCreation}
  />
)}

{(selectedPaymentMethod === 'mpesa' || 
  selectedPaymentMethod === 'airtel' || 
  selectedPaymentMethod === 'orange' ||
  selectedPaymentMethod === 'mtn') && (
  <MobileMoneyPaymentForm 
    amount={paymentAmount}
    billingId={selectedBilling.id}
    onSuccess={handlePaymentSuccess}
    onClose={() => setPaymentDialogOpen(false)}
    onValidation={validatePaymentAmount}
    onPaymentCreation={handlePaymentCreation}
  />
)}

{selectedPaymentMethod === 'applepay' && (
  <ApplePayPaymentForm 
    amount={paymentAmount}
    billingId={selectedBilling.id}
    onSuccess={handlePaymentSuccess}
    onClose={() => setPaymentDialogOpen(false)}
    onValidation={validatePaymentAmount}
    onPaymentCreation={handlePaymentCreation}
  />
)}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed": return "bg-green-500/20 text-green-400 border-green-500/30";
    case "processing": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "failed": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "pending": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default: return "bg-slate-500/20 text-slate-400 border-slate-500/30";
  }
};