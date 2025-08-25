import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  ArrowUp, 
  ArrowDown, 
  ArrowRightLeft,
  Search, 
  Filter,
  Calendar,
  Download,
  AlertTriangle,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { Alert, AlertDescription } from '../components/ui/alert'
import { EmptyState } from '../components/ui/EmptyState'
import { MouvementStock, Depot, MouvementType } from '../types'
import { repository } from '../lib/repositories'
import { formatKg, formatDate, formatFCFA } from '../lib/utils'

const MOVEMENT_ICONS = {
  entree: ArrowDown,
  sortie: ArrowUp,
  transfert: ArrowRightLeft,
  ajustement: Activity
} as const

const MOVEMENT_COLORS = {
  entree: 'text-green-600',
  sortie: 'text-red-600',
  transfert: 'text-blue-600',
  ajustement: 'text-orange-600'
} as const

const MOVEMENT_LABELS = {
  entree: 'Entrée',
  sortie: 'Sortie',
  transfert: 'Transfert',
  ajustement: 'Ajustement'
} as const

export function Mouvements() {
  const [mouvements, setMouvements] = useState<MouvementStock[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<'all' | MouvementType>('all')
  const [filterDepot, setFilterDepot] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState<string>('')

  // Charger les données
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [mouvementsData, depotsData] = await Promise.all([
        repository.getMouvements(),
        repository.getDepots()
      ])
      
      setMouvements(mouvementsData)
      setDepots(depotsData)
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError('Erreur lors du chargement des mouvements de stock')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les mouvements
  const filteredMouvements = useMemo(() => {
    return mouvements.filter(mouvement => {
      const matchesType = filterType === 'all' || mouvement.type === filterType
      const matchesDepot = filterDepot === 'all' || 
        mouvement.depot_source_id === filterDepot || 
        mouvement.depot_cible_id === filterDepot
      const matchesSearch = !searchTerm || 
        mouvement.produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mouvement.note?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDate = !dateFilter || 
        mouvement.date_mouvement.toISOString().split('T')[0] === dateFilter
      
      return matchesType && matchesDepot && matchesSearch && matchesDate
    })
  }, [mouvements, filterType, filterDepot, searchTerm, dateFilter])

  // Statistiques des mouvements
  const stats = useMemo(() => {
    const today = new Date()
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const totalMouvements = mouvements.length
    const mouvementsThisMonth = mouvements.filter(m => m.date_mouvement >= thisMonth).length
    
    const entrees = mouvements.filter(m => m.type === 'entree')
    const sorties = mouvements.filter(m => m.type === 'sortie')
    const transferts = mouvements.filter(m => m.type === 'transfert')
    
    const totalEntrees = entrees.reduce((sum, m) => sum + m.quantite_kg, 0)
    const totalSorties = sorties.reduce((sum, m) => sum + m.quantite_kg, 0)
    
    return {
      totalMouvements,
      mouvementsThisMonth,
      totalEntrees,
      totalSorties,
      totalTransferts: transferts.length,
      stockNet: totalEntrees - totalSorties
    }
  }, [mouvements])

  // Grouper les mouvements par date
  const mouvementsGroupes = useMemo(() => {
    const groups = new Map<string, MouvementStock[]>()
    
    filteredMouvements.forEach(mouvement => {
      const dateKey = formatDate(mouvement.date_mouvement)
      const existing = groups.get(dateKey) || []
      existing.push(mouvement)
      groups.set(dateKey, existing)
    })
    
    return Array.from(groups.entries())
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
  }, [filteredMouvements])

  const getDepotName = (depotId: string | undefined) => {
    if (!depotId) return 'N/A'
    const depot = depots.find(d => d.id === depotId)
    return depot?.nom || 'Dépôt inconnu'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
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
              <Activity className="h-3 w-3" />
              {stats.totalMouvements} mouvements
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Historique complet des entrées, sorties et transferts</p>
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

      {/* Statistiques */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 md:grid-cols-4"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Mouvements</p>
                <p className="text-2xl font-bold">{stats.totalMouvements}</p>
                <p className="text-xs text-muted-foreground">
                  +{stats.mouvementsThisMonth} ce mois
                </p>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Entrées</p>
                <p className="text-2xl font-bold text-green-600">{formatKg(stats.totalEntrees)}</p>
              </div>
              <ArrowDown className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sorties</p>
                <p className="text-2xl font-bold text-red-600">{formatKg(stats.totalSorties)}</p>
              </div>
              <ArrowUp className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stock Net</p>
                <p className={`text-2xl font-bold ${stats.stockNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatKg(stats.stockNet)}
                </p>
              </div>
              <ArrowRightLeft className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par produit ou note..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type de mouvement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="entree">Entrées uniquement</SelectItem>
                  <SelectItem value="sortie">Sorties uniquement</SelectItem>
                  <SelectItem value="transfert">Transferts uniquement</SelectItem>
                  <SelectItem value="ajustement">Ajustements uniquement</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDepot} onValueChange={setFilterDepot}>
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

              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Liste des mouvements groupés par date */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-6"
      >
        {mouvementsGroupes.length > 0 ? (
          mouvementsGroupes.map(([date, mouvementsDate]) => (
            <Card key={date}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{date}</span>
                  <Badge variant="outline">
                    {mouvementsDate.length} mouvement{mouvementsDate.length > 1 ? 's' : ''}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mouvementsDate.map((mouvement) => {
                    const Icon = MOVEMENT_ICONS[mouvement.type]
                    return (
                      <div key={mouvement.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                        <div className={`p-2 rounded-lg bg-muted/30 ${MOVEMENT_COLORS[mouvement.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{mouvement.produit}</h3>
                            <Badge variant={
                              mouvement.type === 'entree' ? 'default' :
                              mouvement.type === 'sortie' ? 'destructive' :
                              mouvement.type === 'transfert' ? 'secondary' : 'outline'
                            }>
                              {MOVEMENT_LABELS[mouvement.type]}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-muted-foreground mt-1">
                            {mouvement.type === 'transfert' ? (
                              <span>
                                {getDepotName(mouvement.depot_source_id)} → {getDepotName(mouvement.depot_cible_id)}
                              </span>
                            ) : mouvement.type === 'entree' ? (
                              <span>Vers: {getDepotName(mouvement.depot_cible_id)}</span>
                            ) : (
                              <span>Depuis: {getDepotName(mouvement.depot_source_id)}</span>
                            )}
                          </div>
                          
                          {mouvement.note && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {mouvement.note}
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">{formatKg(mouvement.quantite_kg)}</p>
                          {mouvement.cout_unitaire_par_kg && (
                            <p className="text-sm text-muted-foreground">
                              {formatFCFA(mouvement.cout_unitaire_par_kg)}/kg
                            </p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          {mouvement.cout_unitaire_par_kg && (
                            <p className="font-medium">
                              {formatFCFA(mouvement.quantite_kg * mouvement.cout_unitaire_par_kg)}
                            </p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            Valeur totale
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <EmptyState 
            title="Aucun mouvement trouvé"
            description="Aucun mouvement ne correspond aux critères de recherche"
            icon={Activity}
          />
        )}
      </motion.div>
    </div>
  )
}