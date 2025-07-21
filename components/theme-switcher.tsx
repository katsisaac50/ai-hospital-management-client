"use client"

import { Moon, Sun, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "@/components/theme-provider"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()

  const themes = [
    {
      name: "Light",
      value: "light" as const,
      icon: Sun,
      description: "Clean and bright interface",
    },
    {
      name: "Dark",
      value: "dark" as const,
      icon: Moon,
      description: "Easy on the eyes",
    },
    {
      name: "Morpho",
      value: "morpho" as const,
      icon: Sparkles,
      description: "Glassmorphism design",
    },
  ]

  const currentTheme = themes.find((t) => t.value === theme)
  const CurrentIcon = currentTheme?.icon || Moon

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/50 transition-all duration-200"
        >
          <CurrentIcon className="h-4 w-4 transition-all" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md border border-border/50">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={`flex items-center gap-3 p-3 cursor-pointer transition-all duration-200 ${
                theme === themeOption.value ? "bg-primary/10 text-primary" : "hover:bg-accent/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span className="font-medium">{themeOption.name}</span>
                <span className="text-xs text-muted-foreground">{themeOption.description}</span>
              </div>
              {theme === themeOption.value && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
