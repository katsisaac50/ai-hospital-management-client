"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, Calendar, Clock, User, UserCheck, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDate, setSelectedDate] = useState("2024-01-15")

  const appointments = [
    {
      id: "A001",
      patientName: "Sarah Johnson",
      doctorName: "Dr. Amanda Wilson",
      time: "09:00 AM",
      duration: "30 min",
      type: "Consultation",
      status: "Confirmed",
      priority: "Medium",
      department: "Cardiology",
      notes: "Follow-up for hypertension",
    },
    {
      id: "A002",
      patientName: "Michael Chen",
      doctorName: "Dr. James Rodriguez",
      time: "10:30 AM",
      duration: "45 min",
      type: "Check-up",
      status: "In Progress",
      priority: "High",
      department: "Neurology",
      notes: "Neurological assessment",
    },
    {
      id: "A003",
      patientName: "Emily Rodriguez",
      doctorName: "Dr. Lisa Chen",
      time: "02:15 PM",
      duration: "30 min",
      type: "Consultation",
      status: "Pending",
      priority: "Low",
      department: "Pediatrics",
      notes: "Routine pediatric check",
    },
    {
      id: "A004",
      patientName: "David Kim",
      doctorName: "Dr. Amanda Wilson",
      time: "03:45 PM",
      duration: "60 min",
      type: "Surgery Consultation",
      status: "Cancelled",
      priority: "High",
      department: "Cardiology",
      notes: "Pre-surgery consultation",
    },
  ]

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "In Progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Cancelled":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Completed":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
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
      case "Confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "In Progress":
        return <Clock className="w-4 h-4" />
      case "Pending":
        return <AlertCircle className="w-4 h-4" />
      case "Cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Appointment Management
            </h1>
            <p className="text-slate-400 mt-2">Schedule and manage patient appointments</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-2xl font-bold text-white">156</p>
                  <p className="text-sm text-slate-400">Today's Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">89</p>
                  <p className="text-sm text-slate-400">Confirmed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">23</p>
                  <p className="text-sm text-slate-400">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">12</p>
                  <p className="text-sm text-slate-400">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <Card className="bg-slate-800/50 border-slate-700/50 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search appointments by patient, doctor, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
                <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card
              key={appointment.id}
              className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {appointment.id.slice(-2)}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{appointment.patientName}</h3>
                        <p className="text-slate-400">with {appointment.doctorName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400" />
                        {appointment.time} ({appointment.duration})
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <User className="w-4 h-4 text-slate-400" />
                        {appointment.type}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        {appointment.department}
                      </div>
                      {appointment.notes && (
                        <div className="col-span-full flex items-center gap-2 text-slate-300">
                          <span className="text-slate-400">Notes:</span>
                          {appointment.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1">{appointment.status}</span>
                      </Badge>
                      <Badge className={getPriorityColor(appointment.priority)}>{appointment.priority}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Reschedule
                      </Button>
                      <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
