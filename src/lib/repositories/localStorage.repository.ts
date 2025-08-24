import { 
  DataRepository, 
  Operation, 
  Depot, 
  LotInventaire, 
  MouvementStock, 
  Parametres,
  FiltresOperations 
} from '../../types';
import { generateId } from '../utils';

export class LocalStorageRepository implements DataRepository {
  private readonly STORAGE_KEYS = {
    operations: 'trading_operations',
    depots: 'trading_depots',
    lots: 'trading_lots',
    mouvements: 'trading_mouvements',
    parametres: 'trading_parametres'
  };

  private getData<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setData<T>(key: string, data: T[]): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private getSingleData<T>(key: string): T | null {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  private setSingleData<T>(key: string, data: T): void {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // Operations
  async getOperations(filtres?: FiltresOperations): Promise<Operation[]> {
    let operations = this.getData<Operation>(this.STORAGE_KEYS.operations);
    
    // Convertir les dates string en Date objects
    operations = operations.map(op => ({
      ...op,
      date_operation: new Date(op.date_operation)
    }));

    if (filtres) {
      if (filtres.date_debut) {
        operations = operations.filter(op => 
          op.date_operation >= filtres.date_debut!
        );
      }
      if (filtres.date_fin) {
        operations = operations.filter(op => 
          op.date_operation <= filtres.date_fin!
        );
      }
      if (filtres.produit) {
        operations = operations.filter(op => 
          op.produit.toLowerCase().includes(filtres.produit!.toLowerCase())
        );
      }
      if (filtres.depot_id) {
        operations = operations.filter(op => 
          op.depot_id === filtres.depot_id
        );
      }
      if (filtres.type) {
        operations = operations.filter(op => 
          op.type === filtres.type
        );
      }
    }

    return operations;
  }

  async createOperation(operation: Omit<Operation, 'id'>): Promise<Operation> {
    const operations = this.getData<Operation>(this.STORAGE_KEYS.operations);
    const newOperation: Operation = {
      ...operation,
      id: generateId()
    };
    operations.push(newOperation);
    this.setData(this.STORAGE_KEYS.operations, operations);
    return newOperation;
  }

  async updateOperation(id: string, operation: Partial<Operation>): Promise<Operation> {
    const operations = this.getData<Operation>(this.STORAGE_KEYS.operations);
    const index = operations.findIndex(op => op.id === id);
    if (index === -1) {
      throw new Error('Operation not found');
    }
    const updatedOperation = { ...operations[index], ...operation };
    operations[index] = updatedOperation;
    this.setData(this.STORAGE_KEYS.operations, operations);
    return updatedOperation;
  }

  async deleteOperation(id: string): Promise<void> {
    const operations = this.getData<Operation>(this.STORAGE_KEYS.operations);
    const filteredOperations = operations.filter(op => op.id !== id);
    this.setData(this.STORAGE_KEYS.operations, filteredOperations);
  }

  // Depots
  async getDepots(): Promise<Depot[]> {
    return this.getData<Depot>(this.STORAGE_KEYS.depots);
  }

  async createDepot(depot: Omit<Depot, 'id'>): Promise<Depot> {
    const depots = this.getData<Depot>(this.STORAGE_KEYS.depots);
    const newDepot: Depot = {
      ...depot,
      id: generateId()
    };
    depots.push(newDepot);
    this.setData(this.STORAGE_KEYS.depots, depots);
    return newDepot;
  }

  async updateDepot(id: string, depot: Partial<Depot>): Promise<Depot> {
    const depots = this.getData<Depot>(this.STORAGE_KEYS.depots);
    const index = depots.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Depot not found');
    }
    const updatedDepot = { ...depots[index], ...depot };
    depots[index] = updatedDepot;
    this.setData(this.STORAGE_KEYS.depots, depots);
    return updatedDepot;
  }

  async deleteDepot(id: string): Promise<void> {
    const depots = this.getData<Depot>(this.STORAGE_KEYS.depots);
    const filteredDepots = depots.filter(d => d.id !== id);
    this.setData(this.STORAGE_KEYS.depots, filteredDepots);
  }

  // Lots inventaire
  async getLots(depot_id?: string, produit?: string): Promise<LotInventaire[]> {
    let lots = this.getData<LotInventaire>(this.STORAGE_KEYS.lots);
    
    // Convertir les dates string en Date objects
    lots = lots.map(lot => ({
      ...lot,
      date_entree: new Date(lot.date_entree)
    }));

    if (depot_id) {
      lots = lots.filter(lot => lot.depot_id === depot_id);
    }
    if (produit) {
      lots = lots.filter(lot => 
        lot.produit.toLowerCase().includes(produit.toLowerCase())
      );
    }

    return lots;
  }

  async createLot(lot: Omit<LotInventaire, 'id'>): Promise<LotInventaire> {
    const lots = this.getData<LotInventaire>(this.STORAGE_KEYS.lots);
    const newLot: LotInventaire = {
      ...lot,
      id: generateId()
    };
    lots.push(newLot);
    this.setData(this.STORAGE_KEYS.lots, lots);
    return newLot;
  }

  async updateLot(id: string, lot: Partial<LotInventaire>): Promise<LotInventaire> {
    const lots = this.getData<LotInventaire>(this.STORAGE_KEYS.lots);
    const index = lots.findIndex(l => l.id === id);
    if (index === -1) {
      throw new Error('Lot not found');
    }
    const updatedLot = { ...lots[index], ...lot };
    lots[index] = updatedLot;
    this.setData(this.STORAGE_KEYS.lots, lots);
    return updatedLot;
  }

  async deleteLot(id: string): Promise<void> {
    const lots = this.getData<LotInventaire>(this.STORAGE_KEYS.lots);
    const filteredLots = lots.filter(l => l.id !== id);
    this.setData(this.STORAGE_KEYS.lots, filteredLots);
  }

  // Mouvements stock
  async getMouvements(filtres?: any): Promise<MouvementStock[]> {
    let mouvements = this.getData<MouvementStock>(this.STORAGE_KEYS.mouvements);
    
    // Convertir les dates string en Date objects
    mouvements = mouvements.map(mouv => ({
      ...mouv,
      date_mouvement: new Date(mouv.date_mouvement)
    }));

    // Appliquer les filtres si fournis
    if (filtres) {
      if (filtres.type) {
        mouvements = mouvements.filter(m => m.type === filtres.type);
      }
      if (filtres.produit) {
        mouvements = mouvements.filter(m => 
          m.produit.toLowerCase().includes(filtres.produit.toLowerCase())
        );
      }
      if (filtres.depot_id) {
        mouvements = mouvements.filter(m => 
          m.depot_source_id === filtres.depot_id || 
          m.depot_cible_id === filtres.depot_id
        );
      }
    }

    return mouvements;
  }

  async createMouvement(mouvement: Omit<MouvementStock, 'id'>): Promise<MouvementStock> {
    const mouvements = this.getData<MouvementStock>(this.STORAGE_KEYS.mouvements);
    const newMouvement: MouvementStock = {
      ...mouvement,
      id: generateId()
    };
    mouvements.push(newMouvement);
    this.setData(this.STORAGE_KEYS.mouvements, mouvements);
    return newMouvement;
  }

  // Parametres
  async getParametres(): Promise<Parametres> {
    let parametres = this.getSingleData<Parametres>(this.STORAGE_KEYS.parametres);
    
    if (!parametres) {
      // Créer des paramètres par défaut
      parametres = {
        id: '1',
        mode_valorisation: 'FIFO',
        devise_affichage: 'FCFA',
        cout_stockage_par_kg_par_jour: undefined
      };
      this.setSingleData(this.STORAGE_KEYS.parametres, parametres);
    }

    return parametres;
  }

  async updateParametres(parametres: Partial<Parametres>): Promise<Parametres> {
    const currentParametres = await this.getParametres();
    const updatedParametres = { ...currentParametres, ...parametres };
    this.setSingleData(this.STORAGE_KEYS.parametres, updatedParametres);
    return updatedParametres;
  }

  // Initialisation
  async init(): Promise<void> {
    // Vérifier et créer les paramètres par défaut si nécessaire
    await this.getParametres();
  }

  async reset(): Promise<void> {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    await this.init();
  }

  async seedData(): Promise<void> {
    // Créer des dépôts de base
    const depotsData = [
      { nom: 'Dépôt Abidjan', localisation: 'Abidjan, Côte d\'Ivoire', actif: true },
      { nom: 'Dépôt Bouaké', localisation: 'Bouaké, Côte d\'Ivoire', actif: true },
      { nom: 'Dépôt Soubré', localisation: 'Soubré, Côte d\'Ivoire', actif: true },
      { nom: 'Dépôt Yamoussoukro', localisation: 'Yamoussoukro, Côte d\'Ivoire', actif: true }
    ];

    for (const depotData of depotsData) {
      await this.createDepot(depotData);
    }

    const depots = await this.getDepots();
    const depotAbidjan = depots.find(d => d.nom.includes('Abidjan'))!;
    const depotBouake = depots.find(d => d.nom.includes('Bouaké'))!;
    const depotSoubre = depots.find(d => d.nom.includes('Soubré'))!;

    // Créer des achats (qui créent des entrées de stock)
    const achatsData = [
      {
        type: 'achat' as const,
        date_operation: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // J-15
        produit: 'Hévéa',
        point_achat: 'Plantation Abengourou',
        depot_id: depotAbidjan.id,
        quantite_kg: 35000,
        prix_achat_par_kg: 520,
        chargement_par_kg: 30,
        transport_par_kg: 45,
        autres_depenses_par_kg: 15
      },
      {
        type: 'achat' as const,
        date_operation: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // J-12
        produit: 'Maïs',
        point_achat: 'Coopérative Bouaké',
        depot_id: depotBouake.id,
        quantite_kg: 20000,
        prix_achat_par_kg: 210,
        chargement_par_kg: 10,
        transport_par_kg: 25,
        autres_depenses_par_kg: 5
      },
      {
        type: 'achat' as const,
        date_operation: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // J-10
        produit: 'Cacao',
        point_achat: 'Coopérative Soubré',
        depot_id: depotSoubre.id,
        quantite_kg: 15000,
        prix_achat_par_kg: 850,
        chargement_par_kg: 40,
        transport_par_kg: 60,
        autres_depenses_par_kg: 25
      },
      {
        type: 'achat' as const,
        date_operation: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // J-8
        produit: 'Anacarde',
        point_achat: 'Producteur Bondoukou',
        depot_id: depotAbidjan.id,
        quantite_kg: 12000,
        prix_achat_par_kg: 650,
        chargement_par_kg: 25,
        transport_par_kg: 35,
        autres_depenses_par_kg: 20
      },
      {
        type: 'achat' as const,
        date_operation: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // J-6
        produit: 'Café',
        point_achat: 'Plantation Man',
        depot_id: depotBouake.id,
        quantite_kg: 8000,
        prix_achat_par_kg: 1200,
        chargement_par_kg: 50,
        transport_par_kg: 80,
        autres_depenses_par_kg: 30
      }
    ];

    // Créer les achats et leurs lots correspondants
    for (const achatData of achatsData) {
      const operation = await this.createOperation(achatData);
      
      // Calculer le coût unitaire total
      const cout_unitaire_par_kg = 
        (achatData.prix_achat_par_kg || 0) +
        achatData.chargement_par_kg +
        achatData.transport_par_kg +
        achatData.autres_depenses_par_kg;

      // Créer le lot correspondant
      await this.createLot({
        produit: achatData.produit,
        depot_id: achatData.depot_id!,
        date_entree: achatData.date_operation,
        quantite_kg_restante: achatData.quantite_kg,
        cout_unitaire_par_kg,
        metadata: {
          numero_bl: `BL-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          fournisseur: achatData.point_achat,
          notes: `Lot créé automatiquement pour l'achat ${operation.id}`
        }
      });

      // Créer le mouvement d'entrée
      await this.createMouvement({
        type: 'entree',
        date_mouvement: achatData.date_operation,
        produit: achatData.produit,
        depot_cible_id: achatData.depot_id,
        quantite_kg: achatData.quantite_kg,
        cout_unitaire_par_kg,
        operation_id: operation.id,
        note: `Entrée automatique pour achat de ${achatData.quantite_kg}kg de ${achatData.produit}`
      });
    }

    // Créer quelques ventes
    const ventesData = [
      {
        type: 'vente' as const,
        date_operation: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // J-5
        produit: 'Hévéa',
        point_vente: 'Export Abidjan Port',
        depot_id: depotAbidjan.id,
        quantite_kg: 10000,
        prix_vente_par_kg: 650,
        chargement_par_kg: 0,
        transport_par_kg: 0,
        autres_depenses_par_kg: 0
      },
      {
        type: 'vente' as const,
        date_operation: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // J-3
        produit: 'Maïs',
        point_vente: 'Marché Bouaké',
        depot_id: depotBouake.id,
        quantite_kg: 8000,
        prix_vente_par_kg: 270,
        chargement_par_kg: 0,
        transport_par_kg: 0,
        autres_depenses_par_kg: 0
      }
    ];

    for (const venteData of ventesData) {
      await this.createOperation(venteData);
    }

    // Créer un transfert
    await this.createMouvement({
      type: 'transfert',
      date_mouvement: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // J-4
      produit: 'Hévéa',
      depot_source_id: depotAbidjan.id,
      depot_cible_id: depotSoubre.id,
      quantite_kg: 5000,
      note: 'Transfert stratégique vers Soubré'
    });

    // Créer un ajustement (perte)
    await this.createMouvement({
      type: 'ajustement',
      date_mouvement: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // J-2
      produit: 'Maïs',
      depot_source_id: depotBouake.id,
      quantite_kg: -300,
      cout_unitaire_par_kg: 250,
      note: 'Perte due à l\'humidité - inventaire physique'
    });
  }
}