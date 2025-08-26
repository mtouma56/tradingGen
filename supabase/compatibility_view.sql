-- Solution de compatibilité pour les colonnes de date de la table operations
-- Ce script peut être exécuté dans Supabase SQL Editor si nécessaire

-- Option 1: Si la table operations utilise 'op_date' au lieu de 'date_operation'
-- Créer une vue qui expose 'date_operation' comme alias de 'op_date'
CREATE OR REPLACE VIEW public.operations_view AS
SELECT
  id, 
  type, 
  op_date as date_operation,  -- Alias op_date -> date_operation
  produit, 
  point_achat, 
  point_vente, 
  depot_id, 
  quantite_kg,
  prix_achat_par_kg, 
  chargement_par_kg, 
  transport_par_kg, 
  autres_depenses_par_kg, 
  prix_vente_par_kg,
  cout_total_par_kg, 
  marge_nette_par_kg, 
  marge_totale, 
  chiffre_affaires, 
  cogs_par_kg,
  created_at, 
  updated_at
FROM public.operations;

-- Activer security invoker pour hériter des permissions de la table parent
ALTER VIEW public.operations_view SET (security_invoker = true);

-- Recharger le schéma pour que PostgREST prenne en compte la vue
NOTIFY pgrst, 'reload schema';

-- Option 2: Si la table operations utilise 'date_operation' correctement
-- Vérifier la structure de la table
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'operations' AND table_schema = 'public';

-- Option 3: Alternative - Renommer la colonne si elle s'appelle autrement
-- ALTER TABLE public.operations RENAME COLUMN op_date TO date_operation;