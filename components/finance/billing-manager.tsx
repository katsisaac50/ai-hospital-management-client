// components/finance/billing-manager.tsx
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authFetch } from '@/lib/api'
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Plus, Calendar, Clock, Receipt, FileText } from "lucide-react"
import {NewInvoiceModal} from "@/components/finance/new-invoice-modal"
import {DownloadInvoicePDF} from "@/components/finance/DownloadInvoicePDF"
import {SendInvoiceButton} from "@/components/finance/send-invoice-button"
import { useToast } from "@/components/ui/use-toast"
// import { FinancialReport } from "@/components/financial/FinancialReport"
import {formatDate} from "@/utils/formatDate"
import {InvoiceDetailsModal} from "@/components/modals/invoice-details-modal"

const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

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
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
      const fetchInvoices = async () => {
        try {
          const res = await authFetch(`${API_URL}/v1/financial/bills`)
          const json = await res.json()
          const Invoices = json?.data || []
          console.log("invoice", Invoices)
          setInvoices(Invoices)
        } catch (err) {
          console.error("Failed to fetch medications:", err)
        }
      }
  
      fetchInvoices()
    }, [])

  // const invoices = [
  //   {
  //     id: "INV001",
  //     patientName: "Sarah Johnson",
  //     patientId: "P001",
  //     date: "2024-01-15",
  //     dueDate: "2024-02-14",
  //     amount: 450.75,
  //     status: "Paid",
  //     services: ["Consultation", "Blood Test"],
  //     insurance: "BlueCross",
  //   },
  //   {
  //     id: "INV002",
  //     patientName: "Michael Chen",
  //     patientId: "P002",
  //     date: "2024-01-14",
  //     dueDate: "2024-02-13",
  //     amount: 1250.0,
  //     status: "Pending",
  //     services: ["Surgery Consultation", "MRI Scan"],
  //     insurance: "Aetna",
  //   },
  //   {
  //     id: "INV003",
  //     patientName: "Emily Rodriguez",
  //     patientId: "P003",
  //     date: "2024-01-13",
  //     dueDate: "2024-02-12",
  //     amount: 890.25,
  //     status: "Overdue",
  //     services: ["Emergency Visit", "X-Ray"],
  //     insurance: "UnitedHealth",
  //   },
  // ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "overdue":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  // useEffect(() => {
  //   async function fetchReport() {
  //     try {
  //       const res = await fetch(`${API_URL}/api/v1/reports/financial/monthly`)
  //       const json = await res.json()
  //       setData(json)
  //     } catch (err) {
  //       console.error("Error loading financial report:", err)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }

  //   fetchReport()
  // }, [])

  // const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  // const totalExpenses = data.reduce((sum, d) => sum + d.expenses, 0)

  // if (loading) return <p className="p-4">Loading...</p>

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
              <NewInvoiceModal/>
              {/* <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button> */}
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
                      {invoice.invoiceNumber.slice(-2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{invoice.patient.fullName}</h3>
                      <p className="text-slate-400">
                        Invoice {invoice.invoiceNumber} • Patient ID: {invoice.patient.id}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Date: {formatDate(invoice.date)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Clock className="w-4 h-4 text-slate-400" />
                      Due: {formatDate(invoice.dueDate)}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Receipt className="w-4 h-4 text-slate-400" />
                      {invoice.insurance}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <FileText className="w-4 h-4 text-slate-400" />
                      Services: {invoice.items.map(item => item.description).join(", ")}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">${invoice.total.toFixed(2)}</p>
                    <Badge className={getStatusColor(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <InvoiceDetailsModal invoice={invoice} />
                    {/* <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      View Details
                    </Button> */}
                    <SendInvoiceButton invoiceId={invoice.id} />
                    <DownloadInvoicePDF invoiceId={invoice.id} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* <FinancialReport
        data={data}
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
      /> */}
    </div>
  )
}
