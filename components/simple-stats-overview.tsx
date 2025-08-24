"use client"
import { useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Heart,
  Stethoscope,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useDashboardStats } from "@/hooks/useDashboardStats"

export function SimpleStatsOverview() {
  const { theme } = useTheme()
  const scrollRef = useRef<HTMLDivElement>(null)

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

  const { data: stats, isLoading, error } = useDashboardStats()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Failed to load dashboard</div>

  const weeklyData = stats?.weeklyFlow || []
  const departments = stats?.departmentStats || []
  const metrics = stats?.realTime || {}

  // Find max patients for weekly flow chart scaling
  const maxPatients = Math.max(...weeklyData.map(day => day.patients), 10) || 10

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" })
  }

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" })
  }

  return (
    <div className="relative">
      {/* Scroll buttons */}
      <button
    onClick={scrollLeft}
    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white"
  >
    <ChevronLeft className="w-5 h-5" />
  </button>
  <button
    onClick={scrollRight}
    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white"
  >
    <ChevronRight className="w-5 h-5" />
  </button>
    <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x pb-6 md:grid md:grid-cols-2 lg:grid-cols-2 md:gap-6 md:overflow-x-visible">
      {/* Weekly Patient Flow Chart */}
      <Card className={cn(cardClasses, "min-w-[90%] md:min-w-0 flex-shrink-0 snap-center")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClasses)}>
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Weekly Patient Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              {stats?.weeklyChange >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-400" />
              )}
              <span className={stats?.weeklyChange >= 0 ? "text-green-400" : "text-red-400"}>
                {stats?.weeklyChange >= 0 ? "+" : ""}
                {stats?.weeklyChange}% vs last week
              </span>
            </div>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">Peak: {stats?.peakDay}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Department Distribution */}
      < Card className={cn(cardClasses, "min-w-[90%] md:min-w-0 flex-shrink-0 snap-center")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClasses)}>
            <Stethoscope className="w-5 h-5 text-purple-400" />
            Department Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Real-time Metrics */}
      <Card className={cn(cardClasses, "min-w-[90%] md:min-w-0 flex-shrink-0 snap-center")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClasses)}>
            <Activity className="w-5 h-5 text-green-400" />
            Real-time Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className={cn("text-sm", mutedTextClasses)}>Avg Wait Time</span>
              </div>
              <div className={cn("text-2xl font-bold", textClasses)}>{metrics?.avgWaitTime} min</div>
              <div className={`flex items-center gap-1 text-sm ${metrics?.waitTimeChange >= 0 ? 'text-red-400' : 'text-green-400'}`}>
                {metrics?.waitTimeChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {metrics?.waitTimeChange >= 0 ? "+" : ""}
                {metrics?.waitTimeChange}% from yesterday
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className={cn("text-sm", mutedTextClasses)}>Queue Length</span>
              </div>
              <div className={cn("text-2xl font-bold", textClasses)}>{metrics?.queueLength}</div>
              <div className={`flex items-center gap-1 text-sm ${metrics?.queueChange >= 0 ? 'text-yellow-400' : 'text-green-400'}`}>
                {metrics?.queueChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {metrics?.queueChange >= 0 ? "+" : ""}
                {metrics?.queueChange}% from yesterday
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className={cn("text-sm", mutedTextClasses)}>Critical Cases</span>
              </div>
              <div className={cn("text-2xl font-bold", textClasses)}>{metrics?.criticalCases}</div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">Immediate Attention</Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className={cn("text-sm", mutedTextClasses)}>Today's Revenue</span>
              </div>
              <div className={cn("text-2xl font-bold", textClasses)}>
                ${(metrics?.revenueToday / 1000).toFixed(1)}K
              </div>
              <div className={`flex items-center gap-1 text-sm ${metrics?.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metrics?.revenueChange >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {metrics?.revenueChange >= 0 ? "+" : ""}
                {metrics?.revenueChange}% vs yesterday
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Summary */}
      <Card className={cn(cardClasses, "min-w-[300px] flex-shrink-0 snap-center")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClasses)}>
            <AlertCircle className="w-5 h-5 text-orange-400" />
            System Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-400" />
                <div>
                  <div className={cn("text-sm", mutedTextClasses)}>New Patients Today</div>
                  <div className={cn("text-lg font-bold", textClasses)}>{metrics?.newPatientsToday}</div>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Today</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-blue-400" />
                <div>
                  <div className={cn("text-sm", mutedTextClasses)}>New Doctors This Month</div>
                  <div className={cn("text-lg font-bold", textClasses)}>{metrics?.newDoctorsThisMonth}</div>
                </div>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Monthly</Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-purple-400" />
                <div>
                  <div className={cn("text-sm", mutedTextClasses)}>Active Patients</div>
                  <div className={cn("text-lg font-bold", textClasses)}>{metrics?.totalActivePatients}</div>
                </div>
              </div>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Current</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* System Alerts */}
      <Card className={cn(cardClasses, "min-w-[300px] flex-shrink-0 snap-center")}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClasses)}>
            <AlertCircle className="w-5 h-5 text-orange-400" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-400 mt-0.5" />
              <div className="flex-1">
                <div className={cn("text-sm font-medium", textClasses)}>Equipment Maintenance Due</div>
                <div className={cn("text-xs", mutedTextClasses)}>MRI Machine #2 - Scheduled for tomorrow</div>
              </div>
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">High</Badge>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
              <div className="flex-1">
                <div className={cn("text-sm font-medium", textClasses)}>Low Medication Stock</div>
                <div className={cn("text-xs", mutedTextClasses)}>Insulin supplies running low - 3 days remaining</div>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">Medium</Badge>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5" />
              <div className="flex-1">
                <div className={cn("text-sm font-medium", textClasses)}>System Update Available</div>
                <div className={cn("text-xs", mutedTextClasses)}>New features and security patches ready</div>
              </div>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Info</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}