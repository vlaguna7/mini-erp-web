import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PDVSidebar from '../../components/PDVSidebar';
import PDVCart from '../../components/PDVCart';
import PDVProducts from '../PDVProducts';
import PDVClient from '../PDVClient';
import PDVPayment from '../PDVPayment';
import PDVFinalize from '../PDVFinalize';
import PDVReturns from '../PDVReturns';
import PDVSettings from '../PDVSettings';
import PDVSuccess from '../PDVSuccess';
import CadastrarClientePage from '../CadastrarClientePage';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVPage.module.css';

type PDVSection = 'produtos' | 'cliente' | 'cliente/criar-cliente' | 'pagamento' | 'finalizar' | 'devolucoes' | 'configuracoes' | 'sucesso';

const PDVPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<PDVSection>('produtos');
  const { setSelectedClient } = usePDVStore();

  const getSectionFromPath = (): PDVSection => {
    const path = location.pathname.replace('/pdv/', '');
    if (path === 'cliente/criar-cliente') return 'cliente/criar-cliente';
    if (['cliente', 'pagamento', 'finalizar', 'devolucoes', 'configuracoes', 'sucesso'].includes(path)) {
      return path as PDVSection;
    }
    return 'produtos';
  };

  React.useEffect(() => {
    const section = getSectionFromPath();
    setActiveSection(section);
  }, [location.pathname]);

  const handleClientCreated = (client: any) => {
    setSelectedClient({
      id: String(client.id),
      name: client.name,
      email: client.email || undefined,
      cpf: client.cpfCnpj || undefined,
      phone: client.phone || undefined,
    });
    navigate('/pdv/cliente');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'cliente/criar-cliente':
        return <CadastrarClientePage onSave={handleClientCreated} cancelPath="/pdv/cliente" />;
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
      case 'sucesso':
        return <PDVSuccess />;
      default:
        return <PDVProducts />;
    }
  };

  return (
    <div className={styles.pdv}>
      <PDVSidebar activeSection={activeSection} />
      <main className={styles.pdvContent}>{renderContent()}</main>
      <aside className={styles.pdvCartSidebar}>
        <PDVCart />
      </aside>
    </div>
  );
};

export default PDVPage;
