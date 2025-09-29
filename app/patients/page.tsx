"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RoleBasedAccess } from "@/components/role-based-access"
import { useAuth } from "@/lib/auth"
import { authFetch } from "@/lib/api"
import { useTheme } from "@/components/theme-provider"
import { Sun, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/formatDate";
import {
  Search,
  Plus,
  Filter,
  Edit,
  Eye,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Heart,
  AlertTriangle,
  User,
  ArrowLeft, 
  Menu,
  Users,
  Activity,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
// import { toast } from "react-toastify";
import EditPatientDialog from "@/components/patients/editPatientForm"
import ClinicalEncountersModal from "@/components/modals/ClinicalEncountersModal";
import { LoginForm } from "@/components/login-form";
import Link from "next/link"

interface PatientType {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: "male" | "female" | "other"
  address: {
    street: string
    city: string
    state?: string
    postalCode: string
    country: string
  }
  emergencyContact: {
    name: string
    relationship: string
    phone: string
  }
  insuranceProvider: string
  insuranceNumber: string
  medicalHistory: Array<{
    _id?: string
    condition: string
    diagnosisDate: string
    treatment: string
  }>
  diagnosisDate: string
  allergies: string[]
  bloodType: string
  status: "active" | "inactive" | "critical"
  lastVisit: string
  nextAppointment?: string
  treatment: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export default function PatientsPage() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme();
  const [patients, setPatients] = useState<PatientType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [selectedPatient, setSelectedPatient] = useState<PatientType | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [newPatient, setNewPatient] = useState<Partial<PatientType>>({})
  const [encounters, setEncounters] = useState<any[]>([]);
  const [selectedEncounter, setSelectedEncounter] = useState<any>(null);
  const [isEncounterModalOpen, setIsEncounterModalOpen] = useState(false);
  // const [encounters, setEncounters] = useState<any[]>([]);
  const [loadingEncounters, setLoadingEncounters] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const cardClasses = cn("transition-all duration-300", {
    "glass-card": theme === "morpho",
    "bg-slate-800/50 border-slate-700/50": theme === "dark",
    "bg-white border-gray-200 shadow-sm": theme === "light",
  })

  const textClasses = cn("transition-colors duration-300", {
    "text-white": theme === "dark" || theme === "morpho",
    "text-gray-900": theme === "light",
  })

  const mutedTextClasses = cn("transition-colors duration-300", {
    "text-slate-400": theme === "dark" || theme === "morpho",
    "text-gray-600": theme === "light",
  })

  useEffect(() => {
    const fetchEncounters = async () => {
  if (isEncounterModalOpen && selectedPatient?.id) {

    const res = await authFetch(`${API_URL}/v1/encounters/patient/${selectedPatient.id}`)
    const json = await res.json();
    const data = json?.data || [];
    console.log('endconters', data)
    setEncounters(data)
  }
}
fetchEncounters()
}, [isEncounterModalOpen, selectedPatient]);

useEffect(() => {
    if (isViewDialogOpen && selectedPatient?.id) {
      setLoadingEncounters(true);
      authFetch(`${API_URL}/v1/encounters/patient/${selectedPatient.id}`)
        .then((res) => res.json())
        .then((json) => setEncounters(json.data || []))
        .catch((err) => console.error("Failed to fetch encounters:", err))
        .finally(() => setLoadingEncounters(false));
    }
  }, [isViewDialogOpen, selectedPatient]);

  useEffect(() => {
  const fetchPatients = async () => {
    // console.log("apit", API_URL)
    const res = await authFetch(`${API_URL}/v1/patients`);
    // console.log('res', res)
    const json = await res.json();
    const data = json?.data || [];

    
    setPatients(data)
  }

  fetchPatients()
}, [])

console.log('data', patients)

  const filteredPatients = Array.isArray(patients)
  ? patients.filter((patient) => {
    const name = patient?.name?.toLowerCase?.() || ""
    const email = patient?.email?.toLowerCase?.() || ""
    const phone = patient?.phone || ""

    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm)

    const matchesFilter = filterStatus === "all" || patient.status === filterStatus

    return matchesSearch && matchesFilter
  }) : []

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "critical":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    }
  }

  const getInputClass = () => cn("transition-colors duration-300", {
  "glass-input": theme === "morpho",
  "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
  "bg-gray-50 border-gray-300": theme === "light",
});


  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

 const handleAddPatient = async () => {
  const patient = {
    name: `${newPatient.firstName || ""} ${newPatient.lastName || ""}`.trim(),
    firstName: newPatient.firstName || "",
    lastName: newPatient.lastName || "",
    email: newPatient.email || "",
    phone: newPatient.phone || "",
    dateOfBirth: newPatient.dateOfBirth || "",
    gender: newPatient.gender || "other",
    bloodType: newPatient.bloodType || "",
    
    address: {
      street: newPatient.addressStreet || "",
      city: newPatient.addressCity || "",
      state: newPatient.addressState || "",
      postalCode: newPatient.addressPostalCode || "",
      country: newPatient.addressCountry || "",
    },

    emergencyContact: {
      name: newPatient.emergencyContactName || "",
      relationship: newPatient.emergencyContactRelationship || "",
      phone: newPatient.emergencyPhone || "",
    },

    medicalHistory: newPatient.medicalHistory
      ? [
          {
            condition: newPatient.medicalHistory,
            diagnosisDate: newPatient.diagnosisDate || null,
            treatment: newPatient.treatment || "",
          },
        ]
      : [],

    allergies: newPatient.allergies
      ? newPatient.allergies.split(",").map((a) => a.trim())
      : [],

    currentMedications: newPatient.medicationName
      ? [
          {
            name: newPatient.medicationName,
            dosage: newPatient.medicationDosage || "",
            frequency: newPatient.medicationFrequency || "",
          },
        ]
      : [],

    insuranceProvider: newPatient.insuranceProvider || "",
    insuranceNumber: newPatient.insuranceNumber || "",

    insurance: {
      provider: newPatient.insuranceProvider || "",
      policyNumber: newPatient.insuranceNumber || "",
      validUntil: newPatient.insuranceValidUntil || null,
    },

    status: "active",
    lastVisit: newPatient.lastVisit || new Date().toISOString(),
  }

  try {
    const res = await fetch(`${API_URL}/v1/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Optional: include auth token if needed
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(patient),
    });

    if (!res.ok) {
      throw new Error("Failed to add patient");
    }

    const responseData = await res.json();
    const savedPatient = responseData.data; // adjust this if your backend sends { data: patient }

    setPatients(prev => [...prev, savedPatient]);
    toast({
      title: "Patient Added",
      description: `${savedPatient.name} has been added.`,
    });

    setNewPatient({});
    setIsAddDialogOpen(false);
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to add patient",
      variant: "destructive",
    });
  }
};

  const handleEditPatient = async () => {
    console.log('sle', selectedPatient)
  if (!selectedPatient?.id) return;

  const token = localStorage.getItem("token");

  try {
    // Send update request to backend
    const response = await fetch(`${API_URL}/v1/patients/${selectedPatient.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...selectedPatient,
        updatedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) throw new Error("Failed to update patient");

    const updatedPatient = await response.json();

    // Update frontend list
    const updatedPatients = patients.map((patient) =>
      patient.id === updatedPatient?.data.id ? updatedPatient?.data : patient
    );
console.log('sd', updatedPatients)
    setPatients(updatedPatients);
    setIsEditDialogOpen(false);
    setSelectedPatient(null);

    toast({
      title: "Patient Updated",
      description: "Patient information has been successfully updated.",
    });
  } catch (error) {
    console.error(error);
    toast("Update failed. Please try again.");
  }
};


 const handleDeletePatient = async (patientId: string) => {
  try {
    const res = await fetch(`${API_URL}/v1/patients/${patientId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!res.ok) {
      throw new Error("Failed to delete patient");
    }

    // Update local state after successful deletion
    setPatients(patients.filter((patient) => patient.id !== patientId));

    toast({
      title: "Patient Removed",
      description: "Patient has been removed from the system.",
      variant: "destructive",
    });
  } catch (error) {
    console.error(error);
    toast({
      title: "Error",
      description: "Failed to delete patient. Please try again.",
      variant: "destructive",
    });
  }
};

if (!token) {
    return <LoginForm />;
  }

  return (
    <div
      className={cn("min-h-screen transition-all duration-300", {
        "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white": theme === "dark",
        "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900": theme === "light",
        "morpho text-white": theme === "morpho",
      })}
    >
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
<header className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
  {/* Title Section */}
  <div className="space-y-1">
    <h1 className={cn(
      "text-2xl font-bold tracking-tight sm:text-3xl",
      textClasses
    )}>
      Patient Management
    </h1>
    <p className={cn(
      "text-sm sm:text-base",
      mutedTextClasses
    )}>
      Manage patient records and information
    </p>
  </div>

  {/* Action Buttons */}
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
    {/* Add Patient Button (Conditional based on role) */}
    <RoleBasedAccess 
      requiredPermission="edit_patients" 
      showError={false}
    >
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        aria-label="Add new patient"
        className={cn(
          "group transition-all duration-300 flex items-center",
          {
            "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600": 
              theme === "dark" || theme === "morpho",
            "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600": 
              theme === "light",
          }
        )}
      >
        <Plus className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
        <span>Add Patient</span>
      </Button>
    </RoleBasedAccess>
    <Button
      variant="outline"
      onClick={() => {
        // cycle through light → dark → morpho
        const nextTheme =
          theme === "light" ? "dark" : theme === "dark" ? "morpho" : "light";
        setTheme(nextTheme);
      }}
      className={cn(
        "flex items-center gap-2 transition-all duration-300",
        {
          "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
          "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
          "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
        }
      )}
    >
      {theme === "light" && <Sun className="w-4 h-4" />}
      {theme === "dark" && <Moon className="w-4 h-4" />}
      {theme === "morpho" && <Sparkles className="w-4 h-4" />}
      <span>Theme: {theme.charAt(0).toUpperCase() + theme.slice(1)}</span>
    </Button>

    {/* Dashboard Link */}
    <Link href="/" legacyBehavior>
      <Button 
        variant="outline" 
        aria-label="Return to dashboard"
        className="border-slate-600 text-slate-300 hover:bg-slate-700/50 hover:text-slate-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        <span>Back to Dashboard</span>
      </Button>
    </Link>
  </div>
</header>

        {/* Search and Filters */}
        <Card className={cn(cardClasses, "mb-6")}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search patients by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={cn("pl-10 transition-colors duration-300", {
                    "glass-input": theme === "morpho",
                    "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
                    "bg-gray-50 border-gray-300": theme === "light",
                  })}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger
                  className={cn("w-48 transition-colors duration-300", {
                    "glass-input": theme === "morpho",
                    "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
                    "bg-gray-50 border-gray-300": theme === "light",
                  })}
                >
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                className={cn("transition-colors duration-300", {
                  "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
                  "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
                  "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
                })}
              >
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className={cn(cardClasses, "hover:scale-105 cursor-pointer")}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                      src={patient.avatar || "/placeholder.svg"} 
                      alt={patient?.name || "No name"} 
                      onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                        {(patient?.name || "NN")
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className={cn("font-semibold", textClasses)}>{patient.name}</h3>
                      <p className={cn("text-sm", mutedTextClasses)}>
                       Age {calculateAge(patient.dateOfBirth)} • {patient.gender}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status === "critical" && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {patient.status === "active" && <Heart className="w-3 h-3 mr-1" />}
                    {patient.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-cyan-400" />
                    <span className={mutedTextClasses}>{patient?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-green-400" />
                    <span className={mutedTextClasses}>{patient?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span className={mutedTextClasses}>Last visit: {formatDate(patient.lastVisit, { includeTime: true })}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(patient)
                      setIsViewDialogOpen(true)
                    }}
                    className={cn("transition-colors duration-300", {
                      "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
                      "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
                      "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
                    })}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedPatient(patient);
                      setIsEncounterModalOpen(true);
                      // You might want to fetch encounters for this patient here
                    }}
                    className={cn("transition-colors duration-300", {
                      "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
                      "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
                      "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
                    })}
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    Add Encounters
                  </Button>
                  <RoleBasedAccess requiredPermission="edit_patients" showError={false}>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient)
                          setIsEditDialogOpen(true)
                        }}
                        className={cn("transition-colors duration-300", {
                          "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
                          "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
                          "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
                        })}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <RoleBasedAccess requiredPermission="delete_patients" showError={false}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePatient(patient.id)}
                          className="border-red-600 text-red-400 hover:bg-red-700/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </RoleBasedAccess>
                    </div>
                  </RoleBasedAccess>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Patient Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent
            className={cn("max-w-2xl max-h-[90vh] overflow-y-auto", {
              "glass-card": theme === "morpho",
              "bg-slate-800 border-slate-700": theme === "dark",
              "bg-white border-gray-200": theme === "light",
            })}
          >
            <DialogHeader>
              <DialogTitle className={textClasses}>Add New Patient</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* First Name */}
      <div className="space-y-2">
        <Label className={textClasses}>First Name</Label>
        <Input
          placeholder="First Name"
          value={newPatient.firstName || ""}
          onChange={(e) => setNewPatient({ ...newPatient, firstName: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>

      {/* Last Name */}
      <div className="space-y-2">
        <Label className={textClasses}>Last Name</Label>
        <Input
          placeholder="Last Name"
          value={newPatient.lastName || ""}
          onChange={(e) => setNewPatient({ ...newPatient, lastName: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label className={textClasses}>Email</Label>
        <Input
          placeholder="Email"
          value={newPatient.email || ""}
          onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <Label className={textClasses}>Phone</Label>
        <Input
          placeholder="Phone"
          value={newPatient.phone || ""}
          onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label className={textClasses}>Date of Birth</Label>
        <Input
          type="date"
          placeholder="Date of Birth"
          value={newPatient.dateOfBirth || ""}
          onChange={(e) => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <Label className={textClasses}>Gender</Label>
        <Select
          value={newPatient.gender || "other"}
          onValueChange={(value) => setNewPatient({ ...newPatient, gender: value })}
        >
          <SelectTrigger
            className={cn("transition-colors duration-300", {
              "glass-input": theme === "morpho",
              "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
              "bg-gray-50 border-gray-300": theme === "light",
            })}
          >
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Blood Type */}
      <div className="space-y-2">
        <Label className={textClasses}>Blood Type</Label>
        <Input
          placeholder="Blood Type (e.g., A+, O-)"
          value={newPatient.bloodType || ""}
          onChange={(e) => setNewPatient({ ...newPatient, bloodType: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>

      {/* Address Fields */}
      <div className="space-y-2">
        <Label className={textClasses}>Street</Label>
        <Input
          placeholder="Street"
          value={newPatient.addressStreet || ""}
          onChange={(e) => setNewPatient({ ...newPatient, addressStreet: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>
      <div className="space-y-2">
        <Label className={textClasses}>City</Label>
        <Input
          placeholder="City"
          value={newPatient.addressCity || ""}
          onChange={(e) => setNewPatient({ ...newPatient, addressCity: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>
      <div className="space-y-2">
        <Label className={textClasses}>State</Label>
        <Input
          placeholder="State"
          value={newPatient.addressState || ""}
          onChange={(e) => setNewPatient({ ...newPatient, addressState: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>
      <div className="space-y-2">
        <Label className={textClasses}>Postal Code</Label>
        <Input
          placeholder="Postal Code"
          value={newPatient.addressPostalCode || ""}
          onChange={(e) => setNewPatient({ ...newPatient, addressPostalCode: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>
      <div className="space-y-2">
        <Label className={textClasses}>Country</Label>
        <Input
          placeholder="Country"
          value={newPatient.addressCountry || ""}
          onChange={(e) => setNewPatient({ ...newPatient, addressCountry: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>

      {/* Emergency Contact Name */}
      <div className="space-y-2">
        <Label className={textClasses}>Emergency Contact Name</Label>
        <Input
          placeholder="Emergency Contact Name"
          value={newPatient.emergencyContactName || ""}
          onChange={(e) => setNewPatient({ ...newPatient, emergencyContactName: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>

      {/* Emergency Contact Phone */}
      <div className="space-y-2">
        <Label className={textClasses}>Emergency Contact Phone</Label>
        <Input
          placeholder="Emergency Contact Phone"
          value={newPatient.emergencyContactPhone || ""}
          onChange={(e) => setNewPatient({ ...newPatient, emergencyContactPhone: e.target.value })}
          className={cn("transition-colors duration-300", {
            "glass-input": theme === "morpho",
            "bg-slate-700/50 border-slate-600 text-white": theme === "dark",
            "bg-gray-50 border-gray-300": theme === "light",
          })}
        />
      </div>
    </div>

    {/* Buttons below form */}
    <div className="flex justify-end gap-4 mt-6">
      <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleAddPatient}>
        Add Patient
      </Button>
    </div>

          </DialogContent>
        </Dialog>

        {/* View Patient Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent
            className={cn("max-w-4xl max-h-[90vh] overflow-y-auto", {
              "glass-card": theme === "morpho",
              "bg-slate-800 border-slate-700": theme === "dark",
              "bg-white border-gray-200": theme === "light",
            })}
          >
            {selectedPatient && (
              <>
                <DialogHeader>
                  <DialogTitle className={cn("flex items-center gap-3", textClasses)}>{ console.log(selectedPatient.name)}
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={selectedPatient.avatar || "/placeholder.svg"} alt={selectedPatient.name} />
                      <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                        {selectedPatient.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        {selectedPatient.name}
                        <Badge className={getStatusColor(selectedPatient.status)}>{selectedPatient.status}</Badge>
                      </div>
                      <p className={cn("text-sm font-normal", mutedTextClasses)}>Patient ID: {selectedPatient.id}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className={cn("text-lg font-semibold", textClasses)}>Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-cyan-400" />
                        <span className={mutedTextClasses}>Age:</span>
                        <span className={textClasses}>{calculateAge(selectedPatient.dateOfBirth)} years old</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-green-400" />
                        <span className={mutedTextClasses}>Email:</span>
                        <span className={textClasses}>{selectedPatient.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-400" />
                        <span className={mutedTextClasses}>Phone:</span>
                        <span className={textClasses}>{selectedPatient.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className={mutedTextClasses}>Address:</span>
                        <span className={textClasses}>
                          {[
                            selectedPatient.address?.street,
                            selectedPatient.address?.city,
                            selectedPatient.address?.state,
                            selectedPatient.address?.postalCode,
                            selectedPatient.address?.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-red-400" />
                        <span className={mutedTextClasses}>Blood Type:</span>
                        <span className={textClasses}>{selectedPatient.bloodType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className={cn("text-lg font-semibold", textClasses)}>Medical Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className={mutedTextClasses}>Medical History:</span>
                        {Array.isArray(selectedPatient.medicalHistory) && selectedPatient.medicalHistory.length > 0 ? (
                          <ul className="mt-1 space-y-1 list-disc list-inside text-sm">
                            {selectedPatient.medicalHistory.map((entry, idx) => (
                              <li key={entry._id || idx} className={textClasses}>
                                <strong>{entry.condition}</strong> – {entry.treatment}{" "}
                                ({new Date(entry.diagnosisDate).toLocaleDateString("en-GB")})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={cn("mt-1 italic", mutedTextClasses)}>No medical history recorded.</p>
                        )}
                      </div>

                      <div>
                        <span className={mutedTextClasses}>Allergies:</span>
                        <p className={cn("mt-1", textClasses)}>{selectedPatient.allergies}</p>
                      </div>
                      <div>
                        <span className={mutedTextClasses}>Insurance Provider:</span>
                        <p className={cn("mt-1", textClasses)}>{selectedPatient.insuranceProvider}</p>
                      </div>
                      <div>
                        <span className={mutedTextClasses}>Insurance Number:</span>
                        <p className={cn("mt-1", textClasses)}>{selectedPatient.insuranceNumber}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className={cn("text-lg font-semibold", textClasses)}>Emergency Contact</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-orange-400" />
                        <span className={mutedTextClasses}>Contact:</span>
                        <span className={textClasses}>{selectedPatient.emergencyContact?.relationship}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-orange-400" />
                        <span className={mutedTextClasses}>Phone:</span>
                        <span className={textClasses}>{selectedPatient.emergencyContact?.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className={cn("text-lg font-semibold", textClasses)}>Visit History</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span className={mutedTextClasses}>Last Visit:</span>
                        <span className={textClasses}>{formatDate(selectedPatient?.lastVisit, { includeTime: true })}</span>
                      </div>
                      {selectedPatient.nextAppointment && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-400" />
                          <span className={mutedTextClasses}>Next Appointment:</span>
                          <span className={textClasses}>{selectedPatient.nextAppointment}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4 md:col-span-2">
                    <h3 className={cn("text-lg font-semibold", textClasses)}>Clinical Encounters</h3>

                    {loadingEncounters ? (
                      <p className={cn("italic", mutedTextClasses)}>Loading encounters…</p>
                    ) : encounters.length === 0 ? (
                      <p className={cn("italic", mutedTextClasses)}>No clinical encounters recorded.</p>
                    ) : (
                      <div className="border rounded-md divide-y divide-gray-200 dark:divide-slate-700">
                        {encounters.map((enc) => (
                          <div key={enc?._id} className="p-4 space-y-1">
                            <div className="flex justify-between items-center">
                              <span className={cn("font-semibold", textClasses)}>
                                {new Date(enc.createdAt).toLocaleString()}
                              </span>
                              <span className={cn("text-sm", mutedTextClasses)}>
                                {enc.diagnosis?.map((d: any) => d.condition).join(", ") || "No diagnosis"}
                              </span>
                            </div>
                            {enc?.chiefComplaints && enc.chiefComplaints?.length > 0 && (
                              <p className={cn("text-sm", textClasses)}>
                                <strong>Chief Complaints:</strong> {enc.chiefComplaints.join(", ")}
                              </p>
                            )}
                            {enc?.prescription && enc.prescription.medications?.length > 0 && (
                              <p className={cn("text-sm", textClasses)}>
                                <strong>Prescription:</strong>{" "}
                                {enc.prescription?.medications
                                  .map(
                                    (m: any) =>
                                      `${m.medication?.name || "Unnamed"} (${m.dosage}, ${m.frequency}, ${m.duration})`
                                  )
                                  .join("; ")}
                              </p>
                            )}
                            {enc.followUp?.date && (
                              <p className={cn("text-sm", textClasses)}>
                                <strong>Follow-up:</strong>{" "}
                                {new Date(enc.followUp.date).toLocaleDateString()} – {enc.followUp.instructions}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Patient Dialog */}
        <EditPatientDialog 
          isEditDialogOpen={isEditDialogOpen}
          setIsEditDialogOpen={setIsEditDialogOpen}
          selectedPatient={selectedPatient}
          setSelectedPatient={setSelectedPatient}
          handleEditPatient={handleEditPatient}
          theme={theme}
          textClasses={textClasses}
        />

        {selectedPatient && (
          <ClinicalEncountersModal
            patientId={selectedPatient.id}
            userRole={
              user?.role === "doctor" || user?.role === "nurse" || user?.role === "admin"
                ? user.role
                : "doctor"
            }
            encounters={encounters}
            encounter= {selectedEncounter}
            setEncounters={setEncounters}
            isOpen={isEncounterModalOpen}
            setIsOpen={setIsEncounterModalOpen}
          >
           {/*  <span className="text-blue-500 cursor-pointer underline">Open Encounter Form</span> */}
          </ClinicalEncountersModal>
        )}

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <Card className={cardClasses}>
            <CardContent className="p-12 text-center">
              <Users
                className={cn("w-16 h-16 mx-auto mb-4 transition-colors duration-300", {
                  "text-slate-400": theme === "dark" || theme === "morpho",
                  "text-gray-400": theme === "light",
                })}
              />
              <h3 className={cn("text-xl font-semibold mb-2 transition-colors duration-300", textClasses)}>
                No Patients Found
              </h3>
              <p className={cn("mb-4 transition-colors duration-300", mutedTextClasses)}>
                {searchTerm || filterStatus !== "all"
                  ? "No patients match your current search criteria."
                  : "Get started by adding your first patient to the system."}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <RoleBasedAccess requiredPermission="edit_patients" showError={false}>
                  <Button
                    onClick={() => setIsAddDialogOpen(true)}
                    className={cn("transition-all duration-300", {
                      "bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90":
                        theme === "dark" || theme === "morpho",
                      "bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90": theme === "light",
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Patient
                  </Button>
                </RoleBasedAccess>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
