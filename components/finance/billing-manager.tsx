// components/finance/billing-manager.tsx
"use client"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, Calendar, Clock, Receipt, FileText } from "lucide-react"

interface Invoice {
  id: string
  patientName: string
  patientId: string
  date: string
  dueDate: string
  amount: number
  status: 'Paid' | 'Pending' | 'Overdue'
  services: string[]
  insurance: string
}

export function BillingManager() {
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
