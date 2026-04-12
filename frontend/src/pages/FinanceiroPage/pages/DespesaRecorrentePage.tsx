import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pause, Play } from 'lucide-react';
import { financialService, RecurringExpense } from '../../../services/financialService';
import s from '../../RelatoriosPage/ReportStyles.module.css';

const fmt = (v: number) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const expenseCategories = [
  'Aluguel', 'Energia', 'Água', 'Internet', 'Telefone', 'Salários',
  'Impostos', 'Assinatura', 'Manutenção', 'Seguros', 'Outros',
];

const frequencies = [
  { value: 'SEMANAL', label: 'Semanal' },
  { value: 'QUINZENAL', label: 'Quinzenal' },
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'ANUAL', label: 'Anual' },
];

const DespesaRecorrentePage: React.FC = () => {
  const nav = useNavigate();
  const [items, setItems] = useState<RecurringExpense[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    description: '',
    category: '',
    value: '',
    frequency: 'MENSAL',
    dayOfMonth: '',
    startDate: new Date().toISOString().slice(0, 10),
    endDate: '',
    notes: '',
  });

  const load = async () => {
    setLoading(true);
    try { setItems(await financialService.getRecurringExpenses()); }
    catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.value || !form.startDate) return;
    setSaving(true);
    try {
      await financialService.createRecurringExpense({
        description: form.description,
        category: form.category || undefined,
        value: parseFloat(form.value),
        frequency: form.frequency,
        dayOfMonth: form.dayOfMonth ? parseInt(form.dayOfMonth) : undefined,
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        notes: form.notes || undefined,
      });
      setForm({ description: '', category: '', value: '', frequency: 'MENSAL', dayOfMonth: '', startDate: new Date().toISOString().slice(0, 10), endDate: '', notes: '' });
      setShowForm(false);
      load();
    } catch { /* */ } finally { setSaving(false); }
  };

  const handleToggle = async (item: RecurringExpense) => {
    try {
      await financialService.updateRecurringExpense(item.id, { active: !item.active });
      load();
    } catch { /* */ }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja remover esta despesa recorrente?')) return;
    try { await financialService.deleteRecurringExpense(id); load(); } catch { /* */ }
  };

  const totalActive = items.filter(i => i.active).reduce((acc, i) => acc + Number(i.value), 0);

  const freqLabel = (f: string) => frequencies.find(x => x.value === f)?.label || f;

  return (
    <div className={s.page}>
      <div className={s.headerRow}>
        <button className={s.backBtn} onClick={() => nav('/financeiro')}><ArrowLeft size={16} /> Voltar</button>
        <h1 className={s.title}>Despesas Recorrentes</h1>
      </div>
      <p className={s.subtitle}>Configure e gerencie despesas que se repetem automaticamente.</p>

      <div className={s.filterBar}>
        <button className={s.filterBtn} onClick={() => setShowForm(!showForm)} style={{ background: '#059669' }}>
          <Plus size={16} /> Nova Despesa Recorrente
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
              {expenseCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Valor (R$) *</label>
            <input type="number" step="0.01" min="0" className={s.filterInput} value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} required />
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Frequência *</label>
            <select className={s.filterSelect} value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
              {frequencies.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Dia do mês</label>
            <input type="number" min="1" max="31" className={s.filterInput} value={form.dayOfMonth} onChange={e => setForm({ ...form, dayOfMonth: e.target.value })} />
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Data de início *</label>
            <input type="date" className={s.filterInput} value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Data de fim</label>
            <input type="date" className={s.filterInput} value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div className={s.filterGroup}>
            <label className={s.filterLabel}>Observações</label>
            <input className={s.filterInput} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className={s.filterBtn} disabled={saving} style={{ background: '#059669' }}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </form>
      )}

      {loading && <div className={s.loading}>Carregando...</div>}

      {!loading && (
        <>
          <div className={s.summaryGrid}>
            <div className={s.summaryCard}><span className={s.summaryValue}>{items.length}</span><span className={s.summaryLabel}>Total Cadastradas</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue}>{items.filter(i => i.active).length}</span><span className={s.summaryLabel}>Ativas</span></div>
            <div className={s.summaryCard}><span className={s.summaryValue} style={{ color: '#dc2626' }}>{fmt(totalActive)}</span><span className={s.summaryLabel}>Valor Mensal (Ativas)</span></div>
          </div>

          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Descrição</th><th>Categoria</th><th>Valor</th><th>Frequência</th>
                  <th>Dia</th><th>Início</th><th>Fim</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0
                  ? <tr><td colSpan={9} className={s.emptyState}>Nenhuma despesa recorrente cadastrada.</td></tr>
                  : items.map(item => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{item.category || '—'}</td>
                      <td className={s.mono}>{fmt(Number(item.value))}</td>
                      <td>{freqLabel(item.frequency)}</td>
                      <td>{item.dayOfMonth || '—'}</td>
                      <td>{new Date(item.startDate).toLocaleDateString('pt-BR')}</td>
                      <td>{item.endDate ? new Date(item.endDate).toLocaleDateString('pt-BR') : '—'}</td>
                      <td>
                        <span className={`${s.badge} ${item.active ? s.badgeGreen : s.badgeRed}`}>
                          {item.active ? 'Ativa' : 'Pausada'}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => handleToggle(item)} style={{ background: 'none', border: 'none', color: item.active ? '#eab308' : '#059669', cursor: 'pointer', padding: 4 }} title={item.active ? 'Pausar' : 'Ativar'}>
                          {item.active ? <Pause size={16} /> : <Play size={16} />}
                        </button>
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

export default DespesaRecorrentePage;
