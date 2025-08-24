"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ProgressBar } from "@/components/ui/progress-bar"
import {
  Users,
  Calendar,
  UserCheck,
  DollarSign,
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  Brain,
  Stethoscope,
  Pill,
  FlaskConical,
  Settings,
  Shield,
  User,
} from "lucide-react"
import Link from "next/link"
import {useAuth, canAccessModule} from "@/lib/auth"
import { AuthBoundary } from '@/components/auth-boundary'
import { LoginForm } from "@/components/login-form"
import { UserProfile } from "@/components/user-profile"
import { RoleBasedAccess } from "@/components/role-based-access"
import { StatsOverview } from "@/components/stats-overview"
import { SimpleStatsOverview } from "@/components/simple-stats-overview"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTheme } from "@/components/theme-provider"
import { authFetch } from "@/lib/api"
import { cn } from "@/lib/utils"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard } from "@/components/dashboard/StatCard";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
 
interface Stats {
  totalPatients: number;
  today: { count: number; prev: number };
  week: { count: number; prev: number };
  month: { count: number; prev: number };
  last7Days: { date: string; count: number }[];
}

export default function Dashboard() {
  const { user } = useAuth()
  const { theme } = useTheme()
  const [showProfile, setShowProfile] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null);
  const [showSimpleStats, setShowSimpleStats] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const maxEmergencies = 10;
  const profileRef = useRef<HTMLDivElement>(null)
  const token = localStorage.getItem("token");

  const { total, growth, trend } = stats?.monthlyRevenue || {}
  console.log('API_URL', API_URL)
console.log('user dashboard', user)
  // Show login form if user is not authenticated

  const renderTrendIcon = () => {
  if (trend === 'up') return <TrendingUp className="w-4 h-4 text-green-400" />
  if (trend === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />
  return <Minus className="w-4 h-4 text-gray-400" />
}

const renderTrendColor = () => {
  if (trend === 'up') return "text-green-400"
  if (trend === 'down') return "text-red-400"
  return "text-gray-400"
}

const getICUColor = (percent: number) => {
  if (percent < 50) return "bg-green-500";
  if (percent < 80) return "bg-yellow-400";
  return "bg-red-500";
};


  const modules = [
    {
      title: "Patient Management",
      description: "View and manage patient records",
      icon: Users,
      href: "/patients",
      color: "from-cyan-500 to-blue-500",
      permission: "view_patients",
      module: "patients",
    },
    {
      title: "Appointments",
      description: "Schedule and manage appointments",
      icon: Calendar,
      href: "/appointments",
      color: "from-green-500 to-emerald-500",
      permission: "view_appointments",
      module: "appointments",
    },
    {
      title: "Doctor Management",
      description: "Manage doctor schedules and information",
      icon: UserCheck,
      href: "/doctors",
      color: "from-purple-500 to-pink-500",
      permission: "view_analytics",
      module: "doctors",
    },
    {
      title: "Pharmacy",
      description: "Medication inventory and prescriptions",
      icon: Pill,
      href: "/pharmacy",
      color: "from-orange-500 to-red-500",
      permission: "view_pharmacy",
      module: "pharmacy",
    },
    {
      title: "Laboratory",
      description: "Lab tests and results management",
      icon: FlaskConical,
      href: "/laboratory",
      color: "from-indigo-500 to-purple-500",
      permission: "view_lab_results",
      module: "laboratory",
    },
    {
      title: "Financial",
      description: "Billing, payments, and financial reports",
      icon: DollarSign,
      href: "/financial",
      color: "from-yellow-500 to-orange-500",
      permission: "view_financial",
      module: "financial",
    },
  ]

  const accessibleModules = user
    ? modules.filter((module) => canAccessModule(user, module.module))
    : [];

  const containerClasses = cn("min-h-screen transition-all duration-300", {
    "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white": theme === "dark",
    "bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900": theme === "light",
    "morpho text-white": theme === "morpho",
  })

  const cardClasses = cn("transition-all duration-300 hover:scale-105", {
    "glass-card": theme === "morpho",
    "bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50": theme === "dark",
    "bg-white border-gray-200 hover:border-blue-500/50 shadow-sm": theme === "light",
  })

   const renderChange = (current: number, previous: number) => {
    if (current > previous) return <span style={{ color: 'green' }}>↑ Increased</span>;
    if (current < previous) return <span style={{ color: 'red' }}>↓ Decreased</span>;
    return <span style={{ color: 'gray' }}>→ No change</span>;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }
    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside)
    } else {
      document.removeEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showProfile])

