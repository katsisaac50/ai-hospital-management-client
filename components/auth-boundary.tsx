"use client"
import { ReactNode, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from "@/components/login-form"

export function AuthBoundary({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)
  }, [])

  if (isAuthenticated === null) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <>{children}</>
}