import React, { useState, useMemo } from 'react';
import { Save } from 'lucide-react';
import { usePDVStore } from '../store/pdvStore';
import './PDVFinalize.css';

const MOCK_SELLERS = [
  { id: '1', name: 'João Pedro', email: 'joao@loja.com' },
  { id: '2', name: 'Maria Silva', email: 'maria@loja.com' },
  { id: '3', name: 'Carlos Santos', email: 'carlos@loja.com' },
];

const PAYMENT_LABELS = {
  cash: 'Dinheiro',
  pix: 'Pix',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
};

export const PDVFinalize: React.FC = () => {
  const {
    cart,
    selectedClient,
    selectedPayment,
    selectedSeller,
    setSelectedSeller,
    saleType,
    setSaleType,
    discount,
    setDiscount,
    getCartTotal,
    resetPDV,
  } = usePDVStore();

  const [sellers] = useState(MOCK_SELLERS);
  const [isSaving, setIsSaving] = useState(false);

  const cartTotal = getCartTotal();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSaveSale = async () => {
    if (!selectedClient || !selectedPayment || !selectedSeller || cart.length === 0) {
      alert('Por favor, preencha todos os campos: Cliente, Pagamento, Vendedor e produtos');
      return;
    }

    setIsSaving(true);
    try {
      const saleData = {
        client_id: selectedClient.id,
        seller_id: selectedSeller.id,
        payment_method: selectedPayment,
        sale_type: saleType,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        subtotal,
        discount,
        total: cartTotal,
      };

      console.log('Salvando venda:', saleData);
      resetPDV();
      alert('Venda realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao realizar venda');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pdv-finalize">
      <div className="pdv-finalize-header">
        <h2 className="pdv-finalize-title">Finalizar Venda</h2>
      </div>

      <div className="pdv-finalize-content">
        <div className="pdv-finalize-section">
          <label className="pdv-finalize-label">Vendedor</label>
          <select
            value={selectedSeller?.id || ''}
            onChange={(e) => {
              const seller = sellers.find((s) => s.id === e.target.value);
              setSelectedSeller(seller || null);
            }}
            className="pdv-finalize-select"
          >
            <option value="">Selecione um vendedor</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pdv-finalize-section">
          <label className="pdv-finalize-label">Tipo de Venda</label>
          <div className="pdv-finalize-radio-group">
            <label className="pdv-finalize-radio">
              <input
                type="radio"
                value="inperson"
                checked={saleType === 'inperson'}
                onChange={(e) => setSaleType(e.target.value as any)}
              />
              <span>Presencial</span>
            </label>
            <label className="pdv-finalize-radio">
              <input
                type="radio"
                value="online"
                checked={saleType === 'online'}
                onChange={(e) => setSaleType(e.target.value as any)}
              />
              <span>Online</span>
            </label>
          </div>
        </div>

        <div className="pdv-finalize-info-box">
          <div className="pdv-finalize-info-item">
            <span className="pdv-finalize-info-label">Cliente:</span>
            <span className="pdv-finalize-info-value">
              {selectedClient?.name || 'Não selecionado'}
            </span>
          </div>

          <div className="pdv-finalize-info-item">
            <span className="pdv-finalize-info-label">Forma de Pagamento:</span>
            <span className="pdv-finalize-info-value">
              {selectedPayment ? PAYMENT_LABELS[selectedPayment as keyof typeof PAYMENT_LABELS] : 'Não selecionada'}
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <div className="pdv-finalize-items">
            <h3 className="pdv-finalize-items-title">Produtos</h3>
            <div className="pdv-finalize-items-list">
              {cart.map((item) => (
                <div key={item.id} className="pdv-finalize-item">
                  <div className="pdv-finalize-item-info">
                    <span className="pdv-finalize-item-name">{item.name}</span>
                    <span className="pdv-finalize-item-qty">
                      {item.quantity}x R$ {item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className="pdv-finalize-item-total">
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pdv-finalize-totals">
          <div className="pdv-finalize-total-row">
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>

          <div className="pdv-finalize-total-row">
            <label>
              Desconto:
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="0.01"
                className="pdv-finalize-discount-input"
              />
            </label>
          </div>

          <div className="pdv-finalize-total-row pdv-finalize-grand-total">
            <span>Total a Pagar:</span>
            <span className="pdv-finalize-total-value">R$ {cartTotal.toFixed(2)}</span>
          </div>
        </div>

        <button
          className="pdv-finalize-save-btn"
          onClick={handleSaveSale}
          disabled={isSaving || cart.length === 0 || !selectedClient || !selectedPayment || !selectedSeller}
        >
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Venda'}
        </button>
      </div>
    </div>
  );
};
