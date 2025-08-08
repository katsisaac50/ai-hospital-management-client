"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { authFetch } from '@/lib/api'
import { Search, Plus, Filter, AlertTriangle, Package, Calendar, Pill } from "lucide-react"
import MedicationModal from "@/components/medication-modal"
import ReorderModal from "@/components/reorder-modal"
import DeleteConfirmationModal from "@/components/delete-confirmation-modal"
import { toast } from "react-toastify"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function MedicationInventory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [medications, setMedications] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingMed, setEditingMed] = useState(null)
  const [showReorderModal, setShowReorderModal] = useState(false)
  const [reorderMed, setReorderMed] = useState(null)
  const [deleteMed, setDeleteMed] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchMedications = async () => {
      try {
        const res = await authFetch(`${API_URL}/v1/pharmacy/medications`)
        const json = await res.json()
        const meds = json?.data || []
        setMedications(meds)
      } catch (err) {
        console.error("Failed to fetch medications:", err)
      }
    }

    fetchMedications()
  }, [])
{console.log('mens', medications)}
  const filteredMedications = medications.filter(
    (med) =>
      med?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      const res = await authFetch(`${API_URL}/v1/pharmacy/medications/${id}`, {
        method: "DELETE",
      })
      console.log('res delete', res)
      if (res.ok) {
        setMedications((prev) => prev.filter((m) => m._id !== id))
        toast.success("Medication deleted successfully")
      } else {
        toast.error("Failed to delete medication")
      }
    } catch (err) {
      toast.error("Error deleting medication")
      console.error("Error deleting medication:", err)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const handleReorder = (medication) => {
    setReorderMed(medication)
    setShowReorderModal(true)
  }

  const handleReorderConfirm = async (quantity) => {
    const updatedQty = reorderMed.quantity + quantity
    const res = await authFetch(`${API_URL}/v1/pharmacy/medications/${reorderMed._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...reorderMed, quantity: updatedQty }),
    })
    const updated = await res.json()
    setMedications((prev) =>
      prev.map((m) => (m._id === updated._id ? updated : m))
    )
    setShowReorderModal(false)
    setReorderMed(null)
  }

  const handleAdd = () => {
    setEditingMed(null)
    setShowModal(true)
  }

  const handleEdit = (medication) => {
    setEditingMed(medication)
    setShowModal(true)
  }

  const handleSave = async (data) => {
  try {
    const res = editingMed
      ? await authFetch(`${API_URL}/v1/pharmacy/medications/${editingMed._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
      : await authFetch(`${API_URL}/v1/pharmacy/medications`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

    const updated = await res.json()

    if (!updated.success) {
      toast.error(updated.error || "Failed to save medication")
      return
    }

    const updatedMed = updated.data

    const meds = editingMed
      ? medications.map((m) => (m._id === updatedMed._id ? updatedMed : m))
      : [...medications, updatedMed]

    setMedications(meds)
    setShowModal(false)
    toast.success("Medication saved successfully")
  } catch (err) {
    toast.error(`An error occurred while saving medication: ${err}`)
    console.error("Save Error:", err)
  }
}

  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Low Stock":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Out of Stock":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const getStockPercentage = (current, max) => {
    return Math.round((current / max) * 100)
  }

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 90
  }

  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
                placeholder="Search medications by name, ID, or category..."
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
              <Button onClick={handleAdd}className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medications Grid */}
      <div className="grid gap-4">
        {filteredMedications.map((medication) => (
          <Card
            key={medication._id}
            className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white">
                      <Pill className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {medication.name} {medication.strength}
                      </h3>
                      <p className="text-slate-400">
                        {medication.form} • {medication.manufacturer} • {medication.category}
                      </p>
                    </div>
                    {isExpiringSoon(medication.expiryDate) && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="space-y-1">
                      <p className="text-slate-400">Stock Level</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              medication.quantity <= medication.minStock
                                ? "bg-red-500"
                                : medication.quantity <= medication.minStock * 1.5
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(getStockPercentage(medication.quantity, medication.maxStock), 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-white font-semibold">{medication.quantity}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-400">Location</p>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Package className="w-4 h-4 text-slate-400" />
                        {medication.location}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-400">Batch & Expiry</p>
                      <div className="text-slate-300">
                        <p>{medication.batchNumber}</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span className={isExpiringSoon(medication.expiryDate) ? "text-yellow-400" : ""}>
                            {formatDate(medication.expiryDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-slate-400">Unit Price</p>
                      <p className="text-white font-semibold">${medication.price}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Badge className={getStatusColor(medication.status)}>{medication.status}</Badge>
                  <div className="flex gap-2">
  <Button
    size="sm"
    variant="outline"
    className="border-slate-600 text-slate-300 hover:bg-slate-700"
    onClick={() => handleEdit(medication)}
  >
    Edit
  </Button>
  <Button
    size="sm"
    className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
    onClick={() => handleReorder(medication)}
  >
    Reorder
  </Button>
  <Button
    size="sm"
    variant="destructive"
    className="hover:opacity-80"
    onClick={() => {
      setDeleteMed(medication)
      setShowDeleteModal(true)
    }}
  >
    Delete
  </Button>
</div>

                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <MedicationModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSave={handleSave}
  initialData={editingMed}
/>
<ReorderModal
  isOpen={showReorderModal}
  onClose={() => setShowReorderModal(false)}
  onConfirm={handleReorderConfirm}
  medication={reorderMed}
/>
<DeleteConfirmationModal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  onConfirm={handleDelete}
  medication={deleteMed}
/>


    </div>
  )
}
