import React, { useState } from 'react';
import { Trash2, X, User, Percent, Check } from 'lucide-react';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVCart.module.css';

const PDVCart: React.FC = () => {
  const { cart, selectedClient, setSelectedClient, removeFromCart, updateCartQuantity, updateItemDiscount, clearCart, getCartTotal } =
    usePDVStore();
  const [discountOpenId, setDiscountOpenId] = useState<string | null>(null);
  const [tempDiscount, setTempDiscount] = useState<string>('');
  const [tempDiscountType, setTempDiscountType] = useState<'value' | 'percent'>('value');

  const total = getCartTotal();

  const openDiscount = (item: { id: string; itemDiscount?: number; itemDiscountType?: 'value' | 'percent' }) => {
    if (discountOpenId === item.id) {
      setDiscountOpenId(null);
      return;
    }
    setDiscountOpenId(item.id);
    setTempDiscount(item.itemDiscount ? String(item.itemDiscount) : '');
    setTempDiscountType(item.itemDiscountType || 'value');
  };

  const confirmDiscount = (itemId: string) => {
    const val = Math.max(0, parseFloat(tempDiscount) || 0);
    updateItemDiscount(itemId, val, tempDiscountType);
    setDiscountOpenId(null);
  };

  const clearItemDiscount = (itemId: string) => {
    updateItemDiscount(itemId, 0, 'value');
    setDiscountOpenId(null);
  };

  if (cart.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Carrinho</h3>
        </div>
        {selectedClient && (
          <div className={styles.clientBadge}>
            <div className={styles.clientIcon}><User size={14} /></div>
            <div className={styles.clientInfo}>
              <span className={styles.clientName}>{selectedClient.name}</span>
              {selectedClient.cpf && <span className={styles.clientCpf}>{selectedClient.cpf}</span>}
            </div>
            <button className={styles.clientRemove} onClick={() => setSelectedClient(null)} title="Remover cliente">
              <X size={14} />
            </button>
          </div>
        )}
        <div className={styles.empty}>
          <p>Nenhum produto adicionado</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Carrinho</h3>
        {cart.length > 0 && (
          <button
            className={styles.clearBtn}
            onClick={() => clearCart()}
            title="Limpar carrinho"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {selectedClient && (
        <div className={styles.clientBadge}>
          <div className={styles.clientIcon}><User size={14} /></div>
          <div className={styles.clientInfo}>
            <span className={styles.clientName}>{selectedClient.name}</span>
            {selectedClient.cpf && <span className={styles.clientCpf}>{selectedClient.cpf}</span>}
          </div>
          <button className={styles.clientRemove} onClick={() => setSelectedClient(null)} title="Remover cliente">
            <X size={14} />
          </button>
        </div>
      )}

      <div className={styles.items}>
        {cart.map((item) => {
          const lineTotal = item.price * item.quantity;
          const disc = item.itemDiscount || 0;
          const discValue = item.itemDiscountType === 'percent' ? lineTotal * (disc / 100) : disc;
          const finalPrice = Math.max(0, lineTotal - discValue);

          return (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemTop}>
              <div className={styles.itemInfo}>
                <p className={styles.itemName}>{item.name}</p>
                {item.code && <p className={styles.itemCode}>Cód: {item.code}</p>}
              </div>
              <div className={styles.itemActions}>
                <button
                  className={`${styles.discountBtn} ${disc > 0 ? styles.discountActive : ''}`}
                  onClick={() => openDiscount(item)}
                  title="Desconto no item"
                >
                  <Percent size={14} />
                </button>
                <button
                  className={styles.itemRemove}
                  onClick={() => removeFromCart(item.id)}
                  title="Remover do carrinho"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            <div className={styles.itemBottom}>
              <div className={styles.itemQty}>
                <button
                  className={styles.qtyBtn}
                  onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                >
                  −
                </button>
                <span className={styles.qtyValue}>{item.quantity}</span>
                <button
                  className={styles.qtyBtn}
                  onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>

              <div className={styles.itemPrice}>
                {disc > 0 && (
                  <p className={styles.itemOriginal}>R$ {lineTotal.toFixed(2)}</p>
                )}
                <p className={styles.itemSubtotal}>R$ {finalPrice.toFixed(2)}</p>
                {item.quantity > 1 && (
                  <p className={styles.itemUnit}>un. R$ {item.price.toFixed(2)}</p>
                )}
              </div>
            </div>

            {discountOpenId === item.id && (
              <div className={styles.itemDiscountRow}>
                <span className={styles.discountLabel}>Desconto:</span>
                <div className={styles.itemInputCombo}>
                  <button
                    className={styles.itemToggle}
                    onClick={() =>
                      setTempDiscountType(tempDiscountType === 'percent' ? 'value' : 'percent')
                    }
                  >
                    {tempDiscountType === 'percent' ? '%' : 'R$'}
                  </button>
                  <input
                    type="number"
                    className={styles.itemNumInput}
                    placeholder="0,00"
                    min={0}
                    value={tempDiscount}
                    onChange={(e) => setTempDiscount(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && confirmDiscount(item.id)}
                  />
                </div>
                <button
                  className={styles.confirmDiscountBtn}
                  onClick={() => confirmDiscount(item.id)}
                  title="Confirmar desconto"
                >
                  <Check size={14} />
                  OK
                </button>
                {disc > 0 && (
                  <button
                    className={styles.clearDiscountBtn}
                    onClick={() => clearItemDiscount(item.id)}
                    title="Remover desconto"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}
          </div>
          );
        })}
      </div>

      <div className={styles.footer}>
        <div className={styles.total}>
          <span>Total:</span>
          <span className={styles.totalValue}>R$ {total.toFixed(2)}</span>
        </div>
        <p className={styles.count}>{cart.length} item(ns)</p>
      </div>
    </div>
  );
};

export default PDVCart;
