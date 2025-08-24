import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Warehouse, 
  ArrowUpDown, 
  Plus, 
  Eye,
  Download,
  AlertCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/Table';
import { StockParProduit, Depot, LotInventaire, Parametres } from '../types';
import { repository } from '../lib/repositories';
import { useValorisation } from '../hooks/useValorisation';
import { formatFCFA, formatKg, formatDate, exportToCSV } from '../lib/utils';

interface StockData {
  produit: string;
  depot_id: string;
  depot_nom: string;
  stock_kg: number;
  valeur_fcfa: number;
  lots: LotInventaire[];
}

export function Inventaire() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [depots, setDepots] = useState<Depot[]>([]);
  const [parametres, setParametres] = useState<Parametres | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLots, setShowLots] = useState<string | null>(null);
  const [filtres, setFiltres] = useState({
    produit: '',
    depot_id: ''
  });

  const { calculerValeurStock, modeValorisation } = useValorisation();

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      // Charger dépôts et paramètres
      const [depotsData, parametresData] = await Promise.all([
        repository.getDepots(),
        repository.getParametres()
      ]);
      
      setDepots(depotsData.filter(d => d.actif));
      setParametres(parametresData);

      // Charger tous les lots
      const lots = await repository.getLots();
      const lotsActifs = lots.filter(lot => lot.quantite_kg_restante > 0);

      // Grouper par produit et dépôt
      const stockGroups: Record<string, StockData> = {};

      for (const lot of lotsActifs) {
        const key = `${lot.produit}-${lot.depot_id}`;
        
        if (!stockGroups[key]) {
          const depot = depotsData.find(d => d.id === lot.depot_id);
          stockGroups[key] = {
            produit: lot.produit,
            depot_id: lot.depot_id,
            depot_nom: depot?.nom || 'Dépôt inconnu',
            stock_kg: 0,
            valeur_fcfa: 0,
            lots: []
          };
        }

        stockGroups[key].stock_kg += lot.quantite_kg_restante;
        stockGroups[key].valeur_fcfa += lot.quantite_kg_restante * lot.cout_unitaire_par_kg;
        stockGroups[key].lots.push(lot);
      }

      // Trier par dépôt puis par produit
      const stockArray = Object.values(stockGroups).sort((a, b) => {
        if (a.depot_nom !== b.depot_nom) {
          return a.depot_nom.localeCompare(b.depot_nom);
        }
        return a.produit.localeCompare(b.produit);
      });

      setStockData(stockArray);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'inventaire:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, []);

  // Filtrer les données
  const stockFiltre = stockData.filter(stock => {
    return (
      (!filtres.produit || stock.produit.toLowerCase().includes(filtres.produit.toLowerCase())) &&
      (!filtres.depot_id || stock.depot_id === filtres.depot_id)
    );
  });

  // Calculer les totaux
  const totaux = stockFiltre.reduce(
    (acc, stock) => ({
      stock_kg: acc.stock_kg + stock.stock_kg,
      valeur_fcfa: acc.valeur_fcfa + stock.valeur_fcfa
    }),
    { stock_kg: 0, valeur_fcfa: 0 }
  );

  const handleExport = () => {
    if (stockFiltre.length === 0) return;
    
    const dataToExport = stockFiltre.map(stock => ({
      Produit: stock.produit,
      Dépôt: stock.depot_nom,
      'Stock (kg)': stock.stock_kg,
      'Valeur (FCFA)': stock.valeur_fcfa,
      'Prix moyen/kg (FCFA)': Math.round(stock.valeur_fcfa / stock.stock_kg),
      'Nombre de lots': stock.lots.length,
      'Mode valorisation': modeValorisation
    }));

    exportToCSV(dataToExport, 'inventaire');
  };

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
    }));

    exportToCSV(dataToExport, `lots_${produit.toLowerCase()}`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inventaire
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestion des stocks par dépôt et produit
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" disabled={stockFiltre.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Résumé des stocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-blue-500 mr-4">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Stock total
              </p>
              <p className="text-2xl font-bold">
                {loading ? '...' : formatKg(totaux.stock_kg)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-green-500 mr-4">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Valeur totale
              </p>
              <p className="text-2xl font-bold">
                {loading ? '...' : formatFCFA(totaux.valeur_fcfa)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <div className="rounded-full p-3 bg-purple-500 mr-4">
              <Warehouse className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Mode de valorisation
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{modeValorisation}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Tableau des stocks */}
      <Card>
        <CardHeader>
          <CardTitle>
            Stock par produit ({stockFiltre.length} ligne(s))
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">Chargement...</p>
          ) : stockFiltre.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucun stock trouvé
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Dépôt</TableHead>
                    <TableHead>Stock (kg)</TableHead>
                    <TableHead>Valeur (FCFA)</TableHead>
                    <TableHead>Prix moyen/kg</TableHead>
                    <TableHead>Nb lots</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stockFiltre.map((stock, index) => {
                    const prixMoyen = stock.valeur_fcfa / stock.stock_kg;
                    
                    return (
                      <TableRow key={`${stock.produit}-${stock.depot_id}`}>
                        <TableCell className="font-medium">{stock.produit}</TableCell>
                        <TableCell>{stock.depot_nom}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formatKg(stock.stock_kg)}
                            {stock.stock_kg < 1000 && (
                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{formatFCFA(stock.valeur_fcfa)}</TableCell>
                        <TableCell>{formatFCFA(prixMoyen)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{stock.lots.length}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowLots(showLots === `${stock.produit}-${stock.depot_id}` ? null : `${stock.produit}-${stock.depot_id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => exporterLots(stock.lots, stock.produit)}
                            >
                              <Download className="h-4 w-4" />
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

      {/* Détail des lots (affiché sous le tableau si sélectionné) */}
      {showLots && (() => {
        const stock = stockFiltre.find(s => `${s.produit}-${s.depot_id}` === showLots);
        if (!stock) return null;

        const lotsTries = [...stock.lots].sort((a, b) => a.date_entree.getTime() - b.date_entree.getTime());

        return (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Détail des lots - {stock.produit} ({stock.depot_nom})</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => exporterLots(stock.lots, stock.produit)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date d'entrée</TableHead>
                        <TableHead>Quantité restante</TableHead>
                        <TableHead>Coût unitaire/kg</TableHead>
                        <TableHead>Valeur totale</TableHead>
                        <TableHead>Fournisseur</TableHead>
                        <TableHead>BL</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lotsTries.map((lot) => {
                        const valeurTotale = lot.quantite_kg_restante * lot.cout_unitaire_par_kg;
                        const anciennetejours = Math.floor((Date.now() - lot.date_entree.getTime()) / (1000 * 60 * 60 * 24));
                        
                        return (
                          <TableRow key={lot.id}>
                            <TableCell>{formatDate(lot.date_entree)}</TableCell>
                            <TableCell>{formatKg(lot.quantite_kg_restante)}</TableCell>
                            <TableCell>{formatFCFA(lot.cout_unitaire_par_kg)}</TableCell>
                            <TableCell>{formatFCFA(valeurTotale)}</TableCell>
                            <TableCell className="max-w-[150px] truncate">
                              {lot.metadata?.fournisseur || '-'}
                            </TableCell>
                            <TableCell className="max-w-[100px] truncate">
                              {lot.metadata?.numero_bl || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={anciennetejours > 90 ? 'warning' : 'success'}
                                >
                                  {anciennetejours}j
                                </Badge>
                                {modeValorisation === 'FIFO' && anciennetejours < 7 && (
                                  <TrendingUp className="h-4 w-4 text-green-500" />
                                )}
                                {modeValorisation === 'FIFO' && anciennetejours > 90 && (
                                  <TrendingDown className="h-4 w-4 text-orange-500" />
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Résumé du lot sélectionné */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total lots:</span>
                      <span className="ml-2 font-medium">{stock.lots.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Stock total:</span>
                      <span className="ml-2 font-medium">{formatKg(stock.stock_kg)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Valeur totale:</span>
                      <span className="ml-2 font-medium">{formatFCFA(stock.valeur_fcfa)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Prix moyen:</span>
                      <span className="ml-2 font-medium">{formatFCFA(stock.valeur_fcfa / stock.stock_kg)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })()}
    </div>
  );
}

// Fix l'import manquant
import { DollarSign } from 'lucide-react';