"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { toast } from "react-toastify"
import { authFetch } from "@/lib/api"
const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

export default function EditPrescriptionModal({ open, onClose, prescription, onUpdated }) {
  const [form, setForm] = useState(null)
  const [medDetails, setMedDetails] = useState({})
  const [isAddingMedication, setIsAddingMedication] = useState(false)
  const [medicationsList, setMedicationsList] = useState([])
  

  useEffect(() => {
    if (prescription) {
      setForm({ ...prescription })
      fetchMedications()
    }
  }, [prescription])

  const fetchMedications = async () => {
    const res = await authFetch(`${API_URL}/v1/pharmacy/medications`)
    const { data } = await res.json()
    setMedicationsList(data || [])
    const detailsMap = {}
    data.forEach((med) => {
      detailsMap[med._id] = med
    })
    setMedDetails(detailsMap)
  }

  const handleMedChange = (index, field, value) => {
    const updatedMeds = [...form.medications]
    updatedMeds[index][field] = value

    if ((field === 'frequency' || field === 'duration') && updatedMeds[index].frequency && updatedMeds[index].duration) {
      const freq = parseInt(updatedMeds[index].frequency.replace(/[^\d]/g, '')) || 1
      const days = parseInt(updatedMeds[index].duration.replace(/[^\d]/g, '')) || 1
      updatedMeds[index].quantity = freq * days
    }

    if (field === 'quantity' && medDetails[updatedMeds[index].medication]) {
      updatedMeds[index].cost = medDetails[updatedMeds[index].medication].price * value
    }

    setForm({ ...form, medications: updatedMeds })
  }

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value })
  }

  const handleSubmit = async () => {
    try {
      const res = await authFetch(`${API_URL}/v1/pharmacy/prescriptions/${form._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      })

      if (!res.ok) throw new Error("Failed to update prescription")

      toast.success("Prescription updated")
      onUpdated()
      onClose()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const addMedication = () => {
    setForm((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          medication: '',
          dosage: '',
          frequency: '',
          duration: '',
          quantity: 1,
          cost: 0,
        },
      ],
    }))
    setIsAddingMedication(true)
  }

const removeMedication = (index) => {
  const updated = [...form.medications];
  updated.splice(index, 1);
  setForm({ ...form, medications: updated });
};

  if (!form) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        <DialogHeader>
          <DialogTitle>Edit Prescription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={(val) => handleChange("priority", val)}>
            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Label>Status</Label>
          <Select value={form.status} onValueChange={(val) => handleChange("status", val)}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Ready">Ready</SelectItem>
              <SelectItem value="Dispensed">Dispensed</SelectItem>
              <SelectItem value="Verification Required">Verification Required</SelectItem>
            </SelectContent>
          </Select>

          <Label>Notes</Label>
          <Textarea
            value={form.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Additional notes"
          />

          <div className="space-y-4">
            {form.medications.map((med, index) => {
              const medInfo = medDetails[med.medication] || {}
              return (
                <div key={index} className="border rounded p-3 bg-slate-700/40">
                  <p className="font-semibold text-white">{medInfo.name || 'Medication'} - {medInfo.strength}</p>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {isAddingMedication && med.medication === '' ? (
                <div>
                  <Label className="text-white">Select Medication</Label>
                  <Select
                    value={med.medication}
                    onValueChange={(val) => handleMedChange(index, 'medication', val)}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Select medication" />
                    </SelectTrigger>
                    <SelectContent>
                      {medicationsList.map((m) => (
                        <SelectItem key={m._id} value={m._id}>
                          {m.name} ({m.strength})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-white">
                  💊 {medicationsList.find((m) => m._id === med.medication)?.name || 'Unknown'}
                </p>
              )}
                    <Input
                      placeholder="Dosage"
                      value={med.dosage}
                      onChange={(e) => handleMedChange(index, "dosage", e.target.value)}
                    />
                    <Input
                      placeholder="Frequency (e.g., 2/day)"
                      value={med.frequency}
                      onChange={(e) => handleMedChange(index, "frequency", e.target.value)}
                    />
                    <Input
                      placeholder="Duration (e.g., 5 days)"
                      value={med.duration}
                      onChange={(e) => handleMedChange(index, "duration", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Quantity"
                      value={med.quantity || ''}
                      onChange={(e) => handleMedChange(index, "quantity", parseInt(e.target.value))}
                    />
                    <Input
                      type="number"
                      placeholder="Cost"
                      value={med.cost?.toFixed(2) || ''}
                      disabled
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMedication(index)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )
            })}
            <Button
              variant="outline"
              className="mt-4"
              onClick={addMedication}
            >
              + Add Medication
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


























// "use client"

// import { useState, useEffect } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Textarea } from "@/components/ui/textarea"
// import { Label } from "@/components/ui/label"
// import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
// import { toast } from "react-toastify"
// import { authFetch } from "@/lib/api"

// export default function editPrescriptionModal({ open, onClose, prescription, onUpdated }) {
//   const [form, setForm] = useState(null)
//   const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

//   useEffect(() => {
//     if (prescription) {
//       setForm({ ...prescription })
//     }
//   }, [prescription])

//   const handleMedChange = (index, field, value) => {
//     const updatedMeds = [...form.medications]
//     updatedMeds[index][field] = value
//     setForm({ ...form, medications: updatedMeds })
//   }

//   const handleChange = (field, value) => {
//     setForm({ ...form, [field]: value })
//   }

//   const handleSubmit = async () => {
//     try {
//       const res = await authFetch(`${API_URL}/v1/pharmacy/prescriptions/${form._id}`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(form)
//       })

//       if (!res.ok) throw new Error("Failed to update prescription")

//       toast.success("Prescription updated")
//       onUpdated()
//       onClose()
//     } catch (err) {
//       toast.error(err.message)
//     }
//   }

//   if (!form) return null

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle>Edit Prescription</DialogTitle>
//         </DialogHeader>

//         <div className="space-y-4">
//           <Label>Priority</Label>
//           <Select value={form.priority} onValueChange={(val) => handleChange("priority", val)}>
//             <SelectTrigger>
//               <SelectValue placeholder="Priority" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="High">High</SelectItem>
//               <SelectItem value="Medium">Medium</SelectItem>
//               <SelectItem value="Low">Low</SelectItem>
//             </SelectContent>
//           </Select>

//           <Label>Status</Label>
//           <Select value={form.status} onValueChange={(val) => handleChange("status", val)}>
//             <SelectTrigger>
//               <SelectValue placeholder="Status" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="Pending">Pending</SelectItem>
//               <SelectItem value="Ready">Ready</SelectItem>
//               <SelectItem value="Dispensed">Dispensed</SelectItem>
//               <SelectItem value="Verification Required">Verification Required</SelectItem>
//             </SelectContent>
//           </Select>

//           <Label>Notes</Label>
//           <Textarea
//             value={form.notes}
//             onChange={(e) => handleChange("notes", e.target.value)}
//             placeholder="Additional notes"
//           />

//           <div className="space-y-4">
//             {form.medications.map((med, index) => (
//               <div key={index} className="border rounded p-3 bg-slate-700/40">
//                 {console.log('gggg', med)}
//                 <p className="font-semibold text-white">Medication ID: {med.medication}</p>
//                 <div className="grid grid-cols-2 gap-3 mt-2">
//                   <Input
//                     placeholder="Dosage"
//                     value={med.dosage}
//                     onChange={(e) => handleMedChange(index, "dosage", e.target.value)}
//                   />
//                   <Input
//                     placeholder="Frequency"
//                     value={med.frequency}
//                     onChange={(e) => handleMedChange(index, "frequency", e.target.value)}
//                   />
//                   <Input
//                     placeholder="Duration (e.g., 5 days)"
//                     value={med.duration}
//                     onChange={(e) => handleMedChange(index, "duration", e.target.value)}
//                   />
//                   <Input
//                     type="number"
//                     placeholder="Quantity"
//                     value={med.quantity}
//                     onChange={(e) => handleMedChange(index, "quantity", parseInt(e.target.value))}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         <DialogFooter className="mt-4">
//           <Button variant="secondary" onClick={onClose}>
//             Cancel
//           </Button>
//           <Button onClick={handleSubmit}>Update</Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   )
// }
