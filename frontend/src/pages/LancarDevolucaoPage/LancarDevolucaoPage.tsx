import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FileText,
  Package,
  DollarSign,
  CheckSquare,
  ChevronRight,
  Info,
  X,
  ArrowLeft,
  User,
  Clock,
  ShoppingCart,
  ScanLine,
  CheckCircle,
  Check,
  Minus,
  Plus,
} from 'lucide-react';
import { saleService } from '../../services/saleService';
import { clientService } from '../../services/clientService';
import { productService } from '../../services/productService';
import { returnService, ResolutionMethod } from '../../services/returnService';
import {
  SearchableModal,
  SearchableSelectTrigger,
  SearchableItem,
} from '../../components/SearchableModal';
import styles from './LancarDevolucaoPage.module.css';

const fmtBRL = (v: number | string) =>
  Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

const todayISO = () => new Date().toISOString().slice(0, 10);
const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

interface SaleItemDto {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: string | number;
  subtotal: string | number;
  product: { id: number; name: string; code: string };
}

interface SaleDto {
  id: number;
  totalValue: string | number;
  subtotal?: string | number;
  saleDate: string;
  createdAt: string;
  clientId: number | null;
  sellerId: number | null;
  client: { id: number; name: string } | null;
  seller: { id: number; name: string } | null;
  items: SaleItemDto[];
  payments?: Array<{ amount: string | number }>;
}

interface ReturnQtyMap {
  [saleItemId: number]: number;
}

const STEPS = [
  { label: 'Buscar Vendas', icon: Search },
  { label: 'Vendas', icon: FileText },
  { label: 'Produtos', icon: Package },
  { label: 'Financeiro', icon: DollarSign },
  { label: 'Revisar', icon: CheckSquare },
];

const METHOD_OPTIONS: { value: ResolutionMethod; title: string; desc: string }[] = [
  { value: 'TROCA', title: 'Trocar Produtos', desc: 'Registra a devolução, o estoque volta. A troca é lançada em uma nova venda.' },
  { value: 'DEVOLVER_PAGAMENTO', title: 'Devolver Pagamentos', desc: 'Gera uma despesa financeira no valor devolvido ao cliente.' },
  { value: 'GERAR_CREDITO', title: 'Gerar Crédito', desc: 'Registra o crédito ao cliente para uso futuro (controlado no financeiro).' },
];

const LancarDevolucaoPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeStep, setActiveStep] = useState(0);

  // ── Step 1: filtros ──
  const [filterSaleId, setFilterSaleId] = useState('');
  const [filterDocFiscal, setFilterDocFiscal] = useState('');
  const [filterProductId, setFilterProductId] = useState('');
  const [filterClientId, setFilterClientId] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState(daysAgoISO(30));
  const [filterDateTo, setFilterDateTo] = useState(todayISO());
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // ── Lookups ──
  const [clients, setClients] = useState<Array<{ id: number; name: string }>>([]);
  const [products, setProducts] = useState<Array<{ id: number; name: string; code: string }>>([]);

  // ── Step 2: resultados ──
  const [sales, setSales] = useState<SaleDto[]>([]);
  const [selectedSale, setSelectedSale] = useState<SaleDto | null>(null);

  // ── Step 3: quantidades a devolver ──
  const [returnQty, setReturnQty] = useState<ReturnQtyMap>({});
  const [scannerActive, setScannerActive] = useState(false);
  const [flashItemId, setFlashItemId] = useState<number | null>(null);
  const scanBufferRef = useRef('');
  const scanBufferTimerRef = useRef<number | null>(null);

  // ── Step 4: método e cliente do crédito ──
  const [resolutionMethod, setResolutionMethod] = useState<ResolutionMethod | ''>('');
  const [creditClientId, setCreditClientId] = useState<string>('');
  const [observation, setObservation] = useState('');

  // ── Submissão ──
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  // ── Modais de busca ──
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [clientFilterModalOpen, setClientFilterModalOpen] = useState(false);
  const [creditClientModalOpen, setCreditClientModalOpen] = useState(false);

  // ── Items para o SearchableModal (nome + tokens de busca por nome/SKU) ──
  const productItems: SearchableItem[] = useMemo(
    () =>
      products.map((p) => ({
        id: p.id,
        primary: p.name,
        secondary: p.code ? `SKU: ${p.code}` : undefined,
        searchTokens: [p.name, p.code].filter(Boolean) as string[],
      })),
    [products]
  );

  const clientItems: SearchableItem[] = useMemo(
    () =>
      clients.map((c) => ({
        id: c.id,
        primary: c.name,
        searchTokens: [c.name],
      })),
    [clients]
  );

  const selectedFilterProduct = useMemo(() => {
    if (!filterProductId) return null;
    return productItems.find((p) => String(p.id) === filterProductId) || null;
  }, [filterProductId, productItems]);

  const selectedFilterClient = useMemo(() => {
    if (!filterClientId) return null;
    return clientItems.find((c) => String(c.id) === filterClientId) || null;
  }, [filterClientId, clientItems]);

  const selectedCreditClient = useMemo(() => {
    if (!creditClientId) return null;
    return clientItems.find((c) => String(c.id) === creditClientId) || null;
  }, [creditClientId, clientItems]);

  useEffect(() => {
    (async () => {
      try {
        const [cli, prodsResp] = await Promise.all([
          clientService.getClients(1, 500),
          productService.getProducts(1, 500),
        ]);
        const cliList = Array.isArray(cli) ? cli : cli.clients || [];
        setClients(cliList.map((c: any) => ({ id: c.id, name: c.name })));
        const prodList: any[] = Array.isArray(prodsResp) ? prodsResp : [];
        setProducts(prodList.map((p: any) => ({ id: p.id, name: p.name, code: p.code })));
      } catch {
        /* ignora — a página ainda funciona sem dropdowns completos */
      }
    })();
  }, []);

  // ── Quando a venda é selecionada, reseta quantidades ──
  useEffect(() => {
    if (!selectedSale) {
      setReturnQty({});
      return;
    }
    const initial: ReturnQtyMap = {};
    selectedSale.items.forEach((it) => {
      initial[it.id] = it.quantity;
    });
    setReturnQty(initial);
  }, [selectedSale]);

  // ── Reset do cliente do crédito ao trocar venda ──
  useEffect(() => {
    setCreditClientId(selectedSale?.clientId ? String(selectedSale.clientId) : '');
  }, [selectedSale]);

  const handleSearchSales = async () => {
    setSearchError('');
    setSearching(true);
    try {
      const parseId = (v: string) => {
        const n = parseInt(v, 10);
        return Number.isFinite(n) && n > 0 ? n : undefined;
      };
      // "Número da venda ou cód. de barras" — se for número puro, trata como sale_id;
      // se tiver letras/outros, trata como barcode.
      let sale_id: number | undefined;
      let barcode: string | undefined;
      const raw = filterSaleId.trim();
      if (raw) {
        if (/^\d+$/.test(raw)) sale_id = parseInt(raw, 10);
        else barcode = raw;
      }
      // "Documento fiscal" mapeia pra sale_id enquanto o schema não tiver campo dedicado
      if (!sale_id && filterDocFiscal.trim() && /^\d+$/.test(filterDocFiscal.trim())) {
        sale_id = parseInt(filterDocFiscal.trim(), 10);
      }

      const resp = await saleService.searchSales({
        sale_id,
        barcode,
        product_id: parseId(filterProductId),
        client_id: parseId(filterClientId),
        date_from: filterDateFrom || undefined,
        date_to: filterDateTo || undefined,
      });
      setSales(resp.sales as SaleDto[]);
      setSelectedSale(null);
      setActiveStep(1);
    } catch (err: any) {
      setSearchError(err?.response?.data?.error || 'Erro ao buscar vendas. Tente novamente.');
    } finally {
      setSearching(false);
    }
  };

  // ── Stepper ──
  const renderStepper = () => {
    const ActiveIcon = STEPS[activeStep].icon;
    const progressPct = ((activeStep + 1) / STEPS.length) * 100;
    return (
      <>
        {/* Versão desktop/tablet — ícones em linha */}
        <div className={styles.stepper} aria-hidden="true">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === activeStep;
            const isDone = i < activeStep;
            const cls = `${styles.step} ${isActive ? styles.active : ''} ${isDone ? styles.completed : ''}`;
            return (
              <React.Fragment key={s.label}>
                <div className={cls}>
                  <div className={styles.stepIcon}>
                    <Icon size={24} />
                  </div>
                  <span className={styles.stepLabel}>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && <ChevronRight className={styles.stepArrow} size={20} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Versão mobile — barra de progresso compacta */}
        <div
          className={styles.stepperMobile}
          role="progressbar"
          aria-valuenow={activeStep + 1}
          aria-valuemin={1}
          aria-valuemax={STEPS.length}
          aria-label={`Passo ${activeStep + 1} de ${STEPS.length}: ${STEPS[activeStep].label}`}
        >
          <div className={styles.stepperMobileHead}>
            <div className={styles.stepperMobileIcon}>
              <ActiveIcon size={20} />
            </div>
            <div className={styles.stepperMobileText}>
              <span className={styles.stepperMobileCount}>
                Passo {activeStep + 1} de {STEPS.length}
              </span>
              <span className={styles.stepperMobileTitle}>{STEPS[activeStep].label}</span>
            </div>
          </div>
          <div className={styles.stepperMobileTrack}>
            <div className={styles.stepperMobileFill} style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </>
    );
  };

  // ── STEP 1: Buscar ──
  const renderStep1 = () => (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Preencha um ou mais campos para buscar a venda que deseja devolver</h2>
      {searchError && <div className={styles.globalError}>{searchError}</div>}
      <div className={styles.grid}>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            Número da venda ou cód. de barras
            <span className={styles.fieldHint} title="Digite o ID numérico da venda ou o código de barras do produto"><Info size={14} /></span>
          </label>
          <input
            type="text"
            value={filterSaleId}
            onChange={(e) => setFilterSaleId(e.target.value)}
            placeholder="Número da venda"
            maxLength={50}
            inputMode="search"
            enterKeyHint="search"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Número documento Fiscal</label>
          <input
            type="text"
            value={filterDocFiscal}
            onChange={(e) => setFilterDocFiscal(e.target.value)}
            placeholder="Número documento Fiscal"
            maxLength={50}
            inputMode="search"
            enterKeyHint="search"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Produto</label>
          <SearchableSelectTrigger
            placeholder="Selecione um produto"
            icon={<Package size={16} />}
            selected={selectedFilterProduct}
            onOpen={() => setProductModalOpen(true)}
            onClear={() => setFilterProductId('')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Data Inicial</label>
          <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>Data Final</label>
          <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
        </div>
        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            Cliente
            <span className={styles.fieldHint} title="Filtrar vendas deste cliente"><Info size={14} /></span>
          </label>
          <SearchableSelectTrigger
            placeholder="Selecione um cadastro"
            icon={<User size={16} />}
            selected={selectedFilterClient}
            onOpen={() => setClientFilterModalOpen(true)}
            onClear={() => setFilterClientId('')}
          />
        </div>
      </div>
    </div>
  );

  // ── STEP 2: Vendas ──
  const renderStep2 = () => (
    <>
      <div className={styles.filterBar}>
        <h3 className={styles.filterBarTitle}>Filtros Aplicados</h3>
        <div className={styles.filterChips}>
          {filterDateFrom && (
            <span className={styles.chip}><span className={styles.chipLabel}>Data Inicial</span><span className={styles.chipValue}>{new Date(filterDateFrom).toLocaleDateString('pt-BR')}</span></span>
          )}
          {filterDateTo && (
            <span className={styles.chip}><span className={styles.chipLabel}>Data Final</span><span className={styles.chipValue}>{new Date(filterDateTo).toLocaleDateString('pt-BR')}</span></span>
          )}
          {filterSaleId && (
            <span className={styles.chip}><span className={styles.chipLabel}>Número/Barcode</span><span className={styles.chipValue}>{filterSaleId}</span></span>
          )}
          {filterClientId && (
            <span className={styles.chip}><span className={styles.chipLabel}>Cliente</span><span className={styles.chipValue}>{clients.find(c => c.id === parseInt(filterClientId))?.name || filterClientId}</span></span>
          )}
          {filterProductId && (
            <span className={styles.chip}><span className={styles.chipLabel}>Produto</span><span className={styles.chipValue}>{products.find(p => p.id === parseInt(filterProductId))?.name || filterProductId}</span></span>
          )}
        </div>
      </div>

      {sales.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.empty}>
            <Package size={48} className={styles.emptyIcon} />
            <p>Nenhuma venda encontrada com os filtros aplicados.</p>
          </div>
        </div>
      ) : (
        <div className={styles.saleList}>
          {sales.map((sale) => {
            const isSel = selectedSale?.id === sale.id;
            return (
              <button
                key={sale.id}
                type="button"
                className={`${styles.saleCard} ${isSel ? styles.selected : ''}`}
                onClick={() => setSelectedSale(isSel ? null : sale)}
              >
                <div className={styles.saleCardHeader}>
                  <span className={styles.saleIdBadge}><ShoppingCart size={14} /> {sale.id}</span>
                  <span className={styles.saleDateBadge}><Clock size={14} /> {fmtDateTime(sale.saleDate || sale.createdAt)}</span>
                  <span className={styles.saleTotalBadge}>{fmtBRL(sale.totalValue)}</span>
                </div>
                <div className={styles.saleCardBody}>
                  <div className={styles.saleCardField}>
                    <span className={styles.saleFieldLabel}>Cliente</span>
                    <span className={`${styles.saleFieldValue} ${!sale.client ? styles.muted : ''}`}>
                      <User size={14} /> {sale.client?.name || '—'}
                    </span>
                  </div>
                  <div className={styles.saleCardField}>
                    <span className={styles.saleFieldLabel}>Vendedor</span>
                    <span className={`${styles.saleFieldValue} ${!sale.seller ? styles.muted : ''}`}>
                      {sale.seller?.name || '—'}
                    </span>
                  </div>
                  <div className={styles.saleCardField}>
                    <span className={styles.saleFieldLabel}>Produtos</span>
                    <ul className={styles.saleProductsList}>
                      {sale.items.map((it) => (
                        <li key={it.id}>{it.quantity} {it.quantity > 1 ? 'un' : 'un'} x {it.product.name}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </>
  );

  // ── STEP 3: Produtos ──
  const handleSetAll = (all: boolean) => {
    if (!selectedSale) return;
    const next: ReturnQtyMap = {};
    selectedSale.items.forEach((it) => {
      next[it.id] = all ? it.quantity : 0;
    });
    setReturnQty(next);
  };

  const setItemQty = (saleItemId: number, rawValue: number, max: number) => {
    const v = Number.isFinite(rawValue) ? Math.max(0, Math.min(max, Math.trunc(rawValue))) : 0;
    setReturnQty((prev) => ({ ...prev, [saleItemId]: v }));
  };

  const registerScan = (code: string) => {
    if (!selectedSale) return;
    const match = selectedSale.items.find(
      (it) => it.product.code.toLowerCase() === code.toLowerCase()
    );
    if (!match) {
      setSubmitError('Produto não encontrado nesta venda');
      return;
    }
    setSubmitError('');
    setReturnQty((prev) => ({
      ...prev,
      [match.id]: Math.min((prev[match.id] || 0) + 1, match.quantity),
    }));
    setFlashItemId(match.id);
    window.setTimeout(() => {
      setFlashItemId((id) => (id === match.id ? null : id));
    }, 600);
  };

  // F8 alterna o scanner (sempre ativo na página, independente do step)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F8') {
        e.preventDefault();
        setScannerActive((s) => !s);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Listener global do scanner — captura tecla por tecla quando ativo
  useEffect(() => {
    if (!scannerActive) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName?.toLowerCase();
      const isTypingField = tag === 'input' || tag === 'textarea' || tag === 'select' || (target?.isContentEditable ?? false);
      if (isTypingField) return; // não interfere em inputs de busca/quantidade
      if (e.key === 'Enter') {
        e.preventDefault();
        const code = scanBufferRef.current.trim();
        scanBufferRef.current = '';
        if (code) registerScan(code);
        return;
      }
      if (e.key.length === 1) {
        scanBufferRef.current += e.key;
        if (scanBufferTimerRef.current) window.clearTimeout(scanBufferTimerRef.current);
        scanBufferTimerRef.current = window.setTimeout(() => {
          scanBufferRef.current = '';
        }, 400);
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
      if (scanBufferTimerRef.current) window.clearTimeout(scanBufferTimerRef.current);
      scanBufferRef.current = '';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannerActive, selectedSale]);

  const renderStep3 = () => {
    if (!selectedSale) return null;
    const selectedCount = Object.values(returnQty).filter((q) => q > 0).length;
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Selecione os produtos a serem devolvidos</h2>
        {submitError && <div className={styles.globalError}>{submitError}</div>}

        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <button
              type="button"
              className={`${styles.scanBtn} ${scannerActive ? styles.active : ''}`}
              onClick={() => setScannerActive((s) => !s)}
              aria-pressed={scannerActive}
              title="Alterna leitura via scanner (F8)"
            >
              <span className={styles.scanPulse} />
              <ScanLine size={16} />
              {scannerActive ? (
                <>
                  <span className={styles.scanLabelFull}>Escutando leitor...</span>
                  <span className={styles.scanLabelShort}>Escutando...</span>
                </>
              ) : (
                <>
                  <span className={styles.scanLabelFull}>Ler código de barras (F8)</span>
                  <span className={styles.scanLabelShort}>Ler código</span>
                </>
              )}
            </button>
          </div>
          <div className={styles.toolbarRight}>
            <button type="button" className={styles.ghostBtn} onClick={() => handleSetAll(true)}>
              <Check size={14} /> Todos
            </button>
            <button type="button" className={styles.ghostBtn} onClick={() => handleSetAll(false)}>
              <X size={14} /> Nenhum
            </button>
          </div>
        </div>

        <div className={styles.selectionSummary}>
          <div className={styles.selectionSummaryItem}>
            <span className={styles.selectionSummaryLabel}>Produtos</span>
            <span className={styles.selectionSummaryValue}>
              {selectedCount} / {selectedSale.items.length}
            </span>
          </div>
          <div className={styles.selectionSummaryItem}>
            <span className={styles.selectionSummaryLabel}>Unidades</span>
            <span className={styles.selectionSummaryValue}>{totals.qty}</span>
          </div>
          <div className={styles.selectionSummaryItem} style={{ marginLeft: 'auto' }}>
            <span className={styles.selectionSummaryLabel}>Total a devolver</span>
            <span className={`${styles.selectionSummaryValue} ${styles.accent}`}>{fmtBRL(totals.refund)}</span>
          </div>
        </div>

        <div className={styles.productCards}>
          {selectedSale.items.map((it) => {
            const current = returnQty[it.id] ?? 0;
            const isSel = current > 0;
            const subtotal = Number(it.unitPrice) * current;
            const cls = `${styles.productCard} ${isSel ? styles.selected : ''} ${flashItemId === it.id ? styles.flash : ''}`;
            const toggle = () => {
              setReturnQty((prev) => ({ ...prev, [it.id]: isSel ? 0 : it.quantity }));
            };
            return (
              <div key={it.id} className={cls}>
                <button
                  type="button"
                  className={styles.selectBox}
                  onClick={toggle}
                  aria-pressed={isSel}
                  aria-label={isSel ? `Desmarcar ${it.product.name}` : `Selecionar ${it.product.name}`}
                >
                  {isSel && <Check size={16} />}
                </button>

                <div className={styles.productMain}>
                  <span className={styles.productName}>{it.product.name}</span>
                  <div className={styles.productMetaRow}>
                    <span className={styles.productMetaItem}>SKU: <strong>{it.product.code}</strong></span>
                    <span className={styles.productMetaItem}>Disponível: <strong>{it.quantity}</strong></span>
                    <span className={styles.productMetaItem}>Valor un.: <strong>{fmtBRL(it.unitPrice)}</strong></span>
                  </div>
                </div>

                <div className={styles.qtyStepper}>
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => setItemQty(it.id, current - 1, it.quantity)}
                    disabled={current <= 0}
                    aria-label="Diminuir quantidade"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    className={styles.qtyValue}
                    type="number"
                    min={0}
                    max={it.quantity}
                    value={current}
                    onChange={(e) => {
                      const raw = parseInt(e.target.value, 10);
                      setItemQty(it.id, raw, it.quantity);
                    }}
                    inputMode="numeric"
                    aria-label={`Quantidade a devolver de ${it.product.name}`}
                  />
                  <button
                    type="button"
                    className={styles.qtyBtn}
                    onClick={() => setItemQty(it.id, current + 1, it.quantity)}
                    disabled={current >= it.quantity}
                    aria-label="Aumentar quantidade"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className={styles.productSubtotal}>
                  <span className={styles.productSubtotalLabel}>Subtotal</span>
                  <span className={styles.productSubtotalValue}>{fmtBRL(subtotal)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Totais derivados ──
  const totals = useMemo(() => {
    if (!selectedSale) return { refund: 0, qty: 0, saleTotal: 0, paid: 0 };
    let refund = 0;
    let qty = 0;
    selectedSale.items.forEach((it) => {
      const q = returnQty[it.id] || 0;
      if (q > 0) {
        qty += q;
        refund += Number(it.unitPrice) * q;
      }
    });
    const saleTotal = Number(selectedSale.totalValue);
    const paid = selectedSale.payments?.reduce((s, p) => s + Number(p.amount), 0) ?? saleTotal;
    return { refund, qty, saleTotal, paid };
  }, [selectedSale, returnQty]);

  // ── STEP 4: Financeiro ──
  const renderStep4 = () => {
    if (!selectedSale) return null;
    const open = totals.saleTotal - totals.paid;
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Selecione o que deseja fazer com o valor da devolução</h2>
        {submitError && <div className={styles.globalError}>{submitError}</div>}
        <div className={styles.summaryGrid}>
          <div className={styles.summaryCard}>
            <span className={styles.summaryValue}>{fmtBRL(totals.saleTotal)}</span>
            <span className={styles.summaryLabel}>Valor da Venda</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryValue}>{fmtBRL(totals.paid)}</span>
            <span className={styles.summaryLabel}>Valor Pago</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryValue}>{fmtBRL(open > 0 ? open : 0)}</span>
            <span className={styles.summaryLabel}>Valor Aberto</span>
          </div>
          <div className={styles.summaryCard}>
            <span className={styles.summaryValue} style={{ color: 'var(--color-success)' }}>{fmtBRL(totals.refund)}</span>
            <span className={styles.summaryLabel}>Valor da Devolução</span>
          </div>
        </div>

        <div className={styles.field} style={{ marginBottom: 'var(--spacing-lg)' }}>
          <label className={styles.fieldLabel}>
            Cliente
            <span className={styles.fieldHint} title="Cliente que receberá o pagamento/crédito"><Info size={14} /></span>
          </label>
          <SearchableSelectTrigger
            placeholder="Selecione um cliente"
            icon={<User size={16} />}
            selected={selectedCreditClient}
            onOpen={() => setCreditClientModalOpen(true)}
            onClear={() => setCreditClientId('')}
          />
        </div>

        <div className={styles.methodGrid}>
          {METHOD_OPTIONS.map((opt) => {
            const isSel = resolutionMethod === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                className={`${styles.methodOption} ${isSel ? styles.selected : ''}`}
                onClick={() => setResolutionMethod(opt.value)}
              >
                <span className={styles.methodRadio} />
                <div className={styles.methodBody}>
                  <span className={styles.methodTitle}>{opt.title}</span>
                  <span className={styles.methodDesc}>{opt.desc}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.field} style={{ marginTop: 'var(--spacing-lg)' }}>
          <label className={styles.fieldLabel}>Observação (opcional)</label>
          <textarea
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Anotação sobre o motivo da devolução"
            maxLength={255}
            rows={3}
          />
        </div>
      </div>
    );
  };

  // ── STEP 5: Revisar ──
  const selectedItems = useMemo(() => {
    if (!selectedSale) return [];
    return selectedSale.items
      .filter((it) => (returnQty[it.id] || 0) > 0)
      .map((it) => ({ ...it, returnQuantity: returnQty[it.id] }));
  }, [selectedSale, returnQty]);

  const renderStep5 = () => {
    if (!selectedSale) return null;
    const methodLabel = METHOD_OPTIONS.find((m) => m.value === resolutionMethod)?.title || '—';
    const clientName = clients.find((c) => c.id === parseInt(creditClientId))?.name || selectedSale.client?.name || '—';
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Revise os dados antes de confirmar a devolução</h2>
        {submitError && <div className={styles.globalError}>{submitError}</div>}

        <div className={styles.reviewGrid}>
          <div className={styles.reviewItem}>
            <div className={styles.reviewItemLabel}>Venda</div>
            <div className={styles.reviewItemValue}>#{selectedSale.id}</div>
          </div>
          <div className={styles.reviewItem}>
            <div className={styles.reviewItemLabel}>Data da venda</div>
            <div className={styles.reviewItemValue}>{fmtDateTime(selectedSale.saleDate || selectedSale.createdAt)}</div>
          </div>
          <div className={styles.reviewItem}>
            <div className={styles.reviewItemLabel}>Cliente</div>
            <div className={styles.reviewItemValue}>{clientName}</div>
          </div>
          <div className={styles.reviewItem}>
            <div className={styles.reviewItemLabel}>Método</div>
            <div className={styles.reviewItemValue}>{methodLabel}</div>
          </div>
          <div className={styles.reviewItem}>
            <div className={styles.reviewItemLabel}>Itens devolvidos</div>
            <div className={styles.reviewItemValue}>{totals.qty}</div>
          </div>
          <div className={styles.reviewItem}>
            <div className={styles.reviewItemLabel}>Total da devolução</div>
            <div className={styles.reviewItemValue} style={{ color: 'var(--color-success)' }}>{fmtBRL(totals.refund)}</div>
          </div>
        </div>

        <div className={styles.tableScroll}>
          <table className={styles.reviewProductsTable}>
            <thead>
              <tr>
                <th>Produto</th>
                <th style={{ textAlign: 'right' }}>Qtd. Devolver</th>
                <th style={{ textAlign: 'right' }}>Valor Un.</th>
                <th style={{ textAlign: 'right' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((it) => (
                <tr key={it.id}>
                  <td>{it.product.name}</td>
                  <td style={{ textAlign: 'right' }}>{it.returnQuantity}</td>
                  <td style={{ textAlign: 'right' }}>{fmtBRL(it.unitPrice)}</td>
                  <td style={{ textAlign: 'right' }}>{fmtBRL(Number(it.unitPrice) * (it.returnQuantity || 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {observation && (
          <div className={styles.reviewItem} style={{ marginTop: 'var(--spacing-lg)' }}>
            <div className={styles.reviewItemLabel}>Observação</div>
            <div className={styles.reviewItemValue} style={{ fontWeight: 'var(--font-weight-regular)' }}>{observation}</div>
          </div>
        )}
      </div>
    );
  };

  // ── Validação por step ──
  const canAdvance = (): boolean => {
    if (activeStep === 0) {
      return true; // permite buscar (backend valida)
    }
    if (activeStep === 1) return !!selectedSale;
    if (activeStep === 2) return totals.qty > 0;
    if (activeStep === 3) return !!resolutionMethod;
    return true;
  };

  const handleNext = async () => {
    setSubmitError('');
    if (activeStep === 0) {
      await handleSearchSales();
      return;
    }
    if (!canAdvance()) {
      if (activeStep === 1) setSubmitError('Selecione uma venda para continuar');
      if (activeStep === 2) setSubmitError('Informe ao menos 1 unidade para devolver');
      if (activeStep === 3) setSubmitError('Selecione o método de devolução');
      return;
    }
    setActiveStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const handleBack = () => {
    setSubmitError('');
    setActiveStep((s) => Math.max(0, s - 1));
  };

  const handleConfirm = async () => {
    if (!selectedSale || !resolutionMethod) return;
    setSubmitError('');
    setSubmitting(true);
    try {
      const items = selectedSale.items
        .filter((it) => (returnQty[it.id] || 0) > 0)
        .map((it) => ({ saleItemId: it.id, quantity: returnQty[it.id] }));

      await returnService.create({
        saleId: selectedSale.id,
        items,
        resolutionMethod,
        clientId: creditClientId ? parseInt(creditClientId) : selectedSale.clientId ?? undefined,
        observation: observation.trim() || undefined,
      });

      setSuccessOpen(true);
      setTimeout(() => navigate('/vendas-e-clientes'), 1800);
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.error ||
        'Erro ao registrar devolução';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => navigate('/vendas-e-clientes');

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Devolução — {STEPS[activeStep].label}</h1>

      {renderStepper()}

      {activeStep === 0 && renderStep1()}
      {activeStep === 1 && renderStep2()}
      {activeStep === 2 && renderStep3()}
      {activeStep === 3 && renderStep4()}
      {activeStep === 4 && renderStep5()}

      <div className={styles.footer}>
        <div className={styles.footerLeft}>
          <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={handleCancel}>
            <X size={16} /> Cancelar
          </button>
          {activeStep > 0 && (
            <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={handleBack}>
              <ArrowLeft size={16} /> Voltar
            </button>
          )}
        </div>
        <div className={styles.footerRight}>
          {activeStep === 1 && !selectedSale && sales.length > 0 && (
            <span className={styles.footerHint}><Info size={14} /> Selecione uma venda para continuar</span>
          )}
          {activeStep < STEPS.length - 1 ? (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleNext}
              disabled={searching}
            >
              {activeStep === 0 ? (searching ? 'Buscando...' : <>Buscar vendas <ChevronRight size={16} /></>) : <>Continuar <ChevronRight size={16} /></>}
            </button>
          ) : (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? 'Registrando...' : <>Confirmar devolução <CheckCircle size={16} /></>}
            </button>
          )}
        </div>
      </div>

      <SearchableModal
        open={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        title="Buscar produto"
        placeholder="Digite o nome ou SKU do produto..."
        items={productItems}
        selectedId={filterProductId ? parseInt(filterProductId) : null}
        onSelect={(it) => setFilterProductId(String(it.id))}
        icon={<Package size={16} />}
        emptyHint="Tente buscar por outro nome ou código SKU"
      />

      <SearchableModal
        open={clientFilterModalOpen}
        onClose={() => setClientFilterModalOpen(false)}
        title="Buscar cliente"
        placeholder="Digite o nome do cliente..."
        items={clientItems}
        selectedId={filterClientId ? parseInt(filterClientId) : null}
        onSelect={(it) => setFilterClientId(String(it.id))}
        icon={<User size={16} />}
        emptyHint="Nenhum cliente corresponde à busca"
      />

      <SearchableModal
        open={creditClientModalOpen}
        onClose={() => setCreditClientModalOpen(false)}
        title="Selecionar cliente"
        placeholder="Digite o nome do cliente..."
        items={clientItems}
        selectedId={creditClientId ? parseInt(creditClientId) : null}
        onSelect={(it) => setCreditClientId(String(it.id))}
        icon={<User size={16} />}
        emptyHint="Nenhum cliente corresponde à busca"
      />

      <AnimatePresence>
        {successOpen && (
          <motion.div
            className={styles.successOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className={styles.successCard}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <div className={styles.successIconWrap}>
                <CheckCircle size={40} />
              </div>
              <h2 className={styles.successTitle}>Devolução registrada!</h2>
              <p className={styles.successSubtitle}>Redirecionando...</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LancarDevolucaoPage;
