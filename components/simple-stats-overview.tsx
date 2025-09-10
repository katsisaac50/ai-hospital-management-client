"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import {
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Stethoscope,
  Users,
  DollarSign,
  Activity,
  Heart,
  Clock,
  AlertCircle,
  Server,
} from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import { useDashboardStats } from "@/hooks/useDashboardStats"

// Define types for your data
interface WeeklyData {
  day: string;
  patients: number;
}

interface DepartmentData {
  name: string;
  doctors: number;
  percentage: number;
  color: string;
}

interface MetricsData {
  avgWaitTime?: number;
  waitTimeChange?: number;
  queueLength?: number;
  queueChange?: number;
  criticalCases?: number;
  revenueToday?: number;
  revenueChange?: number;
  totalPatients?: number;
  totalDoctors?: number;
  newPatientsToday?: number;
  newDoctorsThisMonth?: number;
  totalActivePatients?: number;
}

interface DashboardStats {
  weeklyFlow: WeeklyData[];
  departmentStats: DepartmentData[];
  realTime: MetricsData;
  weeklyChange?: number;
  peakDay?: string;
}

export function SimpleStatsOverview() {
  const { theme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(1) // Start at first real card
  const [paused, setPaused] = useState(false)
  const [touchData, setTouchData] = useState<{ x: number | null; time: number }>({ x: null, time: 0 })

  const { data: stats, isLoading, error, refresh } = useDashboardStats()

  const weeklyData = (stats as DashboardStats)?.weeklyFlow || []
  const departments = (stats as DashboardStats)?.departmentStats || []
  const metrics = (stats as DashboardStats)?.realTime || {}
  const maxPatients = weeklyData.length ? Math.max(...weeklyData.map(d => d.patients)) : 10

  const cardClasses = cn("transition-all duration-300", {
    "glass-card": theme === "morpho",
    "bg-slate-800/50 border-slate-700/50": theme === "dark",
    "bg-white border-gray-200 shadow-sm": theme === "light",
  })

  const textClasses = cn("transition-colors duration-300", {
    "text-white": theme === "dark" || theme === "morpho",
    "text-gray-900": theme === "light",
  })

  const mutedTextClasses = cn("transition-colors duration-300", {
    "text-slate-400": theme === "dark" || theme === "morpho",
    "text-gray-600": theme === "light",
  })

  // Small subcomponents
  const WeeklyFlowCard = () => (
    <>
      <div className="space-y-4">
        {weeklyData.map((day, index) => (
          <div key={`${day.day}-${index}`} className="flex items-center gap-4">
            <div className="w-12 text-sm font-medium text-cyan-400">{day.day}</div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn("text-sm", mutedTextClasses)}>Patients</span>
                <span className={cn("text-sm font-medium", textClasses)}>{day.patients}</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(day.patients / maxPatients) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          {(stats as DashboardStats)?.weeklyChange >= 0 ? (
            <TrendingUp className="w-4 h-4 text-green-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
          <span className={(stats as DashboardStats)?.weeklyChange >= 0 ? "text-green-400" : "text-red-400"}>
            {(stats as DashboardStats)?.weeklyChange >= 0 ? "+" : ""}
            {(stats as DashboardStats)?.weeklyChange}% vs last week
          </span>
        </div>
        <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Peak: {(stats as DashboardStats)?.peakDay}</Badge>
      </div>
    </>
  )

  const DepartmentCard = () => (
    <>
      <div className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                <span className={cn("text-sm font-medium", textClasses)}>
                  {dept.name.charAt(0).toUpperCase() + dept.name.slice(1)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm", mutedTextClasses)}>{dept.doctors} doctors</span>
                <span className={cn("text-sm font-medium", textClasses)}>{dept.percentage}%</span>
              </div>
            </div>
            <Progress value={dept.percentage} className="h-2" />
          </div>
        ))}
      </div>
      <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-purple-400" />
            <span className={textClasses}>Total Patients: </span>
            <span className="text-purple-400 font-semibold">{metrics?.totalPatients}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Stethoscope className="w-4 h-4 text-blue-400" />
            <span className={textClasses}>Total Doctors: </span>
            <span className="text-blue-400 font-semibold">{metrics?.totalDoctors}</span>
          </div>
        </div>
      </div>
    </>
  )

  const RealTimeCard = () => (
    <div className="grid grid-cols-2 gap-4">
      {[
        {
          label: "Avg Wait Time",
          value: metrics?.avgWaitTime,
          change: metrics?.waitTimeChange,
          icon: <Clock className="w-4 h-4 text-blue-400" />,
          unit: "min",
          positiveUp: true,
        },
        {
          label: "Queue Length",
          value: metrics?.queueLength,
          change: metrics?.queueChange,
          icon: <Users className="w-4 h-4 text-cyan-400" />,
          positiveUp: true,
        },
        {
          label: "Critical Cases",
          value: metrics?.criticalCases,
          icon: <Heart className="w-4 h-4 text-red-400" />,
          badge: <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Immediate Attention</Badge>,
        },
        {
          label: "Today's Revenue",
          value: metrics?.revenueToday ? (metrics.revenueToday / 1000).toFixed(1) : "0",
          change: metrics?.revenueChange,
          icon: <DollarSign className="w-4 h-4 text-green-400" />,
          unit: "K",
          positiveUp: false,
        },
      ].map((item, idx) => (
        <div key={idx} className="space-y-2">
          <div className="flex items-center gap-2">
            {item.icon}
            <span className={cn("text-sm", mutedTextClasses)}>{item.label}</span>
          </div>
          <div className={cn("text-2xl font-bold", textClasses)}>
            {item.value} {item.unit || ""}
          </div>
          {item.change !== undefined && (
            <div
              className={`flex items-center gap-1 text-sm ${
                (item.positiveUp ? item.change >= 0 : item.change < 0) ? "text-red-400" : "text-green-400"
              }`}
            >
              {(item.positiveUp ? item.change >= 0 : item.change < 0) ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {item.change >= 0 ? "+" : ""}
              {item.change}% from yesterday
            </div>
          )}
          {item.badge && item.badge}
        </div>
      ))}
    </div>
  )

  const SystemSummaryCard = () => (
    <div className="space-y-4">
      {[
        {
          label: "New Patients Today",
          value: metrics?.newPatientsToday,
          icon: <Users className="w-5 h-5 text-green-400" />,
          badge: <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Today</Badge>,
          bg: "bg-green-500/10",
          border: "border-green-500/20",
        },
        {
          label: "New Doctors This Month",
          value: metrics?.newDoctorsThisMonth,
          icon: <Stethoscope className="w-5 h-5 text-blue-400" />,
          badge: <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Monthly</Badge>,
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
        },
        {
          label: "Active Patients",
          value: metrics?.totalActivePatients,
          icon: <Heart className="w-5 h-5 text-purple-400" />,
          badge: <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Current</Badge>,
          bg: "bg-purple-500/10",
          border: "border-purple-500/20",
        },
      ].map((item, idx) => (
        <div key={idx} className={`flex items-center justify-between p-3 rounded-lg ${item.bg} border ${item.border}`}>
          <div className="flex items-center gap-3">
            {item.icon}
            <div>
              <div className={cn("text-sm", mutedTextClasses)}>{item.label}</div>
              <div className={cn("text-lg font-bold", textClasses)}>{item.value}</div>
            </div>
          </div>
          {item.badge}
        </div>
      ))}
    </div>
  )

  const SystemAlertsCard = () => (
    <div className="space-y-3">
      {[
        {
          title: "Equipment Maintenance Due",
          description: "MRI Machine #2 - Scheduled for tomorrow",
          level: "high",
          bg: "bg-red-500/10",
          border: "border-red-500/20",
          color: "red",
        },
        {
          title: "Low Medication Stock",
          description: "Insulin supplies running low - 3 days remaining",
          level: "Medium",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/20",
          color: "yellow",
        },
        {
          title: "System Update Available",
          description: "New features and security patches ready",
          level: "Info",
          bg: "bg-blue-500/10",
          border: "border-blue-500/20",
          color: "blue",
        },
      ].map((alert, idx) => (
        <div
          key={idx}
          className={`flex items-start gap-3 p-3 rounded-lg ${alert.bg} border ${alert.border}`}
        >
          <AlertCircle className={`w-4 h-4 mt-0.5 text-${alert.color}-400`} />
          <div className="flex-1">
            <div className={cn("text-sm font-medium", textClasses)}>{alert.title}</div>
            <div className={cn("text-xs", mutedTextClasses)}>{alert.description}</div>
          </div>
          <Badge className={`bg-${alert.color}-500/20 text-${alert.color}-400 border-${alert.color}-500/30 text-xs`}>
            {alert.level}
          </Badge>
        </div>
      ))}
    </div>
  )

  const cards = [
    { title: "Weekly Patient Flow", icon: <TrendingUp className="w-5 h-5 text-cyan-400" />, content: <WeeklyFlowCard /> },
    { title: "Department Distribution", icon: <Stethoscope className="w-5 h-5 text-purple-400" />, content: <DepartmentCard /> },
    { title: "Real-time Metrics", icon: <Activity className="w-5 h-5 text-green-400" />, content: <RealTimeCard /> },
    { title: "System Summary", icon: <Server className="w-5 h-5 text-orange-400" />, content: <SystemSummaryCard /> },
    { title: "System Alerts", icon: <AlertCircle className="w-5 h-5 text-red-400" />, content: <SystemAlertsCard /> },
  ]

  // Infinite loop setup
  const extendedCards = [cards[cards.length - 1], ...cards, cards[0]]

  const scrollToCard = useCallback(
    (index: number, smooth = true) => {
      if (!scrollRef.current) return
      const card = scrollRef.current.children[index] as HTMLDivElement
      if (!card) return
      scrollRef.current.scrollTo({ left: card.offsetLeft, behavior: smooth ? "smooth" : "auto" })
      setActiveIndex(index)
    },
    []
  )

  // Auto-slide
  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % extendedCards.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [paused, extendedCards.length])

  // Loop handling
  useEffect(() => {
    scrollToCard(activeIndex)
    
    // Handle infinite loop
    if (activeIndex === 0) {
      // Jump to the last real card after a delay (to complete the illusion)
      const timer = setTimeout(() => {
        scrollToCard(cards.length, false)
      }, 300)
      return () => clearTimeout(timer)
    } else if (activeIndex === extendedCards.length - 1) {
      // Jump to the first real card after a delay
      const timer = setTimeout(() => {
        scrollToCard(1, false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [activeIndex, scrollToCard, cards.length, extendedCards.length])

  const goLeft = () => setActiveIndex(prev => Math.max(prev - 1, 0))
  const goRight = () => setActiveIndex(prev => Math.min(prev + 1, extendedCards.length - 1))

  // Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchData({ x: e.touches[0].clientX, time: Date.now() })
    setPaused(true)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!scrollRef.current || touchData.x === null) return
    const deltaX = touchData.x - e.touches[0].clientX
    scrollRef.current.scrollLeft += deltaX
    setTouchData({ x: e.touches[0].clientX, time: touchData.time })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!scrollRef.current || touchData.x === null) return
    const deltaX = touchData.x - e.changedTouches[0].clientX
    const deltaTime = Date.now() - touchData.time
    const velocity = deltaX / deltaTime
    let newIndex = activeIndex

    if (Math.abs(deltaX) > scrollRef.current.offsetWidth / 3 || Math.abs(velocity) > 0.3) {
      newIndex = deltaX > 0 ? activeIndex + 1 : activeIndex - 1
    }

    // Ensure index stays within bounds
    newIndex = Math.max(0, Math.min(newIndex, extendedCards.length - 1))
    setActiveIndex(newIndex)
    setTouchData({ x: null, time: 0 })
    setPaused(false)
  }

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading...</div>
  if (error) return <div className="bg-red-500/20 text-red-400 p-4 rounded-lg">Error loading data</div>

  // Calculate the real index for dot indicators
  const getRealIndex = () => {
    if (activeIndex === 0) return cards.length - 1
    if (activeIndex === extendedCards.length - 1) return 0
    return activeIndex - 1
  }

  const realIndex = getRealIndex()

  return (
    <>
    <Button 
        onClick={() => refresh()} 
        variant="outline" 
        size="sm" 
        className={cn("transition-colors duration-300 relative top-2 left-2 z-20", {
        "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
        "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
        "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
      })}
        // className="absolute top-2 right-2 z-20"
      >
        🔄 Refresh
      </Button>
    <div className="relative">
      {/* Arrows */}
      <button
        aria-label="Scroll Left"
        onClick={goLeft}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        aria-label="Scroll Right"
        onClick={goRight}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 scrollbar-hide"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {extendedCards.map((card, idx) => (
          <Card
            key={idx}
            className={cn(cardClasses, "min-w-[90%] md:min-w-[45%] lg:min-w-[30%] flex-shrink-0 snap-center shadow-xl")}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">{card.icon} {card.title}</CardTitle>
            </CardHeader>
            <CardContent>{card.content}</CardContent>
          </Card>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center mt-2 gap-2">
        {cards.map((_, idx) => (
          <span
            key={idx}
            className={cn(
              "w-2 h-2 rounded-full transition-colors",
              realIndex === idx ? "bg-gray-900" : "bg-gray-400"
            )}
          />
        ))}
      </div>
    </div>
    </>
  )
}