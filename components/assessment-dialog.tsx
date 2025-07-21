"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

interface Assessment {
  id?: string
  date: string
  doctorName: string
  doctorId: string
  chiefComplaint: string
  presentIllness: string
  physicalExam: string
  assessment: string
  diagnosis: string[]
  plan: string
  followUp: string
  vitals: {
    temperature: number
    bloodPressure: string
    heartRate: number
    respiratoryRate: number
    oxygenSaturation: number
    weight: number
    height: number
  }
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
  }>
  labOrders: string[]
  status: "draft" | "completed" | "reviewed"
}

interface AssessmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (assessment: Omit<Assessment, "id">) => void
  assessment?: Assessment | null
  patientId: string
}

export function AssessmentDialog({ open, onOpenChange, onSave, assessment, patientId }: AssessmentDialogProps) {
  const [formData, setFormData] = useState<Omit<Assessment, "id">>({
    date: new Date().toISOString().split("T")[0],
    doctorName: "Dr. Amanda Wilson", // In real app, this would come from current user
    doctorId: "D001",
    chiefComplaint: "",
    presentIllness: "",
    physicalExam: "",
    assessment: "",
    diagnosis: [],
    plan: "",
    followUp: "",
    vitals: {
      temperature: 98.6,
      bloodPressure: "",
      heartRate: 0,
      respiratoryRate: 0,
      oxygenSaturation: 0,
      weight: 0,
      height: 0,
    },
    medications: [],
    labOrders: [],
    status: "draft",
  })

  const [newDiagnosis, setNewDiagnosis] = useState("")
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
  })
  const [newLabOrder, setNewLabOrder] = useState("")

  useEffect(() => {
    if (assessment) {
      setFormData(assessment)
    } else {
      // Reset form for new assessment
      setFormData({
        date: new Date().toISOString().split("T")[0],
        doctorName: "Dr. Amanda Wilson",
        doctorId: "D001",
        chiefComplaint: "",
        presentIllness: "",
        physicalExam: "",
        assessment: "",
        diagnosis: [],
        plan: "",
        followUp: "",
        vitals: {
          temperature: 98.6,
          bloodPressure: "",
          heartRate: 0,
          respiratoryRate: 0,
          oxygenSaturation: 0,
          weight: 0,
          height: 0,
        },
        medications: [],
        labOrders: [],
        status: "draft",
      })
    }
  }, [assessment, open])

  const handleSave = () => {
    onSave(formData)
    onOpenChange(false)
  }

  const addDiagnosis = () => {
    if (newDiagnosis.trim()) {
      setFormData({
        ...formData,
        diagnosis: [...formData.diagnosis, newDiagnosis.trim()],
      })
      setNewDiagnosis("")
    }
  }

  const removeDiagnosis = (index: number) => {
    setFormData({
      ...formData,
      diagnosis: formData.diagnosis.filter((_, i) => i !== index),
    })
  }

  const addMedication = () => {
    if (newMedication.name.trim()) {
      setFormData({
        ...formData,
        medications: [...formData.medications, newMedication],
      })
      setNewMedication({ name: "", dosage: "", frequency: "", duration: "" })
    }
  }

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      medications: formData.medications.filter((_, i) => i !== index),
    })
  }

  const addLabOrder = () => {
    if (newLabOrder.trim()) {
      setFormData({
        ...formData,
        labOrders: [...formData.labOrders, newLabOrder.trim()],
      })
      setNewLabOrder("")
    }
  }

  const removeLabOrder = (index: number) => {
    setFormData({
      ...formData,
      labOrders: formData.labOrders.filter((_, i) => i !== index),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-cyan-400">
            {assessment ? "Edit Assessment" : "New Clinical Assessment"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Chief Complaint */}
          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Input
              id="chiefComplaint"
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Patient's main concern or reason for visit"
            />
          </div>

          {/* Present Illness */}
          <div className="space-y-2">
            <Label htmlFor="presentIllness">History of Present Illness</Label>
            <Textarea
              id="presentIllness"
              value={formData.presentIllness}
              onChange={(e) => setFormData({ ...formData, presentIllness: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Detailed description of the current illness"
              rows={3}
            />
          </div>

          {/* Vital Signs */}
          <div className="space-y-4">
            <h4 className="text-cyan-400 font-medium">Vital Signs</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°F)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  value={formData.vitals.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, temperature: Number.parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  value={formData.vitals.bloodPressure}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, bloodPressure: e.target.value },
                    })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="120/80"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                <Input
                  id="heartRate"
                  type="number"
                  value={formData.vitals.heartRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, heartRate: Number.parseInt(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="respiratoryRate">Respiratory Rate (/min)</Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  value={formData.vitals.respiratoryRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, respiratoryRate: Number.parseInt(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oxygenSaturation">O2 Saturation (%)</Label>
                <Input
                  id="oxygenSaturation"
                  type="number"
                  value={formData.vitals.oxygenSaturation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, oxygenSaturation: Number.parseInt(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.vitals.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, weight: Number.parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (inches)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.vitals.height}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitals: { ...formData.vitals, height: Number.parseFloat(e.target.value) || 0 },
                    })
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Physical Examination */}
          <div className="space-y-2">
            <Label htmlFor="physicalExam">Physical Examination</Label>
            <Textarea
              id="physicalExam"
              value={formData.physicalExam}
              onChange={(e) => setFormData({ ...formData, physicalExam: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Physical examination findings"
              rows={3}
            />
          </div>

          {/* Assessment */}
          <div className="space-y-2">
            <Label htmlFor="assessment">Clinical Assessment</Label>
            <Textarea
              id="assessment"
              value={formData.assessment}
              onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Clinical assessment and impression"
              rows={3}
            />
          </div>

          {/* Diagnoses */}
          <div className="space-y-4">
            <h4 className="text-cyan-400 font-medium">Diagnoses</h4>
            <div className="flex gap-2">
              <Input
                value={newDiagnosis}
                onChange={(e) => setNewDiagnosis(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Add diagnosis"
                onKeyPress={(e) => e.key === "Enter" && addDiagnosis()}
              />
              <Button onClick={addDiagnosis} size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.diagnosis.map((dx, index) => (
                <Badge key={index} variant="secondary" className="bg-purple-500/20 text-purple-300">
                  {dx}
                  <button onClick={() => removeDiagnosis(index)} className="ml-2 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Treatment Plan */}
          <div className="space-y-2">
            <Label htmlFor="plan">Treatment Plan</Label>
            <Textarea
              id="plan"
              value={formData.plan}
              onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Treatment plan and recommendations"
              rows={3}
            />
          </div>

          {/* Medications */}
          <div className="space-y-4">
            <h4 className="text-cyan-400 font-medium">Medications</h4>
            <div className="grid grid-cols-4 gap-2">
              <Input
                value={newMedication.name}
                onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Medication name"
              />
              <Input
                value={newMedication.dosage}
                onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Dosage"
              />
              <Input
                value={newMedication.frequency}
                onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Frequency"
              />
              <div className="flex gap-2">
                <Input
                  value={newMedication.duration}
                  onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                  className="bg-slate-700/50 border-slate-600 text-white"
                  placeholder="Duration"
                />
                <Button onClick={addMedication} size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {formData.medications.map((med, index) => (
                <div key={index} className="bg-slate-700/30 rounded p-3 flex justify-between items-center">
                  <div>
                    <p className="text-white font-medium">
                      {med.name} {med.dosage}
                    </p>
                    <p className="text-slate-400 text-sm">
                      {med.frequency} • {med.duration}
                    </p>
                  </div>
                  <button onClick={() => removeMedication(index)} className="text-red-400 hover:text-red-300">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Lab Orders */}
          <div className="space-y-4">
            <h4 className="text-cyan-400 font-medium">Laboratory Orders</h4>
            <div className="flex gap-2">
              <Input
                value={newLabOrder}
                onChange={(e) => setNewLabOrder(e.target.value)}
                className="bg-slate-700/50 border-slate-600 text-white"
                placeholder="Add lab order"
                onKeyPress={(e) => e.key === "Enter" && addLabOrder()}
              />
              <Button onClick={addLabOrder} size="sm" className="bg-cyan-500 hover:bg-cyan-600">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.labOrders.map((lab, index) => (
                <Badge key={index} variant="outline" className="border-blue-500/30 text-blue-300">
                  {lab}
                  <button onClick={() => removeLabOrder(index)} className="ml-2 hover:text-red-400">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Follow-up */}
          <div className="space-y-2">
            <Label htmlFor="followUp">Follow-up Instructions</Label>
            <Textarea
              id="followUp"
              value={formData.followUp}
              onChange={(e) => setFormData({ ...formData, followUp: e.target.value })}
              className="bg-slate-700/50 border-slate-600 text-white"
              placeholder="Follow-up instructions and timeline"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.chiefComplaint.trim()}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
          >
            {assessment ? "Update Assessment" : "Save Assessment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
