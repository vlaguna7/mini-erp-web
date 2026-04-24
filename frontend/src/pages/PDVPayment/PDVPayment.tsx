import React, { useState } from 'react';
import { DollarSign, Smartphone, CreditCard, Trash2, Wallet } from 'lucide-react';
import { usePDVStore, PaymentMethod } from '../../store/pdvStore';
import styles from './PDVPayment.module.css';

const PAYMENT_METHODS = [
  { id: 'cash' as PaymentMethod, label: 'Dinheiro', icon: DollarSign },
  { id: 'pix' as PaymentMethod, label: 'Pix', icon: Smartphone },
  { id: 'credit' as PaymentMethod, label: 'Cartão de Crédito', icon: CreditCard },
  { id: 'debit' as PaymentMethod, label: 'Cartão de Débito', icon: CreditCard },
];

const CREDIT_BALANCE_METHOD: PaymentMethod = 'credit_balance';

const CARD_BRANDS = [
  { id: 'visa', label: 'Visa', icon: '𝗩', color: '#1a1f71' },
  { id: 'mastercard', label: 'Mastercard', icon: '𝗠', color: '#eb001b' },
  { id: 'elo', label: 'Elo', icon: '𝗘', color: '#00a4e0' },
  { id: 'amex', label: 'American Express', icon: '𝗔', color: '#006fcf' },
  { id: 'hipercard', label: 'Hipercard', icon: '𝗛', color: '#822124' },
  { id: 'diners', label: 'Diners Club', icon: '𝗗', color: '#0079be' },
];

const MAX_INSTALLMENTS = 12;

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
    selectedClient,
  } = usePDVStore();

  const [amountInput, setAmountInput] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [methodError, setMethodError] = useState<string>('');

  const subtotal = getSubtotal();
  const totalToPay = getTotalToPay();
  const totalPaid = getTotalPaid();
  const remaining = Math.max(0, totalToPay - totalPaid);

  // Saldo de crédito disponível do cliente selecionado (bruto) e já descontando o que está
  // sendo usado no pagamento atual (para permitir múltiplas entradas sem estourar).
  const clientCreditBalance = Number(selectedClient?.creditBalance ?? 0);
  const creditAlreadyUsed = payments
    .filter((p) => p.method === CREDIT_BALANCE_METHOD)
    .reduce((s, p) => s + p.amount, 0);
  const creditAvailable = Math.max(0, clientCreditBalance - creditAlreadyUsed);
  const showCreditBalance = !!selectedClient && clientCreditBalance > 0;

  const fmt = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const parsedAmount = parseFloat((amountInput || '0').replace(',', '.')) || 0;

  const handleSelectMethod = (method: PaymentMethod) => {
    setMethodError('');
    setSelectedMethod(method);
    setSelectedInstallments(1);
    setSelectedBrand(null);
    const rest = Math.max(0, totalToPay - totalPaid);
    // Para saldo de crédito, o teto é min(restante, saldo disponível)
    const cap = method === CREDIT_BALANCE_METHOD ? Math.min(rest, creditAvailable) : rest;
    setAmountInput(cap > 0 ? cap.toFixed(2).replace('.', ',') : '');
  };

  const handleAddPayment = () => {
    if (!selectedMethod) return;
    setMethodError('');

    const parsed = parseFloat(amountInput.replace(',', '.'));
    if (isNaN(parsed) || parsed <= 0) return;
    const maxAllowed = Math.max(0, totalToPay - totalPaid);
    let amount = Math.min(parsed, maxAllowed);
    if (amount <= 0) return;

    if (selectedMethod === 'credit' && !selectedBrand) return;

    if (selectedMethod === CREDIT_BALANCE_METHOD) {
      if (!selectedClient) {
        setMethodError('Selecione um cliente para usar saldo de crédito');
        return;
      }
      if (creditAvailable <= 0) {
        setMethodError('Saldo de crédito esgotado');
        return;
      }
      amount = Math.min(amount, creditAvailable);
      if (amount <= 0) return;
    }

    const info = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    const brandLabel = selectedBrand ? CARD_BRANDS.find((b) => b.id === selectedBrand)?.label : undefined;

    let label: string;
    if (selectedMethod === CREDIT_BALANCE_METHOD) {
      label = 'Saldo de crédito';
    } else {
      label = info?.label || selectedMethod;
      if (selectedMethod === 'credit' && selectedInstallments > 1) {
        label = `${info?.label} ${selectedInstallments}x`;
      }
      if (brandLabel) {
        label += ` (${brandLabel})`;
      }
    }

    addPayment({
      id: `${selectedMethod}-${Date.now()}`,
      method: selectedMethod,
      label,
      amount,
      installments: selectedMethod === 'credit' ? selectedInstallments : undefined,
      cardBrand: selectedMethod === 'credit' ? (selectedBrand || undefined) : undefined,
    });
    setSelectedMethod(null);
    setAmountInput('');
    setSelectedInstallments(1);
    setSelectedBrand(null);
  };

  const handleCancel = () => {
    setSelectedMethod(null);
    setAmountInput('');
    setSelectedInstallments(1);
    setSelectedBrand(null);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddPayment();
    if (e.key === 'Escape') handleCancel();
  };

  const isCredit = selectedMethod === 'credit';

  const installmentOptions = Array.from({ length: MAX_INSTALLMENTS }, (_, i) => {
    const n = i + 1;
    const installmentValue = parsedAmount > 0 ? parsedAmount / n : 0;
    return { n, value: installmentValue };
  });

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
          {showCreditBalance && (
            <button
              key={CREDIT_BALANCE_METHOD}
              className={`${styles.methodCard} ${styles.methodCredit} ${selectedMethod === CREDIT_BALANCE_METHOD ? styles.methodActive : ''}`}
              onClick={() => handleSelectMethod(CREDIT_BALANCE_METHOD)}
              disabled={creditAvailable <= 0}
              title={creditAvailable <= 0 ? 'Saldo de crédito já totalmente utilizado nesta venda' : `Saldo disponível: ${fmt(creditAvailable)}`}
            >
              <Wallet size={24} strokeWidth={1.5} />
              <span>Saldo de crédito</span>
              <span className={styles.methodHint}>{fmt(creditAvailable)}</span>
            </button>
          )}
        </div>

        {methodError && <div className={styles.warn}>{methodError}</div>}

        {selectedMethod && (
          <div className={styles.addRow}>
            <div className={styles.addRowTop}>
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
            </div>

            {isCredit && (
              <div className={styles.creditSelects}>
                <div className={styles.creditField}>
                  <label className={styles.creditFieldLabel}>Parcelas</label>
                  <select
                    className={styles.creditSelect}
                    value={selectedInstallments}
                    onChange={(e) => setSelectedInstallments(Number(e.target.value))}
                  >
                    {installmentOptions.map(({ n, value }) => (
                      <option key={n} value={n}>
                        {n}x de {fmt(value)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.creditField}>
                  <label className={styles.creditFieldLabel}>Bandeira</label>
                  <select
                    className={styles.creditSelect}
                    value={selectedBrand || ''}
                    onChange={(e) => setSelectedBrand(e.target.value || null)}
                  >
                    <option value="">Selecione a bandeira</option>
                    {CARD_BRANDS.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className={styles.addRowActions}>
              <button
                className={styles.addConfirm}
                onClick={handleAddPayment}
                disabled={isCredit && !selectedBrand}
              >
                Confirmar
              </button>
              <button className={styles.addCancel} onClick={handleCancel}>Cancelar</button>
            </div>
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
