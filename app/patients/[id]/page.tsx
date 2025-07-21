"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Calendar, Phone, Mail, MapPin, Activity, FileText, Stethoscope, Plus, Edit } from "lucide-react"
import Link from "next/link"
import { AssessmentDialog } from "@/components/assessment-dialog"
import { MedicalHistory } from "@/components/medical-history"
import { VitalSigns } from "@/components/vital-signs"
import { offlineManager } from "@/lib/offline-manager"

interface Assessment {
  id: string
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

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const [showAssessmentDialog, setShowAssessmentDialog] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [assessments, setAssessments] = useState<Assessment[]>([])

  // Mock patient data - in real app, this would come from database
  const patient = {
    id: params.id,
    name: "Sarah Johnson",
    age: 34,
    gender: "Female",
    phone: "+1 (555) 123-4567",
    email: "sarah.j@email.com",
    address: "123 Main St, City, State 12345",
    dateOfBirth: "1989-03-15",
    insuranceProvider: "BlueCross BlueShield",
    emergencyContact: "John Johnson +1-555-123-4568",
    medicalHistory: ["Hypertension", "Diabetes Type 2"],
    allergies: ["Penicillin", "Shellfish"],
    status: "Active",
    lastVisit: "2024-01-15",
  }

  const handleAddAssessment = async (newAssessment: Omit<Assessment, "id">) => {
    try {
      const assessment = await offlineManager.create("assessments", {
        ...newAssessment,
        patient_id: params.id,
      })
      setAssessments([assessment, ...assessments])
      setShowAssessmentDialog(false)
    } catch (error) {
      console.error("Failed to save assessment:", error)
    }
  }

