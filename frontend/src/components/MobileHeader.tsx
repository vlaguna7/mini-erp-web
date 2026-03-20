import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import './MobileHeader.css';

export const MobileHeader: React.FC = () => {
  const { setIsOpen, isDark, toggleTheme } = useSidebar();

  return (
    <header className="mobile-header">
      <button
        className="mobile-header-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Abrir menu"
      >
        <Menu size={22} />
      </button>

      <span className="mobile-header-logo">Mini ERP</span>

      <button
        className="mobile-header-btn"
        onClick={toggleTheme}
        aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
    </header>
  );
};