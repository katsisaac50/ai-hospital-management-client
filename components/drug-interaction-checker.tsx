"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Brain, AlertTriangle, CheckCircle, Search, Plus, X, Zap } from "lucide-react"

export function DrugInteractionChecker() {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [interactions, setInteractions] = useState<any[]>([])

  const availableDrugs = [
    "Warfarin",
    "Aspirin",
    "Metformin",
    "Lisinopril",
    "Atorvastatin",
    "Omeprazole",
    "Amoxicillin",
    "Ibuprofen",
    "Acetaminophen",
    "Prednisone",
    "Furosemide",
    "Digoxin",
    "Phenytoin",
    "Carbamazepine",
    "Lithium",
  ]

  const filteredDrugs = availableDrugs.filter(
    (drug) => drug.toLowerCase().includes(searchTerm.toLowerCase()) && !selectedDrugs.includes(drug),
  )

  const addDrug = (drug: string) => {
    if (!selectedDrugs.includes(drug)) {
      setSelectedDrugs([...selectedDrugs, drug])
      setSearchTerm("")
    }
  }

  const removeDrug = (drug: string) => {
    setSelectedDrugs(selectedDrugs.filter((d) => d !== drug))
  }

  const checkInteractions = async () => {
    if (selectedDrugs.length < 2) return

    setIsChecking(true)

    // Simulate AI processing
    setTimeout(() => {
      const mockInteractions = [
        {
          drugs: ["Warfarin", "Aspirin"],
          severity: "Major",
          description: "Increased risk of bleeding when used together",
          recommendation: "Monitor INR closely and consider dose adjustment",
          mechanism: "Both drugs affect blood clotting mechanisms",
        },
        {
          drugs: ["Lisinopril", "Ibuprofen"],
          severity: "Moderate",
          description: "NSAIDs may reduce the effectiveness of ACE inhibitors",
          recommendation: "Monitor blood pressure and kidney function",
          mechanism: "NSAIDs can counteract the blood pressure lowering effects",
        },
      ]

      const relevantInteractions = mockInteractions.filter((interaction) =>
        interaction.drugs.every((drug) => selectedDrugs.includes(drug)),
      )

      setInteractions(relevantInteractions)
      setIsChecking(false)
    }, 2000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Major":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Moderate":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Minor":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* AI Drug Interaction Checker Header */}
      <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-cyan-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Drug Interaction Checker
              </CardTitle>
              <p className="text-sm text-slate-400">Advanced AI-powered drug interaction analysis</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drug Selection */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">Select Medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search for medications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>

            {/* Search Results */}
            {searchTerm && filteredDrugs.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                {filteredDrugs.map((drug) => (
                  <Button
                    key={drug}
                    variant="ghost"
                    className="w-full justify-start text-slate-300 hover:bg-slate-700/50"
                    onClick={() => addDrug(drug)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {drug}
                  </Button>
                ))}
              </div>
            )}

            {/* Selected Drugs */}
            <div>
              <p className="text-sm text-slate-400 mb-2">Selected Medications:</p>
              <div className="flex flex-wrap gap-2">
                {selectedDrugs.map((drug) => (
                  <Badge key={drug} variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30">
                    {drug}
                    <button onClick={() => removeDrug(drug)} className="ml-2 hover:text-red-400">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Check Button */}
            <Button
              onClick={checkInteractions}
              disabled={selectedDrugs.length < 2 || isChecking}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
            >
              {isChecking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Analyzing Interactions...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Check Interactions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-cyan-400">Interaction Results</CardTitle>
          </CardHeader>
          <CardContent>
            {interactions.length === 0 && selectedDrugs.length >= 2 && !isChecking && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-green-400 font-semibold">No Major Interactions Found</p>
                <p className="text-slate-400 text-sm">The selected medications appear to be safe to use together</p>
              </div>
            )}

            {interactions.length === 0 && selectedDrugs.length < 2 && (
              <div className="text-center py-8">
                <Brain className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <p className="text-slate-400">Select at least 2 medications to check for interactions</p>
              </div>
            )}

            {interactions.length > 0 && (
              <div className="space-y-4">
                {interactions.map((interaction, index) => (
                  <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-white font-semibold">{interaction.drugs.join(" + ")}</h4>
                        <p className="text-slate-400 text-sm">{interaction.description}</p>
                      </div>
                      <Badge className={getSeverityColor(interaction.severity)}>
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {interaction.severity}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-slate-400">Mechanism:</span>
                        <p className="text-slate-300">{interaction.mechanism}</p>
                      </div>
                      <div>
                        <span className="text-slate-400">Recommendation:</span>
                        <p className="text-slate-300">{interaction.recommendation}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