const fetchStats = async () => {
  console.log('fetching')
  try {
    const res = await authFetch(`${API_URL}/v1/patients/stats`);
    console.log('res', res)
    const data = await res.json();
    setStats(data || []);
    setError(false);
  } catch (err) {
    console.log('l erroring')
    console.error("Error fetching stats:", err);
    // setError(true);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  if (token) {
    fetchStats();
  }
}, [token]);

  console.log('todken dash', token)

  if (!token) {
    return <LoginForm />
  }

  // Improved loading and error states
if (loading) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      <span className="ml-4 text-slate-400">Loading dashboard data...</span>
    </div>
  );
}

if (error) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-500">
      <AlertTriangle className="inline mr-2" />
      Failed to load dashboard data. Please try again later.
      <Button 
        variant="outline" 
        onClick={fetchStats}
        className="ml-4"
      >
        Retry
      </Button>
    </div>
  );
}

if (!stats) {
  return (
    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-500">
      <AlertTriangle className="inline mr-2" />
      No data available
    </div>
  );
}

  return (
    <AuthBoundary>
    <div className={containerClasses}>
      <div className="container mx-auto px-6 py-8">
        {/* Header with User Info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
  <div className="order-1 md:order-none">
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
      <div className="flex items-center gap-3">
        <Stethoscope className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          BismillahMedicalCenter
        </h1>
      </div>
      <Badge className="w-fit bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 text-cyan-300">
        <Brain className="w-3 h-3 mr-1" />
        AI-Powered
      </Badge>
    </div>
    <p
      className={cn("transition-colors duration-300", {
        "text-slate-400": theme === "dark" || theme === "morpho",
        "text-gray-600": theme === "light",
      })}
    >
      Welcome back,{" "}
      <span
        className={cn("font-medium", {
          "text-white": theme === "dark" || theme === "morpho",
          "text-gray-900": theme === "light",
        })}
      >
        {user.name}
      </span>
    </p>
    <p
      className={cn("text-sm transition-colors duration-300", {
        "text-slate-500": theme === "dark" || theme === "morpho",
        "text-gray-500": theme === "light",
      })}
    >
      Role: {user.role.replace("_", " ")} • Department: {user.department}
    </p>
  </div>
  <div className="flex flex-wrap items-center gap-2 sm:gap-4 order-2 md:order-none w-full md:w-auto justify-end">
    <ThemeSwitcher />
    <Button
      variant="outline"
      onClick={() => setShowProfile(!showProfile)}
      size="sm"
      className={cn("transition-colors duration-300", {
        "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
        "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
        "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
      })}
    >
      <User className="w-4 h-4 mr-2" />
      Profile
    </Button>
    <RoleBasedAccess requiredPermission="system_settings" showError={false}>
      <Link href="/integrations">
        <Button
          variant="outline"
          size="sm"
          className={cn("transition-colors duration-300", {
            "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
            "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
            "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
          })}
        >
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
      </Link>
    </RoleBasedAccess>
  </div>
</div>

        {/* User Profile Sidebar */}
        {showProfile && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end p-6">
            <div ref={profileRef} className="w-96 max-h-[90vh] overflow-y-auto">
              <UserProfile />
              <Button
                variant="outline"
                onClick={() => setShowProfile(false)}
                className={cn("w-full mt-4 transition-colors duration-300", {
                  "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
                  "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
                  "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
                })}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        <RoleBasedAccess requiredPermission="view_analytics" showError={false}>
  <div className="mb-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className={cn("text-xl font-semibold", {
        "text-white": theme === "dark" || theme === "morpho",
        "text-gray-900": theme === "light",
      })}>
        Statistics Overview
      </h2>
      <Button 
        variant="outline"
        onClick={() => setShowSimpleStats(!showSimpleStats)}
        className={cn("transition-colors duration-300", {
          "border-slate-600 text-slate-300 hover:bg-slate-700": theme === "dark",
          "border-gray-300 text-gray-700 hover:bg-gray-100": theme === "light",
          "glass-button border-white/20 text-white hover:bg-white/10": theme === "morpho",
        })}
      >
        {showSimpleStats ? (
          <>
            <Activity className="w-4 h-4 mr-2" />
            Show Chart View
          </>
        ) : (
          <>
            <Users className="w-4 h-4 mr-2" />
            Show Bar View
          </>
        )}
      </Button>
    </div>
    
    {showSimpleStats ? (
      <SimpleStatsOverview />
    ) : (
      <StatsOverview />
    )}
  </div>
