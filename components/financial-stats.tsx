import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CreditCard, FileText, TrendingUp, Receipt, AlertCircle, CheckCircle, Clock } from "lucide-react"

export function FinancialStats() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$847K",
      change: "+15%",
      icon: DollarSign,
      color: "text-green-400",
      trend: "up",
    },
    {
      title: "Payments Today",
      value: "$24.5K",
      change: "+8%",
      icon: CreditCard,
      color: "text-cyan-400",
      trend: "up",
    },
    {
      title: "Outstanding Invoices",
      value: "$18.7K",
      change: "-12%",
      icon: FileText,
      color: "text-yellow-400",
      trend: "down",
    },
    {
      title: "Insurance Claims",
      value: "$32.1K",
      change: "+22%",
      icon: Receipt,
      color: "text-blue-400",
      trend: "up",
    },
    {
      title: "Processed Claims",
      value: "89%",
      change: "+5%",
      icon: CheckCircle,
      color: "text-purple-400",
      trend: "up",
    },
    {
      title: "Pending Payments",
      value: "23",
      change: "+3",
      icon: Clock,
      color: "text-orange-400",
      trend: "up",
    },
    {
      title: "Overdue Accounts",
      value: "$5.4K",
      change: "-18%",
      icon: AlertCircle,
      color: "text-red-400",
      trend: "down",
    },
    {
      title: "Profit Margin",
      value: "23.5%",
      change: "+2.1%",
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
                    {stat.change} from last month
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
