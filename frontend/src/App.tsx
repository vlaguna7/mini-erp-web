import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { SidebarProvider } from './context/SidebarContext';
import { useSidebar } from './context/SidebarContext';
import { Sidebar } from './components/Sidebar';
import { MobileHeader } from './components/MobileHeader';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { EstoquePage } from './pages/EstoquePage';
import { PDVPage } from './pages/PDVPage';
import { SalesAndClientsPage } from './pages/SalesAndClientsPage';
import { BlankPage } from './pages/BlankPage';
import { PDVLayout } from './layouts/PDVLayout';
import './App.css';

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);

  return isMobile;
};

const ProtectedLayout: React.FC<{ children: React.ReactNode; isInitializing: boolean }> = ({
  children,
  isInitializing,
}) => {
  const user = useAuthStore((state) => state.user);
  const { isOpen, setIsOpen } = useSidebar();
  const isMobile = useIsMobile();

  if (isInitializing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: '#666' }}>
        Carregando...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <MobileHeader />

      <div style={{ display: 'flex' }}>
        <Sidebar />

        <div
          className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />

        <main className={`main-content ${isOpen && !isMobile ? 'sidebar-open' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    setIsInitializing(false);
  }, []);

  return (
    <Router>
      <SidebarProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/pdv/*" element={<PDVLayout isInitializing={isInitializing}><PDVPage /></PDVLayout>} />
          <Route path="/dashboard" element={<ProtectedLayout isInitializing={isInitializing}><DashboardPage /></ProtectedLayout>} />
          <Route path="/estoque"   element={<ProtectedLayout isInitializing={isInitializing}><EstoquePage /></ProtectedLayout>} />
          <Route path="/vendas-e-clientes"    element={<ProtectedLayout isInitializing={isInitializing}><SalesAndClientsPage /></ProtectedLayout>} />
          <Route path="/vendas-e-clientes/cadastrar-cliente" element={<ProtectedLayout isInitializing={isInitializing}><BlankPage title="Cadastrar Cliente" /></ProtectedLayout>} />
          <Route path="/vendas-e-clientes/lista-clientes" element={<ProtectedLayout isInitializing={isInitializing}><BlankPage title="Lista de Clientes" /></ProtectedLayout>} />
          <Route path="/vendas-e-clientes/lancar-venda" element={<ProtectedLayout isInitializing={isInitializing}><BlankPage title="Lançar Venda" /></ProtectedLayout>} />
          <Route path="/vendas-e-clientes/lancar-devolucao" element={<ProtectedLayout isInitializing={isInitializing}><BlankPage title="Lançar Devolução de Venda" /></ProtectedLayout>} />
          <Route path="/financeiro" element={<ProtectedLayout isInitializing={isInitializing}><BlankPage title="Financeiro" /></ProtectedLayout>} />
          <Route path="/relatorios" element={<ProtectedLayout isInitializing={isInitializing}><BlankPage title="Relatórios" /></ProtectedLayout>} />
          <Route path="/configuracoes" element={<ProtectedLayout isInitializing={isInitializing}><BlankPage title="Configurações" /></ProtectedLayout>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </SidebarProvider>
    </Router>
  );
}

export default App;