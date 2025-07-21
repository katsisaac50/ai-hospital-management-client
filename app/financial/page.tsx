"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  CreditCard,
  FileText,
  TrendingUp,
  Receipt,
  AlertCircle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { FinancialStats } from "@/components/financial-stats"

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Financial Management
            </h1>
            <p className="text-slate-400 mt-2">Manage invoices, payments, and financial operations</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <FinancialStats />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="billing"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              Billing
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger
              value="insurance"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Receipt className="w-4 h-4 mr-2" />
              Insurance
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <FinancialOverview />
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <BillingManager />
          </TabsContent>

          <TabsContent value="payments" className="space-y-6">
            <PaymentProcessor />
          </TabsContent>

          <TabsContent value="insurance" className="space-y-6">
            <InsuranceClaims />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <FinancialReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function FinancialOverview() {
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

function BillingManager() {
  const [searchTerm, setSearchTerm] = useState("")

  const invoices = [
    {
      id: "INV001",
      patientName: "Sarah Johnson",
      patientId: "P001",
      date: "2024-01-15",
      dueDate: "2024-02-14",
      amount: 450.75,
      status: "Paid",
      services: ["Consultation", "Blood Test"],
      insurance: "BlueCross",
    },
    {
      id: "INV002",
      patientName: "Michael Chen",
      patientId: "P002",
      date: "2024-01-14",
      dueDate: "2024-02-13",
      amount: 1250.0,
      status: "Pending",
      services: ["Surgery Consultation", "MRI Scan"],
      insurance: "Aetna",
    },
    {
      id: "INV003",
      patientName: "Emily Rodriguez",
      patientId: "P003",
      date: "2024-01-13",
      dueDate: "2024-02-12",
      amount: 890.25,
      status: "Overdue",
      services: ["Emergency Visit", "X-Ray"],
      insurance: "UnitedHealth",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Overdue":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search invoices by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="grid gap-4">
        {invoices.map((invoice) => (
          <Card
            key={invoice.id}
            className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {invoice.id.slice(-2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{invoice.patientName}</h3>
                      <p className="text-slate-400">
                        Invoice {invoice.id} • Patient ID: {invoice.patientId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Date: {invoice.date}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Due: {invoice.dueDate}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Receipt className="w-4 h-4 text-slate-400" />
                      {invoice.insurance}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Services: {invoice.services.join(", ")}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">${invoice.amount.toFixed(2)}</p>
                    <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                      Send Invoice
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PaymentProcessor() {
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

function InsuranceClaims() {
  const claims = [
    {
      id: "CLM001",
      patientName: "Sarah Johnson",
      provider: "BlueCross",
      amount: 450.75,
      status: "Approved",
      submittedDate: "2024-01-10",
      processedDate: "2024-01-15",
    },
    {
      id: "CLM002",
      patientName: "Michael Chen",
      provider: "Aetna",
      amount: 1250.0,
      status: "Under Review",
      submittedDate: "2024-01-12",
      processedDate: null,
    },
    {
      id: "CLM003",
      patientName: "Emily Rodriguez",
      provider: "UnitedHealth",
      amount: 890.25,
      status: "Denied",
      submittedDate: "2024-01-08",
      processedDate: "2024-01-14",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Under Review":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Denied":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Insurance Claims</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold">{claim.patientName}</h4>
                  <p className="text-slate-400 text-sm">
                    Claim ID: {claim.id} • {claim.provider}
                  </p>
                </div>
                <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Amount</p>
                  <p className="text-white font-semibold">${claim.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Submitted</p>
                  <p className="text-white">{claim.submittedDate}</p>
                </div>
                <div>
                  <p className="text-slate-400">Processed</p>
                  <p className="text-white">{claim.processedDate || "Pending"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Provider</p>
                  <p className="text-white">{claim.provider}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function FinancialReports() {
  const reports = [
    {
      title: "Monthly Revenue Report",
      description: "Comprehensive revenue analysis for January 2024",
      type: "Revenue",
      date: "2024-01-31",
      status: "Ready",
    },
    {
      title: "Insurance Claims Summary",
      description: "Summary of all insurance claims processed this month",
      type: "Claims",
      date: "2024-01-31",
      status: "Generating",
    },
    {
      title: "Outstanding Payments Report",
      description: "List of all overdue and pending payments",
      type: "Collections",
      date: "2024-01-31",
      status: "Ready",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Financial Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.map((report, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{report.title}</h4>
                  <p className="text-slate-400 text-sm mb-2">{report.description}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>Type: {report.type}</span>
                    <span>Date: {report.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      report.status === "Ready"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {report.status}
                  </Badge>
                  {report.status === "Ready" && (
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
