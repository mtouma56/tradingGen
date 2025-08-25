import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Package, 
  Warehouse, 
  Search, 
  Filter,
  Eye,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { EmptyState } from '../components/ui/EmptyState'
import { LotInventaire, Depot, StockParProduit } from '../types'
import { repository } from '../lib/repositories'
import { formatFCFA, formatKg, formatDate } from '../lib/utils'

interface StockSummary {
  produit: string
  total_kg: number
  valeur_totale: number
  depots_count: number
  cout_moyen: number
}

export function Inventaire() {
  const [lots, setLots] = useState<LotInventaire[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDepot, setSelectedDepot] = useState<string>('all')
  const [selectedProduit, setSelectedProduit] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Charger les données
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [lotsData, depotsData] = await Promise.all([
        repository.getLots(),
        repository.getDepots()
      ])
      
      setLots(lotsData)
      setDepots(depotsData)
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError('Erreur lors du chargement des données d\'inventaire')
    } finally {
      setLoading(false)
    }
  }

  // Calculer les résumés de stock
  const stockSummaries = useMemo((): StockSummary[] => {
    const summaries = new Map<string, StockSummary>()

    lots.forEach(lot => {
      const key = lot.produit
      const existing = summaries.get(key)
      
      if (existing) {
        existing.total_kg += lot.quantite_kg_restante
        existing.valeur_totale += lot.quantite_kg_restante * lot.cout_unitaire_par_kg
        const uniqueDepots = new Set([...existing.depots_count.toString().split(','), lot.depot_id])
        existing.depots_count = uniqueDepots.size
      } else {
        summaries.set(key, {
          produit: key,
          total_kg: lot.quantite_kg_restante,
          valeur_totale: lot.quantite_kg_restante * lot.cout_unitaire_par_kg,
          depots_count: 1,
          cout_moyen: lot.cout_unitaire_par_kg
        })
      }
    })

    // Recalculer le coût moyen
    summaries.forEach(summary => {
      const produitLots = lots.filter(lot => lot.produit === summary.produit)
      const totalQuantite = produitLots.reduce((sum, lot) => sum + lot.quantite_kg_restante, 0)
      const valeurTotale = produitLots.reduce((sum, lot) => sum + (lot.quantite_kg_restante * lot.cout_unitaire_par_kg), 0)
      summary.cout_moyen = totalQuantite > 0 ? valeurTotale / totalQuantite : 0
    })

    return Array.from(summaries.values()).sort((a, b) => b.valeur_totale - a.valeur_totale)
  }, [lots])

  // Lots filtrés
  const filteredLots = useMemo(() => {
    return lots.filter(lot => {
      const matchesDepot = selectedDepot === 'all' || lot.depot_id === selectedDepot
      const matchesProduit = selectedProduit === 'all' || lot.produit === selectedProduit
      const matchesSearch = !searchTerm || 
        lot.produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lot.metadata?.fournisseur && lot.metadata.fournisseur.toLowerCase().includes(searchTerm.toLowerCase()))
      
      return matchesDepot && matchesProduit && matchesSearch
    })
  }, [lots, selectedDepot, selectedProduit, searchTerm])

  // Stock par dépôt
  const stockParDepot = useMemo(() => {
    const stockMap = new Map<string, { depot: Depot; lots: LotInventaire[]; total_kg: number; valeur_totale: number }>()

    lots.forEach(lot => {
      const depot = depots.find(d => d.id === lot.depot_id)
      if (!depot) return

      const existing = stockMap.get(lot.depot_id)
      if (existing) {
        existing.lots.push(lot)
        existing.total_kg += lot.quantite_kg_restante
        existing.valeur_totale += lot.quantite_kg_restante * lot.cout_unitaire_par_kg
      } else {
        stockMap.set(lot.depot_id, {
          depot,
          lots: [lot],
          total_kg: lot.quantite_kg_restante,
          valeur_totale: lot.quantite_kg_restante * lot.cout_unitaire_par_kg
        })
      }
    })

    return Array.from(stockMap.values()).sort((a, b) => b.valeur_totale - a.valeur_totale)
  }, [lots, depots])

  // Produits uniques pour le filtre
  const produits = useMemo(() => {
    const produitSet = new Set(lots.map(lot => lot.produit))
    return Array.from(produitSet).sort()
  }, [lots])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
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
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Inventaire</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Package className="h-3 w-3" />
              {lots.length} lots
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Gestion des stocks par dépôt avec traçabilité FIFO</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Résumé global */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-3"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Total</p>
                <p className="text-2xl font-bold">
                  {formatKg(lots.reduce((sum, lot) => sum + lot.quantite_kg_restante, 0))}
                </p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valeur Totale</p>
                <p className="text-2xl font-bold">
                  {formatFCFA(lots.reduce((sum, lot) => sum + (lot.quantite_kg_restante * lot.cout_unitaire_par_kg), 0))}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nombre de Lots</p>
                <p className="text-2xl font-bold">{lots.length}</p>
              </div>
              <Warehouse className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <Tabs defaultValue="resume" className="space-y-6">
        <TabsList>
          <TabsTrigger value="resume">Résumé par produit</TabsTrigger>
          <TabsTrigger value="lots">Lots détaillés</TabsTrigger>
          <TabsTrigger value="depots">Par dépôt</TabsTrigger>
        </TabsList>

        {/* Résumé par produit */}
        <TabsContent value="resume">
          <Card>
            <CardHeader>
              <CardTitle>Stock par Produit</CardTitle>
            </CardHeader>
            <CardContent>
              {stockSummaries.length > 0 ? (
                <div className="space-y-4">
                  {stockSummaries.map((summary) => (
                    <div key={summary.produit} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-primary rounded-full" />
                        <div>
                          <h3 className="font-medium">{summary.produit}</h3>
                          <p className="text-sm text-muted-foreground">
                            Dans {summary.depots_count} dépôt{summary.depots_count > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatKg(summary.total_kg)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFCFA(summary.cout_moyen)}/kg moyen
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatFCFA(summary.valeur_totale)}</p>
                        <p className="text-sm text-green-600">
                          Valeur totale
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState 
                  title="Aucun stock disponible"
                  description="Aucun lot en stock actuellement"
                  icon={Package}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lots détaillés */}
        <TabsContent value="lots" className="space-y-4">
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par produit ou fournisseur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedDepot} onValueChange={setSelectedDepot}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Dépôt" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les dépôts</SelectItem>
                    {depots.map(depot => (
                      <SelectItem key={depot.id} value={depot.id}>{depot.nom}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedProduit} onValueChange={setSelectedProduit}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Produit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les produits</SelectItem>
                    {produits.map(produit => (
                      <SelectItem key={produit} value={produit}>{produit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Liste des lots */}
          <Card>
            <CardHeader>
              <CardTitle>Lots en Stock ({filteredLots.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredLots.length > 0 ? (
                <div className="space-y-4">
                  {filteredLots.map((lot) => {
                    const depot = depots.find(d => d.id === lot.depot_id)
                    return (
                      <div key={lot.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                          <div className="flex-1">
                            <h3 className="font-medium">{lot.produit}</h3>
                            <p className="text-sm text-muted-foreground">
                              {depot?.nom || 'Dépôt inconnu'}
                            </p>
                            {lot.metadata?.fournisseur && (
                              <p className="text-xs text-muted-foreground">
                                Fournisseur: {lot.metadata.fournisseur}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatKg(lot.quantite_kg_restante)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFCFA(lot.cout_unitaire_par_kg)}/kg
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatFCFA(lot.quantite_kg_restante * lot.cout_unitaire_par_kg)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(lot.date_entree)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <EmptyState 
                  title="Aucun lot trouvé"
                  description="Aucun lot ne correspond aux critères de recherche"
                  icon={Package}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Par dépôt */}
        <TabsContent value="depots">
          <div className="space-y-4">
            {stockParDepot.length > 0 ? (
              stockParDepot.map((stock) => (
                <Card key={stock.depot.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Warehouse className="h-5 w-5" />
                          {stock.depot.nom}
                        </CardTitle>
                        {stock.depot.localisation && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {stock.depot.localisation}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold">{formatKg(stock.total_kg)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFCFA(stock.valeur_totale)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stock.lots.map((lot) => (
                        <div key={lot.id} className="flex items-center justify-between p-3 bg-muted/30 rounded">
                          <div>
                            <p className="font-medium">{lot.produit}</p>
                            <p className="text-sm text-muted-foreground">
                              Entrée: {formatDate(lot.date_entree)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatKg(lot.quantite_kg_restante)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatFCFA(lot.cout_unitaire_par_kg)}/kg
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState 
                title="Aucun stock dans les dépôts"
                description="Aucun lot en stock actuellement"
                icon={Warehouse}
              />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}