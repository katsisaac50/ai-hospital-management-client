"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const claims = [
    {
      id: "CLM001",
      patientName: "Sarah Johnson",
      provider: "BlueCross",
      amount: 450.75,
      status: "Approved",
      submittedDate: "2024-01-10",
      processedDate: "2024-01-15",
    },
    {
      id: "CLM002",
      patientName: "Michael Chen",
      provider: "Aetna",
      amount: 1250.0,
      status: "Under Review",
      submittedDate: "2024-01-12",
      processedDate: null,
    },
    {
      id: "CLM003",
      patientName: "Emily Rodriguez",
      provider: "UnitedHealth",
      amount: 890.25,
      status: "Denied",
      submittedDate: "2024-01-08",
      processedDate: "2024-01-14",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Under Review":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Denied":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

export function InsuranceClaims() {

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Insurance Claims</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold">{claim.patientName}</h4>
                  <p className="text-slate-400 text-sm">
                    Claim ID: {claim.id} • {claim.provider}
                  </p>
                </div>
                <Badge className={getStatusColor(claim.status)}>{claim.status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Amount</p>
                  <p className="text-white font-semibold">${claim.amount.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-slate-400">Submitted</p>
                  <p className="text-white">{claim.submittedDate}</p>
                </div>
                <div>
                  <p className="text-slate-400">Processed</p>
                  <p className="text-white">{claim.processedDate || "Pending"}</p>
                </div>
                <div>
                  <p className="text-slate-400">Provider</p>
                  <p className="text-white">{claim.provider}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}