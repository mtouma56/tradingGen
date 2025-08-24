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
  Zap
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
import { KpiCard, ChartCard, useChartData } from '../components/ui/kpi-card'
import { DataTable } from '../components/ui/data-table'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { Alert, AlertDescription } from '../components/ui/alert'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import { DashboardKPIs, Operation } from '../types'
import { repository } from '../lib/repositories'
import { useValorisation } from '../hooks/useValorisation'
import { formatFCFA, formatKg, formatDate, exportToCSV } from '../lib/utils'

const CHART_COLORS = {
  primary: '#0EA5E9',
  secondary: '#22C55E', 
  accent: '#F59E0B',
  destructive: '#EF4444',
  warning: '#F97316'
}

export function Dashboard() {
  const { t } = useTranslation()
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null)
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30')
  const [selectedProduct, setSelectedProduct] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  const { calculerValeurStock } = useValorisation()

  // Données pour graphiques avec hooks personnalisés
  const stockEvolutionData = useChartData(useMemo(() => {
    const now = new Date()
    const data = []
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      data.push({
        date: formatDate(date),
        value: Math.floor(Math.random() * 10000) + 45000,
        trend: Math.floor(Math.random() * 5000000) + 25000000
      })
    }
    return data
  }, []), 'trend')

  const marginByProductData = useChartData(useMemo(() => {
    const products = ['Hévéa', 'Maïs', 'Cacao', 'Anacarde', 'Café']
    return products.map((product, index) => ({
      name: product,
      value: Math.floor(Math.random() * 50) + 10,
      revenue: Math.floor(Math.random() * 10000000) + 5000000,
      color: Object.values(CHART_COLORS)[index % Object.values(CHART_COLORS).length]
    }))
  }, []), 'distribution')

  const performanceData = useMemo(() => {
    return [
      { name: 'Achats', value: 45, color: CHART_COLORS.primary },
      { name: 'Ventes', value: 35, color: CHART_COLORS.secondary },
      { name: 'Stock', value: 20, color: CHART_COLORS.accent }
    ]
  }, [])

  const chargerDonnees = async () => {
    setLoading(true)
    try {
      const dateLimite = new Date()
      if (period !== 'all') {
        dateLimite.setDate(dateLimite.getDate() - parseInt(period))
      }

      const filtres = {
        date_debut: period === 'all' ? undefined : dateLimite,
        produit: selectedProduct === 'all' ? undefined : selectedProduct
      }
      
      const operationsData = await repository.getOperations(filtres)
      setOperations(operationsData)

      // Calculs KPIs (logique métier PRÉSERVÉE)
      const ventes = operationsData.filter(op => op.type === 'vente')
      const quantite_vendue_kg = ventes.reduce((sum, v) => sum + v.quantite_kg, 0)
      const chiffre_affaires = ventes.reduce((sum, v) => sum + (v.chiffre_affaires || 0), 0)
      const marge_totale = ventes.reduce((sum, v) => sum + (v.marge_totale || 0), 0)
      const cogs_total = ventes.reduce((sum, v) => sum + ((v.cogs_par_kg || 0) * v.quantite_kg), 0)
      const marge_moyenne_kg = quantite_vendue_kg > 0 ? marge_totale / quantite_vendue_kg : 0
      const { stock_kg: stock_actuel_kg, valeur_fcfa: valeur_stock } = await calculerValeurStock()

      const kpisData: DashboardKPIs = {
        nombre_operations: operationsData.length,
        quantite_vendue_kg,
        chiffre_affaires,
        cogs_total,
        marge_totale,
        stock_actuel_kg,
        valeur_stock
      }

      setKpis(kpisData)
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerDonnees()
  }, [period, selectedProduct])

  const handleExportData = () => {
    if (operations.length === 0) return
    
    const dataToExport = operations.map(op => ({
      Date: formatDate(op.date_operation),
      Type: op.type.toUpperCase(),
      Produit: op.produit,
      'Quantité (kg)': op.quantite_kg,
      'Prix unitaire (FCFA)': op.type === 'achat' ? op.prix_achat_par_kg : op.prix_vente_par_kg,
      'Marge totale (FCFA)': op.marge_totale || 0,
      'CA (FCFA)': op.chiffre_affaires || 0
    }))

    exportToCSV(dataToExport, `dashboard_${period}j`)
  }

  if (loading) {
    return <PageLoader text={t('common.loading')} />
  }

  // Données pour les KPI Cards avec graphiques intégrés
  const kpiCardsData = [
    {
      title: t('dashboard.kpis.currentStock'),
      value: formatKg(kpis?.stock_actuel_kg || 0),
      description: 'Stock physique total',
      icon: Package,
      trend: 'up' as const,
      trendValue: '+2.1%',
      chart: {
        type: 'area' as const,
        data: stockEvolutionData.slice(-7),
        colors: [CHART_COLORS.primary]
      }
    },
    {
      title: t('dashboard.kpis.stockValue'),
      value: formatFCFA(kpis?.valeur_stock || 0),
      description: 'Valorisation FIFO',
      icon: DollarSign,
      trend: 'up' as const,
      trendValue: '+5.2%',
      chart: {
        type: 'line' as const,
        data: stockEvolutionData.slice(-7).map(d => ({ ...d, value: d.trend })),
        colors: [CHART_COLORS.secondary]
      }
    },
    {
      title: t('dashboard.kpis.avgMargin'),
      value: formatFCFA((kpis?.quantite_vendue_kg || 0) > 0 ? (kpis?.marge_totale || 0) / (kpis?.quantite_vendue_kg || 1) : 0),
      description: 'Marge moyenne/kg',
      icon: TrendingUp,
      trend: 'down' as const,
      trendValue: '-1.3%',
      chart: {
        type: 'bar' as const,
        data: marginByProductData.slice(-7),
        colors: [CHART_COLORS.accent]
      }
    },
    {
      title: t('dashboard.kpis.operations30d'),
      value: (kpis?.nombre_operations || 0).toString(),
      description: 'Opérations période',
      icon: ShoppingCart,
      trend: 'neutral' as const,
      trendValue: '=',
      chart: {
        type: 'pie' as const,
        data: performanceData,
        colors: [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.accent]
      }
    }
  ]

  // Alertes métier
  const alertes = [
    ...(operations.some(op => op.type === 'vente' && (op.marge_nette_par_kg || 0) < 0) ? [{
      type: 'warning' as const,
      title: 'Marges négatives détectées',
      message: 'Certaines ventes présentent des marges négatives. Vérifiez les prix de vente.'
    }] : []),
    ...((kpis?.stock_actuel_kg || 0) < 10000 ? [{
      type: 'destructive' as const,
      title: 'Stock faible',
      message: 'Le niveau de stock est critique. Envisagez un réapprovisionnement.'
    }] : [])
  ]

  return (
    <div className="space-y-6">
      {/* Header avec filtres */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              FIFO Actif
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-44">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('dashboard.filters.last7days')}</SelectItem>
              <SelectItem value="30">{t('dashboard.filters.last30days')}</SelectItem>
              <SelectItem value="90">{t('dashboard.filters.last90days')}</SelectItem>
              <SelectItem value="all">Toutes les données</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-44">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les produits</SelectItem>
              <SelectItem value="Hévéa">Hévéa</SelectItem>
              <SelectItem value="Maïs">Maïs</SelectItem>
              <SelectItem value="Cacao">Cacao</SelectItem>
              <SelectItem value="Anacarde">Anacarde</SelectItem>
              <SelectItem value="Café">Café</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            variant="outline" 
            onClick={handleExportData}
            disabled={operations.length === 0}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {t('common.export')}
          </Button>
        </div>
      </motion.div>

      {/* Alertes */}
      {alertes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2"
        >
          {alertes.map((alerte, index) => (
            <Alert key={index} variant={alerte.type}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alerte.title}:</strong> {alerte.message}
              </AlertDescription>
            </Alert>
          ))}
        </motion.div>
      )}

      {/* KPI Cards avec graphiques intégrés */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {kpiCardsData.map((kpi, index) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            description={kpi.description}
            icon={kpi.icon}
            trend={kpi.trend}
            trendValue={kpi.trendValue}
            chart={kpi.chart}
          />
        ))}
      </motion.div>

      {/* Onglets pour différentes vues */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Vue d'ensemble
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analyses
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Opérations
          </TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Évolution du stock */}
            <ChartCard 
              title="Évolution du stock"
              description="Tendance sur 30 derniers jours"
              actions={
                <Button variant="outline" size="sm">
                  <Zap className="h-4 w-4" />
                </Button>
              }
            >
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stockEvolutionData}>
                  <defs>
                    <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-sm text-primary">
                              Stock: {formatKg(payload[0]?.value as number)}
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Area 
                    type="monotone"
                    dataKey="value"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fill="url(#stockGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Marge par produit */}
            <ChartCard 
              title="Performance par produit"
              description="Marges et chiffres d'affaires"
            >
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={marginByProductData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-md">
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-sm text-secondary">
                              Marge: {payload[0]?.value}%
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={CHART_COLORS.secondary}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </TabsContent>

        {/* Vue Analyses */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartCard title="Analyse détaillée" description="Métriques avancées">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={stockEvolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={CHART_COLORS.primary}
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="trend" 
                      stroke={CHART_COLORS.secondary}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
            <div>
              <ChartCard title="Répartition" description="Distribution des activités">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </ChartCard>
            </div>
          </div>
        </TabsContent>

        {/* Vue Opérations */}
        <TabsContent value="operations" className="space-y-6">
          {operations.length === 0 ? (
            <EmptyState
              title="Aucune opération"
              description="Aucune opération trouvée pour cette période"
              action={{
                label: "Créer une opération",
                onClick: () => console.log('Navigate to operations')
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Opérations récentes</CardTitle>
                <CardDescription>
                  {operations.length} opération(s) pour la période sélectionnée
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {operations.slice(0, 10).map((operation) => (
                    <motion.div
                      key={operation.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-gray-200"
                      whileHover={{ x: 4, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge 
                            variant={operation.type === 'achat' ? 'secondary' : 'default'}
                            className="text-xs"
                          >
                            {operation.type.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{operation.produit}</span>
                          {operation.type === 'vente' && (operation.marge_nette_par_kg || 0) < 0 && (
                            <Badge variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Marge négative
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(operation.date_operation)} • {formatKg(operation.quantite_kg)}
                          {operation.type === 'vente' && (
                            <span className="ml-2">
                              • Marge: {formatFCFA(operation.marge_totale || 0)}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        {operation.type === 'achat' ? (
                          <p className="font-semibold text-destructive">
                            -{formatFCFA((operation.cout_total_par_kg || 0) * operation.quantite_kg)}
                          </p>
                        ) : (
                          <p className="font-semibold text-secondary">
                            +{formatFCFA(operation.chiffre_affaires || 0)}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}