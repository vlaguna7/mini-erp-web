import React, { useState } from 'react';
import { Store } from 'lucide-react';
import LoginForm from '../../components/LoginForm';
import SignupForm from '../../components/SignupForm';
import styles from './LoginPage.module.css';

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginContainer}>
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Store size={48} />
          </div>
          <h1>Mini ERP - WEB</h1>
          <p>Gestão inteligente de estoque e finanças para pequenos varejistas</p>
        </div>

        <div className={styles.formContainer}>
          {isLogin ? (
            <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
          ) : (
            <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
