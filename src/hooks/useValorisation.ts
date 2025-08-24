import { useState, useEffect } from 'react';
import { 
  LotInventaire, 
  ModeValorisationType, 
  ResultatValoFIFO, 
  ResultatValoMoyenne 
} from '../types';
import { repository } from '../lib/repositories';

/**
 * Hook pour calculer la valorisation FIFO
 * Consomme les lots par ordre d'ancienneté (First In, First Out)
 */
export function useValoFIFO() {
  const calculerFIFO = async (
    produit: string, 
    depot_id: string, 
    quantite_demandee: number
  ): Promise<ResultatValoFIFO> => {
    // Récupérer tous les lots du produit dans le dépôt, triés par date d'entrée
    const lots = await repository.getLots(depot_id, produit);
    const lotsDisponibles = lots
      .filter(lot => lot.quantite_kg_restante > 0)
      .sort((a, b) => a.date_entree.getTime() - b.date_entree.getTime());

    let quantite_restante = quantite_demandee;
    let cogs_total = 0;
    const lots_consommes: Array<{
      lot_id: string;
      quantite_kg: number;
      cout_unitaire_par_kg: number;
    }> = [];

    for (const lot of lotsDisponibles) {
      if (quantite_restante <= 0) break;

      const quantite_a_prendre = Math.min(quantite_restante, lot.quantite_kg_restante);
      
      lots_consommes.push({
        lot_id: lot.id,
        quantite_kg: quantite_a_prendre,
        cout_unitaire_par_kg: lot.cout_unitaire_par_kg
      });

      cogs_total += quantite_a_prendre * lot.cout_unitaire_par_kg;
      quantite_restante -= quantite_a_prendre;
    }

    if (quantite_restante > 0) {
      throw new Error(`Stock insuffisant. Il manque ${quantite_restante}kg de ${produit} dans le dépôt.`);
    }

    const cogs_par_kg = cogs_total / quantite_demandee;

    return {
      cogs_par_kg,
      lots_consommes
    };
  };

  return { calculerFIFO };
}

/**
 * Hook pour calculer la valorisation en coût moyen pondéré
 * Utilise le coût moyen de tous les lots disponibles
 */
export function useValoMoyennePonderee() {
  const calculerMoyennePonderee = async (
    produit: string, 
    depot_id: string, 
    quantite_demandee: number
  ): Promise<ResultatValoMoyenne> => {
    // Récupérer tous les lots du produit dans le dépôt
    const lots = await repository.getLots(depot_id, produit);
    const lotsDisponibles = lots.filter(lot => lot.quantite_kg_restante > 0);

    if (lotsDisponibles.length === 0) {
      throw new Error(`Aucun stock disponible pour ${produit} dans le dépôt.`);
    }

    // Calculer le stock total et la valeur totale
    let stock_total_kg = 0;
    let valeur_totale = 0;

    for (const lot of lotsDisponibles) {
      stock_total_kg += lot.quantite_kg_restante;
      valeur_totale += lot.quantite_kg_restante * lot.cout_unitaire_par_kg;
    }

    if (stock_total_kg < quantite_demandee) {
      throw new Error(`Stock insuffisant. Disponible: ${stock_total_kg}kg, demandé: ${quantite_demandee}kg`);
    }

    // Calculer le coût moyen pondéré
    const cogs_par_kg = valeur_totale / stock_total_kg;

    return {
      cogs_par_kg,
      stock_avant_kg: stock_total_kg,
      valeur_avant: valeur_totale
    };
  };

  return { calculerMoyennePonderee };
}

/**
 * Hook principal de valorisation qui utilise le mode configuré
 */
