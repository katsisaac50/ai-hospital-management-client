"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Brain, Loader2, MessageSquare, Pill, Stethoscope, FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function EnhancedAIAssistant() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [response, setResponse] = useState("")
  const [activeMode, setActiveMode] = useState<"diagnosis" | "medication" | "notes">("diagnosis")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || isLoading) return

    setIsLoading(true)
    setResponse("")

    // Simulate AI response with a delay
    setTimeout(() => {
      let simulatedResponse = ""

      switch (activeMode) {
        case "diagnosis":
          simulatedResponse =
            "Based on the symptoms described, the patient may be experiencing acute sinusitis. Recommend further examination of nasal passages and possibly a CT scan to confirm diagnosis. Differential diagnoses to consider: allergic rhinitis, upper respiratory infection, or migraine."
          break
        case "medication":
          simulatedResponse =
            "No contraindications found for prescribing amoxicillin with the patient's current medication regimen. However, note that the patient has a documented penicillin allergy (moderate severity). Consider azithromycin as an alternative. Recommended dosage: 500mg once daily for 3 days."
          break
        case "notes":
          simulatedResponse =
            "I've generated clinical notes based on your dictation:\n\nPatient presents with 3-day history of nasal congestion, facial pain, and yellow-green nasal discharge. Temperature 99.8°F. No cough or sore throat reported. Nasal mucosa appears erythematous with purulent discharge visible. Frontal and maxillary sinuses tender to palpation. Assessment: Acute bacterial sinusitis. Plan: Prescribed antibiotics, saline nasal spray, and follow-up in 10 days if symptoms persist."
          break
      }

      setResponse(simulatedResponse)
      setIsLoading(false)
    }, 1500)
  }

  const modes = [
    {
      id: "diagnosis",
      name: "Diagnostic Assistant",
      icon: Stethoscope,
      description: "AI-powered differential diagnosis suggestions",
    },
    {
      id: "medication",
      name: "Medication Advisor",
      icon: Pill,
      description: "Drug interactions and dosage recommendations",
    },
    {
      id: "notes",
      name: "Clinical Notes",
      icon: FileText,
      description: "Generate and summarize clinical documentation",
    },
  ]

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-cyan-400">AI Medical Assistant</CardTitle>
              <p className="text-sm text-slate-400">Powered by advanced medical AI</p>
            </div>
          </div>
          <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Enhanced</Badge>
        </div>
      </CardHeader>

      <CardContent>
        {/* Mode Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = activeMode === mode.id
            return (
              <Button
                key={mode.id}
                variant={isActive ? "default" : "outline"}
                className={`flex items-center gap-2 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }`}
                onClick={() => setActiveMode(mode.id as any)}
              >
                <Icon className="w-4 h-4" />
                {mode.name}
              </Button>
            )
          })}
        </div>

        {/* Current Mode Description */}
        <p className="text-sm text-slate-400 mb-4">{modes.find((m) => m.id === activeMode)?.description}</p>

        {/* Query Input */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder={
              activeMode === "diagnosis"
                ? "Describe patient symptoms and medical history..."
                : activeMode === "medication"
                  ? "Enter current medications and proposed prescription..."
                  : "Dictate or summarize your clinical notes..."
            }
            className="bg-slate-700/50 border-slate-600 resize-none min-h-[100px]"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              {activeMode === "diagnosis"
                ? "For medical reference only. Not a substitute for clinical judgment."
                : activeMode === "medication"
                  ? "Always verify drug interactions with official sources."
                  : "Review AI-generated notes for accuracy before finalizing."}
            </p>
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Get Response
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Response Area */}
        {response && (
          <div className="mt-4 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <p className="font-medium text-cyan-400">AI Response:</p>
            </div>
            <p className="text-slate-300 whitespace-pre-line">{response}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
