import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/productService';
import { useAuthStore } from '../../store/authStore';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const setStoreError = useAuthStore((state) => state.setError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Por favor, preencha e-mail e senha');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login(email, password);
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (err: any) {
      let errorMessage = 'Falha ao fazer login';
      
      if (err.response?.status === 401) {
        errorMessage = 'E-mail ou senha incorretos';
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message === 'Network Error') {
        errorMessage = 'Erro de conexão. Verifique sua internet';
      }
      
      setError(errorMessage);
    } finally {
        setIsLoading(false);
      }
    };
  
    return (
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2>Login</h2>
        
        {error && <div className={styles.errorMessage}>{error}</div>}
        
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
            disabled={isLoading}
          />
        </div>
  
        <div className={styles.formGroup}>
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            disabled={isLoading}
          />
        </div>
  
        <button type="submit" disabled={isLoading} className={`${styles.btn} ${styles.btnPrimary}`}>
          {isLoading ? 'Conectando...' : 'Entrar'}
        </button>
  
        <p className={styles.formSwitch}>
          Não tem conta?{' '}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className={styles.linkButton}
            disabled={isLoading}
          >
            Cadastre-se aqui
          </button>
        </p>
      </form>
    );
};

export default LoginForm;
