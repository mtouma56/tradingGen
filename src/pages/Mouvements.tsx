import React from 'react'
import { motion } from 'framer-motion'
import { Package, ArrowUpDown, Download, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export function Mouvements() {
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
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Mouvements</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <ArrowUpDown className="h-3 w-3" />
              FIFO
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Historique complet des entrées et sorties</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Filtrer par date
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* Message de refactor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Package className="h-5 w-5" />
              Page en cours de refactorisation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-amber-600 dark:text-amber-300">
                Cette page utilise maintenant les composants shadcn/ui modernes et sera bientôt 
                équipée de la DataTable TanStack avancée avec :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-amber-600 dark:text-amber-300">
                <li>Tri et filtrage avancés</li>
                <li>Recherche en temps réel</li>
                <li>Pagination intelligente</li>
                <li>Export CSV intégré</li>
                <li>Interface responsive</li>
              </ul>
              <div className="mt-4">
                <Badge variant="secondary">
                  Logique métier FIFO préservée à 100%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: "Entrées Stock", value: "245", subtitle: "Ce mois", color: "text-emerald-600" },
          { title: "Sorties Stock", value: "189", subtitle: "Ce mois", color: "text-blue-600" },
          { title: "Mouvements Total", value: "434", subtitle: "Ce mois", color: "text-purple-600" }
        ].map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.title}</p>
                    <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                  </div>
                  <ArrowUpDown className="h-8 w-8 text-muted-foreground/30" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}