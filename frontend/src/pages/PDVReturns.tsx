import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import './PDVReturns.css';

const MOCK_SALES = [
  {
    id: '001',
    client: 'João Silva',
    date: '2026-03-24',
    total: 150.00,
    items: [
      { name: 'Produto A', quantity: 2, price: 50.00 },
      { name: 'Produto B', quantity: 1, price: 50.00 },
    ],
  },
  {
    id: '002',
    client: 'Maria Santos',
    date: '2026-03-23',
    total: 200.00,
    items: [
      { name: 'Produto C', quantity: 1, price: 200.00 },
    ],
  },
];

export const PDVReturns: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [isReverting, setIsReverting] = useState(false);

  const filteredSales = MOCK_SALES.filter(
    (sale) =>
      sale.id.includes(searchTerm) ||
      sale.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReverseSale = async () => {
    if (!selectedSale) return;
    setIsReverting(true);
    try {
      console.log('Revertendo venda:', selectedSale.id);
      alert(`Venda ${selectedSale.id} revertida com sucesso!`);
      setSelectedSale(null);
    } catch (error) {
      console.error('Erro ao reverter venda:', error);
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <div className="pdv-returns">
      <div className="pdv-returns-header">
        <h2 className="pdv-returns-title">Devoluções</h2>
      </div>

      <div className="pdv-returns-search">
        <Search size={18} className="pdv-search-icon" />
        <input
          type="text"
          placeholder="Buscar por número da venda ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pdv-search-input"
        />
      </div>

      <div className="pdv-returns-content">
        <div className="pdv-returns-list">
          <h3 className="pdv-returns-subtitle">Vendas Anteriores</h3>
          {filteredSales.length === 0 ? (
            <p className="pdv-returns-empty">Nenhuma venda encontrada</p>
          ) : (
            <>
              {filteredSales.map((sale) => (
                <button
                  key={sale.id}
                  className={`pdv-returns-sale-card ${
                    selectedSale?.id === sale.id ? 'selected' : ''
                  }`}
                  onClick={() =>
                    setSelectedSale(
                      selectedSale?.id === sale.id ? null : sale
                    )
                  }
                >
                  <div className="pdv-returns-sale-id">{sale.id}</div>
                  <div className="pdv-returns-sale-info">
                    <span>{sale.client}</span>
                    <span>{sale.date}</span>
                  </div>
                  <div className="pdv-returns-sale-total">
                    R$ {sale.total.toFixed(2)}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {selectedSale && (
          <div className="pdv-returns-details">
            <h3 className="pdv-returns-subtitle">Detalhes da Venda</h3>
            <div className="pdv-returns-sale-details">
              <div className="pdv-returns-detail-item">
                <span className="pdv-returns-label">Número:</span>
                <span>{selectedSale.id}</span>
              </div>
              <div className="pdv-returns-detail-item">
                <span className="pdv-returns-label">Cliente:</span>
                <span>{selectedSale.client}</span>
              </div>
              <div className="pdv-returns-detail-item">
                <span className="pdv-returns-label">Data:</span>
                <span>{selectedSale.date}</span>
              </div>

              <div className="pdv-returns-items">
                <h4 className="pdv-returns-items-title">Produtos</h4>
                {selectedSale.items.map((item: any, idx: number) => (
                  <div key={idx} className="pdv-returns-item">
                    <span>{item.name}</span>
                    <span>{item.quantity}x R$ {item.price.toFixed(2)}</span>
                    <span>R$ {(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pdv-returns-total">
                <span>Total:</span>
                <span>R$ {selectedSale.total.toFixed(2)}</span>
              </div>

              <button
                className="pdv-returns-reverse-btn"
                onClick={handleReverseSale}
                disabled={isReverting}
              >
                <RotateCcw size={18} />
                {isReverting ? 'Revertendo...' : 'Reverter Venda'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
