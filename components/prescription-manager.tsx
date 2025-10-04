"use client"

import { useState,  useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { authFetch } from '@/lib/api'
import { format } from 'date-fns'
import {
  Pill,
  Repeat,
  Hourglass,
  Search,
  Plus,
  Filter,
  FileText,
  User,
  UserCheck,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { exportPrescriptionsToCSV } from '@/lib/exportPrescriptionsToCSV'
import { exportPrescriptionsToPDF } from '@/lib/exportPrescriptionsToPDF'
import EditPrescriptionModal from './edit-prescription-modal'
import {ViewPrescriptionModal} from '@/components/pharmacy/view-prescription-modal'
import ProcessPrescriptionModal from "@/components/pharmacy/process-prescription-modal"
import { toast } from "react-toastify"
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api'

export function PrescriptionManager({ userRole = 'admin' }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingRx, setEditingRx] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicationMap, setMedicationMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewingRx, setViewingRx] = useState(null);
  const [openPrescriptionModal, setOpenPrescriptionModal] = useState(false);


  const fetchMedications = async () => {
  const res = await authFetch(`${API_URL}/v1/pharmacy/medications`);
  const json = await res.json();

  // Create a map: { medicationId: { name, price, strength, quantity, etc } }
  const map = {};
  json.data.forEach((med) => {
    map[med._id] = med;
  });
  setMedicationMap(map);
};

  const fetchPrescriptions = async () => {
    const res = await authFetch(`${API_URL}/v1/pharmacy/prescriptions`)
    
    const {data} = await res.json()

    console.log('res', data)
    setPrescriptions(data)
  }

  useEffect(() => {
    fetchPrescriptions()
    fetchMedications();
  }, [])

  const handleProcess = async (id) => {
    setLoading(true);
    try {
      // Example: call your API to update prescription status
      const response = await authFetch(`${API_URL}/v1/pharmacy/prescriptions/process/${id}`, {
        method: 'PUT',
      });
console.log('process', response)
      if (!response.ok) {
        throw new Error('Failed to process prescription');
      }

      toast.success('Prescription processed successfully!')
      fetchPrescriptions()
      setPrescriptions((prev) => prev.filter(p => p._id !== id)) 
      // Optionally, refetch prescriptions or update state
      
    } catch (error) {
      console.error(error);
      toast.error(err.message)
      // alert('Error processing prescription');
    } finally {
      setLoading(false);
    }
  };

  // const prescriptions = [
  //   {
  //     id: "RX001",
  //     patientName: "Sarah Johnson",
  //     patientId: "P001",
  //     doctorName: "Dr. Amanda Wilson",
  //     dateIssued: "2024-01-15",
  //     medications: [
  //       { name: "Amoxicillin 500mg", quantity: 21, instructions: "Take 1 capsule 3 times daily" },
  //       { name: "Ibuprofen 400mg", quantity: 30, instructions: "Take 1 tablet as needed for pain" },
  //     ],
  //     status: "Pending",
  //     priority: "Medium",
  //     insurance: "BlueCross",
  //     totalCost: 45.75,
  //     copay: 10.0,
  //   },
  //   {
  //     id: "RX002",
  //     patientName: "Michael Chen",
  //     patientId: "P002",
  //     doctorName: "Dr. James Rodriguez",
  //     dateIssued: "2024-01-15",
  //     medications: [{ name: "Metformin 850mg", quantity: 90, instructions: "Take 1 tablet twice daily with meals" }],
  //     status: "Ready",
  //     priority: "High",
  //     insurance: "Aetna",
  //     totalCost: 112.5,
  //     copay: 15.0,
  //   },
  //   {
  //     id: "RX003",
  //     patientName: "Emily Rodriguez",
  //     patientId: "P003",
  //     doctorName: "Dr. Lisa Chen",
  //     dateIssued: "2024-01-14",
  //     medications: [
  //       { name: "Albuterol Inhaler", quantity: 1, instructions: "Use as needed for breathing difficulty" },
  //       { name: "Fluticasone Nasal Spray", quantity: 1, instructions: "Use 2 sprays in each nostril daily" },
  //     ],
  //     status: "Dispensed",
  //     priority: "Low",
  //     insurance: "UnitedHealth",
  //     totalCost: 89.25,
  //     copay: 20.0,
  //   },
  //   {
  //     id: "RX004",
  //     patientName: "David Kim",
  //     patientId: "P004",
  //     doctorName: "Dr. Amanda Wilson",
  //     dateIssued: "2024-01-15",
  //     medications: [
  //       { name: "Lisinopril 10mg", quantity: 30, instructions: "Take 1 tablet daily in the morning" },
  //       { name: "Atorvastatin 20mg", quantity: 30, instructions: "Take 1 tablet daily at bedtime" },
  //     ],
  //     status: "Verification Required",
  //     priority: "High",
  //     insurance: "Medicare",
  //     totalCost: 67.8,
  //     copay: 5.0,
  //   },
  // ]
console.log('great', prescriptions)
  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription?._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.doctor?.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Ready":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Dispensed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Verification Required":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Medium":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Low":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Ready":
        return <CheckCircle className="w-4 h-4" />
      case "Pending":
        return <Clock className="w-4 h-4" />
      case "Dispensed":
        return <CheckCircle className="w-4 h-4" />
      case "Verification Required":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const handleDelete = async (id) => {
    console.log('heheh delete', id)
    if (!confirm('Delete this prescription?')) return
    const res = await authFetch(`${API_URL}/v1/pharmacy/prescriptions/${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      toast.success('Prescription deleted')
      
      setPrescriptions((prev) => prev.filter(p => p._id !== id)) 
    } else {
      toast.error('Failed to delete')
    }
  }

//   const handleSubmit = (e) => {
//     e.preventDefault()
//     // Handle form submission logic here
//     // For example, you can send the search term to an API or filter the prescriptions
//     // For now, we'll just log it to the console
//     await fetch('/api/prescriptions', {
//   method: 'POST',
//   headers: { 'Content-Type': 'application/json' },
//   body: JSON.stringify(form),
// })
//     if (!searchTerm.trim()) {
//       console.warn("Search term is empty")
//       return
//     }
//     console.log("Form submitted with search term:", searchTerm)
//     // You can also reset the search term if needed
//     // setSearchTerm("");
//   }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search prescriptions by patient, doctor, or ID..."
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
              <Button onClick={() => setOpenPrescriptionModal(true)} variant="outline" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                New Prescription
              </Button>
              {userRole === 'admin' && (
                <div className="space-x-2">
                <Button onClick={() => exportPrescriptionsToCSV(prescriptions)} variant="outline">
                  Export CSV
                </Button>
                <Button onClick={() => exportPrescriptionsToPDF(prescriptions, medicationMap)} variant="outline">
                  Export PDF
                </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Prescriptions List */}
      <div className="grid gap-4">
        {filteredPrescriptions.map((prescription) => (
          <Card
            key={prescription._id}
            className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {prescription._id.slice(-2)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{prescription.patient?.name}</h3>
                      <p className="text-slate-400">
                        Prescribed by {prescription.doctor?.fullName} • {format(new Date(prescription?.createdAt), 'PPpp')}
                      </p>
                    </div>
                  </div>
                  {/* Medications */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Medications:</h4>
                    <div className="space-y-2">
                      {prescription.medications.map((med, index) => {
                        const medInfo = medicationMap[med.medication]; // med.medication is ID
{console.log('medinfo', medInfo)}
                        return (
                          <div key={index} className="bg-slate-700/30 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-white font-medium">
                                  🧪 {medInfo?.name || 'Unknown Medication'} ({medInfo?.strength || 'N/A'})
                                </p>
                                <p className="text-slate-400 text-sm">{prescription.notes}</p>
                              </div>
                              <Badge variant="secondary" className="bg-slate-600/50 text-slate-300 space-x-2 flex items-center">
                                <span className="flex items-center gap-1">
                                  <Pill className="w-4 h-4" />
                                  {med?.dosage ?? 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Repeat className="w-4 h-4" />
                                  {med?.frequency ?? 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Hourglass className="w-4 h-4" />
                                  {med?.duration ?? 'N/A'}
                                </span>
                                <span className="flex items-center gap-1 text-slate-400 text-sm italic">
                                  💰 ${med?.cost?.toFixed(2) || '0.00'} | Qty: {med?.quantity || 'N/A'}
                                </span>
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <User className="w-4 h-4 text-slate-400" />
                      Patient ID: {prescription.patient.medicalRecordNumber || prescription.patient._id}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <UserCheck className="w-4 h-4 text-slate-400" />
                      Insurance: {prescription.patient?.insurance?.provider || 'N/A'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Copay: ${prescription.copay}
                      {/* Total: ${prescription.totalCost} (Copay: ${prescription.copay}) */}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(prescription.status)}>
                      {getStatusIcon(prescription.status)}
                      <span className="ml-1">{prescription.status}</span>
                    </Badge>
                    <Badge className={getPriorityColor(prescription.priority)}>{prescription.priority}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => setViewingRx(prescription)} size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      View Details
                    </Button>
                    {prescription.status === "Ready" && (
                      <Button size="sm" variant="secondary" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90">
                        Dispense
                      </Button>
                    )}
                    {prescription.status === "Pending" && (
                      <Button onClick={() => handleProcess(prescription._id)} variant="secondary" disabled={loading} size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                        {loading ? 'Processing...' : 'Process'}
                      </Button>
                    )}
                    {userRole === 'admin' && (
                    <>
                      {prescription.status === "Pending" && (
                        <Button size="sm" variant="secondary" className="bg-gradient-to-r from-blue-500 to-emerald-500 hover:opacity-90" onClick={() => { setEditingRx(prescription); setShowEdit(true); }}>Edit</Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-500 hover:bg-red-600"
                        onClick={() => handleDelete(prescription._id)}
                      >
                        Delete
                      </Button>
                    </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {showEdit && (
        <EditPrescriptionModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          prescription={editingRx}
          onUpdated={fetchPrescriptions}
        />
      )}
      {viewingRx && (
        <ViewPrescriptionModal
          prescription={viewingRx}
          onClose={() => setViewingRx(null)}
          onUpdated={fetchPrescriptions}
          medicationMap={medicationMap}
        />
      )}
      {openPrescriptionModal && <ProcessPrescriptionModal heading = {true} open={openPrescriptionModal} onClose={() => setOpenPrescriptionModal(false)} />}
      </div>
    </div>
  )
}


// ./components/prescription-manager.jsx
// import { useEffect, useState } from 'react'
// import { Card } from '@/components/ui/card'
// import { enUS } from 'date-fns/locale';

// export function PrescriptionManager() {
//   const [prescriptions, setPrescriptions] = useState([])

//   useEffect(() => {
//     const fetchPrescriptions = async () => {
//       const res = await fetch('/api/prescriptions')
//       const data = await res.json()
//       setPrescriptions(data)
//     }
//     fetchPrescriptions()
//   }, [])

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//       {prescriptions.map((rx) => (
//         <Card key={rx._id} className="p-4 bg-slate-800 border border-slate-700">
//           <h3 className="text-cyan-400 font-bold text-lg">{rx.patientName}</h3>
//           <p className="text-sm text-slate-300">Doctor: {rx.doctorName}</p>
//           <p className="text-sm mt-2">🧪 {rx.medications}</p>
//           <p className="text-xs text-slate-400 mt-2 italic">{rx.notes}</p>
//           <p className="text-xs text-slate-500 mt-1">{new Date(rx.createdAt).toLocaleString()}</p>
//         </Card>
//       ))}
//     </div>
//   )
// }