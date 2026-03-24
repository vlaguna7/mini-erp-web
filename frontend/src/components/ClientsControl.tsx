import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import './ClientsControl.css';

export const ClientsControl: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="clients-control">
      <div className="clients-control-header">
        <Users size={24} className="clients-control-icon" />
        <h2 className="clients-control-title">Controle de Clientes</h2>
      </div>

      <div className="clients-control-actions">
        <button
          className="btn btn-primary clients-control-btn"
          onClick={() => navigate('/vendas-e-clientes/cadastrar-cliente')}
        >
          <Plus size={18} />
          Cadastrar Cliente
        </button>

        <button
          className="btn btn-outline clients-control-btn"
          onClick={() => navigate('/vendas-e-clientes/lista-clientes')}
        >
          <Users size={18} />
          Lista de Clientes
        </button>
      </div>
    </div>
  );
};
