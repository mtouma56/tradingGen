import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Warehouse,
  AlertTriangle,
  Calendar,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { DashboardKPIs, Operation } from '../types';
import { repository } from '../lib/repositories';
import { formatFCFA, formatKg, formatDate } from '../lib/utils';
import { useValorisation } from '../hooks/useValorisation';

export function Dashboard() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtreDate, setFiltreDate] = useState('30'); // 30 derniers jours par défaut
  const [filtreProduit, setFiltreProduit] = useState('');

  const { calculerValeurStock } = useValorisation();

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const dateLimite = new Date();
      dateLimite.setDate(dateLimite.getDate() - parseInt(filtreDate));

      // Charger les opérations avec filtre
      const filtres = {
        date_debut: filtreDate === 'all' ? undefined : dateLimite,
        produit: filtreProduit || undefined
      };
      
      const operationsData = await repository.getOperations(filtres);
      setOperations(operationsData);

      // Calculer les KPIs
      const ventes = operationsData.filter(op => op.type === 'vente');
      const achats = operationsData.filter(op => op.type === 'achat');
      
      const quantite_vendue_kg = ventes.reduce((sum, v) => sum + v.quantite_kg, 0);
      const chiffre_affaires = ventes.reduce((sum, v) => sum + (v.chiffre_affaires || 0), 0);
      const marge_totale = ventes.reduce((sum, v) => sum + (v.marge_totale || 0), 0);
      const cogs_total = ventes.reduce((sum, v) => sum + ((v.cogs_par_kg || 0) * v.quantite_kg), 0);

      // Calculer le stock total et sa valeur
      const { stock_kg: stock_actuel_kg, valeur_fcfa: valeur_stock } = await calculerValeurStock();

      const kpisData: DashboardKPIs = {
        nombre_operations: operationsData.length,
        quantite_vendue_kg,
        chiffre_affaires,
        cogs_total,
        marge_totale,
        stock_actuel_kg,
        valeur_stock
      };

      setKpis(kpisData);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    chargerDonnees();
  }, [filtreDate, filtreProduit]);

  const kpiCards = [
    {
      title: "Opérations",
      value: kpis?.nombre_operations || 0,
      format: (v: number) => v.toString(),
      icon: Package,
      color: "bg-blue-500"
    },
    {
      title: "Quantité vendue",
      value: kpis?.quantite_vendue_kg || 0,
      format: formatKg,
      icon: BarChart3,
      color: "bg-green-500"
    },
    {
      title: "Chiffre d'affaires",
      value: kpis?.chiffre_affaires || 0,
      format: formatFCFA,
      icon: DollarSign,
      color: "bg-emerald-500"
    },
    {
      title: "COGS Total",
      value: kpis?.cogs_total || 0,
      format: formatFCFA,
      icon: TrendingUp,
      color: "bg-orange-500"
    },
    {
      title: "Marge totale",
      value: kpis?.marge_totale || 0,
      format: formatFCFA,
      icon: TrendingUp,
      color: (kpis?.marge_totale || 0) >= 0 ? "bg-green-500" : "bg-red-500"
    },
    {
      title: "Stock actuel",
      value: kpis?.stock_actuel_kg || 0,
      format: formatKg,
      icon: Warehouse,
      color: "bg-purple-500"
    },
    {
      title: "Valeur stock",
      value: kpis?.valeur_stock || 0,
      format: formatFCFA,
      icon: Package,
      color: "bg-indigo-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* En-tête avec filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Vue d'ensemble de vos opérations de trading
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <select 
              value={filtreDate} 
              onChange={(e) => setFiltreDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
              <option value="365">Dernière année</option>
              <option value="all">Toutes les données</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <Input
              placeholder="Filtrer par produit..."
              value={filtreProduit}
              onChange={(e) => setFiltreProduit(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="flex items-center p-6">
                <div className={`rounded-full p-3 ${kpi.color} mr-4`}>
                  <kpi.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {kpi.title}
                  </p>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold">
                      {loading ? '...' : kpi.format(kpi.value)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Opérations récentes avec marges négatives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Opérations récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-4">Chargement...</p>
          ) : operations.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              Aucune opération trouvée pour cette période
            </p>
          ) : (
            <div className="space-y-3">
              {operations.slice(0, 10).map((operation) => (
                <motion.div
                  key={operation.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={operation.type === 'achat' ? 'secondary' : 'default'}>
                        {operation.type.toUpperCase()}
                      </Badge>
                      <span className="font-medium">{operation.produit}</span>
                      {operation.type === 'vente' && (operation.marge_nette_par_kg || 0) < 0 && (
                        <Badge variant="destructive">
                          ⚠️ Marge négative
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
                      <p className="font-medium text-red-600">
                        -{formatFCFA((operation.cout_total_par_kg || 0) * operation.quantite_kg)}
                      </p>
                    ) : (
                      <p className="font-medium text-green-600">
                        +{formatFCFA(operation.chiffre_affaires || 0)}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Graphiques simples */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par produits</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-4">Chargement...</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(
                  operations.reduce((acc, op) => {
                    acc[op.produit] = (acc[op.produit] || 0) + op.quantite_kg;
                    return acc;
                  }, {} as Record<string, number>)
                ).map(([produit, quantite]) => (
                  <div key={produit} className="flex justify-between items-center">
                    <span className="font-medium">{produit}</span>
                    <Badge variant="outline">{formatKg(quantite)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance des ventes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-4">Chargement...</p>
            ) : (
              <div className="space-y-3">
                {operations
                  .filter(op => op.type === 'vente')
                  .slice(0, 5)
                  .map((operation) => (
                    <div key={operation.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{operation.produit}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(operation.date_operation)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          (operation.marge_nette_par_kg || 0) >= 0 
                            ? 'text-green-600' 
                            : 'text-red-600'
                        }`}>
                          {formatFCFA(operation.marge_totale || 0)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatFCFA(operation.marge_nette_par_kg || 0)}/kg
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}