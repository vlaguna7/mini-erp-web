import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';
import styles from './PDVReturns.module.css';

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

const PDVReturns: React.FC = () => {
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
    <div className={styles.pdvReturns}>
      <div className={styles.pdvReturnsHeader}>
        <h2 className={styles.pdvReturnsTitle}>Devoluções</h2>
      </div>

      <div className={styles.pdvReturnsSearch}>
        <Search size={18} className={styles.pdvSearchIcon} />
        <input
          type="text"
          placeholder="Buscar por número da venda ou cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.pdvReturnsSearchInput}
        />
      </div>

      <div className={styles.pdvReturnsContent}>
        <div className={styles.pdvReturnsList}>
          <h3 className={styles.pdvReturnsSubtitle}>Vendas Anteriores</h3>
          {filteredSales.length === 0 ? (
            <p className={styles.pdvReturnsEmpty}>Nenhuma venda encontrada</p>
          ) : (
            <>
              {filteredSales.map((sale) => (
                <button
                  key={sale.id}
                  className={`${styles.pdvReturnsSaleCard} ${
                    selectedSale?.id === sale.id ? styles.selected : ''
                  }`}
                  onClick={() =>
                    setSelectedSale(
                      selectedSale?.id === sale.id ? null : sale
                    )
                  }
                >
                  <div className={styles.pdvReturnsSaleId}>{sale.id}</div>
                  <div className={styles.pdvReturnsSaleInfo}>
                    <span>{sale.client}</span>
                    <span>{sale.date}</span>
                  </div>
                  <div className={styles.pdvReturnsSaleTotal}>
                    R$ {sale.total.toFixed(2)}
                  </div>
                </button>
              ))}
            </>
          )}
        </div>

        {selectedSale && (
          <div className={styles.pdvReturnsDetails}>
            <h3 className={styles.pdvReturnsSubtitle}>Detalhes da Venda</h3>
            <div className={styles.pdvReturnsSaleDetails}>
              <div className={styles.pdvReturnsDetailItem}>
                <span className={styles.pdvReturnsLabel}>Número:</span>
                <span>{selectedSale.id}</span>
              </div>
              <div className={styles.pdvReturnsDetailItem}>
                <span className={styles.pdvReturnsLabel}>Cliente:</span>
                <span>{selectedSale.client}</span>
              </div>
              <div className={styles.pdvReturnsDetailItem}>
                <span className={styles.pdvReturnsLabel}>Data:</span>
                <span>{selectedSale.date}</span>
              </div>

              <div className={styles.pdvReturnsItems}>
                <h4 className={styles.pdvReturnsItemsTitle}>Produtos</h4>
                {selectedSale.items.map((item: any, idx: number) => (
                  <div key={idx} className={styles.pdvReturnsItem}>
                    <span>{item.name}</span>
                    <span>{item.quantity}x R$ {item.price.toFixed(2)}</span>
                    <span>R$ {(item.quantity * item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.pdvReturnsTotal}>
                <span>Total:</span>
                <span>R$ {selectedSale.total.toFixed(2)}</span>
              </div>

              <button
                className={styles.pdvReturnsReverseBtn}
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

export default PDVReturns;
