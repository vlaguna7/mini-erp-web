import React, { useState, useEffect } from 'react';
import { productService } from '../../services/productService';
import styles from './ProductForm.module.css';

interface ProductFormProps {
  onSuccess: () => void;
  onCancel?: () => void;
  initialProduct?: any;
}

const ProductForm: React.FC<ProductFormProps> = ({ 
  onSuccess, 
  onCancel,
  initialProduct 
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [priceCost, setPriceCost] = useState('');
  const [priceSale, setPriceSale] = useState('');
  const [quantityStock, setQuantityStock] = useState('0');
  const [minStock, setMinStock] = useState('10');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name || '');
      setCode(initialProduct.code || '');
      setCategory(initialProduct.category || '');
      setPriceCost(initialProduct.priceCost?.toString() || '');
      setPriceSale(initialProduct.priceSale?.toString() || '');
      setQuantityStock(initialProduct.quantityStock?.toString() || '0');
      setMinStock(initialProduct.minStock?.toString() || '10');
    }
  }, [initialProduct]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !priceSale) {
      setError('Nome e Preço de Venda são obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const isEditing = Boolean(initialProduct);
      const productData: any = {
        name,
        category,
        priceCost: priceCost ? parseFloat(priceCost) : 0,
        priceSale: parseFloat(priceSale),
        quantityStock: parseInt(quantityStock),
        minStock: parseInt(minStock),
      };
      // Na criação, o SKU é gerado pelo backend — só enviamos em edição.
      if (isEditing) productData.code = code;

      if (initialProduct) {
        await productService.updateProduct(initialProduct.id, productData);
        setSuccess('Produto atualizado com sucesso!');
      } else {
        await productService.createProduct(productData);
        setSuccess('Produto cadastrado com sucesso!');
      }

      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Erro ao salvar produto';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`${styles.form} ${styles.productForm}`}>
      <h2>{initialProduct ? 'Editar Produto' : 'Cadastrar Produto'}</h2>
      
      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}
      
      <div className={styles.formGroup}>
        <label htmlFor="name">Nome do Produto *</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do produto"
          required
          disabled={isLoading}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="code">Código do Produto (SKU)</label>
        <input
          id="code"
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={initialProduct ? 'Ex: PRD-000001' : 'Gerado automaticamente ao salvar'}
          disabled={isLoading || !initialProduct}
          readOnly={!initialProduct}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category">Categoria</label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="ex: Vestuário"
          disabled={isLoading}
        />
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="priceCost">Preço de Custo</label>
          <input
            id="priceCost"
            type="number"
            step="0.01"
            min="0"
            value={priceCost}
            onChange={(e) => setPriceCost(e.target.value)}
            placeholder="0.00"
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="priceSale">Preço de Venda *</label>
          <input
            id="priceSale"
            type="number"
            step="0.01"
            min="0.01"
            value={priceSale}
            onChange={(e) => setPriceSale(e.target.value)}
            placeholder="0.00"
            required
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="quantityStock">Quantidade em Estoque</label>
          <input
            id="quantityStock"
            type="number"
            min="0"
            value={quantityStock}
            onChange={(e) => setQuantityStock(e.target.value)}
            placeholder="0"
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="minStock">Estoque Mínimo</label>
          <input
            id="minStock"
            type="number"
            min="0"
            value={minStock}
            onChange={(e) => setMinStock(e.target.value)}
            placeholder="10"
            disabled={isLoading}
          />
        </div>
      </div>

      <div className={styles.formActions}>
        <button 
          type="submit" 
          disabled={isLoading} 
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          {isLoading 
            ? (initialProduct ? 'Atualizando...' : 'Cadastrando...')
            : (initialProduct ? 'Atualizar' : 'Cadastrar')
          }
        </button>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel} 
            disabled={isLoading}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};

export default ProductForm;
