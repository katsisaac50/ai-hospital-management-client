
import { createContext, useContext } from "react"

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  department?: string
  licenseNumber?: string
  specialization?: string
  avatar?: string
  isActive: boolean
  lastLogin?: string
  permissions: Permission[]
  createdAt: string
  updatedAt: string
}

export type UserRole =
  | "admin"
  | "doctor"
  | "nurse"
  | "lab_technician"
  | "pharmacist"
  | "receptionist"
  | "finance_manager"
  | "radiologist"
  | "therapist"

export type Permission =
  | "view_patients"
  | "edit_patients"
  | "delete_patients"
  | "view_appointments"
  | "schedule_appointments"
  | "cancel_appointments"
  | "view_medical_records"
  | "edit_medical_records"
  | "prescribe_medications"
  | "view_lab_results"
  | "create_lab_orders"
  | "edit_lab_results"
  | "view_pharmacy"
  | "dispense_medications"
  | "manage_inventory"
  | "view_financial"
  | "process_payments"
  | "generate_reports"
  | "manage_users"
  | "system_settings"
  | "view_analytics"
  | "emergency_access"

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    "view_patients",
    "edit_patients",
    "delete_patients",
    "view_appointments",
    "schedule_appointments",
    "cancel_appointments",
    "view_medical_records",
    "edit_medical_records",
    "prescribe_medications",
    "view_lab_results",
    "create_lab_orders",
    "edit_lab_results",
    "view_pharmacy",
    "dispense_medications",
    "manage_inventory",
    "view_financial",
    "process_payments",
    "generate_reports",
    "manage_users",
    "system_settings",
    "view_analytics",
    "emergency_access",
  ],
  doctor: [
    "view_patients",
    "edit_patients",
    "view_appointments",
    "schedule_appointments",
    "view_medical_records",
    "edit_medical_records",
    "prescribe_medications",
    "view_lab_results",
    "create_lab_orders",
    "view_pharmacy",
    "generate_reports",
    "view_analytics",
  ],
  nurse: [
    "view_patients",
    "edit_patients",
    "view_appointments",
    "schedule_appointments",
    "view_medical_records",
    "edit_medical_records",
    "view_lab_results",
    "view_pharmacy",
    "emergency_access",
  ],
  lab_technician: ["view_patients", "view_lab_results", "edit_lab_results", "create_lab_orders", "generate_reports"],
  pharmacist: ["view_patients", "view_pharmacy", "dispense_medications", "manage_inventory", "generate_reports"],
  receptionist: [
    "view_patients",
    "edit_patients",
    "view_appointments",
    "schedule_appointments",
    "cancel_appointments",
    "view_financial",
    "process_payments",
  ],
  finance_manager: ["view_patients", "view_financial", "process_payments", "generate_reports", "view_analytics"],
  radiologist: ["view_patients", "view_medical_records", "view_lab_results", "edit_lab_results", "generate_reports"],
  therapist: [
    "view_patients",
    "edit_patients",
    "view_appointments",
    "schedule_appointments",
    "view_medical_records",
    "edit_medical_records",
  ],
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "System Administrator",
  doctor: "Doctor",
  nurse: "Nurse",
  lab_technician: "Lab Technician",
  pharmacist: "Pharmacist",
  receptionist: "Receptionist",
  finance_manager: "Finance Manager",
  radiologist: "Radiologist",
  therapist: "Therapist",
}

