import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, CreditCard, CheckCircle, RotateCcw, Settings, LogOut } from 'lucide-react';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVSidebar.module.css';

type PDVSection = 'produtos' | 'cliente' | 'cliente/criar-cliente' | 'pagamento' | 'finalizar' | 'devolucoes' | 'configuracoes';

interface PDVSidebarProps {
  activeSection: PDVSection;
}

const SECTIONS = [
  { id: 'produtos', label: 'Produtos', icon: Package },
  { id: 'cliente', label: 'Cliente', icon: Users },
  { id: 'pagamento', label: 'Pagamento', icon: CreditCard },
  { id: 'finalizar', label: 'Finalizar', icon: CheckCircle },
  { id: 'devolucoes', label: 'Devoluções', icon: RotateCcw },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
];

const PDVSidebar: React.FC<PDVSidebarProps> = ({ activeSection }) => {
  const navigate = useNavigate();
  const resetPDV = usePDVStore((state) => state.resetPDV);

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'sair') {
      resetPDV();
      navigate('/dashboard');
      return;
    }
    navigate(`/pdv/${sectionId}`);
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.content}>
        <nav className={styles.nav}>
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.navItem} ${activeSection === id || activeSection.startsWith(id + '/') ? styles.active : ''}`}
              onClick={() => handleNavigate(id)}
              title={label}
            >
              <Icon size={20} />
              <span className={styles.navLabel}>{label}</span>
            </button>
          ))}
        </nav>

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
