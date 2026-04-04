import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ChevronDown, ChevronRight, User } from 'lucide-react';
import { usePDVStore } from '../../store/pdvStore';
import { clientService } from '../../services/clientService';
import { saleService } from '../../services/saleService';
import styles from './PDVFinalize.module.css';

const PAYMENT_LABELS: Record<string, string> = {
  cash: 'Dinheiro',
  pix: 'Pix',
  credit: 'Cartão de Crédito',
  debit: 'Cartão de Débito',
};

const PRESENCE_OPTIONS = [
  { value: 'presencial', label: 'Venda presencial' },
  { value: 'entrega_domicilio', label: 'Venda com entrega em domicílio' },
  { value: 'internet', label: 'Venda pela internet' },
  { value: 'nao_presencial', label: 'Operação não presencial, outros' },
];

const SALE_CATEGORY_OPTIONS = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'presencial', label: 'Presencial' },
  { value: 'tele', label: 'Tele' },
];

const PDVFinalize: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    selectedClient,
    selectedPayment,
    payments,
    selectedSeller,
    setSelectedSeller,
    presenceIndicator,
    setPresenceIndicator,
    saleCategory,
    setSaleCategory,
    observation,
    setObservation,
    printExchangeReceipt,
    setPrintExchangeReceipt,
    discount,
    surcharge,
    getTotalToPay,
    getTotalPaid,
    getSubtotal,
    resetPDV,
    setLastSaleId,
  } = usePDVStore();

  const [sellers, setSellers] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showObservation, setShowObservation] = useState(!!observation);

  const totalToPay = getTotalToPay();
  const totalPaid = getTotalPaid();
  const subtotal = getSubtotal();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const hasPayments = payments.length > 0;
  const isPaymentComplete = hasPayments && Math.abs(totalPaid - totalToPay) <= 0.01;

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      const data = await clientService.getClients(1, 200);
      const list = Array.isArray(data) ? data : data?.clients ?? [];
      setSellers(list);
    } catch (error) {
      console.error('Erro ao carregar cadastros:', error);
    }
  };

  const fmt = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });



  const handleSaveSale = async () => {
    if (!selectedClient || (!selectedPayment && payments.length === 0) || cart.length === 0) {
      alert('Por favor, preencha todos os campos: Cliente, Pagamento e produtos');
      return;
    }

    if (!isPaymentComplete) {
      alert('O valor pago deve ser igual ao valor total a pagar');
      return;
    }

    setIsSaving(true);
    try {
      const saleData = {
        client_id: Number(selectedClient.id),
        seller_id: selectedSeller?.id ? Number(selectedSeller.id) : null,
        payments: payments.map((p) => ({
          method: p.method,
          label: p.label,
          amount: p.amount,
          installments: p.installments,
          cardBrand: p.cardBrand,
        })),
        presence_indicator: presenceIndicator,
        sale_category: saleCategory,
        observation,
        items: cart.map((item) => ({
          product_id: Number(item.id),
          quantity: item.quantity,
          unit_price: item.price,
        })),
        subtotal,
        discount,
        surcharge,
        total: totalToPay,
      };

      const sale = await saleService.createSale(saleData);
      setLastSaleId(sale.id);
      resetPDV();
      navigate('/pdv/sucesso');
    } catch (error: any) {
      console.error('Erro ao salvar venda:', error);
      const msg = error.response?.data?.error || 'Erro ao realizar venda';
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* ── INFORMAÇÕES ADICIONAIS ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Informações Adicionais</h2>

        <div className={styles.fieldsRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>
              Vendedor <span className={styles.infoIcon} title="Selecione o vendedor responsável">&#9432;</span>
            </label>
            <select
              value={selectedSeller?.id || ''}
              onChange={(e) => {
                const seller = sellers.find((s) => String(s.id) === e.target.value);
                if (seller) {
                  setSelectedSeller({ id: String(seller.id), name: seller.name, email: seller.email });
                } else {
                  setSelectedSeller(null);
                }
              }}
              className={styles.select}
            >
              <option value="">Selecione um cadastro</option>
              {sellers.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Indicador de presença</label>
            <select
              value={presenceIndicator}
              onChange={(e) => setPresenceIndicator(e.target.value)}
              className={styles.select}
            >
              {PRESENCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel}>Categoria da venda</label>
            <select
              value={saleCategory}
              onChange={(e) => setSaleCategory(e.target.value)}
              className={styles.select}
            >
              {SALE_CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.extraOptions}>
          <button
            type="button"
            className={styles.toggleObservation}
            onClick={() => setShowObservation(!showObservation)}
          >
            {showObservation ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Adicionar Observação
          </button>

          {showObservation && (
            <textarea
              className={styles.observationInput}
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Digite uma observação..."
              rows={3}
            />
          )}

          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={printExchangeReceipt}
              onChange={(e) => setPrintExchangeReceipt(e.target.checked)}
              className={styles.checkbox}
            />
            Imprimir comprovante de troca
          </label>
        </div>
      </section>

      {/* ── CLIENTE ── */}
      <section className={styles.section}>
        <div className={styles.clientRow}>
          <h2 className={styles.sectionTitle}>Cliente</h2>
          <button
            type="button"
            className={styles.changeLink}
            onClick={() => navigate('/pdv/cliente')}
          >
            (alterar)
          </button>
        </div>
        <div className={styles.clientInfo}>
          <User size={18} className={styles.clientIcon} />
          <span className={styles.clientName}>
            {selectedClient?.name || 'Nenhum cliente selecionado'}
          </span>
        </div>
      </section>

      {/* ── PAGAMENTO ── */}
      <section className={styles.section}>
        <div className={styles.clientRow}>
          <h2 className={styles.sectionTitle}>Pagamento</h2>
          <button
            type="button"
            className={styles.changeLink}
            onClick={() => navigate('/pdv/pagamento')}
          >
            (alterar)
          </button>
        </div>

        {payments.length > 0 ? (
          <div className={styles.paymentsList}>
            {payments.map((p, idx) => (
              <div key={p.id} className={styles.paymentItem}>
                <span className={styles.paymentIndex}>{idx + 1}.</span>
                <span className={styles.paymentMethod}>{p.label}</span>
                <span className={styles.paymentCondition}>à vista</span>
                <span className={styles.paymentAmount}>{fmt(p.amount)}</span>
              </div>
            ))}
            <div className={styles.paymentTotal}>
              <span>Total</span>
              <span>{fmt(totalPaid)}</span>
            </div>
          </div>
        ) : (
          <p className={styles.emptyMsg}>Nenhum pagamento adicionado</p>
        )}
      </section>

      {/* ── PRODUTOS ── */}
      <section className={styles.section}>
        <div className={styles.clientRow}>
          <h2 className={styles.sectionTitle}>
            Produtos ({totalItems} {totalItems === 1 ? 'item' : 'itens'})
          </h2>
          <button
            type="button"
            className={styles.changeLink}
            onClick={() => navigate('/pdv/produtos')}
          >
            (alterar)
          </button>
        </div>

        {cart.length > 0 ? (
          <div className={styles.productsTable}>
            <div className={styles.tableHeader}>
              <span className={styles.colHash}>#</span>
              <span className={styles.colItem}>Item</span>
              <span className={styles.colQty}>Qtd.</span>
              <span className={styles.colTotal}>Total</span>
            </div>
            {cart.map((item, index) => (
              <div key={item.id} className={styles.tableRow}>
                <span className={styles.colHash}>{index + 1}</span>
                <span className={styles.colItem}>{item.name}</span>
                <span className={styles.colQty}>{item.quantity}</span>
                <span className={styles.colTotal}>{fmt(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className={styles.tableFooter}>
              <span className={styles.footerLabel}>Total dos produtos</span>
              <span className={styles.colQty}>{totalItems}</span>
              <span className={styles.colTotal}>{fmt(subtotal)}</span>
            </div>
          </div>
        ) : (
          <p className={styles.emptyMsg}>Nenhum produto no carrinho</p>
        )}
      </section>

      {/* ── BOTÃO SALVAR ── */}
      <button
        className={styles.saveBtn}
        onClick={handleSaveSale}
        disabled={isSaving || cart.length === 0 || !selectedClient || !isPaymentComplete}
      >
        <Save size={18} />
        {isSaving ? 'Salvando...' : 'Salvar Venda'}
      </button>
    </div>
  );
};

export default PDVFinalize;
