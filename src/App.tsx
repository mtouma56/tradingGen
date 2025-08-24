import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Operations } from './components/Operations';
import { Inventaire } from './components/Inventaire';
import { repository } from './lib/repositories';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [initialized, setInitialized] = useState(false);

  // Initialiser l'application
  useEffect(() => {
    const initApp = async () => {
      try {
        await repository.init();
        
        // Charger les données de seed si c'est la première fois
        const operations = await repository.getOperations();
        if (operations.length === 0) {
          console.log('🌱 Chargement des données de démonstration...');
          await repository.seedData();
        }
        
        setInitialized(true);
      } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        setInitialized(true); // Continue même en cas d'erreur
      }
    };

    initApp();
  }, []);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'operations':
        return <Operations />;
      case 'inventaire':
        return <Inventaire />;
      case 'mouvements':
        return <div className="text-center py-8">Page Mouvements - En construction</div>;
      case 'parametres':
        return <div className="text-center py-8">Page Paramètres - En construction</div>;
      default:
        return <Dashboard />;
    }
  };

  if (!initialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation de l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;