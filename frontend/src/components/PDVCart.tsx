import React from 'react';
import { Trash2, X } from 'lucide-react';
import { usePDVStore } from '../store/pdvStore';
import './PDVCart.css';

export const PDVCart: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, clearCart, getCartTotal } =
    usePDVStore();

  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="pdv-cart">
        <div className="pdv-cart-header">
          <h3 className="pdv-cart-title">Carrinho</h3>
        </div>
        <div className="pdv-cart-empty">
          <p>Nenhum produto adicionado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdv-cart">
      <div className="pdv-cart-header">
        <h3 className="pdv-cart-title">Carrinho</h3>
        {cart.length > 0 && (
          <button
            className="pdv-cart-clear-btn"
            onClick={() => clearCart()}
            title="Limpar carrinho"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      <div className="pdv-cart-items">
        {cart.map((item) => (
          <div key={item.id} className="pdv-cart-item">
            <div className="pdv-cart-item-info">
              <p className="pdv-cart-item-name">{item.name}</p>
              <p className="pdv-cart-item-code">{item.code}</p>
            </div>

            <div className="pdv-cart-item-qty">
              <button
                className="pdv-qty-btn"
                onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
              >
                −
              </button>
              <span className="pdv-qty-value">{item.quantity}</span>
              <button
                className="pdv-qty-btn"
                onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
            </div>

            <div className="pdv-cart-item-price">
              <p className="pdv-cart-item-subtotal">
                R$ {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>

            <button
              className="pdv-cart-item-remove"
              onClick={() => removeFromCart(item.id)}
              title="Remover do carrinho"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="pdv-cart-footer">
        <div className="pdv-cart-total">
          <span>Total:</span>
          <span className="pdv-cart-total-value">R$ {total.toFixed(2)}</span>
        </div>
        <p className="pdv-cart-count">{cart.length} item(ns)</p>
      </div>
    </div>
  );
};
