"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth, type UserRole, ROLE_LABELS } from "@/lib/auth"
import { User, Shield, LogOut, Settings, Clock, Building, Mail, RefreshCw } from "lucide-react"

export function UserProfile() {
  const { user, logout, switchRole } = useAuth()
  const [showRoleSwitch, setShowRoleSwitch] = useState(false)

  if (!user) return null

  const handleRoleSwitch = (newRole: UserRole) => {
    switchRole(newRole)
    setShowRoleSwitch(false)
  }

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "doctor":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "nurse":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "lab_technician":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "pharmacist":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "receptionist":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      case "finance_manager":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-cyan-400 flex items-center gap-2">
          <User className="w-5 h-5" />
          User Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-white">{user.name}</h3>
            <p className="text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {user.email}
            </p>
            {user.department && (
              <p className="text-slate-400 flex items-center gap-2">
                <Building className="w-4 h-4" />
                {user.department}
              </p>
            )}
          </div>
        </div>

        {/* Role and Status */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Role:</span>
            <Badge className={getRoleColor(user.role)}>
              <Shield className="w-3 h-3 mr-1" />
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Status:</span>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>

          {user.lastLogin && (
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Last Login:</span>
              <span className="text-white text-sm flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(user.lastLogin).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Permissions */}
        <div className="space-y-3">
          <h4 className="text-slate-300 font-medium">Permissions</h4>
          <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {user.permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="text-xs border-slate-600 text-slate-300">
                {permission.replace("_", " ")}
              </Badge>
            ))}
          </div>
        </div>

        {/* Role Switch (Demo Feature) */}
        <div className="space-y-3 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Demo: Switch Role</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRoleSwitch(!showRoleSwitch)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Switch
            </Button>
          </div>

          {showRoleSwitch && (
            <Select onValueChange={handleRoleSwitch}>
              <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                <SelectValue placeholder="Select role to switch to" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {Object.entries(ROLE_LABELS).map(([role, label]) => (
                  <SelectItem key={role} value={role} disabled={role === user.role}>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(role as UserRole)} variant="outline">
                        {label}
                      </Badge>
                      {role === user.role && <span className="text-xs">(Current)</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-slate-700">
          <Button variant="outline" size="sm" className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="flex-1 border-red-600 text-red-400 hover:bg-red-700/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
