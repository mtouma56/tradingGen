import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'

export function SimpleOperations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Opérations</h1>
          <p className="text-muted-foreground">Gestion des achats et ventes</p>
        </div>
      </div>
      
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Opérations - Version simplifiée</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">
            La page des opérations est en cours de finalisation...
          </p>
        </CardContent>
      </Card>
    </div>
  )
}