import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/productService';
import { useAuthStore } from '../../store/authStore';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate       = useNavigate();
  const login          = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor, preencha e-mail e senha');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await authService.login(email, password);
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (err: any) {
      let msg = 'Falha ao fazer login';
      if (err.response?.status === 401)          msg = 'E-mail ou senha incorretos';
      else if (err.response?.data?.error)        msg = err.response.data.error;
      else if (err.message === 'Network Error')  msg = 'Erro de conexão. Verifique sua internet';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Bem-vindo de volta</h2>

      {error && (
        <div className={styles.errorMessage}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <circle cx="7.5" cy="7.5" r="6.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M7.5 4.5v3.5M7.5 10h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      <div className={styles.formGroup}>
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          disabled={isLoading}
          autoComplete="email"
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.labelRow}>
          <label htmlFor="login-password">Senha</label>
          <button type="button" className={styles.forgotLink}>Esqueceu?</button>
        </div>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          disabled={isLoading}
          autoComplete="current-password"
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Entrando…' : 'Entrar'}
      </button>

      {/* formSwitch is hidden by AuthPage — kept for standalone usage */}
      <p className={styles.formSwitch}>
        Não tem conta?{' '}
        <button type="button" onClick={onSwitchToSignup} className={styles.linkButton} disabled={isLoading}>
          Cadastre-se
        </button>
      </p>
    </form>
  );
};

export default LoginForm;