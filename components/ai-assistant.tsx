"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Brain, Send, Sparkles, MessageCircle } from "lucide-react"

export function AIAssistant() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const suggestions = [
    "Analyze patient symptoms",
    "Schedule optimization",
    "Drug interaction check",
    "Diagnosis assistance",
  ]

  const handleSendMessage = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    // Simulate AI processing
    setTimeout(() => {
      setIsLoading(false)
      setMessage("")
    }, 2000)
  }

  return (
    <Card className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-cyan-500/30">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-500">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Medical Assistant
              </CardTitle>
              <p className="text-sm text-slate-400">Powered by advanced medical AI</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-cyan-400 hover:text-cyan-300"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            {isExpanded ? "Minimize" : "Expand"}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <Badge
                key={suggestion}
                variant="secondary"
                className="cursor-pointer hover:bg-cyan-500/20 bg-slate-700/50 text-cyan-300 border-cyan-500/30"
                onClick={() => setMessage(suggestion)}
              >
                <Sparkles className="w-3 h-3 mr-1" />
                {suggestion}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask the AI assistant anything..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI can help with medical queries, scheduling, and administrative tasks
          </div>
        </CardContent>
      )}
    </Card>
  )
}
