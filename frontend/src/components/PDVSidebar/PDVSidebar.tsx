import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, CreditCard, CheckCircle, RotateCcw, Settings, LogOut, AlertCircle, Check } from 'lucide-react';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVSidebar.module.css';

type PDVSection = 'produtos' | 'cliente' | 'cliente/criar-cliente' | 'pagamento' | 'finalizar' | 'devolucoes' | 'configuracoes' | 'sucesso';

interface PDVSidebarProps {
  activeSection: PDVSection;
}

const FLOW_SECTIONS = [
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'cliente', label: 'Cliente', icon: Users },
  { id: 'pagamento', label: 'Pagamento', icon: CreditCard },
  { id: 'finalizar', label: 'Finalizar', icon: CheckCircle },
];

const OTHER_SECTIONS = [
  { id: 'devolucoes', label: 'Devoluções', icon: RotateCcw },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

type StepStatus = 'pending' | 'complete';

const PDVSidebar: React.FC<PDVSidebarProps> = ({ activeSection }) => {
  const navigate = useNavigate();
  const { cart, selectedClient, payments, resetPDV, getTotalToPay, getTotalPaid } = usePDVStore();

  const totalToPay = getTotalToPay();
  const totalPaid = getTotalPaid();

  const getStepStatus = (id: string): StepStatus | null => {
    switch (id) {
      case 'produtos':
        return cart.length > 0 ? 'complete' : 'pending';
      case 'cliente':
        return selectedClient ? 'complete' : 'pending';
      case 'pagamento':
        return payments.length > 0 && Math.abs(totalPaid - totalToPay) <= 0.01
          ? 'complete'
          : 'pending';
      case 'finalizar': {
        const allDone =
          cart.length > 0 &&
          selectedClient !== null &&
          payments.length > 0 &&
          Math.abs(totalPaid - totalToPay) <= 0.01;
        return allDone ? 'complete' : 'pending';
      }
      default:
        return null;
    }
  };

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'sair') {
      resetPDV();
      navigate('/dashboard');
      return;
    }
    navigate(`/pdv/${sectionId}`);
  };

  const renderStatusIcon = (status: StepStatus | null) => {
    if (status === null) return null;
    if (status === 'complete') {
      return (
        <span className={styles.statusIcon} data-status="complete">
          <Check size={13} strokeWidth={3} />
        </span>
      );
    }
    return (
      <span className={styles.statusIcon} data-status="pending">
        <AlertCircle size={13} strokeWidth={2.5} />
      </span>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.content}>
        <div className={styles.sectionGroup}>
          <span className={styles.groupLabel}>Fluxo de venda</span>
          <nav className={styles.nav}>
            {FLOW_SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id || activeSection.startsWith(id + '/');
              const status = getStepStatus(id);
              return (
                <button
                  key={id}
                  className={`${styles.navItem} ${isActive ? styles.active : ''} ${status ? styles[status] : ''}`}
                  onClick={() => handleNavigate(id)}
                  title={label}
                >
                  <Icon size={20} />
                  <span className={styles.navLabel}>{label}</span>
                  {renderStatusIcon(status)}
                </button>
              );
            })}
          </nav>
        </div>

        <div className={styles.sectionGroup}>
          <span className={styles.groupLabel}>Outros</span>
          <nav className={styles.nav}>
            {OTHER_SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id || activeSection.startsWith(id + '/');
              return (
                <button
                  key={id}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                  onClick={() => handleNavigate(id)}
                  title={label}
                >
                  <Icon size={20} />
                  <span className={styles.navLabel}>{label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <button
          className={`${styles.navItem} ${styles.exit}`}
          onClick={() => handleNavigate('sair')}
          title="Sair do PDV"
        >
          <LogOut size={20} />
          <span className={styles.navLabel}>Sair do PDV</span>
        </button>
      </div>
    </aside>
  );
};

export default PDVSidebar;
