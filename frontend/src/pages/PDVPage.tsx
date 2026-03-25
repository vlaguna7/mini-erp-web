import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PDVSidebar } from '../components/PDVSidebar';
import { PDVCart } from '../components/PDVCart';
import { PDVProducts } from './PDVProducts';
import { PDVClient } from './PDVClient';
import { PDVPayment } from './PDVPayment';
import { PDVFinalize } from './PDVFinalize';
import { PDVReturns } from './PDVReturns';
import { PDVSettings } from './PDVSettings';
import './PDVPage.css';

type PDVSection = 'produtos' | 'cliente' | 'pagamento' | 'finalizar' | 'devolucoes' | 'configuracoes';

export const PDVPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<PDVSection>('produtos');

  const getSectionFromPath = (): PDVSection => {
    const path = location.pathname.replace('/pdv/', '');
    if (['cliente', 'pagamento', 'finalizar', 'devolucoes', 'configuracoes'].includes(path)) {
      return path as PDVSection;
    }
    return 'produtos';
  };

  React.useEffect(() => {
    const section = getSectionFromPath();
    setActiveSection(section);
  }, [location.pathname]);

  const renderContent = () => {
    switch (activeSection) {
      case 'cliente':
        return <PDVClient />;
      case 'pagamento':
        return <PDVPayment />;
      case 'finalizar':
        return <PDVFinalize />;
      case 'devolucoes':
        return <PDVReturns />;
      case 'configuracoes':
        return <PDVSettings />;
      default:
        return <PDVProducts />;
    }
  };

  return (
    <div className="pdv">
      <PDVSidebar activeSection={activeSection} />
      <main className="pdv-content">{renderContent()}</main>
      <aside className="pdv-cart-sidebar">
        <PDVCart />
      </aside>
    </div>
  );
};
