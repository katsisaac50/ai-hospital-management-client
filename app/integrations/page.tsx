import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IntegrationDashboard } from "@/components/integration-dashboard"
import { Zap } from "lucide-react"
import Link from "next/link"

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              System Integrations
            </h1>
            <p className="text-slate-400 mt-2">Manage external services and API connections</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Integration Dashboard */}
        <IntegrationDashboard />

        {/* Available Integrations */}
        <Card className="bg-slate-800/50 border-slate-700/50 mt-8">
          <CardHeader>
            <CardTitle className="text-cyan-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Available Integrations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  name: "Epic MyChart",
                  description: "Patient portal integration",
                  category: "Healthcare",
                  status: "Available",
                },
                {
                  name: "Cerner PowerChart",
                  description: "Electronic health records",
                  category: "Healthcare",
                  status: "Available",
                },
                {
                  name: "Allscripts",
                  description: "Practice management system",
                  category: "Healthcare",
                  status: "Available",
                },
                {
                  name: "PayPal",
                  description: "Alternative payment processing",
                  category: "Payment",
                  status: "Available",
                },
                {
                  name: "Twilio",
                  description: "SMS and voice communications",
                  category: "Communication",
                  status: "Available",
                },
                {
                  name: "SendGrid",
                  description: "Email delivery service",
                  category: "Communication",
                  status: "Available",
                },
              ].map((integration, index) => (
                <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-2">{integration.name}</h4>
                  <p className="text-slate-400 text-sm mb-3">{integration.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">{integration.category}</span>
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
