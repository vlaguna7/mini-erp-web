import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Check, SearchX, ChevronDown } from 'lucide-react';
import styles from './SearchableModal.module.css';

export interface SearchableItem {
  id: string | number;
  primary: string;
  secondary?: string;
  searchTokens?: string[];
}

interface SearchableModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  placeholder?: string;
  items: SearchableItem[];
  selectedId?: string | number | null;
  onSelect: (item: SearchableItem) => void;
  icon?: React.ReactNode;
  emptyHint?: string;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim();
}

export const SearchableModal: React.FC<SearchableModalProps> = ({
  open,
  onClose,
  title,
  placeholder = 'Digite para buscar...',
  items,
  selectedId,
  onSelect,
  icon,
  emptyHint,
}) => {
  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlightIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = normalize(query);
    return items.filter((it) => {
      const haystack = [it.primary, it.secondary || '', ...(it.searchTokens || [])]
        .map(normalize)
        .join(' ');
      return haystack.includes(q);
    });
  }, [items, query]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-idx="${highlightIdx}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightIdx]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = filtered[highlightIdx];
      if (pick) {
        onSelect(pick);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
          >
            <div className={styles.header}>
              <h3 className={styles.title}>{title}</h3>
              <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            <div className={styles.searchBox}>
              <Search size={18} className={styles.searchIcon} />
              <input
                ref={inputRef}
                className={styles.searchInput}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  type="button"
                  className={styles.clearSearchBtn}
                  onClick={() => setQuery('')}
                  aria-label="Limpar busca"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className={styles.list} ref={listRef}>
              {filtered.length === 0 ? (
                <div className={styles.empty}>
                  <SearchX size={36} className={styles.emptyIcon} />
                  <span className={styles.emptyTitle}>Nenhum resultado</span>
                  {emptyHint && <span className={styles.emptyHint}>{emptyHint}</span>}
                </div>
              ) : (
                filtered.map((it, idx) => {
                  const isSelected = selectedId !== null && selectedId !== undefined && it.id === selectedId;
                  const isHighlighted = idx === highlightIdx;
                  return (
                    <button
                      type="button"
                      key={it.id}
                      data-idx={idx}
                      className={`${styles.item} ${isSelected ? styles.selected : ''} ${isHighlighted ? styles.highlighted : ''}`}
                      onMouseEnter={() => setHighlightIdx(idx)}
                      onClick={() => {
                        onSelect(it);
                        onClose();
                      }}
                    >
                      {icon && <span className={styles.itemIcon}>{icon}</span>}
                      <span className={styles.itemContent}>
                        <span className={styles.itemPrimary}>{it.primary}</span>
                        {it.secondary && <span className={styles.itemSecondary}>{it.secondary}</span>}
                      </span>
                      {isSelected && <Check size={16} className={styles.itemCheck} />}
                    </button>
                  );
                })
              )}
            </div>

            <div className={styles.footer}>
              <span className={styles.footerHint}>
                <span className={styles.kbd}>↑</span>
                <span className={styles.kbd}>↓</span>
                Navegar
              </span>
              <span className={styles.footerHint}>
                <span className={styles.kbd}>Enter</span>
                Selecionar
              </span>
              <span className={styles.footerHint}>
                <span className={styles.kbd}>Esc</span>
                Fechar
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ===== Trigger (botão que abre o modal e mostra o valor selecionado) ===== */
interface SearchableSelectTriggerProps {
  placeholder: string;
  selected?: SearchableItem | null;
  onOpen: () => void;
  onClear?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export const SearchableSelectTrigger: React.FC<SearchableSelectTriggerProps> = ({
  placeholder,
  selected,
  onOpen,
  onClear,
  icon,
  disabled,
}) => {
  return (
    <button
      type="button"
      className={styles.trigger}
      onClick={onOpen}
      disabled={disabled}
      aria-haspopup="dialog"
    >
      {icon && <span style={{ color: 'var(--color-slate-400)', display: 'inline-flex' }}>{icon}</span>}
      <span className={styles.triggerContent}>
        {selected ? (
          <>
            <span className={styles.triggerLabel}>{selected.primary}</span>
            {selected.secondary && <span className={styles.triggerSecondary}>{selected.secondary}</span>}
          </>
        ) : (
          <span className={`${styles.triggerLabel} ${styles.placeholder}`}>{placeholder}</span>
        )}
      </span>
      <span className={styles.triggerActions}>
        {selected && onClear && (
          <span
            className={styles.triggerClear}
            role="button"
            tabIndex={-1}
            aria-label="Limpar seleção"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
          >
            <X size={14} />
          </span>
        )}
        <ChevronDown size={16} />
      </span>
    </button>
  );
};

export default SearchableModal;
