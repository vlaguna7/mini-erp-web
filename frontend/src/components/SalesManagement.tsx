import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, RotateCcw } from 'lucide-react';
import './SalesManagement.css';

export const SalesManagement: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="sales-management">
      <div className="sales-management-header">
        <ShoppingCart size={24} className="sales-management-icon" />
        <h2 className="sales-management-title">Gestão de Vendas</h2>
      </div>

      <div className="sales-management-actions">
        <button
          className="btn btn-primary sales-management-btn"
          onClick={() => navigate('/vendas-e-clientes/lancar-venda')}
        >
          <ShoppingCart size={18} />
          Lançar Venda
        </button>

        <button
          className="btn btn-outline sales-management-btn"
          onClick={() => navigate('/vendas-e-clientes/lancar-devolucao')}
        >
          <RotateCcw size={18} />
          Lançar Devolução de Venda
        </button>
      </div>
    </div>
  );
};
