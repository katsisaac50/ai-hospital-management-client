"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Activity } from "lucide-react"

interface Assessment {
  date: string
  vitals: {
    temperature: number
    bloodPressure: string
    heartRate: number
    respiratoryRate: number
    oxygenSaturation: number
    weight: number
    height: number
  }
}

interface VitalSignsProps {
  assessments: Assessment[]
}

export function VitalSigns({ assessments }: VitalSignsProps) {
  // Prepare data for charts
  const chartData = assessments
    .slice()
    .reverse()
    .map((assessment) => ({
      date: assessment.date,
      temperature: assessment.vitals.temperature,
      heartRate: assessment.vitals.heartRate,
      respiratoryRate: assessment.vitals.respiratoryRate,
      oxygenSaturation: assessment.vitals.oxygenSaturation,
      weight: assessment.vitals.weight,
      systolic: assessment.vitals.bloodPressure ? Number.parseInt(assessment.vitals.bloodPressure.split("/")[0]) : 0,
      diastolic: assessment.vitals.bloodPressure ? Number.parseInt(assessment.vitals.bloodPressure.split("/")[1]) : 0,
    }))

  const latestVitals = assessments.length > 0 ? assessments[0].vitals : null

  return (
    <div className="space-y-6">
      {/* Latest Vital Signs */}
      {latestVitals && (
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Latest Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">Temperature</p>
                <p className="text-2xl font-bold text-white">{latestVitals.temperature}°F</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">Blood Pressure</p>
                <p className="text-2xl font-bold text-white">{latestVitals.bloodPressure}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">Heart Rate</p>
                <p className="text-2xl font-bold text-white">{latestVitals.heartRate} bpm</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">Respiratory Rate</p>
                <p className="text-2xl font-bold text-white">{latestVitals.respiratoryRate} /min</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">O2 Saturation</p>
                <p className="text-2xl font-bold text-white">{latestVitals.oxygenSaturation}%</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">Weight</p>
                <p className="text-2xl font-bold text-white">{latestVitals.weight} lbs</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 text-center">
                <p className="text-slate-400 text-sm">Height</p>
                <p className="text-2xl font-bold text-white">{latestVitals.height} in</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vital Signs Trends */}
      {chartData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Blood Pressure Chart */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">Blood Pressure Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="systolic" stroke="#06B6D4" strokeWidth={2} name="Systolic" />
                  <Line type="monotone" dataKey="diastolic" stroke="#8B5CF6" strokeWidth={2} name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Heart Rate Chart */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">Heart Rate Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="heartRate" stroke="#10B981" strokeWidth={2} name="Heart Rate" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Weight Chart */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">Weight Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="weight" stroke="#F59E0B" strokeWidth={2} name="Weight" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Temperature Chart */}
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-cyan-400">Temperature Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" domain={[96, 102]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                  <Line type="monotone" dataKey="temperature" stroke="#EF4444" strokeWidth={2} name="Temperature" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
