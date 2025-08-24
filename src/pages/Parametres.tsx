import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Cog, Shield, Database, Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Switch } from '../components/ui/Switch'
import { Separator } from '../components/ui/Separator'

export function Parametres() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between"
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Paramètres</h1>
            <Badge variant="outline" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              Système
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">Configuration système et préférences</p>
        </div>
        
        <Button className="gap-2">
          <Database className="h-4 w-4" />
          Sauvegarder
        </Button>
      </motion.div>

      {/* Message de refactor */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Cog className="h-5 w-5" />
              Interface modernisée avec shadcn/ui
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-blue-600 dark:text-blue-300">
                Cette page utilise maintenant les composants shadcn/ui modernes et sera bientôt 
                équipée de formulaires react-hook-form + Zod :
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-600 dark:text-blue-300">
                <li>Validation en temps réel</li>
                <li>Interface cohérente</li>
                <li>Feedback visuel riche</li>
                <li>Gestion d'erreurs avancée</li>
                <li>Sauvegarde automatique</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Système FIFO */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Système FIFO
              </CardTitle>
              <CardDescription>
                Configuration de la valorisation des stocks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Mode FIFO Actif</p>
                  <p className="text-sm text-muted-foreground">First In, First Out</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Calcul automatique COGS</p>
                  <p className="text-sm text-muted-foreground">Cost of Goods Sold</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="font-medium">Devise système</p>
                <Badge variant="secondary">FCFA (CFA Franc)</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-amber-500" />
                Notifications
              </CardTitle>
              <CardDescription>
                Alertes et rappels système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Alertes stock faible</p>
                  <p className="text-sm text-muted-foreground">Seuil : 10,000 kg</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marges négatives</p>
                  <p className="text-sm text-muted-foreground">Détection automatique</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Emails quotidiens</p>
                  <p className="text-sm text-muted-foreground">Résumé d'activité</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sécurité */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Sécurité et Sauvegarde
              </CardTitle>
              <CardDescription>
                Protection des données et sauvegardes automatiques
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Database className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">Sauvegarde auto</p>
                  <p className="text-sm text-muted-foreground">Toutes les 6h</p>
                  <Switch className="mt-2" defaultChecked />
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                  <p className="font-medium">Chiffrement</p>
                  <p className="text-sm text-muted-foreground">AES-256</p>
                  <Badge variant="default" className="mt-2">Activé</Badge>
                </div>
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <Settings className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                  <p className="font-medium">Logs audit</p>
                  <p className="text-sm text-muted-foreground">30 jours</p>
                  <Switch className="mt-2" defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}