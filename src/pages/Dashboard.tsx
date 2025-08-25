import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Package,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  BarChart3,
  Activity,
  AlertTriangle,
  Zap,
  Eye
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { Alert, AlertDescription } from '../components/ui/alert'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { DashboardKPIs, Operation } from '../types'
import { repository } from '../lib/repositories'
import { formatFCFA, formatKg, formatDate, exportToCSV } from '../lib/utils'

const CHART_COLORS = {
  primary: '#0EA5E9',
  secondary: '#22C55E',
  accent: '#F59E0B',
  muted: '#6B7280'
}

// Composant KPI Card
function KPICard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'up',
  className = ''
}: {
  title: string
  value: string | number
  change?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <p className={`text-xs flex items-center gap-1 ${
                trend === 'up' ? 'text-green-600' :
                trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
              }`}>
                <TrendingUp className={`h-3 w-3 ${trend === 'down' ? 'rotate-180' : ''}`} />
                {change}
              </p>
            )}
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [operations, setOperations] = useState<Operation[]>([])
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Charger les opérations
        const operationsData = await repository.getOperations()
        setOperations(operationsData)

        // Calculer les KPIs
        const achats = operationsData.filter(op => op.type === 'achat')
        const ventes = operationsData.filter(op => op.type === 'vente')

        const totalQuantiteAchetee = achats.reduce((sum, op) => sum + op.quantite_kg, 0)
        const totalQuantiteVendue = ventes.reduce((sum, op) => sum + op.quantite_kg, 0)
        const stockActuel = totalQuantiteAchetee - totalQuantiteVendue

        const chiffreAffaires = ventes.reduce((sum, op) => 
          sum + (op.chiffre_affaires || (op.quantite_kg * (op.prix_vente_par_kg || 0))), 0
        )

        const margeTotal = ventes.reduce((sum, op) => 
          sum + (op.marge_totale || 0), 0
        )

        // Calculer la valeur du stock (estimation simple)
        const coutMoyenAchat = achats.length > 0 
          ? achats.reduce((sum, op) => sum + ((op.prix_achat_par_kg || 0) + op.chargement_par_kg + op.transport_par_kg + op.autres_depenses_par_kg), 0) / achats.length
          : 0
        const valeurStock = stockActuel * coutMoyenAchat

        const calculatedKpis: DashboardKPIs = {
          nombre_operations: operationsData.length,
          quantite_vendue_kg: totalQuantiteVendue,
          chiffre_affaires: chiffreAffaires,
          cogs_total: 0, // À implémenter avec la logique FIFO
          marge_totale: margeTotal,
          stock_actuel_kg: stockActuel,
          valeur_stock: valeurStock
        }

        setKpis(calculatedKpis)

      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
        setError('Erreur lors du chargement des données')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [selectedPeriod])

  // Données pour les graphiques
  const chartData = useMemo(() => {
    if (!operations.length) return { ventesPeriode: [], margesProduit: [], evolutionStock: [] }

    // Évolution des ventes par mois
    const ventesPeriode = operations
      .filter(op => op.type === 'vente')
      .reduce((acc, op) => {
        const month = new Date(op.date_operation).toLocaleDateString('fr-FR', { 
          year: 'numeric', 
          month: 'short' 
        })
        
        const existing = acc.find(item => item.mois === month)
        if (existing) {
          existing.ventes += op.quantite_kg
          existing.ca += op.chiffre_affaires || (op.quantite_kg * (op.prix_vente_par_kg || 0))
        } else {
          acc.push({
            mois: month,
            ventes: op.quantite_kg,
            ca: op.chiffre_affaires || (op.quantite_kg * (op.prix_vente_par_kg || 0))
          })
        }
        return acc
      }, [] as Array<{ mois: string; ventes: number; ca: number }>)

    // Marges par produit
    const margesProduit = operations
      .filter(op => op.type === 'vente')
      .reduce((acc, op) => {
        const existing = acc.find(item => item.produit === op.produit)
        if (existing) {
          existing.marge += op.marge_totale || 0
          existing.quantite += op.quantite_kg
        } else {
          acc.push({
            produit: op.produit,
            marge: op.marge_totale || 0,
            quantite: op.quantite_kg
          })
        }
        return acc
      }, [] as Array<{ produit: string; marge: number; quantite: number }>)

    return { ventesPeriode, margesProduit, evolutionStock: [] }
  }, [operations])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error} - Vérifiez votre connexion à la base de données.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble des performances et KPIs</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="90d">3 mois</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </motion.div>

      {/* KPIs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <KPICard
          title="Total Opérations"
          value={kpis?.nombre_operations || 0}
          change="+12% ce mois"
          icon={Activity}
          trend="up"
        />
        <KPICard
          title="Stock Actuel"
          value={formatKg(kpis?.stock_actuel_kg || 0)}
          change="+5% ce mois"
          icon={Package}
          trend="up"
        />
        <KPICard
          title="Chiffre d'Affaires"
          value={formatFCFA(kpis?.chiffre_affaires || 0)}
          change="+18% ce mois"
          icon={DollarSign}
          trend="up"
        />
        <KPICard
          title="Valeur du Stock"
          value={formatFCFA(kpis?.valeur_stock || 0)}
          change="+3% ce mois"
          icon={TrendingUp}
          trend="up"
        />
      </motion.div>

      {/* Contenu principal */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="operations">Opérations récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Évolution des ventes */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Évolution des Ventes
                  </CardTitle>
                  <CardDescription>
                    Quantité vendue par période
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.ventesPeriode.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData.ventesPeriode}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="mois" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [formatKg(value), 'Ventes']} />
                        <Line 
                          type="monotone" 
                          dataKey="ventes" 
                          stroke={CHART_COLORS.primary} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState 
                      title="Aucune donnée de vente"
                      description="Les graphiques apparaîtront après les premières ventes"
                      icon={BarChart3}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Marges par produit */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Marges par Produit
                  </CardTitle>
                  <CardDescription>
                    Rentabilité par type d'hévéa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {chartData.margesProduit.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData.margesProduit}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="produit" />
                        <YAxis />
                        <Tooltip formatter={(value: any) => [formatFCFA(value), 'Marge']} />
                        <Bar 
                          dataKey="marge" 
                          fill={CHART_COLORS.secondary}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyState 
                      title="Aucune marge calculée"
                      description="Les données de marge apparaîtront après les premières ventes"
                      icon={TrendingUp}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Détail des Ventes</CardTitle>
              <CardDescription>
                Analyse complète des performances de vente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState 
                title="Analyse des ventes"
                description="Graphiques détaillés des performances de vente"
                icon={ShoppingCart}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock">
          <Card>
            <CardHeader>
              <CardTitle>Gestion du Stock</CardTitle>
              <CardDescription>
                État actuel et évolution du stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState 
                title="Analyse du stock"
                description="Graphiques de l'évolution du stock par dépôt"
                icon={Package}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle>Opérations Récentes</CardTitle>
              <CardDescription>
                Dernières transactions et mouvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {operations.length > 0 ? (
                <div className="space-y-4">
                  {operations.slice(-5).reverse().map((operation) => (
                    <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          operation.type === 'achat' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        <div>
                          <p className="font-medium">{operation.produit}</p>
                          <p className="text-sm text-muted-foreground">
                            {operation.type === 'achat' ? operation.point_achat : operation.point_vente}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatKg(operation.quantite_kg)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(operation.date_operation)}
                        </p>
                      </div>
                      <Badge variant={operation.type === 'achat' ? 'secondary' : 'default'}>
                        {operation.type}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="Aucune opération"
                  description="Les opérations récentes apparaîtront ici"
                  icon={Activity}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}