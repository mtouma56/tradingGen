import React from 'react'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Menu, User, Bell, Search, Settings, LogOut, ChevronDown } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Input } from '../ui/Input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import { ThemeToggle } from '../ThemeToggle'
import { LanguageToggle } from '../LanguageToggle'
import { cn } from '../../lib/utils'

interface TopbarProps {
  isCollapsed: boolean
  onToggleSidebar: () => void
}

const pageData: Record<string, { title: string; subtitle?: string; icon?: React.ElementType }> = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Vue d\'ensemble des performances et KPIs' },
  '/operations': { title: 'Opérations', subtitle: 'Gestion des achats, ventes et calculs FIFO' },
  '/inventaire': { title: 'Inventaire', subtitle: 'Gestion des stocks par dépôt avec traçabilité' },
  '/mouvements': { title: 'Mouvements', subtitle: 'Historique complet des entrées et sorties' },
  '/parametres': { title: 'Paramètres', subtitle: 'Configuration système et préférences' }
}

export function Topbar({ isCollapsed, onToggleSidebar }: TopbarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const currentPageData = pageData[location.pathname]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-0 z-30 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-200 shadow-sm transition-all duration-300",
        isCollapsed ? "left-16" : "left-64",
        "right-0"
      )}
    >
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4 flex-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="h-9 w-9 lg:hidden hover:bg-accent"
          >
            <Menu className="h-4 w-4" />
          </Button>

          <motion.div 
            className="flex items-center gap-4 flex-1"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg lg:text-xl font-semibold tracking-tight">
                  {currentPageData ? currentPageData.title : 'Trading Hévéa'}
                </h1>
                {location.pathname !== '/dashboard' && (
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    FIFO
                  </Badge>
                )}
              </div>
              {currentPageData?.subtitle && (
                <motion.p 
                  className="text-sm text-muted-foreground hidden lg:block max-w-md truncate"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {currentPageData.subtitle}
                </motion.p>
              )}
            </div>
            
            {/* Search Bar (hidden on mobile) */}
            <div className="hidden md:flex items-center relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 pr-4 h-9 w-64 bg-muted/30 border-0 focus:bg-background focus:ring-1 focus:ring-primary"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Section */}
        <motion.div 
          className="flex items-center gap-2"
          initial={{ x: 10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9 hover:bg-accent">
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-destructive text-destructive-foreground">
              3
            </Badge>
          </Button>
          
          <div className="hidden sm:flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
          
          <div className="hidden lg:block w-px h-6 bg-border mx-2" />
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-9 px-2 hover:bg-accent">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="" alt="Admin" />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium">Admin</span>
                  <span className="text-xs text-muted-foreground">Gestionnaire</span>
                </div>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Admin User</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@trading-hevea.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile Menu */}
          <div className="sm:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48" align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <Search className="mr-2 h-4 w-4" />
                  <span>Rechercher</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Préférences</DropdownMenuLabel>
                <DropdownMenuItem className="cursor-pointer">
                  Langue
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Thème
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </div>
    </motion.header>
  )
}