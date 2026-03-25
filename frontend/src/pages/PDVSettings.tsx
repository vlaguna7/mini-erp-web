import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Globe, LogOut } from 'lucide-react';
import './PDVSettings.css';

export const PDVSettings: React.FC = () => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'pt' | 'en' | 'es'>('pt');

  const handleExitPDV = () => {
    if (
      window.confirm('Deseja sair do PDV? Carrinho não salvo será perdido.')
    ) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="pdv-settings">
      <div className="pdv-settings-header">
        <h2 className="pdv-settings-title">Configurações</h2>
      </div>

      <div className="pdv-settings-content">
        <div className="pdv-settings-section">
          <h3 className="pdv-settings-section-title">Aparência</h3>
          <div className="pdv-settings-item">
            <label className="pdv-settings-label">Tema</label>
            <div className="pdv-settings-theme-toggle">
              <button
                className={`pdv-theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={18} />
                Claro
              </button>
              <button
                className={`pdv-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} />
                Escuro
              </button>
            </div>
          </div>
        </div>

        <div className="pdv-settings-section">
          <h3 className="pdv-settings-section-title">Idioma</h3>
          <div className="pdv-settings-item">
            <label className="pdv-settings-label">Selecione o idioma</label>
            <div className="pdv-settings-language-group">
              {[
                { code: 'pt', label: 'Português (Brazil)' },
                { code: 'en', label: 'English (US)' },
                { code: 'es', label: 'Español (España)' },
              ].map((lang) => (
                <label key={lang.code} className="pdv-settings-radio">
                  <input
                    type="radio"
                    value={lang.code}
                    checked={language === lang.code}
                    onChange={(e) => setLanguage(e.target.value as any)}
                  />
                  <span>{lang.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="pdv-settings-section pdv-settings-section-exit">
          <h3 className="pdv-settings-section-title">PDV</h3>
          <button
            className="pdv-settings-exit-btn"
            onClick={handleExitPDV}
          >
            <LogOut size={18} />
            Sair do PDV
          </button>
          <p className="pdv-settings-exit-warning">
            Carrinho não salvo será perdido
          </p>
        </div>
      </div>
    </div>
  );
};
