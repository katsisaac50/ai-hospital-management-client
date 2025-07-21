"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"
import { authFetch } from "@/lib/api"

export default function editPrescriptionModal({ open, onClose, prescription, onUpdated, medicationMap }) {
  const [form, setForm] = useState(null)
  const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

  useEffect(() => {
    if (prescription) {
      setForm({ ...prescription })
    }
  }, [prescription])

  const handleMedChange = (index, field, value) => {
    const updatedMeds = [...form.medications]
    updatedMeds[index][field] = value
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

  if (!form) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Prescription</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Label>Priority</Label>
          <Select value={form.priority} onValueChange={(val) => handleChange("priority", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Label>Status</Label>
          <Select value={form.status} onValueChange={(val) => handleChange("status", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
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
            {form.medications.map((med, index) => (
              <div key={index} className="border rounded p-3 bg-slate-700/40">
                <p className="font-semibold text-white">Medication ID: {med.medication}</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Input
                    placeholder="Dosage"
                    value={med.dosage}
                    onChange={(e) => handleMedChange(index, "dosage", e.target.value)}
                  />
                  <Input
                    placeholder="Frequency"
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
                    value={med.quantity}
                    onChange={(e) => handleMedChange(index, "quantity", parseInt(e.target.value))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Update</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
