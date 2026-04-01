import React, { useState } from 'react';
import { DollarSign, Smartphone, CreditCard, Trash2, ChevronRight } from 'lucide-react';
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

  const [showMethods, setShowMethods] = useState(true);
  const [amountInput, setAmountInput] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const subtotal = getSubtotal();
  const totalToPay = getTotalToPay();
  const totalPaid = getTotalPaid();
  const remaining = Math.max(0, totalToPay - totalPaid);

  const formatCurrency = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const handleSelectMethod = (method: PaymentMethod) => {
    setSelectedMethod(method);
    const remainingToPay = Math.max(0, totalToPay - totalPaid);
    setAmountInput(remainingToPay > 0 ? remainingToPay.toFixed(2).replace('.', ',') : '');
  };

  const handleAddPayment = () => {
    if (!selectedMethod) return;
    const parsed = parseFloat(amountInput.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;

    const methodInfo = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    addPayment({
      id: `${selectedMethod}-${Date.now()}`,
      method: selectedMethod,
      label: methodInfo?.label || selectedMethod,
      amount: parsed,
    });
    setSelectedMethod(null);
    setAmountInput('');
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddPayment();
    if (e.key === 'Escape') {
      setSelectedMethod(null);
      setAmountInput('');
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Coluna esquerda - Formas de pagamento */}
      <div className={styles.leftColumn}>
        <div className={styles.header}>
          <h2 className={styles.title}>Escolher formas de pagamentos</h2>
        </div>

        {payments.length > 0 && (
          <button className={styles.clearBtn} onClick={clearPayments}>
            <Trash2 size={16} />
            Remover todos os pagamentos
          </button>
        )}

        <button
          className={styles.sectionToggle}
          onClick={() => setShowMethods(!showMethods)}
        >
          <span className={styles.sectionToggleText}>Formas de pagamento</span>
          <ChevronRight
            size={18}
            className={`${styles.chevron} ${showMethods ? styles.chevronOpen : ''}`}
          />
        </button>

        {showMethods && (
          <div className={styles.methods}>
            {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`${styles.methodCard} ${
                  selectedMethod === id ? styles.methodCardActive : ''
                }`}
                onClick={() => handleSelectMethod(id)}
              >
                <Icon size={28} strokeWidth={1.5} />
                <span className={styles.methodLabel}>{label}</span>
              </button>
            ))}
          </div>
        )}

        {selectedMethod && (
          <div className={styles.amountInputRow}>
            <span className={styles.amountMethodName}>
              {PAYMENT_METHODS.find((m) => m.id === selectedMethod)?.label}
            </span>
            <div className={styles.amountField}>
              <span className={styles.amountPrefix}>R$</span>
              <input
                type="text"
                className={styles.amountInput}
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                onKeyDown={handleAmountKeyDown}
                placeholder="0,00"
                autoFocus
              />
            </div>
            <button className={styles.amountAddBtn} onClick={handleAddPayment}>
              Adicionar
            </button>
            <button
              className={styles.amountCancelBtn}
              onClick={() => {
                setSelectedMethod(null);
                setAmountInput('');
              }}
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Lista de pagamentos adicionados */}
        <div className={styles.paymentsList}>
          {payments.map((payment) => (
            <div key={payment.id} className={styles.paymentItem}>
              <div className={styles.paymentItemInfo}>
                <span className={styles.paymentItemName}>{payment.label}</span>
                <span className={styles.paymentItemAmount}>
                  {formatCurrency(payment.amount)}
                </span>
              </div>
              <button
                className={styles.paymentItemDelete}
                onClick={() => removePayment(payment.id)}
                title="Remover pagamento"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Coluna direita - Resumo */}
      <div className={styles.rightColumn}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Valor Total</span>
          <span className={styles.summaryValue}>{formatCurrency(subtotal)}</span>
        </div>

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Desconto</span>
          <div className={styles.summaryInputGroup}>
            <button
              className={`${styles.typeToggle} ${
                discountType === 'value' ? styles.typeToggleActive : ''
              }`}
              onClick={() =>
                setDiscountType(discountType === 'value' ? 'percent' : 'value')
              }
            >
              {discountType === 'value' ? 'R$' : '%'}
            </button>
            <input
              type="number"
              className={styles.summaryInput}
              value={discount || ''}
              onChange={(e) =>
                setDiscount(Math.max(0, parseFloat(e.target.value) || 0))
              }
              min="0"
              step="0.01"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Acréscimo de valor</span>
          <div className={styles.summaryInputGroup}>
            <button
              className={`${styles.typeToggle} ${
                surchargeType === 'value' ? styles.typeToggleActive : ''
              }`}
              onClick={() =>
                setSurchargeType(surchargeType === 'value' ? 'percent' : 'value')
              }
            >
              {surchargeType === 'value' ? 'R$' : '%'}
            </button>
            <input
              type="number"
              className={styles.summaryInput}
              value={surcharge || ''}
              onChange={(e) =>
                setSurcharge(Math.max(0, parseFloat(e.target.value) || 0))
              }
              min="0"
              step="0.01"
              placeholder="0,00"
            />
          </div>
        </div>

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Cupom</span>
          <div className={styles.couponGroup}>
            <input
              type="text"
              className={styles.couponInput}
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Código do cupom"
            />
            <button className={styles.couponBtn} title="Aplicar cupom">
              ➜
            </button>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Valor a pagar</span>
          <span className={styles.summaryValueBold}>{formatCurrency(totalToPay)}</span>
        </div>

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Valor Pago</span>
          <span className={styles.summaryValueBold}>{formatCurrency(totalPaid)}</span>
        </div>

        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Valor Restante</span>
          <span
            className={`${styles.summaryValueBold} ${
              remaining > 0 ? styles.valueRemaining : styles.valueOk
            }`}
          >
            {formatCurrency(remaining)}
          </span>
        </div>

        {totalPaid > 0 && Math.abs(totalPaid - totalToPay) > 0.01 && (
          <div className={styles.warningBox}>
            O valor pago deve ser igual ao valor total a pagar
          </div>
        )}

        {totalPaid > 0 && Math.abs(totalPaid - totalToPay) <= 0.01 && (
          <div className={styles.successBox}>
            Pagamento completo!
          </div>
        )}
      </div>
    </div>
  );
};

export default PDVPayment;
