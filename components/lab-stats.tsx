import { Card, CardContent } from "@/components/ui/card"
import { TestTube, FlaskConical, Activity, CheckCircle, Clock, AlertTriangle, Settings, TrendingUp } from "lucide-react"

export function LabStats() {
  const stats = [
    {
      title: "Tests Today",
      value: "156",
      change: "+12",
      icon: TestTube,
      color: "text-cyan-400",
      trend: "up",
    },
    {
      title: "Completed Tests",
      value: "89",
      change: "+8",
      icon: CheckCircle,
      color: "text-green-400",
      trend: "up",
    },
    {
      title: "Pending Results",
      value: "34",
      change: "+5",
      icon: Clock,
      color: "text-yellow-400",
      trend: "up",
    },
    {
      title: "Critical Results",
      value: "7",
      change: "+2",
      icon: AlertTriangle,
      color: "text-red-400",
      trend: "up",
    },
    {
      title: "Equipment Online",
      value: "12/14",
      change: "100%",
      icon: Settings,
      color: "text-blue-400",
      trend: "stable",
    },
    {
      title: "Turnaround Time",
      value: "2.3h",
      change: "-15min",
      icon: Activity,
      color: "text-purple-400",
      trend: "down",
    },
    {
      title: "Quality Score",
      value: "98.5%",
      change: "+0.3%",
      icon: FlaskConical,
      color: "text-emerald-400",
      trend: "up",
    },
    {
      title: "Revenue Today",
      value: "$8.2K",
      change: "+18%",
      icon: TrendingUp,
      color: "text-pink-400",
      trend: "up",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const IconComponent = stat.icon
        return (
          <Card key={stat.title} className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p
                    className={`text-sm ${
                      stat.trend === "up" ? "text-green-400" : stat.trend === "down" ? "text-red-400" : "text-slate-400"
                    }`}
                  >
                    {stat.change} from yesterday
                  </p>
                </div>
                <IconComponent className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
