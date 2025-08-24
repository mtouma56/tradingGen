import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  fr: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Tableau de bord',
        operations: 'Opérations',
        inventory: 'Inventaire',
        movements: 'Mouvements',
        settings: 'Paramètres',
      },
      // Common
      common: {
        loading: 'Chargement...',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        create: 'Créer',
        search: 'Rechercher',
        filter: 'Filtrer',
        export: 'Exporter',
        actions: 'Actions',
        date: 'Date',
        product: 'Produit',
        quantity: 'Quantité',
        price: 'Prix',
        total: 'Total',
        status: 'Statut',
        warehouse: 'Dépôt',
        noData: 'Aucune donnée disponible',
        errorOccurred: 'Une erreur est survenue',
      },
      // Dashboard
      dashboard: {
        title: 'Tableau de bord',
        subtitle: 'Vue d\'ensemble de vos opérations de trading',
        kpis: {
          currentStock: 'Stock actuel',
          stockValue: 'Valeur stock',
          avgMargin: 'Marge moyenne/kg',
          operations30d: 'Opérations (30j)',
          stockEvolution: 'Évolution du stock',
          marginByProduct: 'Marge par produit',
        },
        filters: {
          period: 'Période',
          last7days: '7 derniers jours',
          last30days: '30 derniers jours',
          last90days: '90 derniers jours',
          customRange: 'Période personnalisée',
        },
      },
      // Operations
      operations: {
        title: 'Opérations',
        subtitle: 'Gestion des achats et ventes',
        newOperation: 'Nouvelle opération',
        type: 'Type',
        purchase: 'Achat',
        sale: 'Vente',
        unitPrice: 'Prix unitaire',
        cogs: 'COGS',
        margin: 'Marge',
        totalMargin: 'Marge totale',
        revenue: 'Chiffre d\'affaires',
        form: {
          title: 'Nouvelle opération',
          productPlaceholder: 'Sélectionnez un produit',
          warehousePlaceholder: 'Sélectionnez un dépôt',
          quantityLabel: 'Quantité (kg)',
          priceLabel: 'Prix unitaire (FCFA/kg)',
          loadingCostLabel: 'Coût chargement/kg',
          transportCostLabel: 'Coût transport/kg',
          otherCostLabel: 'Autres dépenses/kg',
        },
      },
      // Inventory
      inventory: {
        title: 'Inventaire',
        subtitle: 'Gestion des stocks par dépôt',
        totalStock: 'Stock total',
        totalValue: 'Valeur totale',
        valuationMethod: 'Méthode valorisation',
        lotsCount: 'Nombre de lots',
        viewLots: 'Voir les lots',
        remainingQty: 'Quantité restante',
        unitCost: 'Coût unitaire',
        lotValue: 'Valeur du lot',
        entryDate: 'Date d\'entrée',
        supplier: 'Fournisseur',
        fifo: 'FIFO',
        avgCost: 'Coût moyen',
      },
      // Units & Formatting
      units: {
        kg: 'kg',
        fcfa: 'FCFA',
        perKg: '/kg',
        days: 'jours',
      },
    },
  },
  en: {
    translation: {
      // Navigation
      nav: {
        dashboard: 'Dashboard',
        operations: 'Operations',
        inventory: 'Inventory',
        movements: 'Movements',
        settings: 'Settings',
      },
      // Common
      common: {
        loading: 'Loading...',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        create: 'Create',
        search: 'Search',
        filter: 'Filter',
        export: 'Export',
        actions: 'Actions',
        date: 'Date',
        product: 'Product',
        quantity: 'Quantity',
        price: 'Price',
        total: 'Total',
        status: 'Status',
        warehouse: 'Warehouse',
        noData: 'No data available',
        errorOccurred: 'An error occurred',
      },
      // Dashboard
      dashboard: {
        title: 'Dashboard',
        subtitle: 'Overview of your trading operations',
        kpis: {
          currentStock: 'Current Stock',
          stockValue: 'Stock Value',
          avgMargin: 'Avg Margin/kg',
          operations30d: 'Operations (30d)',
          stockEvolution: 'Stock Evolution',
          marginByProduct: 'Margin by Product',
        },
        filters: {
          period: 'Period',
          last7days: 'Last 7 days',
          last30days: 'Last 30 days',
          last90days: 'Last 90 days',
          customRange: 'Custom range',
        },
      },
      // Operations
      operations: {
        title: 'Operations',
        subtitle: 'Purchase and sales management',
        newOperation: 'New operation',
        type: 'Type',
        purchase: 'Purchase',
        sale: 'Sale',
        unitPrice: 'Unit Price',
        cogs: 'COGS',
        margin: 'Margin',
        totalMargin: 'Total Margin',
        revenue: 'Revenue',
        form: {
          title: 'New operation',
          productPlaceholder: 'Select a product',
          warehousePlaceholder: 'Select a warehouse',
          quantityLabel: 'Quantity (kg)',
          priceLabel: 'Unit price (FCFA/kg)',
          loadingCostLabel: 'Loading cost/kg',
          transportCostLabel: 'Transport cost/kg',
          otherCostLabel: 'Other expenses/kg',
        },
      },
      // Inventory
      inventory: {
        title: 'Inventory',
        subtitle: 'Stock management by warehouse',
        totalStock: 'Total Stock',
        totalValue: 'Total Value',
        valuationMethod: 'Valuation Method',
        lotsCount: 'Number of lots',
        viewLots: 'View lots',
        remainingQty: 'Remaining Qty',
        unitCost: 'Unit Cost',
        lotValue: 'Lot Value',
        entryDate: 'Entry Date',
        supplier: 'Supplier',
        fifo: 'FIFO',
        avgCost: 'Avg Cost',
      },
      // Units & Formatting
      units: {
        kg: 'kg',
        fcfa: 'FCFA',
        perKg: '/kg',
        days: 'days',
      },
    },
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Français par défaut
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'trading-hevea-language',
    },
  })

export default i18n