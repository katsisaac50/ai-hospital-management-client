"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { useDashboardStats } from "@/hooks/useDashboardStats"
// Tailwind color to hex mapping
const tailwindToHex = {
  'bg-red-500': '#ef4444',
  'bg-blue-500': '#3b82f6',
  'bg-orange-500': '#f97316',
  'bg-purple-500': '#a855f7',
  'bg-gray-500': '#6b7280',
  'bg-green-500': '#22c55e',
  'bg-yellow-500': '#eab308',
  'bg-cyan-500': '#06b6d4'
}

interface StatsOverviewProps {
  data: {
    weeklyFlow: Array<{ day: string; patients: number; appointments: number }>
    departmentStats: Array<{ name: string; doctors: number; color: string }>
    realTime: {
      monthlyTrend: {
        current: number
        previous: number
        change: number
      }
      // ... other realTime properties
    }
  }
}

export function StatsOverview() {
  const { theme } = useTheme()
  const { data: stats } = useDashboardStats()
    // Transform department data with hex colors
  const departmentData = stats?.departmentStats?.map(dept => ({
    name: dept.name,
    value: dept.doctors,
    color: tailwindToHex[dept.color] || '#8884d8' // Fallback to default
  })) || []


  // Default color mapping for departments if not provided
  function getDefaultColor(department) {
    const colorMap = {
      cardiology: "#0088FE",
      pediatrics: "#00C49F",
      orthopedics: "#FFBB28",
      neurology: "#FF8042",
      oncology: "#8884d8",
      emergency: "#FF6B6B"
    }
    return colorMap[department.toLowerCase()] || "#" + Math.floor(Math.random()*16777215).toString(16)
  }

  // Theme-aware styling
  const cardClasses = cn("transition-all duration-300", {
    "glass-card": theme === "morpho",
    "bg-slate-800/50 border-slate-700/50": theme === "dark",
    "bg-white border-gray-200 shadow-sm": theme === "light",
  })

  const textClasses = cn({
    "text-white": theme === "dark" || theme === "morpho",
    "text-gray-900": theme === "light",
  })

  // Vibrant color schemes for both themes
  const chartColors = {
    dark: {
      patients: "#3b82f6",  // blue-500
      appointments: "#10b981", // emerald-500
      grid: "#374151",       // gray-700
      axis: "#9ca3af",       // gray-400
      tooltipBg: "#1f2937",  // gray-800
      tooltipBorder: "#4b5563" // gray-600
    },
    light: {
      patients: "#2563eb",   // blue-600
      appointments: "#059669", // emerald-600
      grid: "#e5e7eb",       // gray-200
      axis: "#4b5563",       // gray-600
      tooltipBg: "#ffffff",
      tooltipBorder: "#d1d5db" // gray-300
    }
  }

  const colors = theme === "dark" || theme === "morpho" ? chartColors.dark : chartColors.light

  // Prepare chart data
  const weeklyFlowData = stats?.weeklyFlow?.map(day => ({
    name: day.day,
    patients: day.patients,
    appointments: day.appointments,
  })) || []

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* Weekly Patient Flow Area Chart */}
      <Card className={cardClasses}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", textClasses)}>
            <span className="text-cyan-400">Weekly Patient Flow</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={weeklyFlowData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.patients} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.patients} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.appointments} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={colors.appointments} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.grid} />
                <XAxis dataKey="name" stroke={colors.axis} />
                <YAxis stroke={colors.axis} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: colors.tooltipBg,
                    borderColor: colors.tooltipBorder,
                    color: textClasses,
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="patients"
                  stroke={colors.patients}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPatients)"
                  name="Patients"
                />
                <Area
                  type="monotone"
                  dataKey="appointments"
                  stroke={colors.appointments}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAppointments)"
                  name="Appointments"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Department Distribution Pie Chart with correct colors */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Department Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={departmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {departmentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderColor: "#475569",
                    color: "#f8fafc",
                  }}
                />
                <Legend 
                  formatter={(value) => (
                    <span className="text-slate-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}