export function useValorisation() {
  const [modeValorisation, setModeValorisation] = useState<ModeValorisationType>('FIFO');
  const { calculerFIFO } = useValoFIFO();
  const { calculerMoyennePonderee } = useValoMoyennePonderee();

  // Charger le mode de valorisation depuis les paramètres
  useEffect(() => {
    const loadMode = async () => {
      try {
        const parametres = await repository.getParametres();
        setModeValorisation(parametres.mode_valorisation);
      } catch (error) {
        console.error('Erreur lors du chargement du mode de valorisation:', error);
      }
    };

    loadMode();
  }, []);

  /**
   * Calculer le COGS selon le mode de valorisation configuré
   */
  const calculerCOGS = async (
    produit: string,
    depot_id: string,
    quantite_kg: number
  ): Promise<number> => {
    try {
      if (modeValorisation === 'FIFO') {
        const resultat = await calculerFIFO(produit, depot_id, quantite_kg);
        return resultat.cogs_par_kg;
      } else {
        const resultat = await calculerMoyennePonderee(produit, depot_id, quantite_kg);
        return resultat.cogs_par_kg;
      }
    } catch (error) {
      console.error('Erreur lors du calcul COGS:', error);
      throw error;
    }
  };

  /**
   * Appliquer une sortie de stock selon le mode de valorisation
   * Met à jour les quantités des lots
   */
  const appliquerSortieStock = async (
    produit: string,
    depot_id: string,
    quantite_kg: number
  ): Promise<void> => {
    try {
      if (modeValorisation === 'FIFO') {
        const resultat = await calculerFIFO(produit, depot_id, quantite_kg);
        
        // Mettre à jour les quantités des lots consommés
        for (const lotConsomme of resultat.lots_consommes) {
          const lot = await repository.getLots().then(lots => 
            lots.find(l => l.id === lotConsomme.lot_id)
          );
          
          if (lot) {
            const nouvelleQuantite = lot.quantite_kg_restante - lotConsomme.quantite_kg;
            await repository.updateLot(lot.id, { 
              quantite_kg_restante: nouvelleQuantite 
            });
          }
        }
      } else {
        // Pour le coût moyen pondéré, on consomme proportionnellement dans tous les lots
        const lots = await repository.getLots(depot_id, produit);
        const lotsDisponibles = lots.filter(lot => lot.quantite_kg_restante > 0);
        
        const stockTotal = lotsDisponibles.reduce((sum, lot) => sum + lot.quantite_kg_restante, 0);
        
        for (const lot of lotsDisponibles) {
          const proportion = lot.quantite_kg_restante / stockTotal;
          const quantiteAConsommer = quantite_kg * proportion;
          const nouvelleQuantite = Math.max(0, lot.quantite_kg_restante - quantiteAConsommer);
          
          await repository.updateLot(lot.id, { 
            quantite_kg_restante: nouvelleQuantite 
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'application de la sortie de stock:', error);
      throw error;
    }
  };

  /**
   * Calculer la valeur totale du stock d'un produit dans un dépôt
   */
  const calculerValeurStock = async (
    produit?: string,
    depot_id?: string
  ): Promise<{ stock_kg: number; valeur_fcfa: number }> => {
    try {
      const lots = await repository.getLots(depot_id, produit);
      const lotsDisponibles = lots.filter(lot => lot.quantite_kg_restante > 0);

      const stock_kg = lotsDisponibles.reduce((sum, lot) => sum + lot.quantite_kg_restante, 0);
      const valeur_fcfa = lotsDisponibles.reduce((sum, lot) => 
        sum + (lot.quantite_kg_restante * lot.cout_unitaire_par_kg), 0
      );

      return { stock_kg, valeur_fcfa };
    } catch (error) {
      console.error('Erreur lors du calcul de la valeur du stock:', error);
      return { stock_kg: 0, valeur_fcfa: 0 };
    }
  };

  /**
   * Vérifier si un stock est suffisant pour une quantité demandée
   */
  const verifierStockDisponible = async (
    produit: string,
    depot_id: string,
    quantite_demandee: number
  ): Promise<boolean> => {
    try {
      const { stock_kg } = await calculerValeurStock(produit, depot_id);
      return stock_kg >= quantite_demandee;
    } catch (error) {
      console.error('Erreur lors de la vérification du stock:', error);
      return false;
    }
  };

  return {
    modeValorisation,
    calculerCOGS,
    appliquerSortieStock,
    calculerValeurStock,
    verifierStockDisponible,
    calculerFIFO,
    calculerMoyennePonderee
  };
}