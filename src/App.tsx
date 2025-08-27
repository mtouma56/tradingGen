import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeProvider } from './lib/theme'
import { I18nextProvider } from 'react-i18next'
import i18n from './lib/i18n'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'
import { Operations } from './pages/Operations'
import { Inventaire } from './pages/Inventaire'
import { Mouvements } from './pages/Mouvements'
import { Parametres } from './pages/Parametres'
import { repository } from './lib/repositories'
import './index.css'

function AppContent() {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialiser l'application
  useEffect(() => {
    const initApp = async () => {
      try {
        console.log('🚀 Initialisation de l\'application Trading Hévéa...')
        
        // Initialiser le repository
        await repository.init()
        
        // Charger les données de seed si c'est la première fois
        const operations = await repository.getOperations()
        if (operations.length === 0) {
          console.log('🌱 Chargement des données de démonstration...')
          await repository.seedData()
          console.log('✅ Données de démonstration chargées')
        }
        
        console.log('✅ Application initialisée avec succès')
        setInitialized(true)
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error)
        setError(error instanceof Error ? error.message : 'Erreur inconnue')
        setInitialized(true) // Continue même en cas d'erreur
      } finally {
        setLoading(false)
      }
    }

    // Délai minimum pour une meilleure UX
    const minLoadingTime = new Promise(resolve => setTimeout(resolve, 1500))
    
    Promise.all([initApp(), minLoadingTime]).then(() => {
      setLoading(false)
    })
  }, [])

  // Page de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          {/* Logo animé */}
          <motion.div
            className="w-20 h-20 mx-auto bg-primary rounded-2xl flex items-center justify-center"
            animate={{ 
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1] 
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            <span className="text-primary-foreground text-2xl font-bold">TH</span>
          </motion.div>

          {/* Titre */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Trading Hévéa</h1>
            <p className="text-muted-foreground">Système de gestion des stocks et opérations</p>
          </div>

          {/* Barre de progression */}
          <div className="w-64 h-2 bg-muted rounded-full overflow-hidden mx-auto">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>

          <p className="text-sm text-muted-foreground">
            Initialisation en cours...
          </p>
        </motion.div>
      </div>
    )
  }

  // Page d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 max-w-md mx-auto px-4"
        >
          <div className="w-20 h-20 mx-auto bg-destructive rounded-2xl flex items-center justify-center">
            <span className="text-destructive-foreground text-2xl">⚠️</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Erreur d'initialisation</h1>
            <p className="text-muted-foreground">
              Une erreur s'est produite lors du démarrage de l'application
            </p>
            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Relancer l'application
          </button>
        </motion.div>
      </div>
    )
  }

  // Application principale avec routing
  return (
    <Routes>
        {/* Route publique de connexion */}
        <Route path="/login" element={<Login />} />
        
        {/* Routes protégées */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout>
                <AnimatePresence mode="wait">
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route 
                      path="/dashboard" 
                      element={
                        <motion.div
                          key="dashboard"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Dashboard />
                        </motion.div>
                      } 
                    />
                    <Route 
                      path="/operations" 
                      element={
                        <motion.div
                          key="operations"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Operations />
                        </motion.div>
                      } 
                    />
                    <Route 
                      path="/inventaire" 
                      element={
                        <motion.div
                          key="inventaire"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Inventaire />
                        </motion.div>
                      } 
                    />
                    <Route 
                      path="/mouvements" 
                      element={
                        <motion.div
                          key="mouvements"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Mouvements />
                        </motion.div>
                      } 
                    />
                    <Route 
                      path="/parametres" 
                      element={
                        <motion.div
                          key="parametres"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Parametres />
                        </motion.div>
                      } 
                    />
                    {/* Route de fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </AnimatePresence>
              </AppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
  )
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <AppContent />
      </ThemeProvider>
    </I18nextProvider>
  )
}

export default App
