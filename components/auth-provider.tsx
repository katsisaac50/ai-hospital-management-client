"use client"

import { useState, useEffect, type ReactNode } from "react"
import { AuthContext, type User, type UserRole, getCurrentUser, setCurrentUser, ROLE_PERMISSIONS } from "@/lib/auth"
import { toast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation';

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const API_URL = process.env.API_BASE_URL || 'http://localhost:5000/api'
  const router = useRouter();

//   useEffect(() => {
//   const token = localStorage.getItem("token")
//   if (!token) {
//     setLoading(false)
//     return
//   }

//   const fetchUser = async () => {
//     try {
//       const res = await fetch("http://localhost:5000/api/v1/auth/me", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })
//       const user = await res.json()

//       const currentUser: User = {
//         id: user._id,
//         email: user.email,
//         name: user.name,
//         role: user.role,
//         department: user.department,
//         avatar: user.avatar,
//         isActive: true,
//         lastLogin: new Date().toISOString(),
//         permissions: ROLE_PERMISSIONS[user.role],
//         createdAt: user.createdAt,
//         updatedAt: user.updatedAt,
//       }

//       setUser(currentUser)
//       setCurrentUser(currentUser)
//     } catch {
//       localStorage.removeItem("token")
//     } finally {
//       setLoading(false)
//     }
//   }

//   fetchUser()
// }, [])


  useEffect(() => {
    // Initialize user from localStorage or set default
    const currentUser = getCurrentUser()
    if (currentUser) {
    // Optionally validate token here or ping /auth/me endpoint
    setUser(currentUser);
  }
    setLoading(false)
  }, [])

    const register = async (
  name: string,
  email: string,
  password: string,
  role: UserRole,
  department?: string,
  licenseNumber?: string,
  specialization?: string
) => {
  try {
    const res = await fetch(`${API_URL}/v1/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        password,
        role,
        department: role === "doctor" || role === "radiologist" ? department : undefined,
        licenseNumber: role === "doctor" ? licenseNumber : undefined,
        specialization: role === "doctor" ? specialization : undefined,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Registration failed");
    }

    const result = await res.json();
    const { token, data: userData } = result;

    // Save token and user data
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(userData));

    const fullUser: User = {
      ...userData,
      permissions: ROLE_PERMISSIONS[userData.role as UserRole],
      isActive: true,
      lastLogin: new Date().toISOString(),
      avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
    };

    setUser(fullUser);
    setCurrentUser(fullUser);

    toast({
      title: "Registration Successful",
      description: `Welcome to the system, ${name}!`,
    });

    return fullUser;
  } catch (error) {
    toast({
      title: "Registration Failed",
      description: (error as Error).message || "Could not create account",
      variant: "destructive",
    });
    throw error;
  }
};


  const login = async (email: string, password: string) => {
  try {
    const res = await fetch(`${API_URL}/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      throw new Error("Invalid email or password");
    }

    const result = await res.json();
    const { token, data: userData } = result;

    // Save token
    localStorage.setItem("token", token);
    localStorage.setItem("currentUser", JSON.stringify(userData));

    // Enrich with permissions
    const fullUser: User = {
      ...userData,
      permissions: ROLE_PERMISSIONS[userData.role as UserRole],
      isActive: true,
      lastLogin: new Date().toISOString(),
      avatar: userData.avatar || "/placeholder.svg?height=40&width=40",
      createdAt: userData.createdAt || new Date().toISOString(),
      updatedAt: userData.updatedAt || new Date().toISOString(),
    };

    setUser(fullUser);
    setCurrentUser(fullUser);

    toast({
      title: "Login Successful",
      description: `Welcome back, ${userData.name || userData.email}!`,
    });
  } catch (error) {
    toast({
      title: "Login Failed",
      description: (error as Error).message || "Invalid credentials",
      variant: "destructive",
    });
    throw error;
  }
};


  const logout = () => {
    setUser(null)
  localStorage.removeItem("currentUser")
  localStorage.removeItem("token")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    })
    
  // router.push("/login");

  }

  const switchRole = (role: UserRole) => {
    if (!user) return

    const updatedUser: User = {
      ...user,
      role,
      permissions: ROLE_PERMISSIONS[role],
      updatedAt: new Date().toISOString(),
    }

    setUser(updatedUser)
    setCurrentUser(updatedUser)

    toast({
      title: "Role Switched",
      description: `You are now logged in as ${role.replace("_", " ")}`,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ user, login, logout, switchRole, register }}>{children}</AuthContext.Provider>
}