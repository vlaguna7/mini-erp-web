import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import {
  iconBarChart,
  iconMoneyBag,
  iconPackage,
  iconPeople,
  iconShoppingCart,
  iconTrophy,
  iconSatellite,
  iconBank,
  iconCreditCard,
  iconChartIncreasing,
  iconMagnifyingGlass,
  iconCardIndexDividers,
  iconBalanceScale,
  iconIdentificationCard,
  iconBeatingHeart,
  iconMoneyWings,
} from '../../assets/icons';
import styles from './RelatoriosPage.module.css';

/* ───────────────────────── tipos ───────────────────────── */
interface SubReport {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface ReportCategory {
  id: string;
  icon: string;
  label: string;
  accentColor: string;
  glowColor: string;
  subReports: SubReport[];
}

/* ──────────────────────── dados ──────────────────────── */
const categories: ReportCategory[] = [
  {
    id: 'vendas',
    icon: iconBarChart,
    label: 'Relatório de Vendas',
    accentColor: '#2563eb',
    glowColor: 'rgba(37,99,235,.15)',
    subReports: [
      {
        id: 'vendas-geral',
        icon: iconShoppingCart,
        title: 'Vendas',
        description:
          'Veja todas as vendas do período com total vendido, créditos utilizados, custos extras, devoluções e faturamento líquido para facilitar a conferência e acompanhar o desempenho.',
      },
      {
        id: 'comissoes',
        icon: iconTrophy,
        title: 'Comissões',
        description:
          'Veja quanto cada vendedor vendeu, o valor das comissões e as vendas que formam esse total.',
      },
      {
        id: 'canais',
        icon: iconSatellite,
        title: 'Canais de Vendas',
        description:
          'Veja de onde vêm suas vendas e o desempenho de cada canal, como loja física, e-commerce e marketplaces.',
      },
    ],
  },
  {
    id: 'financeiro',
    icon: iconMoneyBag,
    label: 'Relatório do Financeiro',
    accentColor: '#2563eb',
    glowColor: 'rgba(37,99,235,.15)',
    subReports: [
      {
        id: 'caixas',
        icon: iconBank,
        title: 'Aberturas e Fechamentos dos Caixas',
        description:
          'Veja o valor inicial de cada caixa, os recebimentos por forma de pagamento, possíveis diferenças e o comprovante de fechamento para garantir a conferência dos valores.',
      },
      {
        id: 'formas-pgto',
        icon: iconCreditCard,
        title: 'Vendas por Forma de Pagamento',
        description:
          'Veja o total vendido, número de vendas e valor por meio de pagamento para entender as preferências dos clientes e planejar melhores condições comerciais.',
      },
      {
        id: 'dfc',
        icon: iconChartIncreasing,
        title: 'Demonstrativo de Fluxo de Caixa (DFC)',
        description:
          'Veja todas as entradas, deduções, custos e resultados financeiros para entender quanto de caixa foi gerado no mês.',
      },
    ],
  },
  {
    id: 'estoque',
    icon: iconPackage,
    label: 'Relatório do Estoque',
    accentColor: '#2563eb',
    glowColor: 'rgba(37,99,235,.15)',
    subReports: [
      {
        id: 'desempenho-produto',
        icon: iconMagnifyingGlass,
        title: 'Desempenho por Produto (Histórico de vendas)',
        description:
          'Veja o que foi vendido no período, com quantidade, devoluções, faturamento, descontos, créditos e lucro bruto. Use filtros por coleção, cliente, categoria, marca, fornecedor e vendedor para analisar melhor os resultados.',
      },
      {
        id: 'vendas-categorias',
        icon: iconCardIndexDividers,
        title: 'Vendas por Categorias',
        description:
          'Veja quais categorias mais vendem, com quantidade de peças, faturamento e ticket médio para entender o desempenho de cada uma.',
      },
      {
        id: 'inventario',
        icon: iconBalanceScale,
        title: 'Inventário de Estoque',
        description:
          'Veja as diferenças entre o estoque registrado e a contagem real, com quantidades antes e depois da conferência e os produtos com divergências para manter o controle preciso.',
      },
    ],
  },
  {
    id: 'clientes',
    icon: iconPeople,
    label: 'Relatório de Clientes',
    accentColor: '#2563eb',
    glowColor: 'rgba(37,99,235,.15)',
    subReports: [
      {
        id: 'clientes-geral',
        icon: iconIdentificationCard,
        title: 'Clientes',
        description:
          'Veja quanto cada cliente comprou no período, número de vendas, peças adquiridas e ticket médio para identificar os principais compradores.',
      },
      {
        id: 'ciclo-vida',
        icon: iconBeatingHeart,
        title: 'Ciclo de Vida do Cliente',
        description:
          'Analise sua base com a metodologia RFV, identifique os melhores clientes e os em risco para direcionar campanhas e melhorar a retenção.',
      },
      {
        id: 'credito-clientes',
        icon: iconMoneyWings,
        title: 'Crédito de Clientes',
        description:
          'Veja os créditos disponíveis, o total em aberto e as movimentações, desde valores gerados por devoluções até os usados em compras.',
      },
    ],
  },
];

/* ──────────────── variantes framer-motion ──────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const categoryVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

const panelVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: 'auto',
    transition: { type: 'spring' as const, stiffness: 200, damping: 24, staggerChildren: 0.1, delayChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.25, ease: 'easeInOut' as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -40, scale: 0.92 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: 40,
    scale: 0.92,
    transition: { duration: 0.2 },
  },
};

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: '200%',
    transition: { repeat: Infinity, duration: 2.5, ease: 'linear' as const },
  },
};

/* ═══════════════════════ COMPONENTE ═══════════════════════ */
const routeMap: Record<string, string> = {
  'vendas-geral': '/relatorios/vendas',
  'comissoes': '/relatorios/comissoes',
  'canais': '/relatorios/canais-vendas',
  'caixas': '/relatorios/caixas',
  'formas-pgto': '/relatorios/formas-pagamento',
  'dfc': '/relatorios/dfc',
  'desempenho-produto': '/relatorios/desempenho-produto',
  'vendas-categorias': '/relatorios/vendas-categorias',
  'inventario': '/relatorios/inventario',
  'clientes-geral': '/relatorios/clientes',
  'ciclo-vida': '/relatorios/ciclo-vida',
  'credito-clientes': '/relatorios/credito-clientes',
};

const RelatoriosPage: React.FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className={styles.page}>
      {/* ── header ── */}
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className={styles.title}>Relatórios</h1>
        <p className={styles.subtitle}>
          Escolha uma categoria para visualizar os relatórios disponíveis
        </p>
      </motion.div>

