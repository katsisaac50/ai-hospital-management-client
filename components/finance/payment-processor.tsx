"use client";

import { useState, useEffect } from "react";
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

interface UpdateBackendPaymentStatusParams {
  paymentIntentId?: string;
  amount: number;
  method: string;
  transactionId?: string;
}

// Payment method types
type PaymentMethod = 'card' | 'cash' | 'mobilepay' | 'applepay' | 'googlepay' | 'bank_transfer';

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

      const response = await authFetch(`${API_URL}/v1/financial/bills/${billingId}/payments/intent`, {
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
      const paymentIntentId = `CASH-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await updateBackendPaymentStatus({
        amount,
        method: 'cash',
        paymentIntentId
      });
      
      onSuccess();
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

// Mobile Payment Component (generic for MobilePay, Apple Pay, Google Pay, etc.)
const MobilePaymentForm = ({ 
  amount, 
  billingId,
  method,
  onSuccess,
  onClose,
  onValidation
}: {
  amount: number;
  billingId: string;
  method: PaymentMethod;
  onSuccess: () => void;
  onClose: () => void;
  onValidation: () => boolean;
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate amount before proceeding
    if (!onValidation()) {
      return;
    }

    if (!transactionId.trim()) {
      setError('Please enter a transaction ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await updateBackendPaymentStatus({
        amount,
        method,
        transactionId
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Mobile payment error:', err);
      setError(err instanceof Error ? err.message : `${method} payment failed`);
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

  const getMethodName = () => {
    switch (method) {
      case 'mobilepay': return 'MobilePay';
      case 'applepay': return 'Apple Pay';
      case 'googlepay': return 'Google Pay';
      case 'bank_transfer': return 'Bank Transfer';
      default: return method;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-slate-700/20 p-3 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-slate-400">Paying with {getMethodName()}:</span>
          <span className="text-green-400 font-medium">${amount.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transactionId">{getMethodName()} Transaction ID</Label>
        <Input
          id="transactionId"
          value={transactionId}
          onChange={(e) => setTransactionId(e.target.value)}
          placeholder={`Enter ${getMethodName()} transaction ID`}
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
          {loading ? 'Processing...' : `Confirm ${getMethodName()} Payment`}
        </Button>
      </div>
    </form>
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
                  
                  {(selectedPaymentMethod === 'mobilepay' || 
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