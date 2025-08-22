'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface InvoiceDetailsModalProps {
  invoice: any // Replace `any` with a proper type if available
}

export function InvoiceDetailsModal({ invoice }: InvoiceDetailsModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          View Details
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
        </DialogHeader>
        <ScrollArea className="space-y-4 p-2">
          <div>
            <strong>Invoice Number:</strong> {invoice.invoiceNumber}
          </div>
          <div>
            <strong>Patient:</strong> {invoice.patient?.name}
          </div>
          <div>
            <strong>Date:</strong>{' '}
            {new Date(invoice.date).toLocaleDateString()}
          </div>
          <div>
            <strong>Due Date:</strong>{' '}
            {new Date(invoice.dueDate).toLocaleDateString()}
          </div>
          <div>
            <strong>Status:</strong> {invoice.status}
          </div>
          <div>
            <strong>Paid Amount:</strong> ${invoice.paidAmount}
          </div>
          <div>
            <strong>Balance Due:</strong> ${invoice.balanceDue}
          </div>
          <div>
            <strong>Amount:</strong> ${invoice.total}
          </div>
          <div>
            <strong>Payment Status:</strong> {invoice.paymentStatus}
          </div>
          <div>
            <strong>Services:</strong>
            <ul className="list-disc ml-5 mt-1">
              {invoice.items?.map((item: any, index: number) => (
                <li key={index}>
                  {item.description} – {item.quantity} × ${item.unitPrice} = $
                  {item.amount}
                </li>
              ))}
            </ul>
          </div>

          {invoice.notes && (
            <div>
              <strong>Notes:</strong>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