      {/* ── grade de categorias ── */}
      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {categories.map((cat) => {
          const isExpanded = expandedId === cat.id;

          return (
            <motion.div key={cat.id} variants={categoryVariants} className={styles.categoryWrapper}>
              {/* Botão principal da categoria */}
              <motion.button
                className={`${styles.categoryBtn} ${isExpanded ? styles.categoryBtnActive : ''}`}
                onClick={() => handleToggle(cat.id)}
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.985 }}
                style={{
                  '--cat-accent': cat.accentColor,
                  '--cat-glow': cat.glowColor,
                } as React.CSSProperties}
              >
                {/* Shimmer decorativo */}
                <motion.span
                  className={styles.shimmer}
                  variants={shimmerVariants}
                  initial="initial"
                  animate="animate"
                />

                <span className={styles.categoryIconWrap}>
                  <img src={cat.icon} alt="" width={30} height={30} />
                </span>
                <span className={styles.categoryLabel}>{cat.label}</span>

                <motion.span
                  className={styles.chevron}
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ type: 'spring' as const, stiffness: 300, damping: 20 }}
                >
                  {isExpanded ? <X size={20} /> : <ChevronRight size={20} />}
                </motion.span>
              </motion.button>

              {/* Sub-relatórios expandidos */}
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.div
                    className={styles.panel}
                    variants={panelVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className={styles.cardsRow}>
                      {cat.subReports.map((sub, idx) => (
                        <motion.div
                          key={sub.id}
                          className={styles.card}
                          variants={cardVariants}
                          whileHover={{ y: -6, boxShadow: `0 20px 40px ${cat.glowColor}` }}
                          style={{ '--cat-accent': cat.accentColor } as React.CSSProperties}
                        >
                          {/* Número decorativo */}
                          <span className={styles.cardNumber}>
                            {String(idx + 1).padStart(2, '0')}
                          </span>

                          {/* Barra superior com accent */}
                          <div className={styles.cardTopBar} />

                          {/* Ícone emoji */}
                          <div className={styles.cardIconArea}>
                            <span className={styles.cardRing} />
                            <span className={styles.cardIconCircle}>
                              <img src={sub.icon} alt="" width={28} height={28} />
                            </span>
                          </div>

                          <h3 className={styles.cardTitle}>{sub.title}</h3>
                          <p className={styles.cardDesc}>{sub.description}</p>

                          <button className={styles.cardAction} onClick={() => navigate(routeMap[sub.id] || '/relatorios')}>
                            Acessar relatório
                            <ChevronRight size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default RelatoriosPage;
