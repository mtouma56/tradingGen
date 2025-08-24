import * as React from "react"
import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus, BarChart3, LineChart, PieChart as PieChartIcon } from "lucide-react"
import {
  LineChart as RechartsLineChart,
  AreaChart,
  BarChart as RechartsBarChart,
  PieChart as RechartsPieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  Area,
  Bar,
  Pie,
} from "recharts"

import { cn } from "../../lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./Card"

interface KpiCardProps {
  title: string
  value: string | number
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ElementType
  className?: string
  chart?: {
    type: "line" | "area" | "bar" | "pie"
    data: any[]
    dataKey?: string
    xKey?: string
    colors?: string[]
  }
  loading?: boolean
}

const CHART_COLORS = {
  primary: "#0EA5E9",
  secondary: "#22C55E", 
  accent: "#F59E0B",
  muted: "#64748B"
}

export function KpiCard({
  title,
  value,
  description,
  trend = "neutral",
  trendValue,
  icon: Icon,
  className,
  chart,
  loading = false,
}: KpiCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-emerald-600"
      case "down":
        return "text-red-600"
      default:
        return "text-muted-foreground"
    }
  }

  const renderChart = () => {
    if (!chart || !chart.data.length) return null

    const { type, data, dataKey = "value", xKey = "name", colors = [CHART_COLORS.primary] } = chart

    const chartProps = {
      width: "100%",
      height: 100,
      data,
    }

    switch (type) {
      case "line":
        return (
          <ResponsiveContainer {...chartProps}>
            <RechartsLineChart data={data}>
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                dot={false}
                className="opacity-80"
              />
              <XAxis dataKey={xKey} hide />
              <YAxis hide />
            </RechartsLineChart>
          </ResponsiveContainer>
        )

      case "area":
        return (
          <ResponsiveContainer {...chartProps}>
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors[0]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={colors[0]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={colors[0]}
                strokeWidth={2}
                fill="url(#colorArea)"
              />
              <XAxis dataKey={xKey} hide />
              <YAxis hide />
            </AreaChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer {...chartProps}>
            <RechartsBarChart data={data}>
              <Bar dataKey={dataKey} fill={colors[0]} radius={[2, 2, 0, 0]} />
              <XAxis dataKey={xKey} hide />
              <YAxis hide />
            </RechartsBarChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer {...chartProps}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={20}
                outerRadius={40}
                dataKey={dataKey}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="h-4 w-4 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("relative overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold leading-none">
                {typeof value === 'number' 
                  ? value.toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                  : value
                }
              </div>
              {trendValue && (
                <div className={cn("flex items-center gap-1 text-xs mt-1", getTrendColor())}>
                  {getTrendIcon()}
                  {trendValue}
                </div>
              )}
              {description && (
                <CardDescription className="text-xs mt-1">
                  {description}
                </CardDescription>
              )}
            </div>
            {chart && (
              <div className="flex-shrink-0 w-24">
                {renderChart()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Composants de graphiques dédiés pour plus de flexibilité
interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

export function ChartCard({ title, description, children, className, actions }: ChartCardProps) {
  return (
    <Card className={cn("p-0", className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description && (
            <CardDescription className="text-sm mt-1">
              {description}
            </CardDescription>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  )
}

// Hook pour les données de graphique
export function useChartData(data: any[], type: string = "trend") {
  return React.useMemo(() => {
    switch (type) {
      case "trend":
        return data.map((item, index) => ({
          name: `${index + 1}`,
          value: item.value || 0,
          date: item.date,
        }))
      
      case "distribution":
        return data.map((item, index) => ({
          name: item.name || `Item ${index + 1}`,
          value: item.value || 0,
          color: item.color || CHART_COLORS.primary,
        }))
      
      default:
        return data
    }
  }, [data, type])
}

// Composants d'icônes pour les différents types de graphiques
export const ChartIcons = {
  Bar: BarChart3,
  Line: LineChart,
  Pie: PieChartIcon,
  Trend: TrendingUp,
}