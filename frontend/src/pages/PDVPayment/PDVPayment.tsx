import React, { useState } from 'react';
import { DollarSign, Smartphone, CreditCard, Trash2 } from 'lucide-react';
import { usePDVStore, PaymentMethod } from '../../store/pdvStore';
import styles from './PDVPayment.module.css';

const PAYMENT_METHODS = [
  { id: 'cash' as PaymentMethod, label: 'Dinheiro', icon: DollarSign },
  { id: 'pix' as PaymentMethod, label: 'Pix', icon: Smartphone },
  { id: 'credit' as PaymentMethod, label: 'Cartão de Crédito', icon: CreditCard },
  { id: 'debit' as PaymentMethod, label: 'Cartão de Débito', icon: CreditCard },
];

const PDVPayment: React.FC = () => {
  const {
    payments,
    addPayment,
    removePayment,
    clearPayments,
    discount,
    setDiscount,
    discountType,
    setDiscountType,
    surcharge,
    setSurcharge,
    surchargeType,
    setSurchargeType,
    coupon,
    setCoupon,
    getSubtotal,
    getTotalToPay,
    getTotalPaid,
  } = usePDVStore();

  const [amountInput, setAmountInput] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const subtotal = getSubtotal();
  const totalToPay = getTotalToPay();
  const totalPaid = getTotalPaid();
  const remaining = Math.max(0, totalToPay - totalPaid);

  const fmt = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    const rest = Math.max(0, totalToPay - totalPaid);
    setAmountInput(rest > 0 ? rest.toFixed(2).replace('.', ',') : '');
  };

  const handleAddPayment = () => {
    if (!selectedMethod) return;
    const parsed = parseFloat(amountInput.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;
    const maxAllowed = Math.max(0, totalToPay - totalPaid);
    const amount = Math.min(parsed, maxAllowed);
    if (amount <= 0) return;
    const info = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    addPayment({
      id: `${selectedMethod}-${Date.now()}`,
      method: selectedMethod,
      label: info?.label || selectedMethod,
      amount,
    });
    setSelectedMethod(null);
    setAmountInput('');
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddPayment();
    if (e.key === 'Escape') { setSelectedMethod(null); setAmountInput(''); }
  };

  return (
    <div className={styles.page}>
      {/* ── SEÇÃO 1: FORMAS DE PAGAMENTO ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Formas de pagamento</h2>
          {payments.length > 0 && (
            <button className={styles.clearBtn} onClick={clearPayments}>
              <Trash2 size={14} />
              Limpar
            </button>
          )}
        </div>

        <div className={styles.methodsRow}>
          {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              className={`${styles.methodCard} ${selectedMethod === id ? styles.methodActive : ''}`}
              onClick={() => handleSelectMethod(id)}
            >
              <Icon size={24} strokeWidth={1.5} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {selectedMethod && (
          <div className={styles.addRow}>
            <span className={styles.addLabel}>
              {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}
            </span>
            <div className={styles.addField}>
              <span className={styles.addPrefix}>R$</span>
              <input
                className={styles.addInput}
                type="text"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                onKeyDown={handleAmountKeyDown}
                placeholder="0,00"
                autoFocus
              />
            </div>
            <button className={styles.addConfirm} onClick={handleAddPayment}>Confirmar</button>
            <button className={styles.addCancel} onClick={() => { setSelectedMethod(null); setAmountInput(''); }}>Cancelar</button>
          </div>
        )}

        {payments.length > 0 && (
          <div className={styles.paymentList}>
            {payments.map((p) => (
              <div key={p.id} className={styles.paymentRow}>
                <span className={styles.paymentName}>{p.label}</span>
                <span className={styles.paymentAmount}>{fmt(p.amount)}</span>
                <button className={styles.paymentDel} onClick={() => removePayment(p.id)} title="Remover">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── SEÇÃO 2: RESUMO FINANCEIRO ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Resumo do pagamento</h2>

        <div className={styles.summaryGrid}>
          {/* Linha 1 */}
          <div className={styles.summaryCell}>
            <span className={styles.summaryLabel}>Subtotal</span>
            <span className={styles.summaryVal}>{fmt(subtotal)}</span>
          </div>

          <div className={styles.summaryCell}>
            <span className={styles.summaryLabel}>Desconto</span>
            <div className={styles.inputCombo}>
              <button
                className={styles.toggle}
                onClick={() => setDiscountType(discountType === 'value' ? 'percent' : 'value')}
              >
                {discountType === 'value' ? 'R$' : '%'}
              </button>
              <input
                type="number"
                className={styles.numInput}
                value={discount || ''}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="0.01"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className={styles.summaryCell}>
            <span className={styles.summaryLabel}>Acréscimo</span>
            <div className={styles.inputCombo}>
              <button
                className={styles.toggle}
                onClick={() => setSurchargeType(surchargeType === 'value' ? 'percent' : 'value')}
              >
                {surchargeType === 'value' ? 'R$' : '%'}
              </button>
              <input
                type="number"
                className={styles.numInput}
                value={surcharge || ''}
                onChange={(e) => setSurcharge(Math.max(0, parseFloat(e.target.value) || 0))}
                min="0"
                step="0.01"
                placeholder="0,00"
              />
            </div>
          </div>

          <div className={styles.summaryCell}>
            <span className={styles.summaryLabel}>Cupom</span>
            <div className={styles.inputCombo}>
              <input
                type="text"
                className={styles.couponInput}
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Código"
              />
              <button className={styles.couponBtn}>Aplicar</button>
            </div>
          </div>
        </div>

        {/* Totais */}
        <div className={styles.totalsBar}>
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>Total a pagar</span>
            <span className={styles.totalVal}>{fmt(totalToPay)}</span>
          </div>
          <div className={styles.totalDivider} />
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>Pago</span>
            <span className={styles.totalVal}>{fmt(totalPaid)}</span>
          </div>
          <div className={styles.totalDivider} />
          <div className={styles.totalItem}>
            <span className={styles.totalLabel}>Restante</span>
            <span className={`${styles.totalVal} ${remaining > 0 ? styles.valRed : styles.valGreen}`}>
              {fmt(remaining)}
            </span>
          </div>
        </div>

        {totalPaid > 0 && Math.abs(totalPaid - totalToPay) > 0.01 && (
          <div className={styles.warn}>O valor pago deve ser igual ao valor total a pagar</div>
        )}
        {totalPaid > 0 && Math.abs(totalPaid - totalToPay) <= 0.01 && (
          <div className={styles.success}>Pagamento completo!</div>
        )}
      </section>
    </div>
  );
};

export default PDVPayment;
