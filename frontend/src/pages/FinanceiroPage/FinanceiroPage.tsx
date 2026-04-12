import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MinusCircle,
  RefreshCw,
  PlusCircle,
  FileText,
  Lock,
  FileCheck,
  ChevronRight,
} from 'lucide-react';
import styles from './FinanceiroPage.module.css';

interface ActionCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  route: string;
  locked?: boolean;
}

const actions: ActionCard[] = [
  {
    id: 'lancar-despesa',
    icon: <MinusCircle size={28} />,
    title: 'Lançar Saída (Despesa)',
    description: 'Registre pagamentos, contas e qualquer saída de caixa para manter o controle financeiro atualizado.',
    route: '/financeiro/lancar-despesa',
  },
  {
    id: 'despesa-recorrente',
    icon: <RefreshCw size={28} />,
    title: 'Criar Despesa Recorrente',
    description: 'Configure despesas automáticas que se repetem — aluguel, assinaturas, contas fixas e mais.',
    route: '/financeiro/despesa-recorrente',
  },
  {
    id: 'lancar-entrada',
    icon: <PlusCircle size={28} />,
    title: 'Lançar Entrada (Outras Receitas)',
    description: 'Registre receitas que não vêm de vendas — aluguéis, reembolsos, rendimentos e outras entradas.',
    route: '/financeiro/lancar-entrada',
  },
  {
    id: 'renegociacao',
    icon: <FileText size={28} />,
    title: 'Lançar Renegociação de dívida',
    description: 'Registre acordos de renegociação de dívidas com novos prazos, valores e condições.',
    route: '/financeiro/renegociacao-divida',
  },
  {
    id: 'nfe-avulsa',
    icon: <FileCheck size={28} />,
    title: 'Emitir NF-e Avulsa',
    description: 'Emissão de Nota Fiscal Eletrônica avulsa. Funcionalidade em breve.',
    route: '',
    locked: true,
  },
  {
    id: 'nfce-avulsa',
    icon: <FileCheck size={28} />,
    title: 'Emitir NFC-e Avulsa',
    description: 'Emissão de Nota Fiscal de Consumidor avulsa. Funcionalidade em breve.',
    route: '',
    locked: true,
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

const FinanceiroPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className={styles.title}>Financeiro</h1>
        <p className={styles.subtitle}>
          Gerencie despesas, receitas e o fluxo financeiro do seu negócio
        </p>
      </motion.div>

      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {actions.map((action, idx) => (
          <motion.div
            key={action.id}
            className={`${styles.card} ${action.locked ? styles.cardLocked : ''}`}
            variants={cardVariants}
            whileHover={action.locked ? {} : { y: -6, boxShadow: '0 20px 40px rgba(37,99,235,.15)' }}
            onClick={() => !action.locked && navigate(action.route)}
          >
            <span className={styles.cardNumber}>
              {String(idx + 1).padStart(2, '0')}
            </span>

            <div className={styles.cardTopBar} />

            <div className={styles.cardIconArea}>
              <span className={styles.cardRing} />
              <span className={`${styles.cardIconCircle} ${action.locked ? styles.cardIconLocked : ''}`}>
                {action.icon}
              </span>
              {action.locked && (
                <span className={styles.lockBadge}>
                  <Lock size={12} />
                </span>
              )}
            </div>

            <h3 className={styles.cardTitle}>{action.title}</h3>
            <p className={styles.cardDesc}>{action.description}</p>

            {!action.locked && (
              <button className={styles.cardAction} onClick={(e) => { e.stopPropagation(); navigate(action.route); }}>
                Acessar
                <ChevronRight size={16} />
              </button>
            )}
            {action.locked && (
              <span className={styles.lockLabel}>
                <Lock size={14} /> Em breve
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default FinanceiroPage;
