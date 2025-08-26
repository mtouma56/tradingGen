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
    if (!supabase) {
      console.warn('Supabase not initialized, returning empty operations array');
      return [];
    }

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
    
    if (error) {
      console.warn('Error fetching operations:', error);
      // Si c'est une erreur de colonne inexistante, essayer avec date_operation
      if (error.code === '42703' && error.message.includes('op_date')) {
        console.log('Trying with date_operation column...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('operations')
          .select('*')
          .order('date_operation', { ascending: false });
        
        if (fallbackError) {
          console.error('Both op_date and date_operation failed:', fallbackError);
          return [];
        }
        
        return (fallbackData || []).map(op => ({
          ...op,
          date_operation: new Date(op.date_operation)
        }));
      }
      return [];
    }
    
    return (data || []).map(op => ({
      ...op,
      date_operation: new Date(op.op_date || op.date_operation)
    }));
  }

  async createOperation(operation: Omit<Operation, 'id'>): Promise<Operation> {
    if (!supabase) throw new Error('Supabase not initialized');

    // Transformer date_operation en op_date pour la base de données
    const { date_operation, ...rest } = operation;
    const operationData = {
      ...rest,
      op_date: date_operation
    };

    const { data, error } = await supabase
      .from('operations')
      .insert([operationData])
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      date_operation: new Date(data.op_date || data.date_operation)
    };
  }

  async updateOperation(id: string, operation: Partial<Operation>): Promise<Operation> {
    if (!supabase) throw new Error('Supabase not initialized');

    // Transformer date_operation en op_date si présent
    const { date_operation, ...rest } = operation;
    const operationData = date_operation 
      ? { ...rest, op_date: date_operation }
      : operation;

    const { data, error } = await supabase
      .from('operations')
      .update(operationData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    
    return {
      ...data,
      date_operation: new Date(data.op_date || data.date_operation)
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
    if (!supabase) {
      console.warn('Supabase not initialized, returning default parameters');
      return {
        id: 'default',
        mode_valorisation: 'FIFO',
        devise_affichage: 'FCFA'
      };
    }

    const { data, error } = await supabase
      .from('parametres')
      .select('*')
      .single();

    if (error) {
      console.warn('Error fetching parameters:', error);
      // Si pas de paramètres, créer des paramètres par défaut
      if (error.code === 'PGRST116') {
        try {
          const defaultParams: Omit<Parametres, 'id'> = {
            mode_valorisation: 'FIFO',
            devise_affichage: 'FCFA'
          };
          
          const { data: newData, error: insertError } = await supabase
            .from('parametres')
            .insert([defaultParams])
            .select()
            .single();
          
          if (insertError) {
            console.warn('Error creating default parameters:', insertError);
            return {
              id: 'default',
              mode_valorisation: 'FIFO',
              devise_affichage: 'FCFA'
            };
          }
          return newData;
        } catch (createError) {
          console.warn('Failed to create default parameters, using fallback');
          return {
            id: 'default',
            mode_valorisation: 'FIFO',
            devise_affichage: 'FCFA'
          };
        }
      }
      // Retourner les paramètres par défaut en cas d'erreur
      return {
        id: 'default',
        mode_valorisation: 'FIFO',
        devise_affichage: 'FCFA'
      };
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