import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, ShoppingBag, DollarSign, TrendingUp, Clock,
  ChevronDown, ChevronUp, Package, CreditCard, Calendar, Users,
  Phone, Mail, MapPin, Instagram, FileText, User as UserIcon, Wallet,
} from 'lucide-react';
import { clientService, ClientPurchase } from '../../services/clientService';
import styles from './VerClientePage.module.css';

type TabKey = 'dados' | 'historico';

interface ClientData {
  id: number;
  name: string;
  personType?: string | null;
  cpfCnpj?: string | null;
  gender?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  instagram?: string | null;
  email?: string | null;
  category?: string | null;
  photo?: string | null;
  zipCode?: string | null;
  street?: string | null;
  number?: string | null;
  complement?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  observations?: string | null;
  creditBalance?: string | number | null;
  createdAt?: string;
}

interface PurchaseStats {
  totalSales: number;
  totalSpent: number;
  averageTicket: number;
  firstPurchaseDate: string | null;
  lastPurchaseDate: string | null;
}

const fmtCurrency = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtCpfCnpj = (value?: string | null) => {
  if (!value) return '—';
  const d = value.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return value;
};

const fmtPhone = (value?: string | null) => {
  if (!value) return '—';
  const d = value.replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  if (d.length === 10) return d.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  return value;
};

const fmtCep = (value?: string | null) => {
  if (!value) return '—';
  const d = value.replace(/\D/g, '');
  if (d.length === 8) return d.replace(/(\d{5})(\d{3})/, '$1-$2');
  return value;
};

const fmtDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fmtBirthDate = (value?: string | null) => {
  if (!value) return '—';
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    return `${d}/${m}/${y}`;
  }
  return value;
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const personTypeLabel = (t?: string | null) => {
  if (t === 'fisica') return 'Pessoa Física';
  if (t === 'juridica') return 'Pessoa Jurídica';
  return '—';
};

