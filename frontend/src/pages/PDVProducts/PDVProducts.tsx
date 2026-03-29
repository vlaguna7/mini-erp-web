import React, { useState, useMemo, useEffect } from 'react';
import { Image as ImageIcon, Code } from 'lucide-react';
import { productService } from '../../services/productService';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVProducts.module.css';

const ITEMS_PER_PAGE = 15;

const PDVProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart, removeFromCart, cart } = usePDVStore();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts();
      let productList = Array.isArray(data) ? data : data?.products ?? [];
      
      // Usar dados reais do produto cadastrado
      productList = productList.map((p: any) => ({
        ...p,
        category: p.category || 'Sem Categoria',
        sku: p.code || `SKU-${p.id}`,
        barcode: p.code || 'N/A',
        stock: p.quantityStock ?? 0,
      }));
      
      setProducts(productList);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.code?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [products, searchTerm]
  );

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const isInCart = (productId: number | string) =>
    cart.some((item) => item.id === String(productId));

  const handleToggleProduct = (product: any) => {
    if (isInCart(product.id)) {
      removeFromCart(product.id);
      return;
    }
    addToCart({
      id: String(product.id),
      name: product.name,
      price: parseFloat(product.priceSale) || 0,
      quantity: 1,
      code: product.code,
    });
  };

  if (isLoading) {
    return (
      <div className={styles.pdvProducts}>
        <div className={styles.pdvProductsLoading}>Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className={styles.pdvProducts}>
      <div className={styles.pdvProductsHeader}>
        <h2 className={styles.pdvProductsTitle}>Produtos</h2>
      </div>

      <div className={styles.pdvProductsSearch}>
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.pdvSearchInput}
        />
      </div>

      {paginatedProducts.length === 0 ? (
        <div className={styles.pdvProductsEmpty}>
          <p>Nenhum produto encontrado</p>
        </div>
      ) : (
        <>
          <div className={styles.pdvProductsGrid}>
            {paginatedProducts.map((product: any) => (
              <button
                key={product.id}
                className={`${styles.pdvProductCard} ${
                  isInCart(product.id) ? styles.inCart : ''
                }`}
                onClick={() => handleToggleProduct(product)}
              >
                <div className={styles.pdvProductImagePlaceholder}>
                  <ImageIcon size={24} className={styles.pdvImageIcon} />
                </div>

                <div className={styles.pdvProductCol}>
                  <span className={styles.pdvProductLabel}>NOME:</span>
                  <span className={styles.pdvProductName}>{product.name}</span>
                </div>

                <div className={styles.pdvProductCol}>
                  <span className={styles.pdvProductLabel}>CATEGORIA:</span>
                  <span className={styles.pdvProductValue}>{product.category}</span>
                </div>

                <div className={styles.pdvProductCol}>
                  <span className={styles.pdvProductLabel}>SKU:</span>
                  <span className={styles.pdvProductValue}>{product.sku}</span>
                  <div className={styles.pdvProductBarcodeGroup}>
                    <Code size={14} className={styles.pdvBarcodeIcon} />
                    <span className={styles.pdvProductBarcode}>{product.barcode}</span>
                  </div>
                </div>

                <div className={styles.pdvProductColRight}>
                  <span className={styles.pdvProductPrice}>
                    R$ {parseFloat(product.priceSale || 0).toFixed(2)}
                  </span>
                  <div className={styles.pdvProductStock}>
                    <span className={styles.pdvStockQuantity}>{product.stock}</span>
                    <span className={styles.pdvStockUnit}>UN</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pdvPagination}>
              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>

              <div className={styles.pdvPageInfo}>
                Página {currentPage} de {totalPages}
              </div>

              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Próxima →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default PDVProducts;