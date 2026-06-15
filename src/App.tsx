import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import styles from './App.module.css';

// Lazy loading pages for better performance
const NewRequestTab = React.lazy(() => import('./pages/NewRequestTab'));
const N3DevelopmentTab = React.lazy(() => import('./pages/N3DevelopmentTab'));
const DevelopmentFlowTab = React.lazy(() => import('./pages/DevelopmentFlowTab'));
const DevelopmentConclusionTab = React.lazy(() => import('./pages/DevelopmentConclusionTab'));
const CompletedRequestsTab = React.lazy(() => import('./pages/CompletedRequestsTab'));
const ReportsTab = React.lazy(() => import('./pages/ReportsTab'));
const DashboardTab = React.lazy(() => import('./pages/DashboardTab'));

const App: React.FC = () => {
  return (
    <div className={styles.appContainer}>
      <Navigation />
      <main className={styles.mainContent}>
        <React.Suspense fallback={<div className={styles.loader}>Loading...</div>}>
          <Routes>
            <Route path="/" element={<NewRequestTab />} />
            <Route path="/n3" element={<N3DevelopmentTab />} />
            <Route path="/fluxo" element={<DevelopmentFlowTab />} />
            <Route path="/conclusao" element={<DevelopmentConclusionTab />} />
            <Route path="/concluidas" element={<CompletedRequestsTab />} />
            <Route path="/relatorios" element={<ReportsTab />} />
            <Route path="/dashboard" element={<DashboardTab />} />
          </Routes>
        </React.Suspense>
      </main>
    </div>
  );
};

export default App;
