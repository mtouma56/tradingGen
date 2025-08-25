-- Données de test pour l'application Trading Hévéa
-- À exécuter après la création des tables

-- Insertion des dépôts de base
INSERT INTO depots (id, nom, localisation, actif) VALUES 
    ('d1234567-89ab-cdef-0123-456789abcdef', 'Entrepôt Principal', 'Abidjan - Zone Industrielle', true),
    ('d2234567-89ab-cdef-0123-456789abcdef', 'Dépôt San Pedro', 'San Pedro - Port', true),
    ('d3234567-89ab-cdef-0123-456789abcdef', 'Stockage Yamoussoukro', 'Yamoussoukro - Centre', true)
ON CONFLICT (id) DO NOTHING;

-- Insertion des paramètres par défaut
INSERT INTO parametres (id, mode_valorisation, devise_affichage, cout_stockage_par_kg_par_jour) VALUES 
    ('p1234567-89ab-cdef-0123-456789abcdef', 'FIFO', 'FCFA', 10.00)
ON CONFLICT (id) DO NOTHING;

-- Insertion d'opérations d'achat (génère automatiquement du stock)
INSERT INTO operations (id, type, date_operation, produit, point_achat, depot_id, quantite_kg, prix_achat_par_kg, chargement_par_kg, transport_par_kg, autres_depenses_par_kg) VALUES 
    ('o1234567-89ab-cdef-0123-456789abcdef', 'achat', '2024-01-15', 'Hévéa Grade A', 'Plantation Koumassi', 'd1234567-89ab-cdef-0123-456789abcdef', 500.000, 850.00, 50.00, 25.00, 15.00),
    ('o2234567-89ab-cdef-0123-456789abcdef', 'achat', '2024-01-20', 'Hévéa Grade A', 'Plantation Dabou', 'd1234567-89ab-cdef-0123-456789abcdef', 750.000, 875.00, 45.00, 30.00, 10.00),
    ('o3234567-89ab-cdef-0123-456789abcdef', 'achat', '2024-01-25', 'Hévéa Grade B', 'Coopérative Agboville', 'd2234567-89ab-cdef-0123-456789abcdef', 300.000, 720.00, 40.00, 35.00, 20.00),
    ('o4234567-89ab-cdef-0123-456789abcdef', 'achat', '2024-02-01', 'Hévéa Grade A', 'Plantation Adzope', 'd1234567-89ab-cdef-0123-456789abcdef', 600.000, 860.00, 55.00, 25.00, 12.00),
    ('o5234567-89ab-cdef-0123-456789abcdef', 'achat', '2024-02-05', 'Hévéa Grade B', 'Plantation Grand Bassam', 'd2234567-89ab-cdef-0123-456789abcdef', 400.000, 740.00, 50.00, 40.00, 18.00)
ON CONFLICT (id) DO NOTHING;

-- Insertion d'opérations de vente
INSERT INTO operations (id, type, date_operation, produit, point_vente, depot_id, quantite_kg, prix_vente_par_kg, chargement_par_kg, transport_par_kg, autres_depenses_par_kg) VALUES 
    ('o6234567-89ab-cdef-0123-456789abcdef', 'vente', '2024-02-10', 'Hévéa Grade A', 'Export Abidjan Port', 'd1234567-89ab-cdef-0123-456789abcdef', 200.000, 1150.00, 30.00, 20.00, 8.00),
    ('o7234567-89ab-cdef-0123-456789abcdef', 'vente', '2024-02-15', 'Hévéa Grade A', 'Usine Transformation', 'd1234567-89ab-cdef-0123-456789abcdef', 300.000, 1200.00, 25.00, 15.00, 5.00),
    ('o8234567-89ab-cdef-0123-456789abcdef', 'vente', '2024-02-20', 'Hévéa Grade B', 'Marché Local', 'd2234567-89ab-cdef-0123-456789abcdef', 150.000, 950.00, 35.00, 25.00, 10.00)
ON CONFLICT (id) DO NOTHING;

-- Lots d'inventaire correspondant aux achats
INSERT INTO lots_inventaire (id, produit, depot_id, date_entree, quantite_kg_restante, cout_unitaire_par_kg, metadata) VALUES 
    ('l1234567-89ab-cdef-0123-456789abcdef', 'Hévéa Grade A', 'd1234567-89ab-cdef-0123-456789abcdef', '2024-01-15', 300.000, 940.00, '{"numero_bl": "BL-2024-001", "fournisseur": "Plantation Koumassi", "notes": "Qualité excellente"}'),
    ('l2234567-89ab-cdef-0123-456789abcdef', 'Hévéa Grade A', 'd1234567-89ab-cdef-0123-456789abcdef', '2024-01-20', 450.000, 960.00, '{"numero_bl": "BL-2024-002", "fournisseur": "Plantation Dabou", "notes": "Livraison rapide"}'),
    ('l3234567-89ab-cdef-0123-456789abcdef', 'Hévéa Grade B', 'd2234567-89ab-cdef-0123-456789abcdef', '2024-01-25', 150.000, 815.00, '{"numero_bl": "BL-2024-003", "fournisseur": "Coopérative Agboville", "notes": "Première collaboration"}'),
    ('l4234567-89ab-cdef-0123-456789abcdef', 'Hévéa Grade A', 'd1234567-89ab-cdef-0123-456789abcdef', '2024-02-01', 600.000, 952.00, '{"numero_bl": "BL-2024-004", "fournisseur": "Plantation Adzope", "notes": "Stock principal"}'),
    ('l5234567-89ab-cdef-0123-456789abcdef', 'Hévéa Grade B', 'd2234567-89ab-cdef-0123-456789abcdef', '2024-02-05', 400.000, 848.00, '{"numero_bl": "BL-2024-005", "fournisseur": "Plantation Grand Bassam", "notes": "Nouveau fournisseur"}}')
