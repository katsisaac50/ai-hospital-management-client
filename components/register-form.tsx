"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth"
import { User, Lock, Briefcase, ClipboardSignature, Stethoscope, FlaskConical, Pill, Calendar, Landmark, Radio, Armchair } from "lucide-react"
import { UserRole, ROLE_LABELS } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function RegisterForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "doctor" as UserRole,
    department: "",
    licenseNumber: "",
    specialization: ""
  })
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { register } = useAuth()
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleRoleChange = (value: UserRole) => {
    setFormData(prev => ({ 
      ...prev, 
      role: value,
      department: value === "doctor" || value === "radiologist" ? prev.department : "",
      licenseNumber: value === "doctor" ? prev.licenseNumber : "",
      specialization: value === "doctor" ? prev.specialization : ""
    }))
    // Clear role-related errors when role changes
    setErrors(prev => ({
      ...prev,
      department: "",
      licenseNumber: "",
      specialization: ""
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format"
    }
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }
    
    // Role-specific validations
    if ((formData.role === "doctor" || formData.role === "radiologist") && !formData.department.trim()) {
      newErrors.department = "Department is required"
    }
    if (formData.role === "doctor") {
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = "License number is required"
      if (!formData.specialization.trim()) newErrors.specialization = "Specialization is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
    // Focus on first error field
    const firstErrorField = Object.keys(errors)[0];
    const element = document.getElementsByName(firstErrorField)[0];
    if (element) element.focus();
    return;
  }
    
    setLoading(true)
    setErrors({})

    try {
      // Prepare the data to send to the backend
      const registrationData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.department && { department: formData.department }),
        ...(formData.licenseNumber && { licenseNumber: formData.licenseNumber }),
        ...(formData.specialization && { specialization: formData.specialization })
      }

      await register(registrationData)
      
      toast.success("Registration successful!", {
        description: "Your account has been created."
      })
      
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Registration failed:", error)
      
      if (error.response?.data?.errors) {
        // Handle backend validation errors
        setErrors(error.response.data.errors)
      } else {
        toast.error("Registration failed", {
          description: error.message || "An error occurred during registration"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "doctor": return <Stethoscope className="w-4 h-4" />
      case "nurse": return <ClipboardSignature className="w-4 h-4" />
      case "lab_technician": return <FlaskConical className="w-4 h-4" />
      case "pharmacist": return <Pill className="w-4 h-4" />
      case "receptionist": return <Calendar className="w-4 h-4" />
      case "finance_manager": return <Landmark className="w-4 h-4" />
      case "radiologist": return <Radio className="w-4 h-4" />
      case "therapist": return <Armchair className="w-4 h-4" />
      default: return <Briefcase className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Staff Registration
          </h1>
          <p className="text-slate-400">Create a new hospital staff account</p>
        </div>

        {/* Registration Form */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <ClipboardSignature className="w-5 h-5" />
              New Staff Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-300">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`pl-10 bg-slate-700/50 border-slate-600 text-white ${errors.name ? "border-red-500" : ""}`}
                    placeholder="Dr. John Smith"
                  />
                </div>
                {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`pl-10 bg-slate-700/50 border-slate-600 text-white ${errors.email ? "border-red-500" : ""}`}
                    placeholder="user@hospital.com"
                  />
                </div>
                {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`pl-10 bg-slate-700/50 border-slate-600 text-white ${errors.password ? "border-red-500" : ""}`}
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-300">
                  Staff Role
                </Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select staff role" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {Object.entries(ROLE_LABELS).map(([role, label]) => (
                      <SelectItem key={role} value={role}>
                        <div className="flex items-center gap-2">
                          {getRoleIcon(role as UserRole)}
                          {label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role-Specific Fields */}
              {(formData.role === "doctor" || formData.role === "radiologist") && (
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-slate-300">
                    Department
                  </Label>
                  <Input
                    id="department"
                    name="department"
                    type="text"
                    value={formData.department}
                    onChange={handleChange}
                    className={`bg-slate-700/50 border-slate-600 text-white ${errors.department ? "border-red-500" : ""}`}
                    placeholder="Cardiology, Neurology, etc."
                  />
                  {errors.department && <p className="text-red-400 text-sm">{errors.department}</p>}
                </div>
              )}

              {formData.role === "doctor" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber" className="text-slate-300">
                      Medical License Number
                    </Label>
                    <Input
                      id="licenseNumber"
                      name="licenseNumber"
                      type="text"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className={`bg-slate-700/50 border-slate-600 text-white ${errors.licenseNumber ? "border-red-500" : ""}`}
                      placeholder="MD-123456"
                    />
                    {errors.licenseNumber && <p className="text-red-400 text-sm">{errors.licenseNumber}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialization" className="text-slate-300">
                      Specialization
                    </Label>
                    <Input
                      id="specialization"
                      name="specialization"
                      type="text"
                      value={formData.specialization}
                      onChange={handleChange}
                      className={`bg-slate-700/50 border-slate-600 text-white ${errors.specialization ? "border-red-500" : ""}`}
                      placeholder="Cardiologist, Pediatrician, etc."
                    />
                    {errors.specialization && <p className="text-red-400 text-sm">{errors.specialization}</p>}
                  </div>
                </>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </>
                ) : "Complete Registration"}
              </Button>
            </form>

            <div className="text-center text-sm text-slate-400 mt-4">
              Already have an account?{" "}
              <a href="/login" className="text-cyan-400 hover:underline">
                Sign in here
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}