import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Plus, Trash2 } from 'lucide-react';
import { financialService, FinancialTransaction } from '../../../services/financialService';
import s from '../../RelatoriosPage/ReportStyles.module.css';

const fmt = (v: number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const incomeCategories = [
  'Aluguel recebido', 'Reembolso', 'Rendimento', 'Comissão recebida',
  'Serviço prestado', 'Venda de ativo', 'Juros recebidos', 'Outros',
];

const paymentMethods = [
  'Dinheiro', 'PIX', 'Transferência', 'Boleto', 'Cheque', 'Depósito',
];

const LancarEntradaPage: React.FC = () => {
  const nav = useNavigate();
  const [items, setItems] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    description: '',
    category: '',
    value: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: '',
    status: 'PAGO',
    notes: '',
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await financialService.getTransactions({
        type: 'RECEITA',
        date_from: filterFrom || undefined,
        date_to: filterTo || undefined,
      });
      setItems(data);
    } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.value || !form.date) return;
    setSaving(true);
    try {
      await financialService.createTransaction({
        type: 'RECEITA',
        description: form.description,
        category: form.category || undefined,
        value: parseFloat(form.value),
        date: form.date,
        paymentMethod: form.paymentMethod || undefined,
        status: form.status,
        notes: form.notes || undefined,
      });
      setForm({ description: '', category: '', value: '', date: new Date().toISOString().slice(0, 10), paymentMethod: '', status: 'PAGO', notes: '' });
      setShowForm(false);
      load();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja remover esta entrada?')) return;
    try { await financialService.deleteTransaction(id); load(); } catch { /* */ }
  };

  const total = items.reduce((acc, i) => acc + Number(i.value), 0);

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/financeiro')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Lançar Entrada (Outras Receitas)</h1>
      </div>
      <p className={s.subtitle}>Registre receitas que não são de vendas — aluguéis, reembolsos, rendimentos.</p>

      <div className={s.filterBar}>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Data inicial</label>
          <input type="date" className={s.filterInput} value={filterFrom} onChange={e => setFilterFrom(e.target.value)} />
        </div>
        <div className={s.filterGroup}>
          <label className={s.filterLabel}>Data final</label>
          <input type="date" className={s.filterInput} value={filterTo} onChange={e => setFilterTo(e.target.value)} />
        </div>
        <button className={s.filterBtn} onClick={load} disabled={loading}><Search size={16} /> {loading ? 'Carregando...' : 'Filtrar'}</button>
        <button className={s.filterBtn} onClick={() => setShowForm(!showForm)} style={{ background: '#059669' }}>
          <Plus size={16} /> Nova Entrada
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Descrição *</label>
            <input className={s.filterInput} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Categoria</label>
            <select className={s.filterSelect} value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="">Selecione</option>
              {incomeCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Valor (R$) *</label>
            <input type="number" step="0.01" min="0" className={s.filterInput} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Data *</label>
            <input type="date" className={s.filterInput} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Forma de Recebimento</label>
            <select className={s.filterSelect} value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="">Selecione</option>
              {paymentMethods.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Status</label>
            <select className={s.filterSelect} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="PAGO">Recebido</option>
              <option value="PENDENTE">Pendente</option>
            </select>
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Observações</label>
            <input className={s.filterInput} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className={s.filterBtn} disabled={saving} style={{ background: '#059669' }}>
            {saving ? 'Salvando...' : 'Salvar Entrada'}
          </button>
        </form>
      )}

      {loading && <div className={s.loading}>Carregando...</div>}

      {!loading && (
        <>
          <div className={s.summaryGrid}>
            <div className={s.summaryCard}><span className={s.summaryValue}>{items.length}</span><span className={s.summaryLabel}>Entradas</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue} style={{ color: '#059669' }}>{fmt(total)}</span><span className={s.summaryLabel}>Total de Entradas</span></div>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Data</th><th>Descrição</th><th>Categoria</th><th>Valor</th>
                  <th>Recebimento</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0
                  ? <tr><td colSpan={7} className={s.emptyState}>Nenhuma entrada encontrada.</td></tr>
                  : items.map(item => (
                    <tr key={item.id}>
                      <td>{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                      <td>{item.description}</td>
                      <td>{item.category || '—'}</td>
                      <td className={s.mono} style={{ color: '#059669' }}>{fmt(Number(item.value))}</td>
                      <td>{item.paymentMethod || '—'}</td>
                      <td>
                        <span className={`${s.badge} ${item.status === 'PAGO' ? s.badgeGreen : s.badgeYellow}`}>
                          {item.status === 'PAGO' ? 'Recebido' : 'Pendente'}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(item.id)} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: 4 }} title="Remover">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default LancarEntradaPage;
