# Trading Hévéa - Application de Gestion d'Inventaire FIFO

## 🎯 Vue d'ensemble du projet

**Trading Hévéa** est une application web moderne de gestion des opérations de trading d'hévéa et autres produits agricoles avec **gestion complète d'inventaire** utilisant les méthodes de valorisation **FIFO** (First In, First Out) et **Coût Moyen Pondéré**.

### 🎉 Fonctionnalités principales

- ✅ **Gestion des opérations** (achats/ventes) avec calcul automatique des marges
- ✅ **Inventaire FIFO** avec gestion des lots et valorisation automatique
- ✅ **Calcul COGS** (Cost of Goods Sold) en temps réel selon la méthode choisie
- ✅ **Dashboard avec KPIs** en temps réel
- ✅ **Export CSV** de toutes les données
- ✅ **Interface responsive** mobile-first avec dark mode
- ✅ **Mode hors-ligne** (LocalStorage) ou **mode connecté** (Supabase)

## 🌐 URLs de l'application

- **🚀 Application Live**: https://3000-icmsarcraz9y3bljxdtx8-6532622b.e2b.dev/
- **📁 Code source**: `/home/user/webapp/`

## 🏗️ Architecture des données

### Modèles de données principaux

#### 📦 **Operations** (Achats & Ventes)
- Type d'opération (achat/vente)
- Produit, quantités, prix unitaires
- Calculs automatiques : coût total/kg, COGS, marges
- Liaison automatique avec les stocks

#### 🏭 **Dépôts** 
- Gestion multi-dépôts
- Localisation et statut actif/inactif

#### 📊 **Lots d'inventaire**
- Traçabilité complète des lots
- Quantités restantes, coûts unitaires
- Métadonnées (BL, fournisseur, notes)

#### 🔄 **Mouvements de stock**
- Entrées, sorties, transferts, ajustements
- Historique complet des mouvements

### Méthodes de valorisation

#### 🔵 **FIFO (First In, First Out)**
- Consommation des lots par ordre d'ancienneté
- Calcul COGS basé sur les lots les plus anciens
- Optimal pour les produits périssables

#### 🟠 **Coût Moyen Pondéré**
- Calcul basé sur le coût moyen du stock disponible
- Lissage des variations de prix
- Adapté aux produits homogènes

## 📱 Guide utilisateur

### 🏠 **Tableau de bord**
- **KPIs en temps réel** : opérations, chiffre d'affaires, marges, stock
- **Alertes automatiques** sur les marges négatives
- **Graphiques** de répartition par produits
- **Filtres** par période et produit

### 🛒 **Opérations**
1. **Créer un achat** :
   - Produit, quantité, prix d'achat/kg
   - Coûts additionnels (chargement, transport)
   - ➡️ **Génère automatiquement** : lot de stock + mouvement d'entrée

2. **Créer une vente** :
   - Produit, quantité, prix de vente/kg
   - ➡️ **Calcule automatiquement** : COGS, marge, décrémente le stock
   - ⚠️ **Alerte** si marge négative

### 📦 **Inventaire**
- **Vue stock** par produit et dépôt
- **Détail des lots** avec ancienneté et valorisation
- **Indicateurs visuels** FIFO (lots prioritaires)
- **Export détaillé** des lots

### 📊 **Logique métier**

#### Achat → Entrée de stock
```
Achat de 1000kg d'hévéa à 520 FCFA/kg
+ Chargement: 30 FCFA/kg
+ Transport: 45 FCFA/kg  
+ Autres: 15 FCFA/kg
= Coût total: 610 FCFA/kg
➡️ Crée un lot de 1000kg à 610 FCFA/kg
```

#### Vente → Sortie FIFO
```
Vente de 500kg d'hévéa à 650 FCFA/kg
➡️ Consomme le lot le plus ancien (610 FCFA/kg)
➡️ COGS: 610 FCFA/kg
➡️ Marge: 650 - 610 = 40 FCFA/kg
➡️ Marge totale: 40 × 500 = 20,000 FCFA
```