// Mock current user - in real app this would come from authentication
export const getCurrentUser = (): User => {
  // This would typically come from your auth provider (Supabase, Auth0, etc.)
  const storedUser = localStorage.getItem("currentUser")
  if (storedUser) {
    return JSON.parse(storedUser)
  }

  // Default admin user for demo
  return {
    id: "user_001",
    email: "admin@hospital.com",
    name: "Dr. Sarah Wilson",
    role: "admin",
    department: "Administration",
    avatar: "/placeholder.svg?height=40&width=40",
    isActive: true,
    lastLogin: new Date().toISOString(),
    permissions: ROLE_PERMISSIONS.admin,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export const setCurrentUser = (user: User) => {
  localStorage.setItem("currentUser", JSON.stringify(user))
}

export const hasPermission = (user: User, permission: Permission): boolean => {
  return user.permissions.includes(permission)
}

export const hasAnyPermission = (user: User, permissions: Permission[]): boolean => {
  return permissions.some((permission) => user.permissions.includes(permission))
}

export const canAccessModule = (user: User, module: string): boolean => {
  switch (module) {
    case "patients":
      return hasPermission(user, "view_patients")
    case "appointments":
      return hasPermission(user, "view_appointments")
    case "doctors":
      return hasAnyPermission(user, ["manage_users", "view_analytics"])
    case "pharmacy":
      return hasPermission(user, "view_pharmacy")
    case "laboratory":
      return hasPermission(user, "view_lab_results")
    case "financial":
      return hasPermission(user, "view_financial")
    default:
      return false
  }
}

// Auth Context
export const AuthContext = createContext<{
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  switchRole: (role: UserRole) => void
}>({
  user: null,
  login: async () => {},
  logout: () => {},
  switchRole: () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}


// // "use client"
// "use client"

// import { createContext, useContext, useState, useEffect, useCallback } from "react"
// import { useRouter } from "next/navigation"
// import { toast } from "sonner"
// import { User, UserRole, Permission, ROLE_PERMISSIONS, ROLE_LABELS } from "./types" // Adjust import path

// interface AuthContextType {
// user: User | null
// token: string | null
// login: (email: string, password: string) => Promise<void>
// register: (data: {
// name: string
// email: string
// password: string
// role: UserRole
// department?: string
// licenseNumber?: string
// specialization?: string
// }) => Promise<void>
// logout: () => void
// switchRole: (role: UserRole) => void
// loading: boolean
// error: string | null
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
// const [user, setUser] = useState<User | null>(null)
// const [token, setToken] = useState<string | null>(null)
// const [loading, setLoading] = useState(false)
// const [error, setError] = useState<string | null>(null)
// const router = useRouter()

// // Initialize auth state
// useEffect(() => {
// const initializeAuth = () => {
// const storedToken = localStorage.getItem('authToken')
// const storedUser = localStorage.getItem('currentUser')

// if (storedToken && storedUser) {
// setToken(storedToken)
// setUser(JSON.parse(storedUser))
// }
// }
// initializeAuth()
// }, [])

// // API request helper
// const apiRequest = useCallback(async (url: string, method: string, body?: any) => {
// setLoading(true)
// setError(null)

// try {
// const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
// method,
// headers: {
//   'Content-Type': 'application/json',
//   ...(token && { Authorization: `Bearer ${token}` })
// },
// body: body ? JSON.stringify(body) : undefined
// })

// const data = await response.json()

// if (!response.ok) {
// throw new Error(data.message || 'Request failed')
// }

// return data
// } catch (err) {
// const message = err instanceof Error ? err.message : 'An unknown error occurred'
// setError(message)
// throw new Error(message)
// } finally {
// setLoading(false)
// }
// }, [token])

// // Registration function
// const register = useCallback(async (formData: {
// name: string
// email: string
// password: string
// role: UserRole
// department?: string
// licenseNumber?: string
// specialization?: string
// }) => {
// try {
// const data = await apiRequest('/api/auth/register', 'POST', {
// ...formData,
// permissions: ROLE_PERMISSIONS[formData.role] || []
// })

// // Store auth data
// localStorage.setItem('authToken', data.token)
// localStorage.setItem('currentUser', JSON.stringify(data.user))
// setToken(data.token)
// setUser(data.user)

// toast.success("Registration successful!", {
// description: `Welcome ${data.user.name} (${ROLE_LABELS[data.user.role as UserRole]})`
// })

// router.push('/dashboard')
// } catch (err) {
// toast.error("Registration failed", {
// description: err instanceof Error ? err.message : "An error occurred"
// })
// throw err
// }
// }, [apiRequest, router])

// // Login function
// const login = useCallback(async (email: string, password: string) => {
// try {
// const data = await apiRequest('/api/auth/login', 'POST', { email, password })

// localStorage.setItem('authToken', data.token)
// localStorage.setItem('currentUser', JSON.stringify(data.user))
// setToken(data.token)
// setUser(data.user)

// toast.success(`Welcome back, ${data.user.name}!`)
// router.push('/dashboard')
// } catch (err) {
// toast.error("Login failed", {
// description: err instanceof Error ? err.message : "Invalid credentials"
// })
// throw err
// }
// }, [apiRequest, router])

// // Logout function
// const logout = useCallback(() => {
// localStorage.removeItem('authToken')
// localStorage.removeItem('currentUser')
// setToken(null)
// setUser(null)
// router.push('/login')
// toast.info("You have been logged out")
// }, [router])

// // Role switching function (for demo purposes)
// const switchRole = useCallback((role: UserRole) => {
// if (!user) return

// const updatedUser = {
// ...user,
// role,
// permissions: ROLE_PERMISSIONS[role] || []
// }

// localStorage.setItem('currentUser', JSON.stringify(updatedUser))
// setUser(updatedUser)
// toast.info(`Switched to ${ROLE_LABELS[role]} role`)
// }, [user])

// // Check permissions (can be used throughout the app)
// const hasPermission = useCallback((permission: Permission): boolean => {
// return user?.permissions.includes(permission) || false
// }, [user])

// const value = {
// user,
// token,
// login,
// register,
// logout,
// switchRole,
// loading,
// error,
// hasPermission // Optional: expose permission check directly
// }

// return (
// <AuthContext.Provider value={value}>
// {children}
// </AuthContext.Provider>
// )
// }

// export const useAuth = () => {
// const context = useContext(AuthContext)
// if (!context) {
// throw new Error('useAuth must be used within an AuthProvider')
// }
// return context
// }

// export const getCurrentUser = (): User | null => {
// const storedUser = localStorage.getItem('currentUser')
// return storedUser ? JSON.parse(storedUser) : null
// }

// export const setCurrentUser = (user: User) => {
// localStorage.setItem('currentUser', JSON.stringify(user))
// }


