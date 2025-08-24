import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

export function SimpleParametres() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-muted-foreground">Configuration de l'application</p>
        </div>
      </div>
      
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Paramètres - Version simplifiée</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            La page des paramètres est en cours de finalisation...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}