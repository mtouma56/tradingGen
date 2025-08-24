import React from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Plus, Download, Filter, TrendingUp, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Alert, AlertDescription } from '../components/ui/alert'

export function Operations() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Opérations</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <ShoppingCart className="h-3 w-3" />
              FIFO
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Gestion des achats, ventes et calculs FIFO</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtrer
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle opération
          </Button>
        </div>
      </motion.div>

      {/* Alert FIFO */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            <strong>Système FIFO actif :</strong> Les calculs de coût des marchandises vendues (COGS) 
            sont automatiquement basés sur la méthode First In, First Out pour une valorisation précise.
          </AlertDescription>
        </Alert>
      </motion.div>

      {/* Message de refactor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <ShoppingCart className="h-5 w-5" />
              Interface modernisée avec TanStack Table
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-emerald-600 dark:text-emerald-300">
                Cette page utilisera bientôt la DataTable TanStack ultra-performante avec :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-emerald-600 dark:text-emerald-300">
                <li>Tri multi-colonnes instantané</li>
                <li>Filtres avancés par produit, date, type</li>
                <li>Recherche globale en temps réel</li>
                <li>Pagination virtualisée</li>
                <li>Dialogs react-hook-form pour CRUD</li>
                <li>Validation Zod complète</li>
              </ul>
              <div className="mt-4">
                <Badge variant="secondary">
                  Calculs FIFO/COGS préservés à 100%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: "Opérations ce mois", 
            value: "127", 
            subtitle: "+12% vs mois dernier", 
            color: "text-blue-600",
            trend: "up"
          },
          { 
            title: "Chiffre d'affaires", 
            value: "2.4M FCFA", 
            subtitle: "+8.2% vs mois dernier", 
            color: "text-emerald-600",
            trend: "up"
          },
          { 
            title: "Marge moyenne", 
            value: "180 FCFA/kg", 
            subtitle: "-2.1% vs mois dernier", 
            color: "text-amber-600",
            trend: "down"
          },
          { 
            title: "Stock valorisé", 
            value: "45.2T kg", 
            subtitle: "Valeur: 28.7M FCFA", 
            color: "text-purple-600",
            trend: "neutral"
          }
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                  {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
                  {item.trend === 'down' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  {item.trend === 'neutral' && <ShoppingCart className="h-4 w-4 text-muted-foreground" />}
                </div>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.subtitle}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Operations Table Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Opérations récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Vente', produit: 'Hévéa', quantite: '2,500 kg', prix: '850 FCFA/kg', marge: '+125,000 FCFA', status: 'success' },
                { type: 'Achat', produit: 'Cacao', quantite: '1,200 kg', prix: '1,200 FCFA/kg', marge: '-1,440,000 FCFA', status: 'neutral' },
                { type: 'Vente', produit: 'Maïs', quantite: '800 kg', prix: '450 FCFA/kg', marge: '-25,000 FCFA', status: 'warning' },
              ].map((op, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={op.type === 'Achat' ? 'secondary' : 'default'}>
                      {op.type}
                    </Badge>
                    <div>
                      <p className="font-medium">{op.produit}</p>
                      <p className="text-sm text-muted-foreground">{op.quantite} • {op.prix}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      op.status === 'success' ? 'text-emerald-600' : 
                      op.status === 'warning' ? 'text-amber-600' : 
                      'text-muted-foreground'
                    }`}>
                      {op.marge}
                    </p>
                    {op.status === 'warning' && (
                      <Badge variant="destructive" className="text-xs mt-1">
                        Marge négative
                      </Badge>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}