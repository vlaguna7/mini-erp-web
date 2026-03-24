import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSidebar } from '../context/SidebarContext';
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
import './Sidebar.css';

export const Sidebar: React.FC = () => {
  const { isOpen, setIsOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { path: '/dashboard',  icon: BarChart3,    label: 'Dashboard'           },
    { path: '/estoque',    icon: Package,       label: 'Controle de Estoque' },
    { path: '/vendas-e-clientes', icon: ShoppingCart,  label: 'Vendas e Clientes' },
    { path: '/financeiro', icon: DollarSign,    label: 'Financeiro'          },
    { path: '/relatorios', icon: FileText,      label: 'Relatórios'          },
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
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      {/* Top — logo + toggle */}
      <div className="sidebar-top">
        {isOpen && (
          <span className="sidebar-logo">Mini ERP</span>
        )}
        <button
          className="sidebar-toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
          title={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isOpen ? <ChevronLeft size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="sidebar-nav">
        <ul className="nav-items">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <li key={item.path}>
                <button
                  className={`nav-item ${active ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                  title={!isOpen ? item.label : ''}
                >
                  <Icon size={24} className="nav-icon" />
                  {isOpen && <span className="nav-label">{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer Section */}
      <div className="sidebar-footer">
        <button
          className="footer-item"
          onClick={() => handleNavigation('/configuracoes')}
          title={!isOpen ? 'Configurações' : ''}
        >
          <Settings size={24} className="nav-icon" />
          {isOpen && <span className="nav-label">Configurações</span>}
        </button>
        <button
          className="footer-item logout"
          onClick={handleLogout}
          title={!isOpen ? 'Sair' : ''}
        >
          <LogOut size={24} className="nav-icon" />
          {isOpen && <span className="nav-label">Sair</span>}
        </button>
      </div>
    </aside>
  );
};