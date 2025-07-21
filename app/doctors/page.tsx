"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Filter, UserCheck, Calendar, Phone, Mail, Clock, Star, Stethoscope } from "lucide-react"
import Link from "next/link"
import AddDoctorModal from '@/components/doctors/AddDoctorModal';
import { authFetch } from "@/lib/api"
import toast from 'react-hot-toast';
import { isSameDay, parseISO } from "date-fns";
const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'

export default function DoctorsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")

  const [isModalOpen, setModalOpen] = useState(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const today = new Date();


  useEffect(() => {
  const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300)
  return () => clearTimeout(handler)
}, [searchTerm])

useEffect(() => {
  const fetchDoctors = async () => {
    try {
      const res = await authFetch(`${API_URL}/v1/doctors`);
      const json = await res.json();
      const data = json?.data || [];
console.log('data doctors', data)
      setDoctors(data);

      if (res.ok) {
        toast.success("Doctors fetched successfully");
      } else {
        toast.error(json?.message || "Failed to fetch doctors");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error("An error occurred while fetching doctors");
    }
  };

  fetchDoctors(); // <- this was misplaced before
}, []);


  // const doctors = [
  //   {
  //     id: "D001",
  //     name: "Dr. Amanda Wilson",
  //     specialty: "Cardiology",
  //     experience: "15 years",
  //     phone: "+1 (555) 111-2222",
  //     email: "a.wilson@hospital.com",
  //     rating: 4.9,
  //     patients: 234,
  //     availability: "Available",
  //     nextSlot: "2:30 PM",
  //     department: "Cardiology",
  //   },
  //   {
  //     id: "D002",
  //     name: "Dr. James Rodriguez",
  //     specialty: "Neurology",
  //     experience: "12 years",
  //     phone: "+1 (555) 333-4444",
  //     email: "j.rodriguez@hospital.com",
  //     rating: 4.8,
  //     patients: 189,
  //     availability: "Busy",
  //     nextSlot: "4:15 PM",
  //     department: "Neurology",
  //   },
  //   {
  //     id: "D003",
  //     name: "Dr. Lisa Chen",
  //     specialty: "Pediatrics",
  //     experience: "8 years",
  //     phone: "+1 (555) 555-6666",
  //     email: "l.chen@hospital.com",
  //     rating: 4.7,
  //     patients: 156,
  //     availability: "Available",
  //     nextSlot: "1:45 PM",
  //     department: "Pediatrics",
  //   },
  // ]

  const filteredDoctors = doctors.filter(
    (doctor) =>
      (`${doctor.firstName} ${doctor.lastName}`).toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      doctor.specialty.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
  )

//   function handleSave(data) {
//   console.log("Saving doctor:", data);
//   // You can call your backend here later
// }

const handleAddDoctor = (newDoctor) => {
  setDoctors((prev) => [...prev, newDoctor]);
  closeModal();
};



  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Busy":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Off Duty":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Doctor Management
            </h1>
            <p className="text-slate-400 mt-2">View and manage doctor schedules</p>
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
                <UserCheck className="w-8 h-8 text-cyan-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{doctors?.length}</p>
                  <p className="text-sm text-slate-400">Total Doctors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{doctors?.filter(
    (doctor) =>
      doctor.availability === "Available"
  ).length}</p>
                  <p className="text-sm text-slate-400">On Duty</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">89</p>
                  <p className="text-sm text-slate-400">Today's Appointments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">4.8</p>
                  <p className="text-sm text-slate-400">Avg Rating</p>
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
                  placeholder="Search doctors by name or specialty..."
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
                <Button onClick={openModal} className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Doctor
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* {console.log("isModalOpen:", isModalOpen)} */}
        {isModalOpen && <AddDoctorModal isOpen ={isModalOpen} onSave={handleAddDoctor} onClose={closeModal} />}
        {/* Doctors List */}
        <div className="grid gap-4">
          {filteredDoctors.length === 0 ? (
  <p className="text-center text-slate-400 py-8">No doctors found for "{searchTerm}"</p>
) : (
  filteredDoctors.map(doctor => (
            <Card
              key={doctor._id}
              className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {doctor.firstName || doctor.lastName ? `${doctor.firstName?.[0] || ''}${doctor.lastName?.[0] || ''}`.toUpperCase() : 'NA'}
                      </div>
                      <div>
                        <h3>{doctor.firstName} {doctor.lastName}</h3>
                        <p className="text-slate-400">
                          {doctor.specialty} • {doctor.experience} experience
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-auto lg:ml-0">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-yellow-400 font-semibold">{doctor.rating}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {doctor.phone}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400" />
                        {doctor.email}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <UserCheck className="w-4 h-4 text-slate-400" />
                        {doctor.patients} patients
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Next slot: {doctor.nextSlot}
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Stethoscope className="w-4 h-4 text-slate-400" />
                        {doctor.department}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <Badge className={getAvailabilityColor(doctor?.availability)}>{doctor?.availability}</Badge>
                    <div className="flex gap-2">
                      <Link href={`/doctors/${doctor._id}/schedule`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        View Schedule
                      </Button>
                      </Link>
                      <Link href={`/appointments/book?doctorId=${doctor._id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                        Book Appointment
                      </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
)}
        </div>
      </div>
    </div>
  )
}