const VerClientePage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const clientId = Number(id);

  const [client, setClient] = useState<ClientData | null>(null);
  const [purchases, setPurchases] = useState<ClientPurchase[]>([]);
  const [stats, setStats] = useState<PurchaseStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('dados');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!Number.isFinite(clientId) || clientId < 1) {
      setLoadError('ID de cliente inválido.');
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const [clientData, purchaseData] = await Promise.all([
          clientService.getClient(clientId),
          clientService.getClientPurchases(clientId, 1, 100),
        ]);
        if (cancelled) return;
        setClient(clientData);
        setPurchases(purchaseData.sales);
        setStats(purchaseData.stats);
      } catch (err: any) {
        if (cancelled) return;
        const msg =
          err?.response?.status === 404
            ? 'Cliente não encontrado.'
            : err?.response?.data?.error || 'Erro ao carregar dados do cliente.';
        setLoadError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [clientId]);

  const toggleExpanded = (saleId: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(saleId)) next.delete(saleId);
      else next.add(saleId);
      return next;
    });
  };

  const addressLine = useMemo(() => {
    if (!client) return '';
    const parts = [
      client.street,
      client.number ? `nº ${client.number}` : null,
      client.complement,
      client.neighborhood,
      client.city && client.state ? `${client.city}/${client.state}` : client.city || client.state,
    ].filter(Boolean);
    return parts.join(', ');
  }, [client]);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Carregando cliente...</p>
        </div>
      </div>
    );
  }

  if (loadError || !client) {
    return (
      <div className={styles.page}>
        <div className={styles.errorState}>
          <Users size={48} />
          <p>{loadError || 'Cliente não encontrado.'}</p>
          <button
            type="button"
            className={styles.btnPrimary}
            onClick={() => navigate('/vendas-e-clientes/lista-clientes')}
          >
            Voltar para lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button
          type="button"
          className={styles.backBtn}
          onClick={() => navigate('/vendas-e-clientes/lista-clientes')}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => navigate(`/vendas-e-clientes/editar-cliente/${client.id}`)}
        >
          <Edit2 size={14} /> Editar cliente
        </button>
      </div>

      <header className={styles.header}>
        <h1 className={styles.title}>Ver cliente</h1>
        <p className={styles.subtitle}>
          Visualização completa do cadastro e histórico de compras
        </p>
      </header>

      <section className={styles.identityCard}>
        {client.photo ? (
          <img src={client.photo} alt={client.name} className={styles.identityPhoto} />
        ) : (
          <span className={styles.identityAvatar}>{getInitials(client.name)}</span>
        )}
        <div className={styles.identityInfo}>
          <h2 className={styles.identityName}>{client.name}</h2>
          <div className={styles.identityMeta}>
            <span className={styles.metaChip}>
              <UserIcon size={13} /> {personTypeLabel(client.personType)}
            </span>
            {client.cpfCnpj && (
              <span className={styles.metaChip}>{fmtCpfCnpj(client.cpfCnpj)}</span>
            )}
            {client.category && (
              <span className={styles.metaChipAccent}>{client.category}</span>
            )}
          </div>
          <div className={styles.identityContact}>
            {(client.whatsapp || client.phone) && (
              <span className={styles.contactItem}>
                <Phone size={13} /> {fmtPhone(client.whatsapp || client.phone)}
              </span>
            )}
            {client.email && (
              <span className={styles.contactItem}>
                <Mail size={13} /> {client.email}
              </span>
            )}
            {client.instagram && (
              <span className={styles.contactItem}>
                <Instagram size={13} /> {client.instagram}
              </span>
            )}
          </div>
        </div>
      </section>

      <section className={styles.statsRow}>
        <div className={`${styles.statCard} ${Number(client.creditBalance ?? 0) > 0 ? styles.statCardHighlight : ''}`}>
          <div className={`${styles.statIcon} ${styles.statIconCredit}`}>
            <Wallet size={18} />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Saldo de crédito</span>
            <span className={styles.statValue}>{fmtCurrency(Number(client.creditBalance ?? 0))}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBlue}`}>
            <ShoppingBag size={18} />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Compras</span>
            <span className={styles.statValue}>{stats?.totalSales ?? 0}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconGreen}`}>
            <DollarSign size={18} />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Total gasto</span>
            <span className={styles.statValue}>{fmtCurrency(stats?.totalSpent ?? 0)}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconAmber}`}>
            <TrendingUp size={18} />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Ticket médio</span>
            <span className={styles.statValue}>{fmtCurrency(stats?.averageTicket ?? 0)}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconSlate}`}>
            <Clock size={18} />
          </div>
          <div className={styles.statBody}>
            <span className={styles.statLabel}>Última compra</span>
            <span className={styles.statValue}>{fmtDate(stats?.lastPurchaseDate)}</span>
          </div>
        </div>
      </section>

      <nav className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'dados' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('dados')}
        >
          <UserIcon size={15} /> Dados pessoais
        </button>
        <button
          type="button"
          className={`${styles.tab} ${activeTab === 'historico' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('historico')}
        >
          <ShoppingBag size={15} /> Histórico de compras
          {stats && <span className={styles.tabBadge}>{stats.totalSales}</span>}
        </button>
      </nav>

      {activeTab === 'dados' && (
        <section className={styles.panel}>
          <div className={styles.panelSection}>
            <h3 className={styles.panelTitle}>Identificação</h3>
            <div className={styles.fieldGrid}>
              <Field label="Tipo de pessoa" value={personTypeLabel(client.personType)} />
              <Field label="CPF/CNPJ" value={fmtCpfCnpj(client.cpfCnpj)} />
              <Field label="Gênero" value={client.gender || '—'} />
              <Field label="Data de nascimento" value={fmtBirthDate(client.birthDate)} />
              <Field label="Categoria" value={client.category || '—'} />
              <Field label="Cliente desde" value={fmtDate(client.createdAt)} />
            </div>
          </div>

          <div className={styles.panelSection}>
            <h3 className={styles.panelTitle}>Contato</h3>
            <div className={styles.fieldGrid}>
              <Field label="WhatsApp" value={fmtPhone(client.whatsapp)} />
              <Field label="Telefone" value={fmtPhone(client.phone)} />
              <Field label="E-mail" value={client.email || '—'} />
              <Field label="Instagram" value={client.instagram || '—'} />
            </div>
          </div>

          <div className={styles.panelSection}>
            <h3 className={styles.panelTitle}>
              <MapPin size={15} /> Endereço
            </h3>
            <div className={styles.fieldGrid}>
              <Field label="CEP" value={fmtCep(client.zipCode)} />
              <Field label="Cidade/UF"
                value={
                  client.city && client.state
                    ? `${client.city} / ${client.state}`
                    : client.city || client.state || '—'
                }
              />
              <Field label="Bairro" value={client.neighborhood || '—'} />
              <Field label="Logradouro" value={client.street || '—'} />
              <Field label="Número" value={client.number || '—'} />
              <Field label="Complemento" value={client.complement || '—'} />
            </div>
            {addressLine && (
              <p className={styles.addressLine}>
                <MapPin size={13} /> {addressLine}
              </p>
            )}
          </div>

          <div className={styles.panelSection}>
            <h3 className={styles.panelTitle}>
              <FileText size={15} /> Observações
            </h3>
            <p className={styles.observations}>
              {client.observations?.trim() || 'Nenhuma observação cadastrada.'}
            </p>
          </div>
        </section>
      )}

      {activeTab === 'historico' && (
        <section className={styles.panel}>
          {purchases.length === 0 ? (
            <div className={styles.emptyHistory}>
              <ShoppingBag size={48} />
              <p>Este cliente ainda não realizou nenhuma compra.</p>
            </div>
          ) : (
            <div className={styles.historyList}>
              {purchases.map((sale) => {
                const isOpen = expanded.has(sale.id);
                const itemsCount = sale.items.reduce((acc, it) => acc + Number(it.quantity), 0);
                const paymentLabels = sale.payments.map((p) => p.label).join(' + ');
                return (
                  <article key={sale.id} className={styles.saleCard}>
                    <button
                      type="button"
                      className={styles.saleHeader}
                      onClick={() => toggleExpanded(sale.id)}
                      aria-expanded={isOpen}
                    >
                      <div className={styles.saleHeaderMain}>
                        <div className={styles.saleNumber}>
                          <span className={styles.saleHash}>Venda</span>
                          <span className={styles.saleId}>#{sale.id}</span>
                        </div>
                        <div className={styles.saleMetaRow}>
                          <span className={styles.saleMetaItem}>
                            <Calendar size={13} /> {fmtDate(sale.saleDate)}
                          </span>
                          <span className={styles.saleMetaItem}>
                            <Package size={13} /> {itemsCount} {itemsCount === 1 ? 'item' : 'itens'}
                          </span>
                          {paymentLabels && (
                            <span className={styles.saleMetaItem}>
                              <CreditCard size={13} /> {paymentLabels}
                            </span>
                          )}
                          {sale.seller && (
                            <span className={styles.saleMetaItem}>
                              <UserIcon size={13} /> {sale.seller.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className={styles.saleHeaderRight}>
                        <span className={styles.saleTotal}>
                          {fmtCurrency(Number(sale.totalValue))}
                        </span>
                        <span className={styles.saleChevron}>
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className={styles.saleDetails}>
                        <div className={styles.detailsBlock}>
                          <h4 className={styles.detailsTitle}>
                            <Package size={14} /> Itens comprados
                          </h4>
                          <div className={styles.itemsTableWrap}>
                            <table className={styles.itemsTable}>
                              <thead>
                                <tr>
                                  <th>Produto</th>
                                  <th>Código</th>
                                  <th style={{ textAlign: 'right' }}>Qtd.</th>
                                  <th style={{ textAlign: 'right' }}>Unitário</th>
                                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sale.items.map((item) => (
                                  <tr key={item.id}>
                                    <td>{item.product.name}</td>
                                    <td className={styles.cellMuted}>{item.product.code || '—'}</td>
                                    <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                                    <td style={{ textAlign: 'right' }}>
                                      {fmtCurrency(Number(item.unitPrice))}
                                    </td>
                                    <td style={{ textAlign: 'right' }}>
                                      {fmtCurrency(Number(item.subtotal))}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className={styles.detailsGrid}>
                          <div className={styles.detailsBlock}>
                            <h4 className={styles.detailsTitle}>
                              <CreditCard size={14} /> Pagamento
                            </h4>
                            <ul className={styles.paymentsList}>
                              {sale.payments.map((p) => (
                                <li key={p.id} className={styles.paymentItem}>
                                  <span className={styles.paymentLabel}>
                                    {p.label}
                                    {p.cardBrand ? ` · ${p.cardBrand}` : ''}
                                    {p.installments && p.installments > 1
                                      ? ` · ${p.installments}x`
                                      : ''}
                                  </span>
                                  <span className={styles.paymentAmount}>
                                    {fmtCurrency(Number(p.amount))}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className={styles.detailsBlock}>
                            <h4 className={styles.detailsTitle}>Resumo financeiro</h4>
                            <dl className={styles.summaryList}>
                              <div className={styles.summaryRow}>
                                <dt>Subtotal</dt>
                                <dd>{fmtCurrency(Number(sale.subtotal))}</dd>
                              </div>
                              {Number(sale.discount) > 0 && (
                                <div className={styles.summaryRow}>
                                  <dt>Desconto</dt>
                                  <dd>- {fmtCurrency(Number(sale.discount))}</dd>
                                </div>
                              )}
                              {Number(sale.surcharge) > 0 && (
                                <div className={styles.summaryRow}>
                                  <dt>Acréscimo</dt>
                                  <dd>+ {fmtCurrency(Number(sale.surcharge))}</dd>
                                </div>
                              )}
                              <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
                                <dt>Total</dt>
                                <dd>{fmtCurrency(Number(sale.totalValue))}</dd>
                              </div>
                            </dl>
                          </div>
                        </div>

                        {sale.observation && (
                          <div className={styles.detailsBlock}>
                            <h4 className={styles.detailsTitle}>
                              <FileText size={14} /> Observação
                            </h4>
                            <p className={styles.observations}>{sale.observation}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const Field: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className={styles.field}>
    <span className={styles.fieldLabel}>{label}</span>
    <span className={styles.fieldValue}>{value}</span>
  </div>
);

export default VerClientePage;
