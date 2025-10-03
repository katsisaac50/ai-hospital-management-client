"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Pill, Package, AlertTriangle, CheckCircle, Clock, ShoppingCart, FileText, Brain, Loader } from "lucide-react"
import Link from "next/link"
import { PharmacyStats } from "@/components/pharmacy-stats"
import { MedicationInventory } from "@/components/medication-inventory"
import { PrescriptionManager } from "@/components/prescription-manager"
import { DrugInteractionChecker } from "@/components/drug-interaction-checker"
import MedicationModal from "@/components/medication-modal"
import ProcessPrescriptionModal from "@/components/pharmacy/process-prescription-modal"
import CreateStockOrderModal from "@/components/pharmacy/CreateStockOrderModal"
import DrugInteractionModal from "@/components/pharmacy/drug-interaction-modal"
import { authFetch } from "@/lib/api"
import { toast } from "sonner"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'


export default function PharmacyPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Pharmacy Management
            </h1>
            <p className="text-slate-400 mt-2">Manage medications and prescriptions</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <PharmacyStats />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Package className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="inventory"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Pill className="w-4 h-4 mr-2" />
              Inventory
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              Prescriptions
            </TabsTrigger>
            <TabsTrigger
              value="ai-tools"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PharmacyOverview />
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <MedicationInventory />
          </TabsContent>

          <TabsContent value="prescriptions" className="space-y-6">
            <PrescriptionManager />
          </TabsContent>

          <TabsContent value="ai-tools" className="space-y-6">
            <DrugInteractionChecker />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function PharmacyOverview() {
  const [recentActivities, setRecentActivities] = useState([])
  const [loading, setLoading] = useState(false);

   // 🔹 Modal states
  const [isPrescriptionModalOpen, setPrescriptionModalOpen] = useState(false)
  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const [isMedicationModalOpen, setMedicationModalOpen] = useState(false);
  const [modalOpen, setOpenModal] = useState(false)
  const [isStockOrderModalOpen, setStockOrderModalOpen] = useState(false);
  const [isDrugInteractionModalOpen, setDrugInteractionModalOpen] = useState(false);
 


  // 🔹 Fetch activities function (reusable)
  const fetchActivities = async () => {
    setLoading(true)
    try {
      const res = await authFetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/v1/pharmacy/activities`,
        { cache: "no-store" }
      )
      if (!res.ok) throw new Error("Failed to fetch activities")
      const data = await res.json()
      setRecentActivities(data)
    } catch (err) {
      console.error("Failed to load activities", err)
    } finally {
      setLoading(false)
    }
  }

   useEffect(() => {
    fetchActivities()
  }, [])




  // const recentActivities = [
  //   {
  //     id: 1,
  //     type: "prescription",
  //     description: "New prescription from Dr. Wilson for Sarah Johnson",
  //     time: "5 minutes ago",
  //     status: "pending",
  //   },
  //   {
  //     id: 2,
  //     type: "stock",
  //     description: "Low stock alert: Amoxicillin 500mg",
  //     time: "15 minutes ago",
  //     status: "warning",
  //   },
  //   {
  //     id: 3,
  //     type: "dispensed",
  //     description: "Medication dispensed to Michael Chen",
  //     time: "30 minutes ago",
  //     status: "completed",
  //   },
  //   {
  //     id: 4,
  //     type: "order",
  //     description: "New stock order placed for Insulin",
  //     time: "1 hour ago",
  //     status: "processing",
  //   },
  // ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return <FileText className="w-4 h-4" />
      case "stock":
        return <AlertTriangle className="w-4 h-4" />
      case "dispensed":
        return <CheckCircle className="w-4 h-4" />
      case "order":
        return <ShoppingCart className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "pending":
        return "text-blue-400"
      case "processing":
        return "text-purple-400"
      default:
        return "text-slate-400"
    }
  }
  
  interface MedicationData {
    name: string
    dosage: string
    [key: string]: any // Add more fields as needed
  }

  interface SaveMedicationResponse {
    success: boolean
    error?: string
    data?: {
      name: string
      [key: string]: any
    }
  }

  const handleSave = async (data: MedicationData): Promise<void> => {
    try {
      const res = await authFetch(`${API_URL}/v1/pharmacy/medications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const updated: SaveMedicationResponse = await res.json()
      if (!updated.success) {
        toast(updated.error || "Failed to save medication")
        return
      }
      toast(`${updated.data?.name} saved successfully`)
      setMedicationModalOpen(false)
      // ⚡ Refresh activities after save
      await fetchActivities()
    } catch (err) {
      toast(`An error occurred while saving medication: ${err}`)
      console.error("Save Error:", err)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Activities */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Recent Activities</CardTitle>
        </CardHeader>
        {console.log('activity', recentActivities)}
        <CardContent className="space-y-4">
          {loading ? (
    <div className="text-slate-400 text-sm">Loading recent activities...</div>
  ) : recentActivities.length === 0 ? (
    <div className="text-slate-400 text-sm">No recent activities found.</div>
  ) : (recentActivities.map((activity) => (
            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
              <div className={`${getActivityColor(activity.status)}`}>{getActivityIcon(activity.type)}</div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.description}</p>
                <p className="text-slate-400 text-xs">{activity.time}</p>
              </div>
            </div>
          ))
  )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => setMedicationModalOpen(true)} className="w-full justify-start bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors duration-200 hover:bg-green-500/30 hover:text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add New Medication
          </Button>
          <Button onClick={() => setPrescriptionModalOpen(true)}  type="button" className="w-full justify-start bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors duration-200 hover:bg-green-500/30 hover:text-white">
            <FileText className="w-4 h-4 mr-2" />
            Process Prescription
          </Button>
          <Button onClick={() => setStockOrderModalOpen(true)}  type="button" className="w-full justify-start bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-colors duration-200 hover:bg-green-500/30 hover:text-white">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Create Stock Order
          </Button>
          <Button
            onClick={() => setDrugInteractionModalOpen(true)} type="button" className="w-full justify-start bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 text-green-800 transition-colors duration-200 hover:bg-green-500/30 hover:text-white">
            <Brain className="w-4 h-4 mr-2" />
            Check Drug Interactions
          </Button>
          <DrugInteractionModal open={isDrugInteractionModalOpen} onClose={() => setDrugInteractionModalOpen(false)} />
        </CardContent>
      </Card>
      
{/* Add Medication Modal */}
{isMedicationModalOpen && <MedicationModal
  isOpen={isMedicationModalOpen}
  onClose={() => setMedicationModalOpen(false)}
  onSave={handleSave}
  initialData={null}
/>}
{isPrescriptionModalOpen && <ProcessPrescriptionModal open={isPrescriptionModalOpen} onClose={() => setPrescriptionModalOpen(false)} heading="Process Prescription" />}
  {isStockOrderModalOpen && <CreateStockOrderModal open={isStockOrderModalOpen} onClose={() => setStockOrderModalOpen(false)} />}
    </div>
  )
}
