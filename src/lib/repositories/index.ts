import { DataRepository } from '../../types';
import { LocalStorageRepository } from './localStorage.repository';
import { SupabaseRepository } from './supabase.repository';
import { isSupabaseAvailable } from '../supabase';

// Factory pour créer le bon repository selon la disponibilité de Supabase
export function createRepository(): DataRepository {
  if (isSupabaseAvailable()) {
    console.log('🔗 Utilisation de Supabase comme backend');
    return new SupabaseRepository();
  } else {
    console.log('💾 Utilisation de LocalStorage comme backend (mode hors-ligne)');
    return new LocalStorageRepository();
  }
}

// Instance singleton du repository
export const repository = createRepository();