import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, X } from 'lucide-react';
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
import ProcessingOverlay from '../../components/ProcessingOverlay';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVPage.module.css';

type PDVSection = 'produtos' | 'cliente' | 'cliente/criar-cliente' | 'pagamento' | 'finalizar' | 'devolucoes' | 'configuracoes' | 'sucesso';

const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
};

const PDVPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<PDVSection>('produtos');
  const { setSelectedClient, cart } = usePDVStore();
  const [isLoading, setIsLoading] = useState(true);
  const hasLoaded = useRef(false);
  const isMobile = useIsMobile();
  const [showMobileCart, setShowMobileCart] = useState(false);

  useEffect(() => {
    if (hasLoaded.current) return;
    hasLoaded.current = true;
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

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

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className={styles.pdv}>
      <PDVSidebar activeSection={activeSection} />
      <main className={styles.pdvContent}>{renderContent()}</main>

      {/* Desktop cart sidebar */}
      {!isMobile && (
        <aside className={styles.pdvCartSidebar}>
          <PDVCart />
        </aside>
      )}

      {/* Mobile floating cart button */}
      {isMobile && (
        <button
          className={styles.mobileCartFab}
          onClick={() => setShowMobileCart(true)}
          aria-label="Abrir carrinho"
        >
          <ShoppingCart size={22} />
          {cartCount > 0 && (
            <span className={styles.mobileCartBadge}>{cartCount}</span>
          )}
        </button>
      )}

      {/* Mobile cart overlay */}
      {isMobile && showMobileCart && (
        <div className={styles.mobileCartOverlay}>
          <div className={styles.mobileCartHeader}>
            <h3 className={styles.mobileCartTitle}>Carrinho</h3>
            <button
              className={styles.mobileCartClose}
              onClick={() => setShowMobileCart(false)}
              aria-label="Fechar carrinho"
            >
              <X size={22} />
            </button>
          </div>
          <div className={styles.mobileCartBody}>
            <PDVCart />
          </div>
        </div>
      )}

      {isLoading && (
        <ProcessingOverlay
          message="Carregando PDV..."
          subtitle="Preparando o ponto de venda"
        />
      )}
    </div>
  );
};

export default PDVPage;
