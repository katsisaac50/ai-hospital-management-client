"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign,
  CreditCard,
  FileText,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,} from "lucide-react"

 const recentTransactions = [
    {
      id: "TXN001",
      type: "payment",
      description: "Payment received from Sarah Johnson",
      amount: 450.75,
      status: "completed",
      time: "10 minutes ago",
    },
    {
      id: "TXN002",
      type: "invoice",
      description: "Invoice generated for Michael Chen",
      amount: 1250.0,
      status: "pending",
      time: "25 minutes ago",
    },
    {
      id: "TXN003",
      type: "insurance",
      description: "Insurance claim processed for Emily Rodriguez",
      amount: 890.25,
      status: "approved",
      time: "1 hour ago",
    },
    {
      id: "TXN004",
      type: "refund",
      description: "Refund issued to David Kim",
      amount: 125.0,
      status: "processing",
      time: "2 hours ago",
    },
  ]

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CreditCard className="w-4 h-4" />
      case "invoice":
        return <FileText className="w-4 h-4" />
      case "insurance":
        return <Receipt className="w-4 h-4" />
      case "refund":
        return <DollarSign className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "approved":
        return "text-green-400"
      case "pending":
        return "text-yellow-400"
      case "processing":
        return "text-blue-400"
      case "failed":
        return "text-red-400"
      default:
        return "text-slate-400"
    }
  }

export function FinancialOverview() {

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Transactions */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
              <div className={`${getStatusColor(transaction.status)}`}>{getTransactionIcon(transaction.type)}</div>
              <div className="flex-1">
                <p className="text-white text-sm">{transaction.description}</p>
                <div className="flex justify-between items-center">
                  <p className="text-slate-400 text-xs">{transaction.time}</p>
                  <p className="text-white font-semibold">${transaction.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Today's Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-400">Payments Received</span>
              </div>
              <p className="text-2xl font-bold text-green-400">$24,580</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-400">Pending Invoices</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">$18,750</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-400">Insurance Claims</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">$32,100</p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-slate-400">Overdue</span>
              </div>
              <p className="text-2xl font-bold text-red-400">$5,420</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}