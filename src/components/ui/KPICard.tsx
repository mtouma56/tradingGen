import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from './Card'
import { Skeleton } from './Skeleton'
import { cn } from '../../lib/utils'

interface KPICardProps {
  title: string
  value: string | number
  previousValue?: number
  icon: LucideIcon
  iconColor?: string
  loading?: boolean
  format?: 'number' | 'currency' | 'percentage'
  className?: string
}

export function KPICard({ 
  title, 
  value, 
  previousValue,
  icon: Icon, 
  iconColor = "bg-primary", 
  loading = false,
  format = 'number',
  className 
}: KPICardProps) {
  
  // Calculer la variation si previousValue est fourni
  const currentNumValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value
  const variation = previousValue && previousValue !== 0 
    ? ((currentNumValue - previousValue) / previousValue) * 100 
    : null

  const isPositive = variation && variation > 0
  const isNegative = variation && variation < 0

  if (loading) {
    return (
      <Card className={cn("kpi-card", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-12 w-12 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={cn("kpi-card cursor-pointer", className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="space-y-1">
                <p className="text-2xl font-bold">
                  {value}
                </p>
                {variation !== null && (
                  <div className="flex items-center gap-1">
                    {isPositive && <TrendingUp className="h-3 w-3 text-secondary" />}
                    {isNegative && <TrendingDown className="h-3 w-3 text-destructive" />}
                    <span className={cn(
                      "text-xs font-medium",
                      isPositive && "text-secondary",
                      isNegative && "text-destructive",
                      !isPositive && !isNegative && "text-muted-foreground"
                    )}>
                      {variation > 0 ? '+' : ''}{variation.toFixed(1)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      vs période précédente
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm",
              iconColor
            )}>
              <Icon className="h-6 w-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}