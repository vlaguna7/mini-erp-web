import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSidebar } from '../../context/SidebarContext';
import {
  Menu,
  ChevronLeft,
  BarChart3,
  Package,
  ShoppingCart,
  DollarSign,
  FileText,
  Settings,
  LogOut,
} from 'lucide-react';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const { isOpen, setIsOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { path: '/dashboard',  icon: BarChart3,    label: 'Dashboard'           },
    { path: '/pdv/produtos', icon: ShoppingCart, label: 'PDV'                 },
    { path: '/estoque',    icon: Package,      label: 'Controle de Estoque' },
    { path: '/vendas-e-clientes', icon: ShoppingCart,  label: 'Vendas e Clientes' },
    { path: '/financeiro', icon: DollarSign,   label: 'Financeiro'          },
    { path: '/relatorios', icon: FileText,     label: 'Relatórios'          },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      {/* Top — logo + toggle */}
      <div className={styles.top}>
        {isOpen && (
          <span className={styles.logo}>Mini ERP</span>
        )}
        <button
          className={styles.toggle}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
          title={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className={styles.nav}>
        <ul className={styles.items}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  className={`${styles.item} ${active ? styles.active : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  title={!isOpen ? item.label : ''}
                >
                  <Icon size={24} className={styles.icon} />
                  {isOpen && <span className={styles.label}>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className={styles.footer}>
        <button
          className={styles.footerItem}
          onClick={() => handleNavigation('/configuracoes')}
          title={!isOpen ? 'Configurações' : ''}
        >
          <Settings size={24} className={styles.icon} />
          {isOpen && <span className={styles.label}>Configurações</span>}
        </button>
        <button
          className={`${styles.footerItem} ${styles.logout}`}
          onClick={handleLogout}
          title={!isOpen ? 'Sair' : ''}
        >
          <LogOut size={24} className={styles.icon} />
          {isOpen && <span className={styles.label}>Sair</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;