import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Save, 
  Warehouse,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  Check,
  Building,
  Database
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'
import { Label } from '../components/ui/Label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/Select'
import { Switch } from '../components/ui/Switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/Dialog'
import { Separator } from '../components/ui/Separator'
import { EmptyState } from '../components/ui/EmptyState'
import { Parametres as ParametresType, Depot, ModeValorisationType } from '../types'
import { repository } from '../lib/repositories'
import { useAuth } from '../contexts/AuthContext'

interface FormDepot {
  nom: string
  localisation: string
  actif: boolean
}

export function Parametres() {
  const { profile, isSupabaseEnabled } = useAuth()
  const [parametres, setParametres] = useState<ParametresType | null>(null)
  const [depots, setDepots] = useState<Depot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isDepotDialogOpen, setIsDepotDialogOpen] = useState(false)
  const [editingDepot, setEditingDepot] = useState<Depot | null>(null)

  // État du formulaire de paramètres
  const [modeValorisationForm, setModeValorisationForm] = useState<ModeValorisationType>('FIFO')
  const [deviseForm, setDeviseForm] = useState('FCFA')
  const [coutStockageForm, setCoutStockageForm] = useState<number>(0)

  // État du formulaire de dépôt
  const [depotForm, setDepotForm] = useState<FormDepot>({
    nom: '',
    localisation: '',
    actif: true
  })

  // Charger les données
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const [parametresData, depotsData] = await Promise.all([
        repository.getParametres(),
        repository.getDepots()
      ])
      
      setParametres(parametresData)
      setDepots(depotsData)
      
      // Initialiser les formulaires
      if (parametresData) {
        setModeValorisationForm(parametresData.mode_valorisation)
        setDeviseForm(parametresData.devise_affichage)
        setCoutStockageForm(parametresData.cout_stockage_par_kg_par_jour || 0)
      }
    } catch (err) {
      console.error('Erreur lors du chargement:', err)
      setError('Erreur lors du chargement des paramètres')
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (message: string) => {
    setSuccess(message)
    setTimeout(() => setSuccess(null), 3000)
  }

  const showError = (message: string) => {
    setError(message)
    setTimeout(() => setError(null), 3000)
  }

  // Sauvegarder les paramètres
  const handleSaveParametres = async () => {
    try {
      const updatedParametres: Partial<ParametresType> = {
        mode_valorisation: modeValorisationForm,
        devise_affichage: deviseForm,
        cout_stockage_par_kg_par_jour: coutStockageForm > 0 ? coutStockageForm : undefined
      }

      await repository.updateParametres(updatedParametres)
      await loadData()
      showSuccess('Paramètres sauvegardés avec succès')
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err)
      showError('Erreur lors de la sauvegarde des paramètres')
    }
  }

  // Gestion des dépôts
  const handleSubmitDepot = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const depotData: Omit<Depot, 'id'> = {
        nom: depotForm.nom,
        localisation: depotForm.localisation || undefined,
        actif: depotForm.actif
      }

      if (editingDepot) {
        await repository.updateDepot(editingDepot.id, depotData)
        showSuccess('Dépôt modifié avec succès')
      } else {
        await repository.createDepot(depotData)
        showSuccess('Dépôt créé avec succès')
      }

      await loadData()
      resetDepotForm()
      setIsDepotDialogOpen(false)
    } catch (err) {
      console.error('Erreur lors de la sauvegarde du dépôt:', err)
      showError('Erreur lors de la sauvegarde du dépôt')
    }
  }

  const resetDepotForm = () => {
    setDepotForm({
      nom: '',
      localisation: '',
      actif: true
    })
    setEditingDepot(null)
  }

  const handleEditDepot = (depot: Depot) => {
    setEditingDepot(depot)
    setDepotForm({
      nom: depot.nom,
      localisation: depot.localisation || '',
      actif: depot.actif
    })
    setIsDepotDialogOpen(true)
  }

  const handleDeleteDepot = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dépôt ? Cette action est irréversible.')) {
      try {
        await repository.deleteDepot(id)
        await loadData()
        showSuccess('Dépôt supprimé avec succès')
      } catch (err) {
        console.error('Erreur lors de la suppression:', err)
        showError('Erreur lors de la suppression du dépôt')
      }
    }
  }

  const handleToggleDepot = async (depot: Depot) => {
    try {
      await repository.updateDepot(depot.id, { actif: !depot.actif })
      await loadData()
      showSuccess(`Dépôt ${depot.actif ? 'désactivé' : 'activé'} avec succès`)
    } catch (err) {
      console.error('Erreur lors de la modification:', err)
      showError('Erreur lors de la modification du dépôt')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-10 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
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
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Paramètres</h1>
            {profile?.role === 'admin' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Admin
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">Configuration système et préférences</p>
        </div>
      </motion.div>

      {/* Alertes */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Alerte mode développement */}
      {!isSupabaseEnabled && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Mode développement actif. Les données sont stockées localement et seront perdues à l'actualisation.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">Paramètres généraux</TabsTrigger>
          <TabsTrigger value="depots">Gestion des dépôts</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        {/* Paramètres généraux */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Générale
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="mode_valorisation">Mode de valorisation</Label>
                  <Select 
                    value={modeValorisationForm} 
                    onValueChange={(value: ModeValorisationType) => setModeValorisationForm(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FIFO">FIFO (Premier Entré, Premier Sorti)</SelectItem>
                      <SelectItem value="MOYEN_PONDERE">Coût Moyen Pondéré</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Méthode utilisée pour calculer le coût des marchandises vendues
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="devise">Devise d'affichage</Label>
                  <Input
                    id="devise"
                    value={deviseForm}
                    onChange={(e) => setDeviseForm(e.target.value)}
                    placeholder="FCFA"
                  />
                  <p className="text-sm text-muted-foreground">
                    Devise utilisée pour l'affichage des montants
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cout_stockage">Coût de stockage par kg/jour (optionnel)</Label>
                <Input
                  id="cout_stockage"
                  type="number"
                  step="0.01"
                  min="0"
                  value={coutStockageForm}
                  onChange={(e) => setCoutStockageForm(Number(e.target.value))}
                  placeholder="0.00"
                />
                <p className="text-sm text-muted-foreground">
                  Coût journalier de stockage par kilogramme (utilisé pour les calculs de rentabilité)
                </p>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button onClick={handleSaveParametres} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder les paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des dépôts */}
        <TabsContent value="depots" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Dépôts et entrepôts</h3>
              <p className="text-muted-foreground">Gérez les lieux de stockage</p>
            </div>
            <Dialog open={isDepotDialogOpen} onOpenChange={setIsDepotDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetDepotForm}>
                  <Plus className="h-4 w-4" />
                  Nouveau dépôt
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingDepot ? 'Modifier le dépôt' : 'Nouveau dépôt'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmitDepot} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="depot_nom">Nom du dépôt</Label>
                    <Input
                      id="depot_nom"
                      value={depotForm.nom}
                      onChange={(e) => setDepotForm({...depotForm, nom: e.target.value})}
                      placeholder="ex: Entrepôt Principal"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="depot_localisation">Localisation</Label>
                    <Input
                      id="depot_localisation"
                      value={depotForm.localisation}
                      onChange={(e) => setDepotForm({...depotForm, localisation: e.target.value})}
                      placeholder="ex: Abidjan - Zone Industrielle"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="depot_actif"
                      checked={depotForm.actif}
                      onCheckedChange={(checked) => setDepotForm({...depotForm, actif: checked})}
                    />
                    <Label htmlFor="depot_actif">Dépôt actif</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsDepotDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      {editingDepot ? 'Modifier' : 'Créer'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {depots.length > 0 ? (
              depots.map((depot) => (
                <Card key={depot.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${
                          depot.actif ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                        }`}>
                          <Warehouse className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{depot.nom}</h3>
                            <Badge variant={depot.actif ? 'default' : 'secondary'}>
                              {depot.actif ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                          {depot.localisation && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {depot.localisation}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleToggleDepot(depot)}
                        >
                          {depot.actif ? 'Désactiver' : 'Activer'}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleEditDepot(depot)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleDeleteDepot(depot.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState 
                title="Aucun dépôt configuré"
                description="Créez votre premier dépôt pour commencer à gérer les stocks"
                icon={Warehouse}
              />
            )}
          </div>
        </TabsContent>

        {/* Informations système */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Informations Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Base de données</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={isSupabaseEnabled ? 'default' : 'secondary'}>
                      {isSupabaseEnabled ? 'Supabase (Production)' : 'LocalStorage (Développement)'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Utilisateur actuel</Label>
                  <p className="text-sm">
                    {profile?.full_name || profile?.email || 'Utilisateur anonyme'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rôle: {profile?.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Version de l'application</Label>
                  <p className="text-sm">Trading Hévéa v1.0.0</p>
                </div>

                <div className="space-y-2">
                  <Label>Nombre total d'opérations</Label>
                  <p className="text-sm">{depots.length} dépôts configurés</p>
                </div>
              </div>

              {!isSupabaseEnabled && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Mode développement:</strong> Les données sont stockées localement dans votre navigateur. 
                    Pour la production, configurez une base de données Supabase dans le fichier .env
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}