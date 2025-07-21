"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth"
import { Shield, User, Lock, Hospital } from "lucide-react"
import { useRouter } from 'next/navigation';

const DEMO_ACCOUNTS = [
  {
    email: "admin@hospital.com",
    password: "admin123",
    role: "System Administrator",
    description: "Full system access",
  },
  {
    email: "doctor@hospital.com",
    password: "doctor123",
    role: "Doctor",
    description: "Patient care and medical records",
  },
  { email: "nurse@hospital.com", password: "nurse123", role: "Nurse", description: "Patient care and basic records" },
  {
    email: "lab@hospital.com",
    password: "lab123",
    role: "Lab Technician",
    description: "Laboratory tests and results",
  },
  { email: "pharmacy@hospital.com", password: "pharmacy123", role: "Pharmacist", description: "Medication management" },
  {
    email: "receptionist@hospital.com",
    password: "reception123",
    role: "Receptionist",
    description: "Appointments and basic patient info",
  },
  {
    email: "finance@hospital.com",
    password: "finance123",
    role: "Finance Manager",
    description: "Financial operations and reports",
  },
]

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [selectedDemo, setSelectedDemo] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log(password)
      await login(email, password)
      router.push("/")
    } catch (error) {
      console.error("Login failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Hospital className="w-12 h-12 text-cyan-400 mr-3" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              MedFlow
            </h1>
          </div>
          <p className="text-slate-400">Hospital Management System</p>
        </div>

        {/* Login Form */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sign In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">
                  Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-purple-400 text-sm">Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="text-slate-300 text-sm">Quick Login</Label>
              <Select value={selectedDemo} onValueChange={setSelectedDemo}>
                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                  <SelectValue placeholder="Select a demo account" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {DEMO_ACCOUNTS.map((account, index) => (
                    <SelectItem key={index} value={account.email}>
                      <div className="flex flex-col">
                        <span className="font-medium">{account.role}</span>
                        <span className="text-xs text-slate-400">{account.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDemo && (
              <Button
                onClick={() => {
                  const account = DEMO_ACCOUNTS.find((acc) => acc.email === selectedDemo)
                  if (account) {
                    handleDemoLogin(account.email, account.password)
                  }
                }}
                variant="outline"
                className="w-full border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Use Demo Account
              </Button>
            )}

            <div className="grid grid-cols-1 gap-2 mt-4">
              {DEMO_ACCOUNTS.slice(0, 3).map((account, index) => (
                <Button
                  key={index}
                  onClick={() => handleDemoLogin(account.email, account.password)}
                  variant="ghost"
                  size="sm"
                  className="justify-start text-xs text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <span className="font-medium mr-2">{account.role}:</span>
                  {account.email}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
