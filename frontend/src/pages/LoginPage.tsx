import React, { useState } from 'react';
import { Store } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
import { SignupForm } from '../components/SignupForm';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="logo-section">
          <div className="logo-icon">
            <Store size={48} />
          </div>
          <h1>Mini ERP - WEB</h1>
          <p>Gestão inteligente de estoque e finanças para pequenos varejistas</p>
        </div>

        <div className="form-container">
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
