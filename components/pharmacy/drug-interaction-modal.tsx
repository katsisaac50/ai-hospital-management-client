"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Brain, Loader } from "lucide-react"
import { checkInteractions } from "@/lib/drug-interactions"

interface DrugInteractionModalProps {
  open: boolean
  onClose: () => void
}

export default function DrugInteractionModal({ open, onClose }: DrugInteractionModalProps) {
  const [drugs, setDrugs] = useState<string[]>([""])
  const [loading, setLoading] = useState(false)
  const [interactions, setInteractions] = useState<string[]>([])
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;;

  const handleChange = (index: number, value: string) => {
    const updated = [...drugs]
    updated[index] = value
    setDrugs(updated)
  }

  const addField = () => setDrugs([...drugs, ""])

  const check = async () => {
    setLoading(true)
    setInteractions([])

    try {
      const cleaned = drugs.filter(d => d.trim() !== "")
      if (cleaned.length < 2) {
        toast.warning("Please enter at least 2 medications")
        setLoading(false)
        return
      }

      // 1. Run local static check first
      const localWarnings = checkInteractions(cleaned)

      if (localWarnings.length) {
        toast.error(`⚠️ Local interactions found:\n${localWarnings.join("\n")}`)
      }

      // 2. Call your backend API to get comprehensive interaction data
      const response = await fetch(`${API_URL}/v1/interactions/check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs: cleaned }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch interactions from backend")
      }

      const data = await response.json()

      // Assuming your backend returns { interactions: string[] }
      const backendWarnings = data.interactions || []

      // 3. Combine local and backend warnings, remove duplicates
      const allWarnings = Array.from(new Set([...localWarnings, ...backendWarnings]))

      if (allWarnings.length) {
        setInteractions(allWarnings)
        toast.error(`⚠️ Interactions found! See details below.`)
      } else {
        toast.success("✅ No known interactions found")
      }
    } catch (error) {
      console.error("Interaction check error:", error)
      toast.error("Error checking drug interactions")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Check Drug Interactions</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {drugs.map((drug, i) => (
            <Input
              key={i}
              value={drug}
              onChange={(e) => handleChange(i, e.target.value)}
              placeholder={`Drug ${i + 1}`}
            />
          ))}

          <Button onClick={addField} variant="outline">
            + Add another drug
          </Button>

          <Button
            onClick={check}
            disabled={loading}
            className="w-full justify-start bg-gradient-to-r from-green-500/20 to-cyan-500/20 border border-green-500/30 hover:bg-green-500/30"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Check Drug Interactions
              </>
            )}
          </Button>

          {/* Show combined interactions in UI */}
          {interactions.length > 0 && (
            <div className="mt-4 p-3 border border-red-400 rounded bg-red-50 text-red-700 whitespace-pre-line">
              {interactions.map((warn, idx) => (
                <p key={idx}>⚠️ {warn}</p>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
