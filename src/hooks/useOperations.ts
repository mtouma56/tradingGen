import { useState, useEffect } from 'react';
import { Operation, FormOperation, FiltresOperations } from '../types';
import { repository } from '../lib/repositories';
import { useValorisation } from './useValorisation';
import { parseDate, generateId } from '../lib/utils';

/**
 * Hook pour gérer les opérations d'achat et de vente
 */
export function useOperations() {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { calculerCOGS, appliquerSortieStock, verifierStockDisponible } = useValorisation();

  /**
   * Charger les opérations avec filtres optionnels
   */
  const chargerOperations = async (filtres?: FiltresOperations) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await repository.getOperations(filtres);
      
      // Calculer les champs dérivés pour chaque opération
      const operationsAvecCalculs = await Promise.all(
        data.map(async (op) => {
          const operationCalculee = { ...op };
          
          // Calculer le coût total par kg
          if (op.type === 'achat') {
            operationCalculee.cout_total_par_kg = 
              (op.prix_achat_par_kg || 0) +
              op.chargement_par_kg +
              op.transport_par_kg +
              op.autres_depenses_par_kg;
          }
          
          // Calculer les métriques de vente
          if (op.type === 'vente' && op.prix_vente_par_kg && op.depot_id) {
            try {
              // Calculer le COGS réel basé sur le stock
              const cogs_par_kg = await calculerCOGS(op.produit, op.depot_id, op.quantite_kg);
              operationCalculee.cogs_par_kg = cogs_par_kg;
              operationCalculee.marge_nette_par_kg = op.prix_vente_par_kg - cogs_par_kg;
              operationCalculee.marge_totale = operationCalculee.marge_nette_par_kg * op.quantite_kg;
              operationCalculee.chiffre_affaires = op.prix_vente_par_kg * op.quantite_kg;
            } catch (error) {
              console.warn(`Impossible de calculer COGS pour l'opération ${op.id}:`, error);
              operationCalculee.cogs_par_kg = 0;
              operationCalculee.marge_nette_par_kg = 0;
              operationCalculee.marge_totale = 0;
              operationCalculee.chiffre_affaires = op.prix_vente_par_kg * op.quantite_kg;
            }
          }
          
          return operationCalculee;
        })
      );
      
      setOperations(operationsAvecCalculs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des opérations');
      console.error('Erreur chargement opérations:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Créer une nouvelle opération d'achat
   * Génère automatiquement l'entrée de stock et le lot
   */
  const creerAchat = async (formData: FormOperation): Promise<void> => {
    if (formData.type !== 'achat') {
      throw new Error('Cette fonction est réservée aux achats');
    }

    if (!formData.prix_achat_par_kg || !formData.depot_id) {
      throw new Error('Prix d\'achat et dépôt requis pour un achat');
    }

    setLoading(true);
    setError(null);

    try {
      // Calculer le coût unitaire total
      const cout_unitaire_par_kg = 
        formData.prix_achat_par_kg +
        formData.chargement_par_kg +
        formData.transport_par_kg +
        formData.autres_depenses_par_kg;

      // Créer l'opération d'achat
      const operation = await repository.createOperation({
        type: 'achat',
        date_operation: parseDate(formData.date_operation),
        produit: formData.produit,
        point_achat: formData.point_achat,
        depot_id: formData.depot_id,
        quantite_kg: formData.quantite_kg,
        prix_achat_par_kg: formData.prix_achat_par_kg,
        chargement_par_kg: formData.chargement_par_kg,
        transport_par_kg: formData.transport_par_kg,
        autres_depenses_par_kg: formData.autres_depenses_par_kg,
        cout_total_par_kg: cout_unitaire_par_kg
      });

      // Créer le lot de stock correspondant
      await repository.createLot({
        produit: formData.produit,
        depot_id: formData.depot_id,
        date_entree: parseDate(formData.date_operation),
        quantite_kg_restante: formData.quantite_kg,
        cout_unitaire_par_kg,
        metadata: {
          numero_bl: `BL-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          fournisseur: formData.point_achat,
          notes: `Lot créé automatiquement pour l'achat ${operation.id}`
        }
      });

      // Créer le mouvement d'entrée
      await repository.createMouvement({
        type: 'entree',
        date_mouvement: parseDate(formData.date_operation),
        produit: formData.produit,
        depot_cible_id: formData.depot_id,
        quantite_kg: formData.quantite_kg,
        cout_unitaire_par_kg,
        operation_id: operation.id,
        note: `Entrée automatique pour achat de ${formData.quantite_kg}kg de ${formData.produit}`
      });

      // Recharger les opérations
      await chargerOperations();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'achat');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Créer une nouvelle opération de vente
   * Décremente automatiquement le stock selon la méthode de valorisation
   */
  const creerVente = async (formData: FormOperation): Promise<void> => {
    if (formData.type !== 'vente') {
      throw new Error('Cette fonction est réservée aux ventes');
    }

    if (!formData.prix_vente_par_kg || !formData.depot_id) {
      throw new Error('Prix de vente et dépôt requis pour une vente');
    }

    setLoading(true);
    setError(null);

    try {
      // Vérifier le stock disponible
      const stockSuffisant = await verifierStockDisponible(
        formData.produit, 
        formData.depot_id, 
        formData.quantite_kg
      );

      if (!stockSuffisant) {
        throw new Error(`Stock insuffisant pour ${formData.produit} dans le dépôt sélectionné`);
      }

      // Calculer le COGS avant la sortie
      const cogs_par_kg = await calculerCOGS(
        formData.produit, 
        formData.depot_id, 
        formData.quantite_kg
      );

      // Créer l'opération de vente avec les calculs
      const marge_nette_par_kg = formData.prix_vente_par_kg - cogs_par_kg;
      const marge_totale = marge_nette_par_kg * formData.quantite_kg;
      const chiffre_affaires = formData.prix_vente_par_kg * formData.quantite_kg;

      const operation = await repository.createOperation({
        type: 'vente',
        date_operation: parseDate(formData.date_operation),
        produit: formData.produit,
        point_vente: formData.point_vente,
        depot_id: formData.depot_id,
        quantite_kg: formData.quantite_kg,
        prix_vente_par_kg: formData.prix_vente_par_kg,
        chargement_par_kg: formData.chargement_par_kg,
        transport_par_kg: formData.transport_par_kg,
        autres_depenses_par_kg: formData.autres_depenses_par_kg,
        cogs_par_kg,
        marge_nette_par_kg,
        marge_totale,
        chiffre_affaires
      });

      // Appliquer la sortie de stock
      await appliquerSortieStock(formData.produit, formData.depot_id, formData.quantite_kg);

      // Créer le mouvement de sortie
      await repository.createMouvement({
        type: 'sortie',
        date_mouvement: parseDate(formData.date_operation),
        produit: formData.produit,
        depot_source_id: formData.depot_id,
        quantite_kg: formData.quantite_kg,
        cout_unitaire_par_kg: cogs_par_kg,
        operation_id: operation.id,
        note: `Sortie automatique pour vente de ${formData.quantite_kg}kg de ${formData.produit}`
      });

      // Recharger les opérations
      await chargerOperations();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de la vente');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Supprimer une opération
   * ATTENTION: Ne restaure pas automatiquement le stock
   */
  const supprimerOperation = async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await repository.deleteOperation(id);
      await chargerOperations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Calculer un aperçu d'opération (pour preview en temps réel)
   */
  const calculerApercuOperation = async (formData: Partial<FormOperation>) => {
    if (!formData.type || !formData.quantite_kg || !formData.depot_id || !formData.produit) {
      return null;
    }

    try {
      if (formData.type === 'achat' && formData.prix_achat_par_kg) {
        const cout_total_par_kg = 
          formData.prix_achat_par_kg +
          (formData.chargement_par_kg || 0) +
          (formData.transport_par_kg || 0) +
          (formData.autres_depenses_par_kg || 0);

        return {
          cout_total_par_kg,
          valeur_totale: cout_total_par_kg * formData.quantite_kg
        };
      }

      if (formData.type === 'vente' && formData.prix_vente_par_kg) {
        try {
          const cogs_par_kg = await calculerCOGS(
            formData.produit, 
            formData.depot_id, 
            formData.quantite_kg
          );
          
          const marge_nette_par_kg = formData.prix_vente_par_kg - cogs_par_kg;
          const marge_totale = marge_nette_par_kg * formData.quantite_kg;
          const chiffre_affaires = formData.prix_vente_par_kg * formData.quantite_kg;

          return {
            cogs_par_kg,
            marge_nette_par_kg,
            marge_totale,
            chiffre_affaires,
            marge_negative: marge_nette_par_kg < 0
          };
        } catch (error) {
          return {
            error: 'Stock insuffisant ou indisponible'
          };
        }
      }
    } catch (error) {
      console.error('Erreur calcul aperçu:', error);
    }

    return null;
  };

  // Charger les opérations au montage du composant
  useEffect(() => {
    chargerOperations();
  }, []);

  return {
    operations,
    loading,
    error,
    chargerOperations,
    creerAchat,
    creerVente,
    supprimerOperation,
    calculerApercuOperation
  };
}