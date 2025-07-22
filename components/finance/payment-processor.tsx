"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

  const payments = [
    {
      id: "PAY001",
      patientName: "Sarah Johnson",
      amount: 450.75,
      method: "Credit Card",
      status: "Completed",
      date: "2024-01-15",
      transactionId: "TXN123456789",
    },
    {
      id: "PAY002",
      patientName: "Michael Chen",
      amount: 1250.0,
      method: "Insurance",
      status: "Processing",
      date: "2024-01-15",
      transactionId: "TXN987654321",
    },
    {
      id: "PAY003",
      patientName: "Emily Rodriguez",
      amount: 890.25,
      method: "Cash",
      status: "Completed",
      date: "2024-01-14",
      transactionId: "TXN456789123",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Processing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }


export function PaymentProcessor() {

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Payment Processing</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold">{payment.patientName}</h4>
                  <p className="text-slate-400 text-sm">Payment ID: {payment.id}</p>
                </div>
                <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Amount</p>
                  <p className="text-white font-semibold">${payment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Method</p>
                  <p className="text-white">{payment.method}</p>
                </div>
                <div>
                  <p className="text-slate-400">Date</p>
                  <p className="text-white">{payment.date}</p>
                </div>
                <div>
                  <p className="text-slate-400">Transaction ID</p>
                  <p className="text-white text-xs">{payment.transactionId}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}