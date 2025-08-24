// Types pour l'application de trading d'hévéa

export type OperationType = 'achat' | 'vente';
export type MouvementType = 'entree' | 'sortie' | 'transfert' | 'ajustement';
export type ModeValorisationType = 'FIFO' | 'MOYEN_PONDERE';

// Table operations
export interface Operation {
  id: string;
  type: OperationType;
  date_operation: Date;
  produit: string;
  point_achat?: string;
  point_vente?: string;
  depot_id?: string;
  quantite_kg: number;
  // Prix et coûts unitaires (par kg)
  prix_achat_par_kg?: number;
  chargement_par_kg: number;
  transport_par_kg: number;
  autres_depenses_par_kg: number;
  prix_vente_par_kg?: number;
  
  // Champs calculés
  cout_total_par_kg?: number;
  marge_nette_par_kg?: number;
  marge_totale?: number;
  chiffre_affaires?: number;
  cogs_par_kg?: number; // Coût des marchandises vendues par kg
}

// Table depots
export interface Depot {
  id: string;
  nom: string;
  localisation?: string;
  actif: boolean;
}

// Table lots_inventaire
export interface LotInventaire {
  id: string;
  produit: string;
  depot_id: string;
  date_entree: Date;
  quantite_kg_restante: number;
  cout_unitaire_par_kg: number;
  metadata?: {
    numero_bl?: string;
    fournisseur?: string;
    notes?: string;
  };
}

// Table mouvements_stock
export interface MouvementStock {
  id: string;
  type: MouvementType;
  date_mouvement: Date;
  produit: string;
  depot_source_id?: string;
  depot_cible_id?: string;
  lot_source_id?: string;
  quantite_kg: number;
  cout_unitaire_par_kg?: number;
  operation_id?: string;
  note?: string;
}

// Table parametres
export interface Parametres {
  id: string;
  mode_valorisation: ModeValorisationType;
  devise_affichage: string;
  cout_stockage_par_kg_par_jour?: number;
}

// Types pour les KPIs du dashboard
export interface DashboardKPIs {
  nombre_operations: number;
  quantite_vendue_kg: number;
  chiffre_affaires: number;
  cogs_total: number;
  marge_totale: number;
  stock_actuel_kg: number;
  valeur_stock: number;
  cout_stockage_periode?: number;
}

// Types pour les données d'inventaire
export interface StockParProduit {
  produit: string;
  depot_id: string;
  depot_nom: string;
  stock_kg: number;
  valeur_fcfa: number;
  mode_valorisation: ModeValorisationType;
}

// Types pour les graphiques
export interface GraphiqueMargeParProduit {
  produit: string;
  marge_totale: number;
}

export interface GraphiqueStockPeriode {
  date: string;
  produit: string;
  depot: string;
  stock_kg: number;
}

// Types pour les filtres
export interface FiltresOperations {
  date_debut?: Date;
  date_fin?: Date;
  produit?: string;
  depot_id?: string;
  type?: OperationType;
}

export interface FiltresStock {
  produit?: string;
  depot_id?: string;
}

// Types pour l'export CSV
export interface ExportData {
  operations?: Operation[];
  stock?: StockParProduit[];
  lots?: LotInventaire[];
  mouvements?: MouvementStock[];
}

// Types pour les calculs de valorisation
export interface ResultatValoFIFO {
  cogs_par_kg: number;
  lots_consommes: Array<{
    lot_id: string;
    quantite_kg: number;
    cout_unitaire_par_kg: number;
  }>;
}

export interface ResultatValoMoyenne {
  cogs_par_kg: number;
  stock_avant_kg: number;
  valeur_avant: number;
}

// Types pour les forms
export interface FormOperation {
  type: OperationType;
  date_operation: string;
  produit: string;
  point_achat?: string;
  point_vente?: string;
  depot_id?: string;
  quantite_kg: number;
  prix_achat_par_kg?: number;
  chargement_par_kg: number;
  transport_par_kg: number;
  autres_depenses_par_kg: number;
  prix_vente_par_kg?: number;
}

export interface FormMouvement {
  type: MouvementType;
  date_mouvement: string;
  produit: string;
  depot_source_id?: string;
  depot_cible_id?: string;
  quantite_kg: number;
  cout_unitaire_par_kg?: number;
  note?: string;
}

// Interface pour la couche d'abstraction des données
export interface DataRepository {
  // Operations
  getOperations(filtres?: FiltresOperations): Promise<Operation[]>;
  createOperation(operation: Omit<Operation, 'id'>): Promise<Operation>;
  updateOperation(id: string, operation: Partial<Operation>): Promise<Operation>;
  deleteOperation(id: string): Promise<void>;
  
  // Depots
  getDepots(): Promise<Depot[]>;
  createDepot(depot: Omit<Depot, 'id'>): Promise<Depot>;
  updateDepot(id: string, depot: Partial<Depot>): Promise<Depot>;
  deleteDepot(id: string): Promise<void>;
  
  // Lots inventaire
  getLots(depot_id?: string, produit?: string): Promise<LotInventaire[]>;
  createLot(lot: Omit<LotInventaire, 'id'>): Promise<LotInventaire>;
  updateLot(id: string, lot: Partial<LotInventaire>): Promise<LotInventaire>;
  deleteLot(id: string): Promise<void>;
  
  // Mouvements stock
  getMouvements(filtres?: any): Promise<MouvementStock[]>;
  createMouvement(mouvement: Omit<MouvementStock, 'id'>): Promise<MouvementStock>;
  
  // Parametres
  getParametres(): Promise<Parametres>;
  updateParametres(parametres: Partial<Parametres>): Promise<Parametres>;
  
  // Initialisation
  init(): Promise<void>;
  reset(): Promise<void>;
  seedData(): Promise<void>;
}