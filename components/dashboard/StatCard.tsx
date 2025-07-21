// components/dashboard/StatCard.tsx
"use client"

import React from "react"
import CountUp from "react-countup"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface StatCardProps {
  title: string
  count: number
  trend: "up" | "down" | "neutral"
  percentChange?: number
  theme?: string
  loading?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  count,
  trend,
  percentChange,
  theme = "light",
  loading = false,
}) => {
  const icon =
    trend === "up" ? (
      <TrendingUp className="w-4 h-4 text-green-500" />
    ) : trend === "down" ? (
      <TrendingDown className="w-4 h-4 text-red-500" />
    ) : (
      <Minus className="w-4 h-4 text-gray-400" />
    )

  const cardClasses = cn(
    "rounded-lg p-4 transition-all duration-300 shadow-sm",
    {
      "bg-white border border-gray-200 text-gray-900": theme === "light",
      "bg-slate-800 text-white border-slate-600": theme === "dark",
      "glass-card text-white border border-white/20": theme === "morpho",
    }
  )

  return (
    <div className={cardClasses}>
      <h4 className="text-sm mb-1 opacity-70">{title}</h4>
      <div className="text-3xl font-bold">
        {loading ? <Skeleton className="h-8 w-20" /> : <CountUp end={count} duration={1} />}
      </div>
      <div className="text-sm mt-1 flex items-center gap-1">
        {icon}
        {percentChange !== undefined ? (
          <span className={trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-400"}>
            {percentChange}% {trend === "up" ? "increase" : trend === "down" ? "decrease" : "no change"}
          </span>
        ) : (
          <span className="text-gray-400">No previous data</span>
        )}
      </div>
    </div>
  )
}