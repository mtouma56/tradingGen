# Trading Hévéa - Système de Gestion des Stocks et Opérations

## 🎯 Vue d'ensemble du Projet

**Trading Hévéa** est un système complet de gestion des stocks et opérations pour le trading d'hévéa, conçu spécialement pour les équipes de 5-6 personnes. L'application offre une gestion complète des achats, ventes, stock et calculs FIFO avec une interface moderne et responsive.

### 🚀 Fonctionnalités Actuellement Complètes

- ✅ **Dashboard interactif** avec KPI en temps réel et graphiques Recharts
- ✅ **Gestion complète des opérations** (achats/ventes) avec formulaires dynamiques
- ✅ **Inventaire avancé** avec traçabilité FIFO et gestion multi-dépôts
- ✅ **Historique des mouvements** avec filtrage et groupement par date
- ✅ **Système de paramètres** avec gestion des dépôts et configuration
- ✅ **Authentification sécurisée** avec protection des routes
- ✅ **Interface responsive** optimisée mobile/desktop
- ✅ **Mode développement** avec données de test automatiques

## 🌍 URLs de l'Application

- **Demo Live**: https://3000-ivf9iwdltf18bf3v7zsnt-6532622b.e2b.dev
- **Repository GitHub**: https://github.com/mtouma56/tradingGen
- **Mode démo**: Connexion automatique en mode développement (sans Supabase)

## 🏗️ Architecture des Données

### Modèles de Données Principaux

#### **Operations Table**
```sql
- id (UUID) - Identifiant unique
- type ('achat' | 'vente') - Type d'opération
- date_operation (Date) - Date de l'opération
- produit (Text) - Type de produit (ex: "Hévéa Grade A")
- quantite_kg (Decimal) - Quantité en kilogrammes
- prix_achat_par_kg / prix_vente_par_kg (Decimal) - Prix unitaires
- chargement_par_kg, transport_par_kg, autres_depenses_par_kg (Decimal) - Coûts
- depot_id (UUID) - Référence au dépôt
- point_achat / point_vente (Text) - Lieu d'achat/vente
- Champs calculés: cout_total_par_kg, marge_totale, chiffre_affaires
```

#### **Lots_Inventaire Table**
```sql
- id (UUID) - Identifiant unique du lot
- produit (Text) - Type de produit
- depot_id (UUID) - Dépôt de stockage
- date_entree (Date) - Date d'entrée en stock
- quantite_kg_restante (Decimal) - Quantité restante (FIFO)
- cout_unitaire_par_kg (Decimal) - Coût d'achat unitaire
- metadata (JSONB) - Informations complémentaires (BL, fournisseur, notes)
```

#### **Mouvements_Stock Table**
```sql
- id (UUID) - Identifiant unique
- type ('entree' | 'sortie' | 'transfert' | 'ajustement') - Type de mouvement
- date_mouvement (Date) - Date du mouvement
- produit (Text) - Produit concerné
- depot_source_id / depot_cible_id (UUID) - Dépôts source/destination
- quantite_kg (Decimal) - Quantité déplacée
- operation_id (UUID) - Lien vers l'opération source
- note (Text) - Note explicative
```

### Services de Stockage
- **Base de données**: Supabase PostgreSQL avec RLS (Row Level Security)
- **Mode développement**: LocalStorage pour tests sans configuration
- **Authentification**: Supabase Auth avec profils utilisateurs
- **Gestion d'état**: React Context API pour auth et data repository pattern

## 📖 Guide Utilisateur

### 🔐 Connexion
1. **Mode Production**: Utilisez vos identifiants Supabase
2. **Mode Développement**: Cliquez sur "Se connecter" (connexion automatique)

### 📊 Dashboard
- **KPI principaux**: Total opérations, stock actuel, chiffre d'affaires, valeur stock
- **Graphiques interactifs**: Évolution des ventes, marges par produit
- **Onglets**: Vue d'ensemble, Ventes, Stock, Opérations récentes
- **Filtres temporels**: 7 jours, 30 jours, 3 mois, 1 an

### 🛒 Gestion des Opérations
- **Création d'opérations**: Formulaire dynamique achat/vente
- **Champs automatiques**: Calcul des coûts totaux et marges
- **Filtrage avancé**: Par type, produit, point d'achat/vente
- **Actions**: Modification, suppression, export

