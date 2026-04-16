import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, Users, ChevronRight, Settings2 } from 'lucide-react';
import {
  iconShoppingCart,
  iconMoneyWings,
  iconPeople,
  iconIdentificationCard,
} from '../../assets/icons';
import { clientService } from '../../services/clientService';
import styles from './SalesAndClientsPage.module.css';

/* ──────────────── variantes framer-motion ──────────────── */
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 22 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, x: -30, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
  },
};

/* ═══════════════════════ COMPONENTE ═══════════════════════ */
const SalesAndClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clientCount, setClientCount] = useState(0);

  const loadCounts = useCallback(async () => {
    try {
      const res = await clientService.getClients(1, 10000);
      const clients = Array.isArray(res) ? res : res?.clients ?? [];
      setClientCount(clients.length);
    } catch {
      /* silently ignore */
    }
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <motion.header
        className={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <h1 className={styles.title}>Vendas e Clientes</h1>
        <p className={styles.subtitle}>
          Gerencie suas vendas, devoluções e clientes em um só lugar
        </p>
      </motion.header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── GESTÃO DE VENDAS ── */}
        <motion.section className={styles.section} variants={sectionVariants}>
          <div className={styles.sectionHeader}>
            <LayoutGrid size={18} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Gestão de Vendas</h2>
          </div>
          <div className={styles.actionGrid}>
            <motion.button
              className={styles.actionCard}
              variants={cardVariants}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(37,99,235,.12)' }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate('/vendas-e-clientes/lancar-venda')}
            >
              <div className={styles.actionIconWrap}>
                <img src={iconShoppingCart} alt="" width={28} height={28} />
              </div>
              <div className={styles.actionInfo}>
                <span className={styles.actionLabel}>Lançar Venda</span>
                <span className={styles.actionDesc}>Registrar uma nova venda no sistema</span>
              </div>
              <ChevronRight size={16} className={styles.actionArrow} />
            </motion.button>

            <motion.button
              className={styles.actionCard}
              variants={cardVariants}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(37,99,235,.12)' }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate('/vendas-e-clientes/lancar-devolucao')}
            >
              <div className={styles.actionIconWrap}>
                <img src={iconMoneyWings} alt="" width={28} height={28} />
              </div>
              <div className={styles.actionInfo}>
                <span className={styles.actionLabel}>Lançar Devolução de Venda</span>
                <span className={styles.actionDesc}>Registrar devolução e gerar crédito</span>
              </div>
              <ChevronRight size={16} className={styles.actionArrow} />
            </motion.button>
          </div>
        </motion.section>

        {/* ── CONTROLE DE CLIENTES ── */}
        <motion.section className={styles.section} variants={sectionVariants}>
          <div className={styles.sectionHeader}>
            <Users size={18} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Controle de Clientes</h2>
          </div>
          <div className={styles.actionGrid}>
            <motion.button
              className={styles.actionCard}
              variants={cardVariants}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(37,99,235,.12)' }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate('/vendas-e-clientes/cadastrar-cliente')}
            >
              <div className={styles.actionIconWrap}>
                <img src={iconPeople} alt="" width={28} height={28} />
              </div>
              <div className={styles.actionInfo}>
                <span className={styles.actionLabel}>Cadastrar Cliente</span>
                <span className={styles.actionDesc}>Adicionar novo cliente ao sistema</span>
              </div>
              <ChevronRight size={16} className={styles.actionArrow} />
            </motion.button>

            <motion.button
              className={styles.actionCard}
              variants={cardVariants}
              whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(37,99,235,.12)' }}
              whileTap={{ scale: 0.985 }}
              onClick={() => navigate('/vendas-e-clientes/lista-clientes')}
            >
              <div className={styles.actionIconWrap}>
                <img src={iconIdentificationCard} alt="" width={28} height={28} />
              </div>
              <div className={styles.actionInfo}>
                <span className={styles.actionLabel}>Lista de Clientes</span>
                <span className={styles.actionDesc}>
                  {clientCount} cliente{clientCount !== 1 ? 's' : ''} cadastrado{clientCount !== 1 ? 's' : ''}
                </span>
              </div>
              <ChevronRight size={16} className={styles.actionArrow} />
            </motion.button>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default SalesAndClientsPage;
