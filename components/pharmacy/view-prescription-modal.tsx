import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { authFetch } from "@/lib/api";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function ViewPrescriptionModal({ prescription, onClose, onUpdated, medicationMap }) {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    if (prescription) {
      checkInvoiceStatus();
    }
  }, [prescription]);

  const checkInvoiceStatus = async () => {
    if (!prescription) return;
    
    setInvoiceLoading(true);
    try {
      const res = await authFetch(`${API_URL}/v1/financial/bills/prescription/${prescription._id}`);
      if (res.ok) {
        const invoiceData = await res.json();
        setInvoice(invoiceData.data);
      } else if (res.status === 404) {
        setInvoice(null);
      } else {
        throw new Error("Failed to fetch invoice");
      }
    } catch (err) {
      console.error("Error checking invoice:", err);
      toast.error("Failed to check invoice status");
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleProcess = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/v1/pharmacy/prescriptions/process/${prescription._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Ready" }),
      });
      if (!res.ok) throw new Error("Failed to process prescription");
      toast.success("Prescription marked as Ready");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async () => {
    setLoading(true);
    try {
      console.log('dispense', invoice)
      // First verify invoice status
      if (!invoice || invoice.paymentStatus !== 'paid') {
        throw new Error("Cannot dispense - invoice not paid");
      }

      const res = await authFetch(`${API_URL}/v1/pharmacy/prescriptions/dispense/${prescription._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Dispensed" }),
      });
      if (!res.ok) {
      if (res.status === 429) {
        throw new Error("Server is busy. Please try again in a moment.");
      }
      throw new Error("Failed to mark as Dispensed");
    };
      toast.success("Prescription dispensed");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!prescription) return null;

  return (
    <Dialog open={!!prescription} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Prescription Details</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="summary" className="mt-4 space-y-4">
          <TabsList className="grid grid-cols-4 w-full bg-slate-700/30">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="insurance">Insurance</TabsTrigger>
            <TabsTrigger value="notes">Doctor Notes</TabsTrigger>
            <TabsTrigger value="invoice">Invoice</TabsTrigger>
          </TabsList>

          {/* Summary */}
          <TabsContent value="summary">
            <div className="text-slate-300 space-y-2">
              <p><strong>Patient:</strong> {prescription.patient?.name}</p>
              <p><strong>Doctor:</strong> {prescription.doctor?.fullName}</p>
              <p><strong>Status:</strong> {prescription.status}</p>
              <p><strong>Priority:</strong> {prescription.priority}</p>
              <p><strong>Issued:</strong> {format(new Date(prescription.createdAt), 'PPpp')}</p>
              <p><strong>Total Cost:</strong> ${prescription.totalCost?.toFixed(2) || '0.00'}</p>
            </div>
          </TabsContent>

          {/* Medications */}
          <TabsContent value="medications">
            <div className="space-y-4 text-slate-300">
              {prescription.medications.map((med, i) => {
                const medInfo = medicationMap[med.medication] || {};
                return (
                  <div key={i} className="bg-slate-700/40 p-3 rounded">
                    <p><strong>Name:</strong> {medInfo.name || medInfo.medication}</p>
                    <p><strong>Dosage:</strong> {med.dosage}</p>
                    <p><strong>Frequency:</strong> {med.frequency}</p>
                    <p><strong>Duration:</strong> {med.duration}</p>
                    <p><strong>Quantity:</strong> {medInfo.quantity}</p>
                    <p><strong>Cost:</strong> ${med.cost?.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Insurance */}
          <TabsContent value="insurance">
            <div className="text-slate-300 space-y-2">
              <p><strong>Provider:</strong> {prescription.insurance?.provider || 'N/A'}</p>
              <p><strong>Policy Number:</strong> {prescription.insurance?.policyNumber || 'N/A'}</p>
              <p><strong>Copay:</strong> ${prescription.insurance?.copay?.toFixed(2) || '0.00'}</p>
              <p><strong>Coverage:</strong> {prescription.insurance?.coverageDetails || 'N/A'}</p>
            </div>
          </TabsContent>

          {/* Doctor Notes */}
          <TabsContent value="notes">
            <div className="text-slate-300 space-y-2">
              <p><strong>Notes:</strong> {prescription.notes || 'No additional instructions.'}</p>
            </div>
          </TabsContent>

          {/* Invoice */}
          <TabsContent value="invoice">
            <div className="text-slate-300 space-y-4">
              {invoiceLoading ? (
                <p>Checking invoice status...</p>
              ) : invoice ? (
                <div className="bg-slate-700/40 p-4 rounded">
                  <h3 className="font-bold text-lg mb-2">Invoice Details</h3>
                  <p><strong>Invoice ID:</strong> {invoice.invoiceNumber}</p>
                  <p><strong>Status:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${
                      invoice.paymentStatus === 'paid' ? 'bg-green-500/20 text-green-300' : 
                      invoice.paymentStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-300' : 
                      'bg-red-500/20 text-red-300'
                    }`}>
                      {invoice.paymentStatus}
                    </span>
                  </p>
                  <p><strong>Amount:</strong> ${invoice.amount?.toFixed(2)}</p>
                  <p><strong>Date Issued:</strong> {invoice.createdAt ? format(new Date(invoice.createdAt), 'PP') : 'N/A'}</p>
                  {invoice.paidAt && (
                    <p><strong>Paid On:</strong> {invoice.paidAt ? format(new Date(invoice.paidAt), 'PPpp') : 'N/A'}</p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-500/10 p-4 rounded border border-yellow-500/30">
                  <h3 className="font-bold text-lg mb-2 text-yellow-300">No Invoice Found</h3>
                  <p>This prescription does not have an associated invoice.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6 flex justify-between">
          <Button variant="secondary" onClick={onClose}>Close</Button>

          <div className="space-x-2">
            {prescription.status === "Pending" && (
              <Button onClick={handleProcess} disabled={loading}>
                Mark as Ready
              </Button>
            )}
            {console.log('pres front', prescription)}
            {prescription.status === "Ready" && (
              <Button 
                onClick={handleDispense} 
                disabled={loading || invoiceLoading || !invoice || invoice.paymentStatus !== 'paid'}
                className={
                  !invoice || invoice.paymentStatus !== 'paid' ? "bg-gray-500 hover:bg-gray-600" : ""
                }
              >
                {invoiceLoading ? "Checking Invoice..." : 
                 !invoice ? "No Invoice" :
                 invoice.paymentStatus !== 'paid' ? `Invoice ${invoice.paymentStatus}` : 
                 "Dispense"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}