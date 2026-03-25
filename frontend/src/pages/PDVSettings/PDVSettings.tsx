import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, Globe, LogOut } from 'lucide-react';
import styles from './PDVSettings.module.css';

const PDVSettings: React.FC = () => {
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
    <div className={styles.pdvSettings}>
      <div className={styles.pdvSettingsHeader}>
        <h2 className={styles.pdvSettingsTitle}>Configurações</h2>
      </div>

      <div className={styles.pdvSettingsContent}>
        <div className={styles.pdvSettingsSection}>
          <h3 className={styles.pdvSettingsSectionTitle}>Aparência</h3>
          <div className={styles.pdvSettingsItem}>
            <label className={styles.pdvSettingsLabel}>Tema</label>
            <div className={styles.pdvSettingsThemeToggle}>
              <button
                className={`${styles.pdvThemeBtn} ${theme === 'light' ? styles.active : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={18} />
                Claro
              </button>
              <button
                className={`${styles.pdvThemeBtn} ${theme === 'dark' ? styles.active : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={18} />
                Escuro
              </button>
            </div>
          </div>
        </div>

        <div className={styles.pdvSettingsSection}>
          <h3 className={styles.pdvSettingsSectionTitle}>Idioma</h3>
          <div className={styles.pdvSettingsItem}>
            <label className={styles.pdvSettingsLabel}>Selecione o idioma</label>
            <div className={styles.pdvSettingsLanguageGroup}>
              {[
                { code: 'pt', label: 'Português (Brazil)' },
                { code: 'en', label: 'English (US)' },
                { code: 'es', label: 'Español (España)' },
              ].map((lang) => (
                <label key={lang.code} className={styles.pdvSettingsRadio}>
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

        <div className={`${styles.pdvSettingsSection} ${styles.pdvSettingsSectionExit}`}>
          <h3 className={styles.pdvSettingsSectionTitle}>PDV</h3>
          <button
            className={styles.pdvSettingsExitBtn}
            onClick={handleExitPDV}
          >
            <LogOut size={18} />
            Sair do PDV
          </button>
          <p className={styles.pdvSettingsExitWarning}>
            Carrinho não salvo será perdido
          </p>
        </div>
      </div>
    </div>
  );
};

export default PDVSettings;
