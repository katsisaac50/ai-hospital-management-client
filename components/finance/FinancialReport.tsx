"use client"

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import { Card } from "@/components/ui/card"

type ReportData = {
  month: string
  revenue: number
  expenses: number
}

type Props = {
  data: ReportData[]
  totalRevenue: number
  totalExpenses: number
}

export function FinancialReport({ data, totalRevenue, totalExpenses }: Props) {
  const netProfit = totalRevenue - totalExpenses
  const profitGrowth = ((netProfit / (totalExpenses || 1)) * 100).toFixed(2)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">Monthly Revenue</h3>
          <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">Monthly Expenses</h3>
          <p className="text-2xl font-bold text-red-500">${totalExpenses.toLocaleString()}</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm text-muted-foreground">Net Profit</h3>
          <p className="text-2xl font-bold text-blue-500">${netProfit.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-1">+{profitGrowth}%</p>
        </Card>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">Financial Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#22c55e" name="Revenue" />
            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
