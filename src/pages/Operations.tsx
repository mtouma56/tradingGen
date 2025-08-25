import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShoppingCart, 
  Plus, 
  Download, 
  Filter, 
  TrendingUp, 
  AlertTriangle,
  Edit,
  Trash2,
  Search,
  Calendar
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { EmptyState } from '../components/ui/EmptyState'
import { Operation, FormOperation, OperationType, Depot } from '../types'
import { repository } from '../lib/repositories'
import { formatFCFA, formatKg, formatDate } from '../lib/utils'

export function Operations() {
  const [operations, setOperations] = useState<Operation[]>([])
  const [depots, setDepots] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null)
  const [filterType, setFilterType] = useState<'all' | OperationType>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Formulaire pour nouvelle opération
  const [formData, setFormData] = useState<FormOperation>({
    type: 'achat',
    date_operation: new Date().toISOString().split('T')[0],
    produit: '',
    quantite_kg: 0,
    chargement_par_kg: 0,
    transport_par_kg: 0,
    autres_depenses_par_kg: 0
  })

  // Charger les données
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [operationsData, depotsData] = await Promise.all([
        repository.getOperations(),
        repository.getDepots()
      ])
      
      setOperations(operationsData)
      setDepots(depotsData)
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  // Filtrer les opérations
  const filteredOperations = operations.filter(op => {
    const matchesType = filterType === 'all' || op.type === filterType
    const matchesSearch = !searchTerm || 
      op.produit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (op.point_achat && op.point_achat.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (op.point_vente && op.point_vente.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesType && matchesSearch
  })

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const operationData: Omit<Operation, 'id'> = {
        type: formData.type,
        date_operation: new Date(formData.date_operation),
        produit: formData.produit,
        quantite_kg: formData.quantite_kg,
        chargement_par_kg: formData.chargement_par_kg,
        transport_par_kg: formData.transport_par_kg,
        autres_depenses_par_kg: formData.autres_depenses_par_kg,
        point_achat: formData.type === 'achat' ? formData.point_achat : undefined,
        point_vente: formData.type === 'vente' ? formData.point_vente : undefined,
        prix_achat_par_kg: formData.type === 'achat' ? formData.prix_achat_par_kg : undefined,
        prix_vente_par_kg: formData.type === 'vente' ? formData.prix_vente_par_kg : undefined,
        depot_id: formData.depot_id,
        // Calculer le coût total pour les achats
        cout_total_par_kg: formData.type === 'achat' 
          ? (formData.prix_achat_par_kg || 0) + formData.chargement_par_kg + formData.transport_par_kg + formData.autres_depenses_par_kg
          : undefined,
        // Calculer le chiffre d'affaires pour les ventes
        chiffre_affaires: formData.type === 'vente' && formData.prix_vente_par_kg
          ? formData.quantite_kg * formData.prix_vente_par_kg
          : undefined
      }

      if (editingOperation) {
        await repository.updateOperation(editingOperation.id, operationData)
      } else {
        await repository.createOperation(operationData)
      }

      await loadData()
      resetForm()
      setIsDialogOpen(false)
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      setError('Erreur lors de la sauvegarde')
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'achat',
      date_operation: new Date().toISOString().split('T')[0],
      produit: '',
      quantite_kg: 0,
      chargement_par_kg: 0,
      transport_par_kg: 0,
      autres_depenses_par_kg: 0
    })
    setEditingOperation(null)
  }

  const handleEdit = (operation: Operation) => {
    setEditingOperation(operation)
    setFormData({
      type: operation.type,
      date_operation: operation.date_operation.toISOString().split('T')[0],
      produit: operation.produit,
      point_achat: operation.point_achat,
      point_vente: operation.point_vente,
      depot_id: operation.depot_id,
      quantite_kg: operation.quantite_kg,
      prix_achat_par_kg: operation.prix_achat_par_kg,
      chargement_par_kg: operation.chargement_par_kg,
      transport_par_kg: operation.transport_par_kg,
      autres_depenses_par_kg: operation.autres_depenses_par_kg,
      prix_vente_par_kg: operation.prix_vente_par_kg
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette opération ?')) {
      try {
        await repository.deleteOperation(id)
        await loadData()
      } catch (err) {
        console.error('Erreur lors de la suppression:', err)
        setError('Erreur lors de la suppression')
      }
    }
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
            <Download className="h-4 w-4" />
            Exporter
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={resetForm}>
                <Plus className="h-4 w-4" />
                Nouvelle opération
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingOperation ? 'Modifier l\'opération' : 'Nouvelle opération'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type d'opération</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value: OperationType) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="achat">Achat</SelectItem>
                        <SelectItem value="vente">Vente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date_operation}
                      onChange={(e) => setFormData({...formData, date_operation: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="produit">Produit</Label>
                    <Input
                      id="produit"
                      value={formData.produit}
                      onChange={(e) => setFormData({...formData, produit: e.target.value})}
                      placeholder="ex: Hévéa Grade A"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="quantite">Quantité (kg)</Label>
                    <Input
                      id="quantite"
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.quantite_kg}
                      onChange={(e) => setFormData({...formData, quantite_kg: Number(e.target.value)})}
                      required
                    />
                  </div>
                </div>

                {formData.type === 'achat' ? (
                  <>
                    <div>
                      <Label htmlFor="point_achat">Point d'achat</Label>
                      <Input
                        id="point_achat"
                        value={formData.point_achat || ''}
                        onChange={(e) => setFormData({...formData, point_achat: e.target.value})}
                        placeholder="ex: Plantation Koumassi"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prix_achat">Prix d'achat par kg (FCFA)</Label>
                      <Input
                        id="prix_achat"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.prix_achat_par_kg || ''}
                        onChange={(e) => setFormData({...formData, prix_achat_par_kg: Number(e.target.value)})}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="point_vente">Point de vente</Label>
                      <Input
                        id="point_vente"
                        value={formData.point_vente || ''}
                        onChange={(e) => setFormData({...formData, point_vente: e.target.value})}
                        placeholder="ex: Export Abidjan Port"
                      />
                    </div>
                    <div>
                      <Label htmlFor="prix_vente">Prix de vente par kg (FCFA)</Label>
                      <Input
                        id="prix_vente"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.prix_vente_par_kg || ''}
                        onChange={(e) => setFormData({...formData, prix_vente_par_kg: Number(e.target.value)})}
                      />
                    </div>
                  </>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="chargement">Chargement par kg</Label>
                    <Input
                      id="chargement"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.chargement_par_kg}
                      onChange={(e) => setFormData({...formData, chargement_par_kg: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transport">Transport par kg</Label>
                    <Input
                      id="transport"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.transport_par_kg}
                      onChange={(e) => setFormData({...formData, transport_par_kg: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="autres">Autres dépenses par kg</Label>
                    <Input
                      id="autres"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.autres_depenses_par_kg}
                      onChange={(e) => setFormData({...formData, autres_depenses_par_kg: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingOperation ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtres */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par produit, point d'achat/vente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Type d'opération" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les opérations</SelectItem>
                  <SelectItem value="achat">Achats uniquement</SelectItem>
                  <SelectItem value="vente">Ventes uniquement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Liste des opérations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Liste des opérations ({filteredOperations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-4 border rounded">
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                    <div className="h-4 bg-muted rounded w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : filteredOperations.length > 0 ? (
              <div className="space-y-4">
                {filteredOperations.map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-3 h-3 rounded-full ${
                        operation.type === 'achat' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{operation.produit}</h3>
                          <Badge variant={operation.type === 'achat' ? 'secondary' : 'default'}>
                            {operation.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {operation.type === 'achat' ? operation.point_achat : operation.point_vente}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatKg(operation.quantite_kg)}</p>
                        <p className="text-sm text-muted-foreground">
                          {operation.type === 'achat' && operation.prix_achat_par_kg
                            ? formatFCFA(operation.prix_achat_par_kg) + '/kg'
                            : operation.type === 'vente' && operation.prix_vente_par_kg
                            ? formatFCFA(operation.prix_vente_par_kg) + '/kg'
                            : '-'
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {formatDate(operation.date_operation)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(operation)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(operation.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState 
                title="Aucune opération trouvée"
                description="Commencez par ajouter votre première opération d'achat ou de vente"
                icon={ShoppingCart}
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}