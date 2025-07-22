"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const reports = [
    {
      title: "Monthly Revenue Report",
      description: "Comprehensive revenue analysis for January 2024",
      type: "Revenue",
      date: "2024-01-31",
      status: "Ready",
    },
    {
      title: "Insurance Claims Summary",
      description: "Summary of all insurance claims processed this month",
      type: "Claims",
      date: "2024-01-31",
      status: "Generating",
    },
    {
      title: "Outstanding Payments Report",
      description: "List of all overdue and pending payments",
      type: "Collections",
      date: "2024-01-31",
      status: "Ready",
    },
  ]

export function FinancialReports() {

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Financial Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.map((report, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{report.title}</h4>
                  <p className="text-slate-400 text-sm mb-2">{report.description}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>Type: {report.type}</span>
                    <span>Date: {report.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      report.status === "Ready"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {report.status}
                  </Badge>
                  {report.status === "Ready" && (
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}