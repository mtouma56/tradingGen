import { 
  DataRepository, 
  Operation, 
  Depot, 
  LotInventaire, 
  MouvementStock, 
  Parametres,
  FiltresOperations 
} from '../../types';
import { supabase } from '../supabase';

export class SupabaseRepository implements DataRepository {
  
  // Operations
  async getOperations(filtres?: FiltresOperations): Promise<Operation[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase.from('operations').select('*');

    if (filtres) {
      if (filtres.date_debut) {
        query = query.gte('op_date', filtres.date_debut.toISOString());
      }
      if (filtres.date_fin) {
        query = query.lte('op_date', filtres.date_fin.toISOString());
      }
      if (filtres.produit) {
        query = query.ilike('produit', `%${filtres.produit}%`);
      }
      if (filtres.depot_id) {
        query = query.eq('depot_id', filtres.depot_id);
      }
      if (filtres.type) {
        query = query.eq('type', filtres.type);
      }
    }

    const { data, error } = await query.order('op_date', { ascending: false });

    if (error) throw error;

    return (data || []).map((op: any) => {
      const { op_date, ...rest } = op;
      return {
        ...rest,
        date_operation: new Date(op_date)
      } as Operation;
    });
  }

  async createOperation(operation: Omit<Operation, 'id'>): Promise<Operation> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { date_operation, ...rest } = operation;

    const { data, error } = await supabase
      .from('operations')
      .insert([{ ...rest, op_date: date_operation.toISOString() }])
      .select()
      .single();

    if (error) throw error;

    const { op_date, ...returned } = data as any;
    return {
      ...returned,
      date_operation: new Date(op_date)
    };
  }

  async updateOperation(id: string, operation: Partial<Operation>): Promise<Operation> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { date_operation, ...rest } = operation;
    const updateData = {
      ...rest,
      ...(date_operation ? { op_date: date_operation.toISOString() } : {})
    };

    const { data, error } = await supabase
      .from('operations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const { op_date, ...returned } = data as any;
    return {
      ...returned,
      date_operation: new Date(op_date)
    };
  }

  async deleteOperation(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('operations')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Depots
  async getDepots(): Promise<Depot[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('depots')
      .select('*')
      .order('nom');

    if (error) throw error;
    return data || [];
  }

  async createDepot(depot: Omit<Depot, 'id'>): Promise<Depot> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('depots')
      .insert([depot])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDepot(id: string, depot: Partial<Depot>): Promise<Depot> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('depots')
      .update(depot)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDepot(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('depots')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Lots inventaire
  async getLots(depot_id?: string, produit?: string): Promise<LotInventaire[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase.from('lots_inventaire').select('*');

    if (depot_id) {
      query = query.eq('depot_id', depot_id);
    }
    if (produit) {
      query = query.ilike('produit', `%${produit}%`);
    }

    const { data, error } = await query
      .order('date_entree', { ascending: true });

    if (error) throw error;
    
    return (data || []).map(lot => ({
      ...lot,
      date_entree: new Date(lot.date_entree)
    }));
  }

  async createLot(lot: Omit<LotInventaire, 'id'>): Promise<LotInventaire> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('lots_inventaire')
      .insert([lot])
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      date_entree: new Date(data.date_entree)
    };
  }

  async updateLot(id: string, lot: Partial<LotInventaire>): Promise<LotInventaire> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('lots_inventaire')
      .update(lot)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      date_entree: new Date(data.date_entree)
    };
  }

  async deleteLot(id: string): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { error } = await supabase
      .from('lots_inventaire')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Mouvements stock
  async getMouvements(filtres?: any): Promise<MouvementStock[]> {
    if (!supabase) throw new Error('Supabase not initialized');

    let query = supabase.from('mouvements_stock').select('*');

    if (filtres) {
      if (filtres.type) {
        query = query.eq('type', filtres.type);
      }
      if (filtres.produit) {
        query = query.ilike('produit', `%${filtres.produit}%`);
      }
      if (filtres.depot_id) {
        query = query.or(`depot_source_id.eq.${filtres.depot_id},depot_cible_id.eq.${filtres.depot_id}`);
      }
    }

    const { data, error } = await query
      .order('date_mouvement', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(mouv => ({
      ...mouv,
      date_mouvement: new Date(mouv.date_mouvement)
    }));
  }

  async createMouvement(mouvement: Omit<MouvementStock, 'id'>): Promise<MouvementStock> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('mouvements_stock')
      .insert([mouvement])
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      date_mouvement: new Date(data.date_mouvement)
    };
  }

  // Parametres
  async getParametres(): Promise<Parametres> {
    if (!supabase) throw new Error('Supabase not initialized');

    const { data, error } = await supabase
      .from('parametres')
      .select('*')
      .single();

    if (error) {
      // Si pas de paramètres, créer des paramètres par défaut
      if (error.code === 'PGRST116') {
        const defaultParams: Omit<Parametres, 'id'> = {
          mode_valorisation: 'FIFO',
          devise_affichage: 'FCFA'
        };
        
        const { data: newData, error: insertError } = await supabase
          .from('parametres')
          .insert([defaultParams])
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newData;
      }
      throw error;
    }

    return data;
  }

  async updateParametres(parametres: Partial<Parametres>): Promise<Parametres> {
    if (!supabase) throw new Error('Supabase not initialized');

    // Récupérer l'ID des paramètres existants
    const current = await this.getParametres();

    const { data, error } = await supabase
      .from('parametres')
      .update(parametres)
      .eq('id', current.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Initialisation
  async init(): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');
    
    // Vérifier la connexion
    const { data, error } = await supabase.auth.getSession();
    if (error && error.message !== 'No session') {
      throw error;
    }
    
    // Initialiser les paramètres par défaut si nécessaire
    await this.getParametres();
  }

  async reset(): Promise<void> {
    if (!supabase) throw new Error('Supabase not initialized');

    // Supprimer toutes les données dans l'ordre (relations)
    await supabase.from('mouvements_stock').delete().neq('id', '');
    await supabase.from('lots_inventaire').delete().neq('id', '');
    await supabase.from('operations').delete().neq('id', '');
    await supabase.from('depots').delete().neq('id', '');
    
    // Réinitialiser les paramètres
    await this.getParametres();
  }

  async seedData(): Promise<void> {
    // Pour Supabase, on peut implémenter la même logique que LocalStorage
    // ou laisser cela à l'administrateur de la base de données
    throw new Error('Seed data not implemented for Supabase - use SQL scripts instead');
  }
}