### 📦 Inventaire
- **Vue résumé**: Stock par produit avec valeurs
- **Lots détaillés**: Traçabilité FIFO complète
- **Vue par dépôt**: Organisation par lieu de stockage
- **Métadonnées**: Numéros BL, fournisseurs, notes

### 📈 Mouvements
- **Historique complet**: Tous les mouvements de stock
- **Groupement par date**: Organisation chronologique
- **Types de mouvements**: Entrées, sorties, transferts, ajustements
- **Statistiques**: Totaux et stock net

### ⚙️ Paramètres
- **Configuration FIFO**: Mode de valorisation
- **Gestion des dépôts**: Création, modification, activation/désactivation
- **Informations système**: Mode de base de données, utilisateur actuel

## 🚀 Déploiement et Configuration

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase (pour la production)

### Installation Locale
```bash
# Cloner le repository
git clone https://github.com/mtouma56/tradingGen.git
cd tradingGen

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev

# Application disponible sur http://localhost:3000
```

### Configuration Supabase (Production)

1. **Créer un projet Supabase**
   ```bash
   # Aller sur https://supabase.com
   # Créer un nouveau projet
   # Récupérer URL et ANON_KEY
   ```

2. **Configuration des variables d'environnement**
   ```bash
   # Copier le fichier d'exemple
   cp .env.example .env

   # Éditer .env avec vos valeurs Supabase (ne pas committer ce fichier)
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-anon-key
   SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
   ```

   Regénérez les clés depuis le tableau de bord Supabase si l'une d'elles est compromise.
   En production, fournissez ces variables via un gestionnaire de secrets (Vercel, variables d'environnement Docker, etc.).

3. **Initialiser la base de données**
   ```sql
   -- Exécuter dans l'éditeur SQL de Supabase
   -- 1. Copier le contenu de supabase/migrations/001_initial_schema.sql
   -- 2. Exécuter le script
   -- 3. Optionnel: Exécuter supabase/seed.sql pour les données de test
   ```

4. **Déploiement sur Vercel**
   ```bash
   # Connecter le repository à Vercel
   # Ajouter les variables d'environnement dans Vercel
   # Déployer automatiquement depuis GitHub
   ```

### Configuration des Utilisateurs

1. **Créer des utilisateurs dans Supabase Auth**
2. **Définir les rôles** dans la table `profiles`
3. **Maximum 5-6 utilisateurs** recommandé pour l'équipe

## 📋 Statut de Déploiement

- **Statut**: ✅ **Application complètement fonctionnelle**
- **Plateforme**: Sandbox de développement (temporaire)
- **Base de données**: Mode LocalStorage (données temporaires)
- **Tech Stack**: React 19 + Vite + TypeScript + TailwindCSS + Supabase
- **Dernière mise à jour**: 25 août 2025

### URLs Fonctionnelles
- `/login` - Page de connexion
- `/dashboard` - Tableau de bord avec KPI
- `/operations` - Gestion des achats/ventes  
- `/inventaire` - État des stocks
- `/mouvements` - Historique des mouvements
- `/parametres` - Configuration système

## 🔮 Prochaines Étapes Recommandées

### Fonctionnalités à Implémenter
1. **Calculs FIFO avancés** - Intégration complète de la logique FIFO dans les ventes
2. **Export CSV/Excel** - Fonctionnalité d'export des données
3. **Notifications** - Alertes de stock faible, notifications système
4. **Rapports avancés** - Génération de rapports PDF
5. **API REST** - Endpoints pour intégrations externes
6. **Mode offline** - Synchronisation hors ligne
7. **Audit trail** - Historique complet des modifications

### Optimisations Techniques
1. **Performance** - Optimisation des requêtes et cache
2. **Sécurité** - Audit de sécurité approfondi
3. **Tests** - Suite de tests unitaires et d'intégration
4. **Documentation API** - Documentation Swagger/OpenAPI
5. **CI/CD** - Pipeline de déploiement automatisé

### Déploiement Production
1. **Configuration Supabase** - Base de données production
2. **Domaine personnalisé** - URL de production
3. **Monitoring** - Outils de surveillance (Sentry, etc.)
4. **Backup** - Stratégie de sauvegarde des données
5. **Scaling** - Préparation à la montée en charge

---

**© 2025 Trading Hévéa - Système de Gestion Optimisé pour les Équipes Trading**