  const handleEditAssessment = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setShowAssessmentDialog(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "draft":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "reviewed":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  useEffect(() => {
    const loadAssessments = async () => {
      try {
        const patientAssessments = await offlineManager.getByIndex("assessments", "patient_id", params.id)
        setAssessments(patientAssessments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      } catch (error) {
        console.error("Failed to load assessments:", error)
      }
    }

    loadAssessments()
  }, [params.id])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Patient Details
            </h1>
            <p className="text-slate-400 mt-2">Complete medical record for {patient.name}</p>
          </div>
          <Link href="/patients">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Back to Patients
            </Button>
          </Link>
        </div>

        {/* Patient Info Card */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                {patient.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{patient.name}</h2>
                <p className="text-slate-400">
                  ID: {patient.id} • {patient.age} years • {patient.gender}
                </p>
                <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/30">{patient.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-slate-400" />
                {patient.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-slate-400" />
                {patient.email}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-slate-400" />
                {patient.address}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Calendar className="w-4 h-4 text-slate-400" />
                DOB: {patient.dateOfBirth}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <User className="w-4 h-4 text-slate-400" />
                {patient.insuranceProvider}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-slate-400" />
                Emergency: {patient.emergencyContact}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="assessments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="assessments"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Stethoscope className="w-4 h-4 mr-2" />
              Assessments
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              Medical History
            </TabsTrigger>
            <TabsTrigger
              value="vitals"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Activity className="w-4 h-4 mr-2" />
              Vital Signs
            </TabsTrigger>
            <TabsTrigger
              value="medications"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Medications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessments" className="space-y-6">
            {/* Add Assessment Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-cyan-400">Clinical Assessments & Diagnoses</h3>
              <Button
                onClick={() => {
                  setSelectedAssessment(null)
                  setShowAssessmentDialog(true)
                }}
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Assessment
              </Button>
            </div>

            {/* Assessments List */}
            <div className="space-y-4">
              {assessments.map((assessment) => (
                <Card
                  key={assessment.id}
                  className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">{assessment.chiefComplaint}</h4>
                          <Badge className={getStatusColor(assessment.status)}>{assessment.status}</Badge>
                        </div>
                        <p className="text-slate-400 text-sm">
                          {assessment.date} • {assessment.doctorName}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditAssessment(assessment)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-cyan-400 font-medium mb-2">Present Illness</h5>
                        <p className="text-slate-300 text-sm mb-4">{assessment.presentIllness}</p>

                        <h5 className="text-cyan-400 font-medium mb-2">Physical Examination</h5>
                        <p className="text-slate-300 text-sm mb-4">{assessment.physicalExam}</p>

                        <h5 className="text-cyan-400 font-medium mb-2">Assessment</h5>
                        <p className="text-slate-300 text-sm">{assessment.assessment}</p>
                      </div>

                      <div>
                        <h5 className="text-cyan-400 font-medium mb-2">Diagnoses</h5>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {assessment.diagnosis.map((dx, index) => (
                            <Badge key={index} variant="secondary" className="bg-purple-500/20 text-purple-300">
                              {dx}
                            </Badge>
                          ))}
                        </div>

                        <h5 className="text-cyan-400 font-medium mb-2">Treatment Plan</h5>
                        <p className="text-slate-300 text-sm mb-4">{assessment.plan}</p>

                        <h5 className="text-cyan-400 font-medium mb-2">Follow-up</h5>
                        <p className="text-slate-300 text-sm">{assessment.followUp}</p>
                      </div>
                    </div>

                    {/* Vital Signs */}
                    <div className="mt-6 pt-4 border-t border-slate-700">
                      <h5 className="text-cyan-400 font-medium mb-3">Vital Signs</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Temperature</p>
                          <p className="text-white font-medium">{assessment.vitals.temperature}°F</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Blood Pressure</p>
                          <p className="text-white font-medium">{assessment.vitals.bloodPressure}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Heart Rate</p>
                          <p className="text-white font-medium">{assessment.vitals.heartRate} bpm</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Respiratory Rate</p>
                          <p className="text-white font-medium">{assessment.vitals.respiratoryRate} /min</p>
                        </div>
                        <div>
                          <p className="text-slate-400">O2 Saturation</p>
                          <p className="text-white font-medium">{assessment.vitals.oxygenSaturation}%</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Weight</p>
                          <p className="text-white font-medium">{assessment.vitals.weight} lbs</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Height</p>
                          <p className="text-white font-medium">{assessment.vitals.height} in</p>
                        </div>
                      </div>
                    </div>

                    {/* Medications and Lab Orders */}
                    {(assessment.medications.length > 0 || assessment.labOrders.length > 0) && (
                      <div className="mt-6 pt-4 border-t border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {assessment.medications.length > 0 && (
                            <div>
                              <h5 className="text-cyan-400 font-medium mb-3">Medications Prescribed</h5>
                              <div className="space-y-2">
                                {assessment.medications.map((med, index) => (
                                  <div key={index} className="bg-slate-700/30 rounded p-3">
                                    <p className="text-white font-medium">
                                      {med.name} {med.dosage}
                                    </p>
                                    <p className="text-slate-400 text-sm">
                                      {med.frequency} • {med.duration}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {assessment.labOrders.length > 0 && (
                            <div>
                              <h5 className="text-cyan-400 font-medium mb-3">Lab Orders</h5>
                              <div className="flex flex-wrap gap-2">
                                {assessment.labOrders.map((lab, index) => (
                                  <Badge key={index} variant="outline" className="border-blue-500/30 text-blue-300">
                                    {lab}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <MedicalHistory patient={patient} />
          </TabsContent>

          <TabsContent value="vitals">
            <VitalSigns assessments={assessments} />
          </TabsContent>

          <TabsContent value="medications">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-cyan-400">Current Medications</h3>
              {/* Current medications from latest assessment */}
              {assessments.length > 0 && assessments[0].medications.length > 0 ? (
                <div className="grid gap-4">
                  {assessments[0].medications.map((med, index) => (
                    <Card key={index} className="bg-slate-800/50 border-slate-700/50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-white font-semibold">{med.name}</h4>
                            <p className="text-slate-400">
                              {med.dosage} • {med.frequency}
                            </p>
                            <p className="text-slate-500 text-sm">Duration: {med.duration}</p>
                          </div>
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-slate-800/50 border-slate-700/50">
                  <CardContent className="p-8 text-center">
                    <p className="text-slate-400">No current medications on record</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Assessment Dialog */}
        <AssessmentDialog
          open={showAssessmentDialog}
          onOpenChange={setShowAssessmentDialog}
          onSave={handleAddAssessment}
          assessment={selectedAssessment}
          patientId={patient.id}
        />
      </div>
    </div>
  )
}
