"use client"

import type { ReactNode } from "react"
import { useAuth, type Permission, hasPermission, hasAnyPermission } from "@/lib/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, AlertTriangle } from "lucide-react"

interface RoleBasedAccessProps {
  children: ReactNode
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  requireAll?: boolean
  fallback?: ReactNode
  showError?: boolean
}

export function RoleBasedAccess({
  children,
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  fallback,
  showError = true,
}: RoleBasedAccessProps) {
  const { user } = useAuth()

  if (!user) {
    return showError ? (
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6 text-center">
          <Shield className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Authentication Required</h3>
          <p className="text-slate-400">Please log in to access this content.</p>
        </CardContent>
      </Card>
    ) : null
  }

  // Check single permission
  if (requiredPermission && !hasPermission(user, requiredPermission)) {
    return (
      fallback ||
      (showError ? (
        <Card className="bg-slate-800/50 border-red-500/20 border">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
            <p className="text-slate-400">You don't have permission to access this content.</p>
            <p className="text-sm text-red-400 mt-2">Required permission: {requiredPermission.replace("_", " ")}</p>
          </CardContent>
        </Card>
      ) : null)
    )
  }

  // Check multiple permissions
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? requiredPermissions.every((permission) => hasPermission(user, permission))
      : hasAnyPermission(user, requiredPermissions)

    if (!hasAccess) {
      return (
        fallback ||
        (showError ? (
          <Card className="bg-slate-800/50 border-red-500/20 border">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Access Denied</h3>
              <p className="text-slate-400">You don't have the required permissions to access this content.</p>
              <p className="text-sm text-red-400 mt-2">
                Required: {requireAll ? "All of" : "Any of"} [{requiredPermissions.join(", ")}]
              </p>
            </CardContent>
          </Card>
        ) : null)
      )
    }
  }

  return <>{children}</>
}

// Convenience components for common use cases
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess requiredPermission="system_settings" fallback={fallback}>
      {children}
    </RoleBasedAccess>
  )
}

export function DoctorOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess requiredPermission="prescribe_medications" fallback={fallback}>
      {children}
    </RoleBasedAccess>
  )
}

export function MedicalStaffOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  return (
    <RoleBasedAccess requiredPermissions={["view_medical_records", "edit_medical_records"]} fallback={fallback}>
      {children}
    </RoleBasedAccess>
  )
}
