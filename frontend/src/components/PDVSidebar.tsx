import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Users, CreditCard, CheckCircle, RotateCcw, Settings, LogOut } from 'lucide-react';
import './PDVSidebar.css';

type PDVSection = 'produtos' | 'cliente' | 'pagamento' | 'finalizar' | 'devolucoes' | 'configuracoes';

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

export const PDVSidebar: React.FC<PDVSidebarProps> = ({ activeSection }) => {
  const navigate = useNavigate();

  const handleNavigate = (sectionId: string) => {
    if (sectionId === 'sair') {
      navigate('/dashboard');
      return;
    }
    navigate(`/pdv/${sectionId}`);
  };

  return (
    <aside className="pdv-sidebar">
      <div className="pdv-sidebar-content">
        <nav className="pdv-nav">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`pdv-nav-item ${activeSection === id ? 'active' : ''}`}
              onClick={() => handleNavigate(id)}
              title={label}
            >
              <Icon size={20} />
              <span className="pdv-nav-label">{label}</span>
            </button>
          ))}
        </nav>

        <button
          className="pdv-nav-item pdv-exit"
          onClick={() => handleNavigate('sair')}
          title="Sair do PDV"
        >
          <LogOut size={20} />
          <span className="pdv-nav-label">Sair do PDV</span>
        </button>
      </div>
    </aside>
  );
};