</RoleBasedAccess>

        {/* Quick Stats Cards */}
        <div className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth-x snap-x pb-4
                md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6 md:overflow-x-visible">
          <RoleBasedAccess requiredPermission="view_patients" showError={false}>
            <Card className={cn(cardClasses, "min-w-[250px] flex-shrink-0 snap-center")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={cn("text-sm transition-colors duration-300", {
                        "text-slate-400": theme === "dark" || theme === "morpho",
                        "text-gray-600": theme === "light",
                      })}
                    >
                      Total Patients
                    </p>
                    <p
                      className={cn("text-3xl font-bold transition-colors duration-300", {
                        "text-white": theme === "dark" || theme === "morpho",
                        "text-gray-900": theme === "light",
                      })}
                    >
                      {stats.totalPatients}
                    </p>{ console.log('mont', stats)}
                    {stats.month && typeof stats.month.prev === 'number' && (
                    <p
                      className={cn(
                        "text-sm flex items-center gap-1",
                        stats.month.count > stats.month.prev
                          ? "text-green-400"
                          : stats.month.count < stats.month.prev
                          ? "text-red-400"
                          : "text-gray-400"
                      )}
                    >
                      {stats.month.count > stats.month.prev ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : stats.month.count < stats.month.prev ? (
                        <TrendingUp className="w-3 h-3 rotate-180" />
                      ) : (
                        <TrendingUp className="w-3 h-3 opacity-50" />
                      )}
                      {stats.month.prev === 0 
                      ? "New data (no previous records)"
                      : `${Math.abs(
                          (((stats.month.count - stats.month.prev) / stats.month.prev) * 100).toFixed(1)
                        )}% ${stats.month.count === stats.month.prev ? "no change" : "from last month"}`}
                  </p>
                  )}
                  </div>
                  <Users className="w-12 h-12 text-cyan-400" />
                </div>
              </CardContent>
            </Card>
          </RoleBasedAccess>

          <RoleBasedAccess requiredPermission="view_appointments" showError={false}>
            <Card className={cn(cardClasses, "min-w-[250px] flex-shrink-0 snap-center")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={cn("text-sm transition-colors duration-300", {
                        "text-slate-400": theme === "dark" || theme === "morpho",
                        "text-gray-600": theme === "light",
                      })}
                    >
                      Today's Appointments
                    </p>
                    <p
                      className={cn("text-3xl font-bold transition-colors duration-300", {
                        "text-white": theme === "dark" || theme === "morpho",
                        "text-gray-900": theme === "light",
                      })}
                    >
                      {stats?.appointmentsToday?.total}
                    </p>
                    <p className="text-blue-400 text-sm">{stats?.appointmentsToday?.pending} pending confirmations</p>
                  </div>
                  <Calendar className="w-12 h-12 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </RoleBasedAccess>

          <RoleBasedAccess requiredPermission="view_analytics" showError={false}>
            <Card className={cn(cardClasses, "min-w-[250px] flex-shrink-0 snap-center")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={cn("text-sm transition-colors duration-300", {
                        "text-slate-400": theme === "dark" || theme === "morpho",
                        "text-gray-600": theme === "light",
                      })}
                    >
                      Active Doctors
                    </p>
                    <p
                      className={cn("text-3xl font-bold transition-colors duration-300", {
                        "text-white": theme === "dark" || theme === "morpho",
                        "text-gray-900": theme === "light",
                      })}
                    >
                      {stats.doctors?.totalActive}
                    </p>
                    <p className="text-purple-400 text-sm">{stats.doctors?.currentlyOnDuty} currently on duty</p>
                  </div>
                  <UserCheck className="w-12 h-12 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </RoleBasedAccess>

          <RoleBasedAccess requiredPermission="view_financial" showError={false}>
            <Card className={cn(cardClasses, "min-w-[250px] flex-shrink-0 snap-center")}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={cn("text-sm transition-colors duration-300", {
                        "text-slate-400": theme === "dark" || theme === "morpho",
                        "text-gray-600": theme === "light",
                      })}
                    >
                      Monthly Revenue
                    </p>
                    <p
                      className={cn("text-3xl font-bold transition-colors duration-300", {
                        "text-white": theme === "dark" || theme === "morpho",
                        "text-gray-900": theme === "light",
                      })}
                    >
                      {total}
                    </p>
                    <div className="flex items-center gap-1 text-sm">
                      {renderTrendIcon()}
                      <span className={cn(renderTrendColor())}>
                        {trend === 'flat' ? 'No change' : `${growth}% from last month`}
                      </span>
                    </div>
                    {/* <p className="text-yellow-400 text-sm flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      +8% from last month
                    </p> */}
                  </div>
                  <DollarSign className="w-12 h-12 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </RoleBasedAccess>
        </div>

        {/* System Status - Emergency Access */}
       
        <RoleBasedAccess requiredPermission="emergency_access" showError={false}>
          <Card className={cn(cardClasses, "mb-8")}>
            <CardHeader>
              <CardTitle className="text-red-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Emergency Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn("transition-colors duration-300", {
                        "text-slate-400": theme === "dark" || theme === "morpho",
                        "text-gray-600": theme === "light",
                      })}
                    >
                      Emergency Queue
                    </span>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                      <Activity className="w-3 h-3 mr-1 animate-pulse" />{stats?.criticalPatientsCount} Critical
                    </Badge>
                  </div>
                  <ProgressBar value={(stats?.criticalPatientsCount / maxEmergencies) * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn("transition-colors duration-300", {
                        "text-slate-400": theme === "dark" || theme === "morpho",
                        "text-gray-600": theme === "light",
                      })}
                    >
                      ICU Occupancy
                    </span>
                    <span className="text-blue-400">{stats?.occupiedICUBeds?.occupied/stats?.occupiedICUBeds?.total} beds</span>
                  </div>
                  <ProgressBar value={stats?.occupiedICUBeds?.occupied} className={`h-2`} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn("transition-colors duration-300", {
                        "text-slate-400": theme === "dark" || theme === "morpho",
                        "text-gray-600": theme === "light",
                      })}
                    >
                      OR Availability
                    </span>
                    <span className="text-green-400">{stats?.statsOR.available} available</span>
                  </div>
                  <Progress value={(stats?.statsOR.available / stats?.statsOR.total) * 100} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </RoleBasedAccess>

        {/* Main Modules */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accessibleModules.map((module) => (
            <RoleBasedAccess key={module.title} requiredPermission={module.permission} showError={false}>
              <Link href={module.href}>
                <Card className={cn(cardClasses, "cursor-pointer group")}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={`p-3 rounded-lg bg-gradient-to-r ${module.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3
                          className={cn("text-xl font-semibold group-hover:text-cyan-400 transition-colors", {
                            "text-white": theme === "dark" || theme === "morpho",
                            "text-gray-900": theme === "light",
                          })}
                        >
                          {module.title}
                        </h3>
                        <p
                          className={cn("text-sm transition-colors duration-300", {
                            "text-slate-400": theme === "dark" || theme === "morpho",
                            "text-gray-600": theme === "light",
                          })}
                        >
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <Button
                      className={cn("w-full transition-all duration-300", {
                        "bg-gradient-to-r from-slate-700 to-slate-600 hover:from-cyan-600 hover:to-purple-600":
                          theme === "dark",
                        "bg-gradient-to-r from-gray-200 to-gray-300 hover:from-blue-500 hover:to-purple-500 text-gray-900 hover:text-white":
                          theme === "light",
                        "glass-button hover:from-cyan-600 hover:to-purple-600": theme === "morpho",
                      })}
                    >
                      Access Module
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </RoleBasedAccess>
          ))}
        </div>

        {/* No Access Message */}
        {accessibleModules.length === 0 && (
          <Card className={cardClasses}>
            <CardContent className="p-8 text-center">
              <Shield
                className={cn("w-16 h-16 mx-auto mb-4 transition-colors duration-300", {
                  "text-slate-400": theme === "dark" || theme === "morpho",
                  "text-gray-400": theme === "light",
                })}
              />
              <h3
                className={cn("text-xl font-semibold mb-2 transition-colors duration-300", {
                  "text-white": theme === "dark" || theme === "morpho",
                  "text-gray-900": theme === "light",
                })}
              >
                Limited Access
              </h3>
              <p
                className={cn("transition-colors duration-300", {
                  "text-slate-400": theme === "dark" || theme === "morpho",
                  "text-gray-600": theme === "light",
                })}
              >
                Your current role ({user.role.replace("_", " ")}) has limited access to system modules.
              </p>
              <p
                className={cn("text-sm mt-2 transition-colors duration-300", {
                  "text-slate-500": theme === "dark" || theme === "morpho",
                  "text-gray-500": theme === "light",
                })}
              >
                Contact your administrator if you need additional permissions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </AuthBoundary>
  )
}