-- ============================================
-- Seed Trading Hévéa (SAFE / idempotent)
-- ============================================

-- 0) Extensions utiles
create extension if not exists "pgcrypto";

-- 1) Dépôts (la table a 'name', pas 'nom')
insert into public.depots (name)
values
  ('Entrepôt Principal'),
  ('Dépôt San Pedro'),
  ('Stockage Yamoussoukro')
on conflict do nothing;

-- Récupération des IDs de dépôts pour les CTE suivants
with d as (
  select id, name from public.depots
  where name in ('Entrepôt Principal','Dépôt San Pedro','Stockage Yamoussoukro')
),

-- 2) Opérations d'achat (INSERT ... RETURNING pour récupérer les IDs)
ins_achats as (
  insert into public.operations
    (type, op_date, produit, point_achat, depot_id,
     quantite_kg, prix_achat_par_kg, chargement_par_kg, transport_par_kg, autres_depenses_par_kg)
  select *
  from (
    -- type,    op_date,      produit,            point_achat,              depot_id(sel via nom),  qty,   prix,  chg,  tr,   autres
    select 'achat'::text, date '2024-01-15', 'Hévéa Grade A', 'Plantation Koumassi',
           (select id from d where name='Entrepôt Principal'), 500.000, 850.00, 50.00, 25.00, 15.00
    union all
    select 'achat', date '2024-01-20', 'Hévéa Grade A', 'Plantation Dabou',
           (select id from d where name='Entrepôt Principal'), 750.000, 875.00, 45.00, 30.00, 10.00
    union all
    select 'achat', date '2024-01-25', 'Hévéa Grade B', 'Coopérative Agboville',
           (select id from d where name='Dépôt San Pedro'),   300.000, 720.00, 40.00, 35.00, 20.00
    union all
    select 'achat', date '2024-02-01', 'Hévéa Grade A', 'Plantation Adzopé',
           (select id from d where name='Entrepôt Principal'), 600.000, 860.00, 55.00, 25.00, 12.00
    union all
    select 'achat', date '2024-02-05', 'Hévéa Grade B', 'Plantation Grand-Bassam',
           (select id from d where name='Dépôt San Pedro'),   400.000, 740.00, 50.00, 40.00, 18.00
  ) v(type,op_date,produit,point_achat,depot_id,quantite_kg,prix_achat_par_kg,chargement_par_kg,transport_par_kg,autres_depenses_par_kg)
  on conflict do nothing
  returning id, op_date, produit, depot_id, quantite_kg, prix_achat_par_kg, chargement_par_kg, transport_par_kg, autres_depenses_par_kg
),

-- 3) Opérations de vente
ins_ventes as (
  insert into public.operations
    (type, op_date, produit, point_vente, depot_id,
     quantite_kg, prix_vente_par_kg, chargement_par_kg, transport_par_kg, autres_depenses_par_kg)
  select *
  from (
    -- type,   op_date,      produit,            point_vente,                depot_id(sel via nom),  qty,   prix,   chg,  tr,   autres
    select 'vente', date '2024-02-10', 'Hévéa Grade A', 'Export Abidjan Port',
           (select id from d where name='Entrepôt Principal'), 200.000, 1150.00, 30.00, 20.00, 8.00
    union all
    select 'vente', date '2024-02-15', 'Hévéa Grade A', 'Usine Transformation',
           (select id from d where name='Entrepôt Principal'), 300.000, 1200.00, 25.00, 15.00, 5.00
    union all
    select 'vente', date '2024-02-20', 'Hévéa Grade B', 'Marché Local',
           (select id from d where name='Dépôt San Pedro'),   150.000, 950.00,  35.00, 25.00, 10.00
  ) v(type,op_date,produit,point_vente,depot_id,quantite_kg,prix_vente_par_kg,chargement_par_kg,transport_par_kg,autres_depenses_par_kg)
  on conflict do nothing
  returning id, op_date, produit, depot_id, quantite_kg, prix_vente_par_kg, chargement_par_kg, transport_par_kg, autres_depenses_par_kg
)

-- 4) Fin des CTE : rien à projeter, l’important est d’avoir inséré
select 1;

-- 5) Mettre à jour les champs calculés (si présents dans la table)
-- Achats : coût total par kg
update public.operations
set cout_total_par_kg = coalesce(prix_achat_par_kg,0)
                       + coalesce(chargement_par_kg,0)
                       + coalesce(transport_par_kg,0)
                       + coalesce(autres_depenses_par_kg,0)
where type='achat'
  and (prix_achat_par_kg is not null
       or chargement_par_kg is not null
       or transport_par_kg is not null
       or autres_depenses_par_kg is not null);

-- Ventes : CA, COGS estimé simple, marges (exemple de démo)
update public.operations
set chiffre_affaires  = quantite_kg * prix_vente_par_kg,
    cogs_par_kg       = coalesce(cogs_par_kg, 940.00), -- valeur de démo; adapter si tu as un calcul FIFO réel
    marge_nette_par_kg= prix_vente_par_kg
                        - coalesce(chargement_par_kg,0)
                        - coalesce(transport_par_kg,0)
                        - coalesce(autres_depenses_par_kg,0)
                        - coalesce(cogs_par_kg, 940.00),
    marge_totale      = (quantite_kg * (prix_vente_par_kg
                        - coalesce(chargement_par_kg,0)
                        - coalesce(transport_par_kg,0)
                        - coalesce(autres_depenses_par_kg,0)
                        - coalesce(cogs_par_kg, 940.00)))
where type='vente' and prix_vente_par_kg is not null;

-- 6) Paramètres (1 ligne globale)
insert into public.parametres (mode_valorisation, devise_affichage)
values ('FIFO','FCFA')
on conflict do nothing;

-- 7) (Optionnel) lots & mouvements : tu peux ajouter ensuite
--    en liant sur les IDs retournés dans ins_achats/ins_ventes si besoin.

-- 8) Rechargement du cache REST
notify pgrst, 'reload schema';
