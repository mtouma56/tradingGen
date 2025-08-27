-- Migration initiale pour l'application Trading Hévéa
-- Basée sur les types TypeScript définis dans src/types/index.ts

-- Extension nécessaire pour les UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des dépôts
CREATE TABLE IF NOT EXISTS depots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nom TEXT NOT NULL,
    localisation TEXT,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des opérations (achats/ventes)
CREATE TABLE IF NOT EXISTS operations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('achat', 'vente')),
    op_date DATE NOT NULL,
    produit TEXT NOT NULL,
    point_achat TEXT,
    point_vente TEXT,
    depot_id UUID REFERENCES depots(id),
    quantite_kg DECIMAL(10,3) NOT NULL,
    
    -- Prix et coûts unitaires (par kg)
    prix_achat_par_kg DECIMAL(10,2),
    chargement_par_kg DECIMAL(10,2) DEFAULT 0,
    transport_par_kg DECIMAL(10,2) DEFAULT 0,
    autres_depenses_par_kg DECIMAL(10,2) DEFAULT 0,
    prix_vente_par_kg DECIMAL(10,2),
    
    -- Champs calculés
    cout_total_par_kg DECIMAL(10,2),
    marge_nette_par_kg DECIMAL(10,2),
    marge_totale DECIMAL(12,2),
    chiffre_affaires DECIMAL(12,2),
    cogs_par_kg DECIMAL(10,2),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des lots d'inventaire (pour calculs FIFO)
CREATE TABLE IF NOT EXISTS lots_inventaire (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    produit TEXT NOT NULL,
    depot_id UUID NOT NULL REFERENCES depots(id),
    date_entree DATE NOT NULL,
    quantite_kg_restante DECIMAL(10,3) NOT NULL,
    cout_unitaire_par_kg DECIMAL(10,2) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS mouvements_stock (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('entree', 'sortie', 'transfert', 'ajustement')),
    date_mouvement DATE NOT NULL,
    produit TEXT NOT NULL,
    depot_source_id UUID REFERENCES depots(id),
    depot_cible_id UUID REFERENCES depots(id),
    lot_source_id UUID REFERENCES lots_inventaire(id),
    quantite_kg DECIMAL(10,3) NOT NULL,
    cout_unitaire_par_kg DECIMAL(10,2),
    operation_id UUID REFERENCES operations(id),
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des paramètres système
CREATE TABLE IF NOT EXISTS parametres (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mode_valorisation TEXT NOT NULL DEFAULT 'FIFO' CHECK (mode_valorisation IN ('FIFO', 'MOYEN_PONDERE')),
    devise_affichage TEXT DEFAULT 'FCFA',
    cout_stockage_par_kg_par_jour DECIMAL(8,4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des utilisateurs (pour l'authentification)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_operations_date ON operations(op_date);
CREATE INDEX IF NOT EXISTS idx_operations_produit ON operations(produit);
CREATE INDEX IF NOT EXISTS idx_operations_depot ON operations(depot_id);
CREATE INDEX IF NOT EXISTS idx_operations_type ON operations(type);

CREATE INDEX IF NOT EXISTS idx_lots_produit_depot ON lots_inventaire(produit, depot_id);
CREATE INDEX IF NOT EXISTS idx_lots_date_entree ON lots_inventaire(date_entree);

CREATE INDEX IF NOT EXISTS idx_mouvements_date ON mouvements_stock(date_mouvement);
CREATE INDEX IF NOT EXISTS idx_mouvements_produit ON mouvements_stock(produit);
CREATE INDEX IF NOT EXISTS idx_mouvements_operation ON mouvements_stock(operation_id);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_depots_updated_at BEFORE UPDATE ON depots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operations_updated_at BEFORE UPDATE ON operations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lots_inventaire_updated_at BEFORE UPDATE ON lots_inventaire
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mouvements_stock_updated_at BEFORE UPDATE ON mouvements_stock
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_parametres_updated_at BEFORE UPDATE ON parametres
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour gérer la création automatique du profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil lors de l'inscription
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE depots ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots_inventaire ENABLE ROW LEVEL SECURITY;
ALTER TABLE mouvements_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour les profils (utilisateurs peuvent voir leur propre profil)
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politiques pour les autres tables (tous les utilisateurs authentifiés peuvent accéder)
CREATE POLICY "Authenticated users can view depots" ON depots
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage depots" ON depots
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view operations" ON operations
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage operations" ON operations
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view lots" ON lots_inventaire
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage lots" ON lots_inventaire
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view mouvements" ON mouvements_stock
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage mouvements" ON mouvements_stock
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view parametres" ON parametres
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage parametres" ON parametres
    FOR ALL USING (auth.role() = 'authenticated');