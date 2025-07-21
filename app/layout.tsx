import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from "@/components/theme-provider"
// import  SyncStatus from "@/components/SyncStatus"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MedFlow - Hospital Management System",
  description: "AI-Powered Hospital Management Application with Role-Based Access Control",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider defaultTheme="dark" storageKey="hospital-ui-theme">
            {children}
            <Toaster />
            <ToastContainer />
            {/* <SyncStatus /> */}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
