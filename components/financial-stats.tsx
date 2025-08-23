import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, CreditCard, FileText, TrendingUp, Receipt, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState } from "react"
import { StatDetailModal } from "./modals/StatDetailModal"

interface FinancialStatsProps {
  data?: {
    totalRevenue: number;
    paymentsToday: number;
    outstandingInvoices: number;
    insuranceClaims: number;
    processedClaims: number;
    pendingPayments: number;
    overdueAccounts: number;
    profitMargin: number;
  };
  loading?: boolean;
}

export function FinancialStats({ data, loading = false }: FinancialStatsProps) {
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

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

  const handleCardClick = (stat: any) => {
    setSelectedStat(stat);
    setIsModalOpen(true);
  };

  if (loading) {
    return <FinancialStatsSkeleton />;
  }

  return (
    <>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => {
        const IconComponent = stat.icon
        return (
          <Card 
            key={stat.title} 
            className={`bg-slate-800/50 border-slate-700/50 transition-all hover:scale-105 hover:border-cyan-400/30 cursor-pointer ${
              selectedStat === stat.title ? 'border-cyan-400/50 scale-105' : ''
            }`}
            onClick={() => handleCardClick(stat)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className={`text-sm ${stat.trend === "up" ? "text-green-400" : "text-red-400"}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <IconComponent className={`w-8 h-8 ${stat.color} cursor-help`} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Click card for details</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
    <StatDetailModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        stat={selectedStat} 
      />
  </>
  )
}

function FinancialStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-700 rounded mb-2 w-2/3"></div>
              <div className="h-6 bg-slate-700 rounded mb-2 w-1/2"></div>
              <div className="h-3 bg-slate-700 rounded w-1/3"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
