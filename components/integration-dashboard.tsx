"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Database,
  CreditCard,
  Brain,
  Stethoscope,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertTriangle,
  Clock,
  Zap,
  Settings,
  Activity,
} from "lucide-react"

interface Integration {
  id: string
  name: string
  type: "database" | "payment" | "ai" | "healthcare" | "external"
  status: "connected" | "disconnected" | "error" | "syncing"
  lastSync?: string
  description: string
  icon: any
}

export function IntegrationDashboard() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "supabase",
      name: "Supabase Database",
      type: "database",
      status: "connected",
      lastSync: "2 minutes ago",
      description: "Primary database for patient records and hospital data",
      icon: Database,
    },
    {
      id: "stripe",
      name: "Stripe Payments",
      type: "payment",
      status: "connected",
      lastSync: "5 minutes ago",
      description: "Payment processing for invoices and billing",
      icon: CreditCard,
    },
    {
      id: "openai",
      name: "OpenAI GPT-4",
      type: "ai",
      status: "connected",
      lastSync: "1 minute ago",
      description: "AI-powered medical assistance and diagnosis support",
      icon: Brain,
    },
    {
      id: "fhir",
      name: "FHIR API",
      type: "healthcare",
      status: "connected",
      lastSync: "10 minutes ago",
      description: "Healthcare data interoperability standard",
      icon: Stethoscope,
    },
    {
      id: "hl7",
      name: "HL7 Messaging",
      type: "healthcare",
      status: "syncing",
      lastSync: "Syncing...",
      description: "Healthcare message exchange protocol",
      icon: Activity,
    },
    {
      id: "lab-system",
      name: "Laboratory System",
      type: "external",
      status: "error",
      lastSync: "2 hours ago",
      description: "External laboratory information system",
      icon: Settings,
    },
  ])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "disconnected":
        return <WifiOff className="w-4 h-4 text-red-400" />
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-400" />
      case "syncing":
        return <Clock className="w-4 h-4 text-yellow-400" />
      default:
        return <Wifi className="w-4 h-4 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "disconnected":
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "syncing":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const handleTestConnection = async (integrationId: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === integrationId ? { ...integration, status: "syncing" as const } : integration,
      ),
    )

    // Simulate connection test
    setTimeout(() => {
      setIntegrations((prev) =>
        prev.map((integration) =>
          integration.id === integrationId
            ? {
                ...integration,
                status: "connected" as const,
                lastSync: "Just now",
              }
            : integration,
        ),
      )
    }, 2000)
  }

  const groupedIntegrations = integrations.reduce(
    (acc, integration) => {
      if (!acc[integration.type]) {
        acc[integration.type] = []
      }
      acc[integration.type].push(integration)
      return acc
    },
    {} as Record<string, Integration[]>,
  )

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            System Integrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-400">Connected</span>
              </div>
              <p className="text-2xl font-bold text-green-400">
                {integrations.filter((i) => i.status === "connected").length}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-slate-400">Syncing</span>
              </div>
              <p className="text-2xl font-bold text-yellow-400">
                {integrations.filter((i) => i.status === "syncing").length}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-slate-400">Errors</span>
              </div>
              <p className="text-2xl font-bold text-red-400">
                {integrations.filter((i) => i.status === "error").length}
              </p>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <WifiOff className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-400">Offline</span>
              </div>
              <p className="text-2xl font-bold text-slate-400">
                {integrations.filter((i) => i.status === "disconnected").length}
              </p>
            </div>
          </div>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="bg-slate-700/50">
              <TabsTrigger value="all">All Integrations</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
              <TabsTrigger value="ai">AI Services</TabsTrigger>
              <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {integrations.map((integration) => {
                const IconComponent = integration.icon
                return (
                  <div key={integration.id} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-8 h-8 text-cyan-400" />
                        <div>
                          <h4 className="text-white font-semibold">{integration.name}</h4>
                          <p className="text-slate-400 text-sm">{integration.description}</p>
                          <p className="text-slate-500 text-xs">Last sync: {integration.lastSync}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(integration.status)}>
                          {getStatusIcon(integration.status)}
                          <span className="ml-1 capitalize">{integration.status}</span>
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestConnection(integration.id)}
                          disabled={integration.status === "syncing"}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          {integration.status === "syncing" ? "Testing..." : "Test"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </TabsContent>

            {Object.entries(groupedIntegrations).map(([type, typeIntegrations]) => (
              <TabsContent key={type} value={type} className="space-y-4">
                {typeIntegrations.map((integration) => {
                  const IconComponent = integration.icon
                  return (
                    <div key={integration.id} className="bg-slate-700/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-8 h-8 text-cyan-400" />
                          <div>
                            <h4 className="text-white font-semibold">{integration.name}</h4>
                            <p className="text-slate-400 text-sm">{integration.description}</p>
                            <p className="text-slate-500 text-xs">Last sync: {integration.lastSync}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={getStatusColor(integration.status)}>
                            {getStatusIcon(integration.status)}
                            <span className="ml-1 capitalize">{integration.status}</span>
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTestConnection(integration.id)}
                            disabled={integration.status === "syncing"}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                          >
                            {integration.status === "syncing" ? "Testing..." : "Test"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
