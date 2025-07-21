"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

interface ThemeAwareCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export function ThemeAwareCard({ children, className, title, description }: ThemeAwareCardProps) {
  const { theme } = useTheme()

  const cardClasses = cn(
    "transition-all duration-300",
    {
      "glass-card": theme === "morpho",
      "bg-slate-800/50 border-slate-700/50": theme === "dark",
      "bg-white border-gray-200": theme === "light",
    },
    className,
  )

  return (
    <Card className={cardClasses}>
      {title && (
        <CardHeader>
          <CardTitle
            className={cn("transition-colors duration-300", {
              "text-cyan-400": theme === "dark" || theme === "morpho",
              "text-gray-900": theme === "light",
            })}
          >
            {title}
          </CardTitle>
          {description && (
            <p
              className={cn("text-sm transition-colors duration-300", {
                "text-slate-400": theme === "dark" || theme === "morpho",
                "text-gray-600": theme === "light",
              })}
            >
              {description}
            </p>
          )}
        </CardHeader>
      )}
      <CardContent>{children}</CardContent>
    </Card>
  )
}
