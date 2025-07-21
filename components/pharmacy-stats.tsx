import { Card, CardContent } from "@/components/ui/card"
import { Pill, Package, AlertTriangle, TrendingUp, FileText, CheckCircle, Clock, ShoppingCart } from "lucide-react"

export function PharmacyStats() {
  const stats = [
    {
      title: "Total Medications",
      value: "1,247",
      change: "+23",
      icon: Pill,
      color: "text-cyan-400",
      trend: "up",
    },
    {
      title: "In Stock",
      value: "1,089",
      change: "+12",
      icon: Package,
      color: "text-green-400",
      trend: "up",
    },
    {
      title: "Low Stock Alerts",
      value: "34",
      change: "-8",
      icon: AlertTriangle,
      color: "text-yellow-400",
      trend: "down",
    },
    {
      title: "Prescriptions Today",
      value: "89",
      change: "+15",
      icon: FileText,
      color: "text-blue-400",
      trend: "up",
    },
    {
      title: "Dispensed Today",
      value: "67",
      change: "+12",
      icon: CheckCircle,
      color: "text-purple-400",
      trend: "up",
    },
    {
      title: "Pending Orders",
      value: "22",
      change: "+5",
      icon: Clock,
      color: "text-orange-400",
      trend: "up",
    },
    {
      title: "Stock Orders",
      value: "8",
      change: "+2",
      icon: ShoppingCart,
      color: "text-pink-400",
      trend: "up",
    },
    {
      title: "Revenue Today",
      value: "$12.4K",
      change: "+18%",
      icon: TrendingUp,
      color: "text-emerald-400",
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
                  <p className={`text-sm ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
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
