"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Activity } from "lucide-react"

interface MedicalHistoryProps {
  patient: {
    medicalHistory: string[]
    allergies: string[]
  }
}

export function MedicalHistory({ patient }: MedicalHistoryProps) {
  return (
    <div className="space-y-6">
      {/* Medical History */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.medicalHistory.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.medicalHistory.map((condition, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  {condition}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No significant medical history on record</p>
          )}
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Allergies & Adverse Reactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {patient.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy, index) => (
                <Badge key={index} className="bg-red-500/20 text-red-400 border-red-500/30">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {allergy}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-slate-400">No known allergies</p>
          )}
        </CardContent>
      </Card>

      {/* Family History */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Family History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Family history information not available</p>
        </CardContent>
      </Card>

      {/* Social History */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Social History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-400">Social history information not available</p>
        </CardContent>
      </Card>
    </div>
  )
}