ON CONFLICT (id) DO NOTHING;

-- Mouvements de stock correspondant aux opérations
-- Entrées pour les achats
INSERT INTO mouvements_stock (id, type, date_mouvement, produit, depot_cible_id, quantite_kg, cout_unitaire_par_kg, operation_id, note) VALUES 
    ('m1234567-89ab-cdef-0123-456789abcdef', 'entree', '2024-01-15', 'Hévéa Grade A', 'd1234567-89ab-cdef-0123-456789abcdef', 500.000, 940.00, 'o1234567-89ab-cdef-0123-456789abcdef', 'Achat Plantation Koumassi'),
    ('m2234567-89ab-cdef-0123-456789abcdef', 'entree', '2024-01-20', 'Hévéa Grade A', 'd1234567-89ab-cdef-0123-456789abcdef', 750.000, 960.00, 'o2234567-89ab-cdef-0123-456789abcdef', 'Achat Plantation Dabou'),
    ('m3234567-89ab-cdef-0123-456789abcdef', 'entree', '2024-01-25', 'Hévéa Grade B', 'd2234567-89ab-cdef-0123-456789abcdef', 300.000, 815.00, 'o3234567-89ab-cdef-0123-456789abcdef', 'Achat Coopérative Agboville'),
    ('m4234567-89ab-cdef-0123-456789abcdef', 'entree', '2024-02-01', 'Hévéa Grade A', 'd1234567-89ab-cdef-0123-456789abcdef', 600.000, 952.00, 'o4234567-89ab-cdef-0123-456789abcdef', 'Achat Plantation Adzope'),
    ('m5234567-89ab-cdef-0123-456789abcdef', 'entree', '2024-02-05', 'Hévéa Grade B', 'd2234567-89ab-cdef-0123-456789abcdef', 400.000, 848.00, 'o5234567-89ab-cdef-0123-456789abcdef', 'Achat Plantation Grand Bassam')
ON CONFLICT (id) DO NOTHING;

-- Sorties pour les ventes
INSERT INTO mouvements_stock (id, type, date_mouvement, produit, depot_source_id, lot_source_id, quantite_kg, cout_unitaire_par_kg, operation_id, note) VALUES 
    ('m6234567-89ab-cdef-0123-456789abcdef', 'sortie', '2024-02-10', 'Hévéa Grade A', 'd1234567-89ab-cdef-0123-456789abcdef', 'l1234567-89ab-cdef-0123-456789abcdef', 200.000, 940.00, 'o6234567-89ab-cdef-0123-456789abcdef', 'Vente Export Abidjan Port'),
    ('m7234567-89ab-cdef-0123-456789abcdef', 'sortie', '2024-02-15', 'Hévéa Grade A', 'd1234567-89ab-cdef-0123-456789abcdef', 'l2234567-89ab-cdef-0123-456789abcdef', 300.000, 960.00, 'o7234567-89ab-cdef-0123-456789abcdef', 'Vente Usine Transformation'),
    ('m8234567-89ab-cdef-0123-456789abcdef', 'sortie', '2024-02-20', 'Hévéa Grade B', 'd2234567-89ab-cdef-0123-456789abcdef', 'l3234567-89ab-cdef-0123-456789abcdef', 150.000, 815.00, 'o8234567-89ab-cdef-0123-456789abcdef', 'Vente Marché Local')
ON CONFLICT (id) DO NOTHING;

-- Mettre à jour les champs calculés des opérations d'achat
UPDATE operations SET
    cout_total_par_kg = COALESCE(prix_achat_par_kg, 0) + chargement_par_kg + transport_par_kg + autres_depenses_par_kg
WHERE type = 'achat';

-- Mettre à jour les champs calculés des opérations de vente (simplifié pour les données de test)
UPDATE operations SET
    chiffre_affaires = quantite_kg * prix_vente_par_kg,
    marge_nette_par_kg = prix_vente_par_kg - (chargement_par_kg + transport_par_kg + autres_depenses_par_kg) - 940.00, -- COGS estimé
    cogs_par_kg = 940.00 -- COGS estimé pour les données de test
WHERE type = 'vente' AND id = 'o6234567-89ab-cdef-0123-456789abcdef';

UPDATE operations SET
    chiffre_affaires = quantite_kg * prix_vente_par_kg,
    marge_nette_par_kg = prix_vente_par_kg - (chargement_par_kg + transport_par_kg + autres_depenses_par_kg) - 960.00,
    cogs_par_kg = 960.00
WHERE type = 'vente' AND id = 'o7234567-89ab-cdef-0123-456789abcdef';

UPDATE operations SET
    chiffre_affaires = quantite_kg * prix_vente_par_kg,
    marge_nette_par_kg = prix_vente_par_kg - (chargement_par_kg + transport_par_kg + autres_depenses_par_kg) - 815.00,
    cogs_par_kg = 815.00
WHERE type = 'vente' AND id = 'o8234567-89ab-cdef-0123-456789abcdef';

-- Calculer la marge totale pour les ventes
UPDATE operations SET
    marge_totale = quantite_kg * marge_nette_par_kg
WHERE type = 'vente' AND marge_nette_par_kg IS NOT NULL;