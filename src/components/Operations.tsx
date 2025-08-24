import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
  Calendar,
  Package
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { Operation, FormOperation, Depot } from '../types';
import { useOperations } from '../hooks/useOperations';
import { repository } from '../lib/repositories';
import { formatFCFA, formatKg, formatDate, formatDateForInput, exportToCSV } from '../lib/utils';

export function Operations() {
  const { operations, loading, error, chargerOperations, creerAchat, creerVente, calculerApercuOperation } = useOperations();
  const [showForm, setShowForm] = useState(false);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [filtres, setFiltres] = useState({
    produit: '',
    type: '',
    depot_id: ''
  });

  // Form state
  const [formData, setFormData] = useState<FormOperation>({
    type: 'achat',
    date_operation: formatDateForInput(new Date()),
    produit: '',
    point_achat: '',
    point_vente: '',
    depot_id: '',
    quantite_kg: 0,
    prix_achat_par_kg: undefined,
    chargement_par_kg: 0,
    transport_par_kg: 0,
    autres_depenses_par_kg: 0,
    prix_vente_par_kg: undefined
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [apercuOperation, setApercuOperation] = useState<any>(null);

  // Charger les dépôts
  useEffect(() => {
    const chargerDepots = async () => {
      try {
        const data = await repository.getDepots();
        setDepots(data.filter(d => d.actif));
      } catch (error) {
        console.error('Erreur chargement dépôts:', error);
      }
    };

    chargerDepots();
  }, []);

  // Calculer aperçu en temps réel
  useEffect(() => {
    const calculerApercu = async () => {
      if (formData.quantite_kg > 0 && formData.depot_id && formData.produit) {
        try {
          const apercu = await calculerApercuOperation(formData);
          setApercuOperation(apercu);
        } catch (error) {
          setApercuOperation(null);
        }
      } else {
        setApercuOperation(null);
      }
    };

    calculerApercu();
  }, [formData, calculerApercuOperation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    try {
      if (formData.type === 'achat') {
        await creerAchat(formData);
      } else {
        await creerVente(formData);
      }
      
      // Reset form
      setFormData({
        type: 'achat',
        date_operation: formatDateForInput(new Date()),
        produit: '',
        point_achat: '',
        point_vente: '',
        depot_id: '',
        quantite_kg: 0,
        prix_achat_par_kg: undefined,
        chargement_par_kg: 0,
        transport_par_kg: 0,
        autres_depenses_par_kg: 0,
        prix_vente_par_kg: undefined
      });
      setShowForm(false);
      setApercuOperation(null);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
      setFormErrors({ general: error instanceof Error ? error.message : 'Erreur inconnue' });
    }
  };

  const operationsFiltrees = operations.filter(op => {
    return (
      (!filtres.produit || op.produit.toLowerCase().includes(filtres.produit.toLowerCase())) &&
      (!filtres.type || op.type === filtres.type) &&
      (!filtres.depot_id || op.depot_id === filtres.depot_id)
    );
  });

  const handleExport = () => {
    if (operationsFiltrees.length === 0) return;
    
    const dataToExport = operationsFiltrees.map(op => ({
      Date: formatDate(op.date_operation),
      Type: op.type.toUpperCase(),
      Produit: op.produit,
      'Point Achat': op.point_achat || '',
      'Point Vente': op.point_vente || '',
      'Quantité (kg)': op.quantite_kg,
      'Prix Achat/kg (FCFA)': op.prix_achat_par_kg || '',
      'Prix Vente/kg (FCFA)': op.prix_vente_par_kg || '',
      'Coût Total/kg (FCFA)': op.cout_total_par_kg || '',
      'COGS/kg (FCFA)': op.cogs_par_kg || '',
      'Marge/kg (FCFA)': op.marge_nette_par_kg || '',
      'Marge Totale (FCFA)': op.marge_totale || '',
      'CA (FCFA)': op.chiffre_affaires || ''
    }));

    exportToCSV(dataToExport, 'operations');
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Opérations
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestion des achats et ventes
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={operationsFiltrees.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle opération
          </Button>
        </div>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="filtre-produit">Produit</Label>
              <Input
                id="filtre-produit"
                placeholder="Rechercher un produit..."
                value={filtres.produit}
                onChange={(e) => setFiltres(prev => ({ ...prev, produit: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="filtre-type">Type d'opération</Label>
              <select
                id="filtre-type"
                value={filtres.type}
                onChange={(e) => setFiltres(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Tous les types</option>
                <option value="achat">Achats</option>
                <option value="vente">Ventes</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filtre-depot">Dépôt</Label>
              <select
                id="filtre-depot"
                value={filtres.depot_id}
                onChange={(e) => setFiltres(prev => ({ ...prev, depot_id: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Tous les dépôts</option>
                {depots.map(depot => (
                  <option key={depot.id} value={depot.id}>{depot.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des opérations */}
      <Card>
        <CardHeader>
          <CardTitle>
            {operationsFiltrees.length} opération(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Chargement...</p>
          ) : operationsFiltrees.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucune opération trouvée
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Produit</TableHead>
                    <TableHead>Dépôt</TableHead>
                    <TableHead>Quantité</TableHead>
                    <TableHead>Prix/kg</TableHead>
                    <TableHead>COGS/kg</TableHead>
                    <TableHead>Marge/kg</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {operationsFiltrees.map((operation) => {
                    const depot = depots.find(d => d.id === operation.depot_id);
                    const margeNegative = operation.type === 'vente' && (operation.marge_nette_par_kg || 0) < 0;
                    
                    return (
                      <TableRow key={operation.id}>
                        <TableCell>{formatDate(operation.date_operation)}</TableCell>
                        <TableCell>
                          <Badge variant={operation.type === 'achat' ? 'secondary' : 'default'}>
                            {operation.type === 'achat' ? (
                              <><ShoppingCart className="h-3 w-3 mr-1" />ACHAT</>
                            ) : (
                              <><TrendingUp className="h-3 w-3 mr-1" />VENTE</>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{operation.produit}</TableCell>
                        <TableCell>{depot?.nom || '-'}</TableCell>
                        <TableCell>{formatKg(operation.quantite_kg)}</TableCell>
                        <TableCell>
                          {operation.type === 'achat' 
                            ? formatFCFA(operation.prix_achat_par_kg || 0)
                            : formatFCFA(operation.prix_vente_par_kg || 0)
                          }
                        </TableCell>
                        <TableCell>
                          {operation.type === 'vente' 
                            ? formatFCFA(operation.cogs_par_kg || 0)
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {operation.type === 'vente' ? (
                            <div className="flex items-center gap-2">
                              <span className={margeNegative ? 'text-red-600' : 'text-green-600'}>
                                {formatFCFA(operation.marge_nette_par_kg || 0)}
                              </span>
                              {margeNegative && (
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          {operation.type === 'achat' ? (
                            <span className="text-red-600 font-medium">
                              -{formatFCFA((operation.cout_total_par_kg || 0) * operation.quantite_kg)}
                            </span>
                          ) : (
                            <span className={`font-medium ${
                              (operation.marge_totale || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {formatFCFA(operation.marge_totale || 0)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de création d'opération */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    Nouvelle {formData.type === 'achat' ? 'achat' : 'vente'}
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowForm(false)}
                  >
                    ×
                  </Button>
                </div>

                {formErrors.general && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {formErrors.general}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Type d'opération */}
                  <div className="md:col-span-2">
                    <Label>Type d'opération</Label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="achat"
                          checked={formData.type === 'achat'}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'achat' }))}
                          className="mr-2"
                        />
                        Achat
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="vente"
                          checked={formData.type === 'vente'}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'vente' }))}
                          className="mr-2"
                        />
                        Vente
                      </label>
                    </div>
                  </div>

                  {/* Date */}
                  <div>
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date_operation}
                      onChange={(e) => setFormData(prev => ({ ...prev, date_operation: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Produit */}
                  <div>
                    <Label htmlFor="produit">Produit *</Label>
                    <Input
                      id="produit"
                      value={formData.produit}
                      onChange={(e) => setFormData(prev => ({ ...prev, produit: e.target.value }))}
                      placeholder="ex: Hévéa, Maïs, Cacao"
                      required
                    />
                  </div>

                  {/* Point d'achat/vente */}
                  <div>
                    <Label htmlFor="point">
                      {formData.type === 'achat' ? 'Point d\'achat' : 'Point de vente'}
                    </Label>
                    <Input
                      id="point"
                      value={formData.type === 'achat' ? formData.point_achat : formData.point_vente}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        [formData.type === 'achat' ? 'point_achat' : 'point_vente']: e.target.value 
                      }))}
                      placeholder={formData.type === 'achat' ? 'Plantation, coopérative...' : 'Port, marché, client...'}
                    />
                  </div>

                  {/* Dépôt */}
                  <div>
                    <Label htmlFor="depot">Dépôt *</Label>
                    <select
                      id="depot"
                      value={formData.depot_id}
                      onChange={(e) => setFormData(prev => ({ ...prev, depot_id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner un dépôt</option>
                      {depots.map(depot => (
                        <option key={depot.id} value={depot.id}>{depot.nom}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quantité */}
                  <div>
                    <Label htmlFor="quantite">Quantité (kg) *</Label>
                    <Input
                      id="quantite"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={formData.quantite_kg || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, quantite_kg: parseFloat(e.target.value) || 0 }))}
                      required
                    />
                  </div>

                  {/* Prix */}
                  <div>
                    <Label htmlFor="prix">
                      {formData.type === 'achat' ? 'Prix d\'achat/kg (FCFA) *' : 'Prix de vente/kg (FCFA) *'}
                    </Label>
                    <Input
                      id="prix"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.type === 'achat' ? formData.prix_achat_par_kg || '' : formData.prix_vente_par_kg || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || undefined;
                        setFormData(prev => ({ 
                          ...prev, 
                          [formData.type === 'achat' ? 'prix_achat_par_kg' : 'prix_vente_par_kg']: value 
                        }));
                      }}
                      required
                    />
                  </div>

                  {/* Coûts additionnels */}
                  <div>
                    <Label htmlFor="chargement">Chargement/kg (FCFA)</Label>
                    <Input
                      id="chargement"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.chargement_par_kg || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, chargement_par_kg: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="transport">Transport/kg (FCFA)</Label>
                    <Input
                      id="transport"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.transport_par_kg || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, transport_par_kg: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="autres">Autres dépenses/kg (FCFA)</Label>
                    <Input
                      id="autres"
                      type="number"
                      min="0"
                      step="1"
                      value={formData.autres_depenses_par_kg || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, autres_depenses_par_kg: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                {/* Aperçu des calculs */}
                {apercuOperation && (
                  <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h3 className="font-medium mb-2">Aperçu</h3>
                    {formData.type === 'achat' ? (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Coût total/kg:</span>
                          <span className="ml-2 font-medium">{formatFCFA(apercuOperation.cout_total_par_kg)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Valeur totale:</span>
                          <span className="ml-2 font-medium">{formatFCFA(apercuOperation.valeur_totale)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">COGS/kg:</span>
                          <span className="ml-2 font-medium">{formatFCFA(apercuOperation.cogs_par_kg)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Marge/kg:</span>
                          <span className={`ml-2 font-medium ${apercuOperation.marge_negative ? 'text-red-600' : 'text-green-600'}`}>
                            {formatFCFA(apercuOperation.marge_nette_par_kg)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Marge totale:</span>
                          <span className={`ml-2 font-medium ${apercuOperation.marge_negative ? 'text-red-600' : 'text-green-600'}`}>
                            {formatFCFA(apercuOperation.marge_totale)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Chiffre d'affaires:</span>
                          <span className="ml-2 font-medium">{formatFCFA(apercuOperation.chiffre_affaires)}</span>
                        </div>
                        {apercuOperation.marge_negative && (
                          <div className="col-span-2 flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">⚠️ Attention: Marge négative!</span>
                          </div>
                        )}
                      </div>
                    )}
                    {apercuOperation.error && (
                      <div className="text-red-600 text-sm">
                        ⚠️ {apercuOperation.error}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-4 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading || !!apercuOperation?.error}>
                    {loading ? 'Création...' : `Créer ${formData.type}`}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}