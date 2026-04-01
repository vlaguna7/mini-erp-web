import React, { useState, useMemo } from 'react';
import { Save } from 'lucide-react';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVFinalize.module.css';

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

const PDVFinalize: React.FC = () => {
  const {
    cart,
    selectedClient,
    selectedPayment,
    payments,
    selectedSeller,
    setSelectedSeller,
    saleType,
    setSaleType,
    discount,
    setDiscount,
    surcharge,
    getTotalToPay,
    getTotalPaid,
    getSubtotal,
    resetPDV,
  } = usePDVStore();

  const [sellers] = useState(MOCK_SELLERS);
  const [isSaving] = useState(false);

  const totalToPay = getTotalToPay();
  const totalPaid = getTotalPaid();
  const subtotal = getSubtotal();

  const hasPayments = payments.length > 0;
  const isPaymentComplete = hasPayments && Math.abs(totalPaid - totalToPay) <= 0.01;

  const handleSaveSale = async () => {
    if (!selectedClient || (!selectedPayment && payments.length === 0) || !selectedSeller || cart.length === 0) {
      alert('Por favor, preencha todos os campos: Cliente, Pagamento, Vendedor e produtos');
      return;
    }

    if (!isPaymentComplete) {
      alert('O valor pago deve ser igual ao valor total a pagar');
      return;
    }

    try {
      const saleData = {
        client_id: selectedClient.id,
        seller_id: selectedSeller.id,
        payments: payments.map((p) => ({ method: p.method, amount: p.amount })),
        sale_type: saleType,
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        subtotal,
        discount,
        surcharge,
        total: totalToPay,
      };

      console.log('Salvando venda:', saleData);
      resetPDV();
      alert('Venda realizada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar venda:', error);
      alert('Erro ao realizar venda');
    }
  };

  return (
    <div className={styles.pdvFinalize}>
      <div className={styles.pdvFinalizeHeader}>
        <h2 className={styles.pdvFinalizeTitle}>Finalizar Venda</h2>
      </div>

      <div className={styles.pdvFinalizeContent}>
        <div className={styles.pdvFinalizeSection}>
          <label className={styles.pdvFinalizeLabel}>Vendedor</label>
          <select
            value={selectedSeller?.id || ''}
            onChange={(e) => {
              const seller = sellers.find((s) => s.id === e.target.value);
              setSelectedSeller(seller || null);
            }}
            className={styles.pdvFinalizeSelect}
          >
            <option value="">Selecione um vendedor</option>
            {sellers.map((seller) => (
              <option key={seller.id} value={seller.id}>
                {seller.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.pdvFinalizeSection}>
          <label className={styles.pdvFinalizeLabel}>Tipo de Venda</label>
          <div className={styles.pdvFinalizeRadioGroup}>
            <label className={styles.pdvFinalizeRadio}>
              <input
                type="radio"
                value="inperson"
                checked={saleType === 'inperson'}
                onChange={(e) => setSaleType(e.target.value as any)}
              />
              <span>Presencial</span>
            </label>
            <label className={styles.pdvFinalizeRadio}>
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

        <div className={styles.pdvFinalizeInfoBox}>
          <div className={styles.pdvFinalizeInfoItem}>
            <span className={styles.pdvFinalizeInfoLabel}>Cliente:</span>
            <span className={styles.pdvFinalizeInfoValue}>
              {selectedClient?.name || 'Não selecionado'}
            </span>
          </div>

          <div className={styles.pdvFinalizeInfoItem}>
            <span className={styles.pdvFinalizeInfoLabel}>Pagamentos:</span>
            <span className={styles.pdvFinalizeInfoValue}>
              {payments.length > 0
                ? payments.map((p) => `${p.label} (R$ ${p.amount.toFixed(2)})`).join(', ')
                : selectedPayment
                  ? PAYMENT_LABELS[selectedPayment as keyof typeof PAYMENT_LABELS]
                  : 'Não selecionado'}
            </span>
          </div>
        </div>

        {cart.length > 0 && (
          <div className={styles.pdvFinalizeItems}>
            <h3 className={styles.pdvFinalizeItemsTitle}>Produtos</h3>
            <div className={styles.pdvFinalizeItemsList}>
              {cart.map((item) => (
                <div key={item.id} className={styles.pdvFinalizeItem}>
                  <div className={styles.pdvFinalizeItemInfo}>
                    <span className={styles.pdvFinalizeItemName}>{item.name}</span>
                    <span className={styles.pdvFinalizeItemQty}>
                      {item.quantity}x R$ {item.price.toFixed(2)}
                    </span>
                  </div>
                  <span className={styles.pdvFinalizeItemTotal}>
                    R$ {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.pdvFinalizeTotals}>
          <div className={styles.pdvFinalizeTotalRow}>
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>

          <div className={`${styles.pdvFinalizeTotalRow} ${styles.pdvFinalizeGrandTotal}`}>
            <span>Total a Pagar:</span>
            <span className={styles.pdvFinalizeTotalValue}>R$ {totalToPay.toFixed(2)}</span>
          </div>

          {payments.length > 0 && (
            <div className={styles.pdvFinalizeTotalRow}>
              <span>Valor Pago:</span>
              <span>R$ {totalPaid.toFixed(2)}</span>
            </div>
          )}
        </div>

        <button
          className={styles.pdvFinalizeSaveBtn}
          onClick={handleSaveSale}
          disabled={isSaving || cart.length === 0 || !selectedClient || !selectedSeller || !isPaymentComplete}
        >
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Venda'}
        </button>
      </div>
    </div>
  );
};

export default PDVFinalize;
