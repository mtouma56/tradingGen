import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  Package,
  Warehouse,
  ArrowUpDown,
  Plus,
  Eye,
  Download,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  Calendar,
  Search,
  BarChart3,
  Box,
  RefreshCw,
  FileText
} from 'lucide-react'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { KPICard } from '../components/ui/KPICard'
import { DataTable } from '../components/ui/DataTable'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { EmptyState } from '../components/ui/EmptyState'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/Dialog'
import { StockParProduit, Depot, LotInventaire, Parametres } from '../types'
import { repository } from '../lib/repositories'
import { useValorisation } from '../hooks/useValorisation'
import { formatFCFA, formatKg, formatDate, exportToCSV } from '../lib/utils'

interface StockData {
  produit: string
  depot_id: string
  depot_nom: string
  stock_kg: number
  valeur_fcfa: number
  lots: LotInventaire[]
  prix_moyen_kg: number
  anciennete_moyenne: number
  stock_critique: boolean
}

interface ProductCard {
  produit: string
  total_stock_kg: number
  total_valeur_fcfa: number
  prix_moyen_kg: number
  nb_depots: number
  nb_lots: number
  anciennete_moyenne: number
  stock_critique: boolean
  depots: StockData[]
}

export function Inventaire() {
  const { t } = useTranslation()
  const [stockData, setStockData] = useState<StockData[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [parametres, setParametres] = useState<Parametres | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)
  const [selectedLots, setSelectedLots] = useState<LotInventaire[]>([])
  const [showLotsDialog, setShowLotsDialog] = useState(false)
  
  // Filtres
  const [filters, setFilters] = useState({
    produit: '',
    depot_id: '',
    stock_critique: false,
    anciennete: 'all' // all, recent, ancien
  })

  // États pour TanStack Table
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const { calculerValeurStock, modeValorisation } = useValorisation()

  const chargerDonnees = async () => {
    setLoading(true)
    try {
      // Charger dépôts et paramètres
      const [depotsData, parametresData] = await Promise.all([
        repository.getDepots(),
        repository.getParametres()
      ])
      
      setDepots(depotsData.filter(d => d.actif))
      setParametres(parametresData)

      // Charger tous les lots
      const lots = await repository.getLots()
      const lotsActifs = lots.filter(lot => lot.quantite_kg_restante > 0)

      // Grouper par produit et dépôt
      const stockGroups: Record<string, StockData> = {}

      for (const lot of lotsActifs) {
        const key = `${lot.produit}-${lot.depot_id}`
        
        if (!stockGroups[key]) {
          const depot = depotsData.find(d => d.id === lot.depot_id)
          stockGroups[key] = {
            produit: lot.produit,
            depot_id: lot.depot_id,
            depot_nom: depot?.nom || 'Dépôt inconnu',
            stock_kg: 0,
            valeur_fcfa: 0,
            lots: [],
            prix_moyen_kg: 0,
            anciennete_moyenne: 0,
            stock_critique: false
          }
        }

        stockGroups[key].stock_kg += lot.quantite_kg_restante
        stockGroups[key].valeur_fcfa += lot.quantite_kg_restante * lot.cout_unitaire_par_kg
        stockGroups[key].lots.push(lot)
      }

      // Calculer métriques additionnelles
      Object.values(stockGroups).forEach(stock => {
        stock.prix_moyen_kg = stock.valeur_fcfa / stock.stock_kg
        stock.anciennete_moyenne = stock.lots.reduce((sum, lot) => {
          const jours = Math.floor((Date.now() - lot.date_entree.getTime()) / (1000 * 60 * 60 * 24))
          return sum + jours
        }, 0) / stock.lots.length
        stock.stock_critique = stock.stock_kg < 1000 // Seuil critique configurable
      })

      // Trier par dépôt puis par produit
      const stockArray = Object.values(stockGroups).sort((a, b) => {
        if (a.depot_nom !== b.depot_nom) {
          return a.depot_nom.localeCompare(b.depot_nom)
        }
        return a.produit.localeCompare(b.produit)
      })

      setStockData(stockArray)
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chargerDonnees()
  }, [])

  // Grouper par produit pour les cartes
  const productCards: ProductCard[] = useMemo(() => {
    const productGroups: Record<string, ProductCard> = {}

    stockData.forEach(stock => {
      if (!productGroups[stock.produit]) {
        productGroups[stock.produit] = {
          produit: stock.produit,
          total_stock_kg: 0,
          total_valeur_fcfa: 0,
          prix_moyen_kg: 0,
          nb_depots: 0,
          nb_lots: 0,
          anciennete_moyenne: 0,
          stock_critique: false,
          depots: []
        }
      }

      const product = productGroups[stock.produit]
      product.total_stock_kg += stock.stock_kg
      product.total_valeur_fcfa += stock.valeur_fcfa
      product.nb_depots += 1
      product.nb_lots += stock.lots.length
      product.depots.push(stock)
    })

    // Calculer les métriques finales
    Object.values(productGroups).forEach(product => {
      product.prix_moyen_kg = product.total_valeur_fcfa / product.total_stock_kg
      product.anciennete_moyenne = product.depots.reduce((sum, depot) => sum + depot.anciennete_moyenne, 0) / product.nb_depots
      product.stock_critique = product.total_stock_kg < 5000 // Seuil critique global
    })

    return Object.values(productGroups).sort((a, b) => a.produit.localeCompare(b.produit))
  }, [stockData])

  // Données filtrées
  const filteredStockData = useMemo(() => {
    let filtered = stockData

    if (filters.produit) {
      filtered = filtered.filter(stock => 
        stock.produit.toLowerCase().includes(filters.produit.toLowerCase())
      )
    }
    if (filters.depot_id) {
      filtered = filtered.filter(stock => stock.depot_id === filters.depot_id)
    }
    if (filters.stock_critique) {
      filtered = filtered.filter(stock => stock.stock_critique)
    }
    if (filters.anciennete !== 'all') {
      filtered = filtered.filter(stock => {
        if (filters.anciennete === 'recent') return stock.anciennete_moyenne <= 30
        if (filters.anciennete === 'ancien') return stock.anciennete_moyenne > 90
        return true
      })
    }

    return filtered
  }, [stockData, filters])

  // Définition des colonnes pour les lots
  const lotsColumns: ColumnDef<LotInventaire>[] = useMemo(() => [
    {
      accessorKey: 'date_entree',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Date d'entrée
        </Button>
      ),
      cell: ({ row }) => formatDate(row.getValue('date_entree')),
      sortingFn: 'datetime',
    },
    {
      accessorKey: 'quantite_kg_restante',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Quantité restante
        </Button>
      ),
      cell: ({ row }) => formatKg(row.getValue('quantite_kg_restante')),
    },
    {
      accessorKey: 'cout_unitaire_par_kg',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2 lg:px-3"
        >
          Coût unitaire/kg
        </Button>
      ),
      cell: ({ row }) => formatFCFA(row.getValue('cout_unitaire_par_kg')),
    },
    {
      id: 'valeur_totale',
      header: 'Valeur totale',
      cell: ({ row }) => {
        const lot = row.original
        return formatFCFA(lot.quantite_kg_restante * lot.cout_unitaire_par_kg)
      },
    },
    {
      id: 'fournisseur',
      header: 'Fournisseur',
      cell: ({ row }) => {
        const lot = row.original
        return (
          <div className="max-w-32 truncate">
            {lot.metadata?.fournisseur || '-'}
          </div>
        )
      },
    },
    {
      id: 'numero_bl',
      header: 'N° BL',
      cell: ({ row }) => {
        const lot = row.original
        return (
          <div className="max-w-20 truncate">
            {lot.metadata?.numero_bl || '-'}
          </div>
        )
      },
    },
    {
      id: 'anciennete',
      header: 'Âge',
      cell: ({ row }) => {
        const lot = row.original
        const jours = Math.floor((Date.now() - lot.date_entree.getTime()) / (1000 * 60 * 60 * 24))
        
        return (
          <div className="flex items-center gap-2">
            <Badge 
              variant={jours > 90 ? 'destructive' : jours > 30 ? 'secondary' : 'default'}
              className="text-xs"
            >
              {jours}j
            </Badge>
            {modeValorisation === 'FIFO' && jours < 7 && (
              <TrendingUp className="h-3 w-3 text-secondary" />
            )}
            {modeValorisation === 'FIFO' && jours > 90 && (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
          </div>
        )
      },
    },
  ], [modeValorisation])

  // Calculer les totaux
  const totaux = useMemo(() => {
    return filteredStockData.reduce(
      (acc, stock) => ({
        stock_kg: acc.stock_kg + stock.stock_kg,
        valeur_fcfa: acc.valeur_fcfa + stock.valeur_fcfa,
        nb_lots: acc.nb_lots + stock.lots.length
      }),
      { stock_kg: 0, valeur_fcfa: 0, nb_lots: 0 }
    )
  }, [filteredStockData])

  // Handlers
  const handleExport = () => {
    if (filteredStockData.length === 0) return
    
    const dataToExport = filteredStockData.map(stock => ({
      Produit: stock.produit,
      Dépôt: stock.depot_nom,
      'Stock (kg)': stock.stock_kg,
      'Valeur (FCFA)': stock.valeur_fcfa,
      'Prix moyen/kg (FCFA)': Math.round(stock.prix_moyen_kg),
      'Nombre de lots': stock.lots.length,
      'Âge moyen (jours)': Math.round(stock.anciennete_moyenne),
      'Stock critique': stock.stock_critique ? 'Oui' : 'Non',
      'Mode valorisation': modeValorisation
    }))

    exportToCSV(dataToExport, 'inventaire')
  }

  const exporterLots = (lots: LotInventaire[], produit: string) => {
    const dataToExport = lots.map(lot => ({
      Produit: lot.produit,
      'Date entrée': formatDate(lot.date_entree),
      'Quantité restante (kg)': lot.quantite_kg_restante,
      'Coût unitaire/kg (FCFA)': lot.cout_unitaire_par_kg,
      'Valeur totale (FCFA)': lot.quantite_kg_restante * lot.cout_unitaire_par_kg,
      'Numéro BL': lot.metadata?.numero_bl || '',
      'Fournisseur': lot.metadata?.fournisseur || '',
      'Notes': lot.metadata?.notes || ''
    }))

    exportToCSV(dataToExport, `lots_${produit.toLowerCase()}`)
  }

  const handleViewLots = (product: ProductCard) => {
    const allLots = product.depots.flatMap(depot => depot.lots)
    setSelectedLots(allLots.sort((a, b) => a.date_entree.getTime() - b.date_entree.getTime()))
    setSelectedProduct(product.produit)
    setShowLotsDialog(true)
  }

  if (loading) {
    return <PageLoader text={t('common.loading')} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t('inventory.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('inventory.subtitle')}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="ghost" onClick={chargerDonnees}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            disabled={filteredStockData.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Stock total"
          value={formatKg(totaux.stock_kg)}
          icon={Package}
          iconColor="bg-primary"
        />
        <KPICard
          title="Valeur totale"
          value={formatFCFA(totaux.valeur_fcfa)}
          icon={DollarSign}
          iconColor="bg-secondary"
        />
        <KPICard
          title="Nombre de lots"
          value={totaux.nb_lots}
          icon={Box}
          iconColor="bg-accent"
        />
        <KPICard
          title="Mode valorisation"
          value={modeValorisation}
          icon={BarChart3}
          iconColor="bg-purple-500"
        />
      </div>

      {/* Filtres */}
      <Card className="rounded-2xl">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Produit</label>
              <Input
                placeholder="Rechercher un produit..."
                value={filters.produit}
                onChange={(e) => setFilters(prev => ({ ...prev, produit: e.target.value }))}
                className="h-9"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Dépôt</label>
              <Select value={filters.depot_id} onValueChange={(value) => setFilters(prev => ({ ...prev, depot_id: value }))}>
                <SelectTrigger className="h-9">
                  <Warehouse className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tous les dépôts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tous les dépôts</SelectItem>
                  {depots.map(depot => (
                    <SelectItem key={depot.id} value={depot.id}>{depot.nom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Âge</label>
              <Select value={filters.anciennete} onValueChange={(value) => setFilters(prev => ({ ...prev, anciennete: value }))}>
                <SelectTrigger className="h-9">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les âges</SelectItem>
                  <SelectItem value="recent">Récent (≤ 30j)</SelectItem>
                  <SelectItem value="ancien">Ancien (&gt; 90j)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 h-9">
                <input
                  type="checkbox"
                  checked={filters.stock_critique}
                  onChange={(e) => setFilters(prev => ({ ...prev, stock_critique: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm">Stock critique</span>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cartes des produits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {productCards.map((product, index) => (
            <motion.div
              key={product.produit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {product.produit}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {product.stock_critique && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {product.nb_depots} dépôt{product.nb_depots > 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Métriques principales */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Stock total</p>
                      <p className="text-lg font-semibold">{formatKg(product.total_stock_kg)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valeur totale</p>
                      <p className="text-lg font-semibold">{formatFCFA(product.total_valeur_fcfa)}</p>
                    </div>
                  </div>
                  
                  {/* Métriques secondaires */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Prix moyen/kg</p>
                      <p className="text-sm font-medium">{formatFCFA(product.prix_moyen_kg)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Âge moyen</p>
                      <p className="text-sm font-medium">{Math.round(product.anciennete_moyenne)} jours</p>
                    </div>
                  </div>

                  {/* Indicateur de santé du stock */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${product.stock_critique ? 'bg-destructive' : 'bg-secondary'}`} />
                      <span className="text-xs text-muted-foreground">
                        {product.stock_critique ? 'Stock critique' : 'Stock normal'}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleViewLots(product)}
                        className="h-7 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => exporterLots(product.depots.flatMap(d => d.lots), product.produit)}
                        className="h-7 px-2"
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tableau détaillé par dépôt */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Stock par dépôt ({filteredStockData.length} ligne(s))</span>
            <Button variant="ghost" size="sm" onClick={chargerDonnees}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStockData.length === 0 ? (
            <EmptyState
              title="Aucun stock trouvé"
              description="Aucun stock ne correspond aux critères de recherche"
              action={{
                label: "Réinitialiser les filtres",
                onClick: () => setFilters({ produit: '', depot_id: '', stock_critique: false, anciennete: 'all' })
              }}
            />
          ) : (
            <div className="space-y-4">
              {filteredStockData.map((stock) => (
                <motion.div
                  key={`${stock.produit}-${stock.depot_id}`}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors"
                  whileHover={{ x: 4 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">{stock.produit}</span>
                      <Badge variant="outline" className="text-xs">
                        {stock.depot_nom}
                      </Badge>
                      {stock.stock_critique && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div>
                        <span>Stock: </span>
                        <span className="font-medium text-foreground">{formatKg(stock.stock_kg)}</span>
                      </div>
                      <div>
                        <span>Valeur: </span>
                        <span className="font-medium text-foreground">{formatFCFA(stock.valeur_fcfa)}</span>
                      </div>
                      <div>
                        <span>Prix moyen: </span>
                        <span className="font-medium text-foreground">{formatFCFA(stock.prix_moyen_kg)}</span>
                      </div>
                      <div>
                        <span>Lots: </span>
                        <span className="font-medium text-foreground">{stock.lots.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => {
                        setSelectedLots(stock.lots.sort((a, b) => a.date_entree.getTime() - b.date_entree.getTime()))
                        setSelectedProduct(`${stock.produit} - ${stock.depot_nom}`)
                        setShowLotsDialog(true)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => exporterLots(stock.lots, stock.produit)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour les lots */}
      <Dialog open={showLotsDialog} onOpenChange={setShowLotsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Détail des lots - {selectedProduct}</span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => selectedProduct && exporterLots(selectedLots, selectedProduct.split(' - ')[0])}
              >
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Résumé */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total lots:</span>
                    <span className="ml-2 font-medium">{selectedLots.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock total:</span>
                    <span className="ml-2 font-medium">
                      {formatKg(selectedLots.reduce((sum, lot) => sum + lot.quantite_kg_restante, 0))}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Valeur totale:</span>
                    <span className="ml-2 font-medium">
                      {formatFCFA(selectedLots.reduce((sum, lot) => sum + (lot.quantite_kg_restante * lot.cout_unitaire_par_kg), 0))}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Âge moyen:</span>
                    <span className="ml-2 font-medium">
                      {Math.round(selectedLots.reduce((sum, lot) => {
                        const jours = Math.floor((Date.now() - lot.date_entree.getTime()) / (1000 * 60 * 60 * 24))
                        return sum + jours
                      }, 0) / selectedLots.length)} jours
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Table des lots */}
            <DataTable
              data={selectedLots}
              columns={lotsColumns}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}