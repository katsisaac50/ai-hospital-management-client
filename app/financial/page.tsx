"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { BillingManager } from "@/components/finance/billing-manager"
import { PaymentProcessor } from "@/components/finance/payment-processor"
import { InsuranceClaims } from "@/components/finance/insurance-claims"
import { FinancialReports } from "@/components/finance/financial-reports"
import { FinancialOverview } from "@/components/finance/financial-overview"

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


