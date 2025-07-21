"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "@/components/theme-provider"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ThemeAwareCard } from "@/components/theme-aware-card"
import { Palette, Sun, Moon, Sparkles, Star, Zap, Layers, Brush } from "lucide-react"

export function ThemeShowcase() {
  const { theme } = useTheme()
  const [activeDemo, setActiveDemo] = useState("cards")

  const themeFeatures = {
    light: {
      name: "Light Theme",
      icon: Sun,
      color: "text-yellow-500",
      features: ["Clean & Professional", "High Contrast", "Easy Reading", "Minimal Design"],
      description: "Perfect for daytime use with excellent readability",
    },
    dark: {
      name: "Dark Theme",
      icon: Moon,
      color: "text-blue-400",
      features: ["Eye-Friendly", "Low Light", "Modern Look", "Battery Saving"],
      description: "Reduces eye strain during extended use",
    },
    morpho: {
      name: "Morpho Theme",
      icon: Sparkles,
      color: "text-cyan-400",
      features: ["Glassmorphism", "Animated Background", "Blur Effects", "Premium Feel"],
      description: "Cutting-edge design with glass-like transparency",
    },
  }

  const currentThemeInfo = themeFeatures[theme]
  const CurrentIcon = currentThemeInfo.icon

  return (
    <div className="space-y-6">
      {/* Theme Header */}
      <ThemeAwareCard>
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10`}>
              <CurrentIcon className={`w-6 h-6 ${currentThemeInfo.color}`} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{currentThemeInfo.name}</h2>
              <p className="text-muted-foreground">{currentThemeInfo.description}</p>
            </div>
          </div>
          <ThemeSwitcher />
        </div>
      </ThemeAwareCard>

      {/* Theme Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {currentThemeInfo.features.map((feature, index) => (
          <ThemeAwareCard key={feature}>
            <div className="p-4 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold">{feature}</h3>
            </div>
          </ThemeAwareCard>
        ))}
      </div>

      {/* Demo Tabs */}
      <ThemeAwareCard>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Palette className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Theme Demonstration</h3>
          </div>

          <div className="flex gap-2 mb-6">
            {[
              { id: "cards", label: "Cards", icon: Layers },
              { id: "buttons", label: "Buttons", icon: Zap },
              { id: "effects", label: "Effects", icon: Brush },
            ].map((tab) => {
              const TabIcon = tab.icon
              return (
                <Button
                  key={tab.id}
                  variant={activeDemo === tab.id ? "default" : "outline"}
                  onClick={() => setActiveDemo(tab.id)}
                  className="flex items-center gap-2"
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </Button>
              )
            })}
          </div>

          {/* Demo Content */}
          {activeDemo === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ThemeAwareCard title="Sample Card" description="This is how cards look in the current theme">
                <div className="space-y-2">
                  <Badge>Primary Badge</Badge>
                  <Badge variant="secondary">Secondary Badge</Badge>
                  <Badge variant="outline">Outline Badge</Badge>
                </div>
              </ThemeAwareCard>

              <ThemeAwareCard title="Interactive Card">
                <div className="space-y-3">
                  <Button className="w-full">Primary Button</Button>
                  <Button variant="outline" className="w-full">
                    Outline Button
                  </Button>
                </div>
              </ThemeAwareCard>

              <ThemeAwareCard title="Status Card">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>System Online</span>
                </div>
              </ThemeAwareCard>
            </div>
          )}

          {activeDemo === "buttons" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          )}

          {activeDemo === "effects" && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/10 to-secondary/10">
                <h4 className="font-semibold mb-2">Gradient Background</h4>
                <p className="text-sm text-muted-foreground">This demonstrates gradient effects in the current theme</p>
              </div>

              {theme === "morpho" && (
                <div className="glass-card p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Glassmorphism Effect</h4>
                  <p className="text-sm text-muted-foreground">
                    This card uses the glass effect available in Morpho theme
                  </p>
                </div>
              )}

              <div className="p-4 rounded-lg border hover:shadow-lg transition-all duration-300 cursor-pointer">
                <h4 className="font-semibold mb-2">Hover Effects</h4>
                <p className="text-sm text-muted-foreground">Hover over this card to see the shadow effect</p>
              </div>
            </div>
          )}
        </div>
      </ThemeAwareCard>

      {/* Theme Comparison */}
      <ThemeAwareCard title="All Available Themes">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(themeFeatures).map(([themeKey, themeInfo]) => {
            const ThemeIcon = themeInfo.icon
            return (
              <div
                key={themeKey}
                className={`p-4 rounded-lg border transition-all duration-300 ${
                  theme === themeKey ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <ThemeIcon className={`w-5 h-5 ${themeInfo.color}`} />
                  <h4 className="font-semibold">{themeInfo.name}</h4>
                  {theme === themeKey && <Badge>Active</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-3">{themeInfo.description}</p>
                <div className="flex flex-wrap gap-1">
                  {themeInfo.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </ThemeAwareCard>
    </div>
  )
}
