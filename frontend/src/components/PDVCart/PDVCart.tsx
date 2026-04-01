import React from 'react';
import { Trash2, X, User } from 'lucide-react';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVCart.module.css';

const PDVCart: React.FC = () => {
  const { cart, selectedClient, setSelectedClient, removeFromCart, updateCartQuantity, clearCart, getCartTotal } =
    usePDVStore();

  const total = getCartTotal();

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
        {cart.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemCode}>{item.code}</p>
            </div>

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
              <p className={styles.itemSubtotal}>
                R$ {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>

            <button
              className={styles.itemRemove}
              onClick={() => removeFromCart(item.id)}
              title="Remover do carrinho"
            >
              <X size={16} />
            </button>
          </div>
        ))}
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