## 🚀 Déploiement & Configuration

### 📋 Prérequis
- Node.js 18+
- npm ou yarn

### ⚡ Installation rapide
```bash
git clone <repository-url>
cd webapp
npm install
npm run dev
```

### 🔧 Variables d'environnement

**Mode LocalStorage (par défaut)** :
Aucune configuration requise - l'application fonctionne hors-ligne.

**Mode Supabase (optionnel)** :
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Configurer Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 📜 Scripts disponibles
```bash
npm run dev      # Démarrage développement
npm run build    # Build production
npm run preview  # Preview du build
```

## 🎯 Statut du développement

### ✅ **Fonctionnalités implémentées**
- [x] Architecture complète avec TypeScript
- [x] Repository pattern (Supabase/LocalStorage)
- [x] Hooks de valorisation FIFO et coût moyen
- [x] Dashboard interactif avec KPIs
- [x] Gestion complète des opérations
- [x] Inventaire avec détail des lots
- [x] Export CSV multi-format
- [x] Interface responsive + dark mode
- [x] Données de démonstration automatiques
- [x] Calculs en temps réel des marges et COGS

### 🚧 **Prochaines étapes recommandées**
- [ ] **Page Mouvements** : Historique détaillé des mouvements de stock
- [ ] **Page Paramètres** : Configuration mode valorisation, coûts stockage
- [ ] **Transferts entre dépôts** : Interface dédiée aux transferts
- [ ] **Ajustements d'inventaire** : Interface pour les corrections de stock
- [ ] **Graphiques avancés** : Charts.js pour visualisations
- [ ] **Notifications temps réel** : Alertes stock faible, marges négatives
- [ ] **Authentification** : Gestion multi-utilisateurs avec Supabase Auth
- [ ] **API REST** : Endpoints pour intégrations externes
- [ ] **Tests unitaires** : Couverture des hooks de valorisation
- [ ] **PWA** : Support mode hors-ligne avancé

## 🛠️ Stack technique

### **Frontend**
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** + **shadcn/ui** + **Lucide React**
- **Framer Motion** pour les animations
- **Date-fns** pour la gestion des dates

### **Backend/Données**
- **Supabase** (PostgreSQL + Auth) *ou*
- **LocalStorage** (mode hors-ligne)
- **Repository Pattern** pour l'abstraction des données

### **Architecture**
- **Hooks personnalisés** pour la logique métier
- **TypeScript strict** avec interfaces complètes
- **Composants réutilisables** avec shadcn/ui
- **Mobile-first** responsive design

## 📊 Données de démonstration

L'application charge automatiquement des données réalistes :
- **4 dépôts** (Abidjan, Bouaké, Soubré, Yamoussoukro)
- **5 achats** avec différents produits (Hévéa, Maïs, Cacao, Anacarde, Café)
- **2 ventes** avec calculs COGS automatiques
- **1 transfert** entre dépôts
- **1 ajustement** d'inventaire (perte)

## 🎉 Points forts de l'implémentation

### 🔥 **Valorisation FIFO avancée**
- Consommation multi-lots automatique
- Calcul COGS précis avec historique
- Mise à jour temps réel des quantités

### 💰 **Calculs financiers complets**
- Coût total par kg (achat + frais)
- COGS basé sur stock réel
- Marges nettes avec alertes

### 📱 **UX moderne**
- Interface intuitive mobile-first
- Aperçus en temps réel dans les formulaires
- Animations fluides avec Framer Motion
- Dark mode automatique

### 🔄 **Flexibilité technique**
- Bascule automatique Supabase/LocalStorage
- Architecture modulaire et extensible
- TypeScript strict pour la robustesse

---

**🌟 L'application est prête à l'emploi et peut gérer des opérations de trading réelles avec une traçabilité complète des stocks et des marges !**

**Version**: 1.0.0  
**Dernière mise à jour**: Août 2024  
**Mode de déploiement**: ✅ LocalStorage (Hors-ligne) / ✅ Supabase (Connecté)