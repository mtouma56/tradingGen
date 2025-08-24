import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  ShoppingCart, 
  Package, 
  ArrowUpDown, 
  Settings,
  ChevronLeft,
  Warehouse,
  Activity
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { Separator } from '../ui/Separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip'
import { cn } from '../../lib/utils'

interface SidebarProps {
  isCollapsed: boolean
  onCollapse: (collapsed: boolean) => void
}

const sidebarVariants = {
  expanded: { width: '16rem' },
  collapsed: { width: '4rem' }
}

const contentVariants = {
  expanded: { opacity: 1, x: 0 },
  collapsed: { opacity: 0, x: -10 }
}

export function Sidebar({ isCollapsed, onCollapse }: SidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()

  const menuItems = [
    {
      path: '/dashboard',
      name: t('nav.dashboard'),
      icon: BarChart3,
      description: 'Vue d\'ensemble des KPIs'
    },
    {
      path: '/operations',
      name: t('nav.operations'),
      icon: ShoppingCart,
      description: 'Achats et ventes'
    },
    {
      path: '/inventaire',
      name: t('nav.inventory'),
      icon: Package,
      description: 'Gestion des stocks'
    },
    {
      path: '/mouvements',
      name: t('nav.movements'),
      icon: ArrowUpDown,
      description: 'Historique des mouvements'
    },
    {
      path: '/parametres',
      name: t('nav.settings'),
      icon: Settings,
      description: 'Configuration système'
    }
  ]

  return (
    <TooltipProvider>
      <motion.div
        variants={sidebarVariants}
        animate={isCollapsed ? 'collapsed' : 'expanded'}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 z-40 h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-r border-gray-200 shadow-lg"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Warehouse className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-sm font-semibold text-foreground">Trading Hévéa</h1>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">FIFO Inventory</span>
                    </div>
                  </div>
                </motion.div>
              )}
              {isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm mx-auto"
                >
                  <Warehouse className="h-5 w-5" />
                </motion.div>
              )}
            </AnimatePresence>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onCollapse(!isCollapsed)}
              className={cn("h-8 w-8 hover:bg-accent", isCollapsed && "mx-auto mt-2")}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform duration-200",
                isCollapsed && "rotate-180"
              )} />
            </Button>
          </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path
            
            const NavigationItem = (
              <motion.div
                key={`nav-${item.path}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="w-full"
              >
                <Link to={item.path}>
                  <Card className={cn(
                    "p-0 transition-all duration-200 cursor-pointer border-0 shadow-none",
                    "hover:bg-accent hover:shadow-md hover:scale-[1.02]",
                    "active:scale-[0.98]",
                    isActive && "bg-primary/10 border-l-2 border-l-primary shadow-md"
                  )}>
                    <div className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-colors",
                      isActive && "text-primary",
                      isCollapsed && "justify-center p-2"
                    )}>
                      <item.icon className={cn(
                        "h-5 w-5 flex-shrink-0 transition-transform",
                        isActive && "text-primary scale-110"
                      )} />
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 text-left overflow-hidden"
                          >
                            <div className="font-medium text-sm">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.description}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      {!isCollapsed && isActive && (
                        <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                          <Activity className="h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </Card>
                </Link>
              </motion.div>
            )
            
            if (isCollapsed) {
              return (
                <Tooltip key={item.path} delayDuration={300}>
                  <TooltipTrigger asChild>
                    {NavigationItem}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="ml-2">
                    <div className="text-sm font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </TooltipContent>
                </Tooltip>
              )
            }
            
            return NavigationItem
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="p-3 bg-muted/30 border-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="h-5 px-2 text-xs">
                      v2.0.0
                    </Badge>
                    <Badge 
                      variant={import.meta.env.DEV ? "destructive" : "default"} 
                      className="h-5 px-2 text-xs"
                    >
                      {import.meta.env.DEV ? 'DEV' : 'PROD'}
                    </Badge>
                  </div>
                  <Separator className="my-2" />
                  <div className="text-xs text-muted-foreground">
                    Système FIFO • Trading Hévéa
                  </div>
                </Card>
              </motion.div>
            )}
            {isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="flex justify-center"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
    </TooltipProvider>
  )
}