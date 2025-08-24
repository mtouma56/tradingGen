import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Settings, 
  Menu, 
  X,
  Warehouse,
  TrendingUp
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      id: 'dashboard',
      name: 'Tableau de bord',
      icon: BarChart3,
      description: 'Vue d\'ensemble des KPIs'
    },
    {
      id: 'operations',
      name: 'Opérations',
      icon: ShoppingCart,
      description: 'Achats et ventes'
    },
    {
      id: 'inventaire',
      name: 'Inventaire',
      icon: Package,
      description: 'Gestion des stocks'
    },
    {
      id: 'mouvements',
      name: 'Mouvements',
      icon: TrendingUp,
      description: 'Historique des mouvements'
    },
    {
      id: 'parametres',
      name: 'Paramètres',
      icon: Settings,
      description: 'Configuration système'
    }
  ];

  const currentMenuItem = menuItems.find(item => item.id === currentPage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar pour mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Trading Hévéa
              </h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="p-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-lg mb-2 text-left transition-colors ${
                    currentPage === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </button>
              ))}
            </nav>
          </motion.div>
        </div>
      )}

      {/* Sidebar pour desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center px-6 py-6 border-b border-gray-200 dark:border-gray-700">
            <Warehouse className="h-8 w-8 text-primary mr-3" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Trading Hévéa
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Gestion d'inventaire FIFO
              </p>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                  currentPage === item.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-xs opacity-75">{item.description}</div>
                </div>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Version 1.0.0 • Mode {process.env.NODE_ENV === 'development' ? 'Développement' : 'Production'}
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
        {/* Header mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center">
            {currentMenuItem && (
              <>
                <currentMenuItem.icon className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {currentMenuItem.name}
                </span>
              </>
            )}
          </div>
          
          <div className="w-10" /> {/* Spacer pour centrer le titre */}
        </div>

        {/* Contenu de la page */}
        <main className="p-4 lg:p-8">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}