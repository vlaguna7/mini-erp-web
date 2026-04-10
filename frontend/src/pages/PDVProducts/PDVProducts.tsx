import React, { useState, useMemo, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { productService } from '../../services/productService';
import { usePDVStore } from '../../store/pdvStore';
import styles from './PDVProducts.module.css';

const ITEMS_PER_PAGE = 5;

const PDVProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [outOfStockModal, setOutOfStockModal] = useState(false);
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
        barcode: p.barcode || 'N/A',
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
    const id = String(product.id);
    if (product.stock <= 0 && !isInCart(product.id)) {
      setOutOfStockModal(true);
      return;
    }
    if (isInCart(product.id)) {
      removeFromCart(id);
      return;
    }
    addToCart({
      id,
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
                } ${product.stock <= 0 ? styles.outOfStock : ''}`}
                onClick={() => handleToggleProduct(product)}
              >
                <div className={styles.pdvProductImagePlaceholder}>
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0].url} alt={product.name} className={styles.pdvProductImgThumb} />
                  ) : (
                    <ImageIcon size={24} className={styles.pdvImageIcon} />
                  )}
                </div>

                <div className={styles.pdvProductCol}>
                  <span className={styles.pdvProductLabel}>NOME:</span>
                  <span className={styles.pdvProductName} title={product.name}>{product.name}</span>
                </div>

                <div className={styles.pdvProductCol}>
                  <span className={styles.pdvProductLabel}>CATEGORIA:</span>
                  <span className={styles.pdvProductValue}>{product.category}</span>
                </div>

                <div className={styles.pdvProductCol}>
                  <span className={styles.pdvProductLabel}>SKU:</span>
                  <span className={styles.pdvProductValue}>{product.sku}</span>
                  <div className={styles.pdvProductBarcodeGroup}>
                    <svg width="14" height="10" viewBox="0 0 16 12" fill="none" className={styles.pdvBarcodeIcon}>
                      <rect x="0" y="0" width="2" height="12" fill="currentColor"/>
                      <rect x="3" y="0" width="1" height="12" fill="currentColor"/>
                      <rect x="5" y="0" width="2" height="12" fill="currentColor"/>
                      <rect x="8" y="0" width="1" height="12" fill="currentColor"/>
                      <rect x="10" y="0" width="2" height="12" fill="currentColor"/>
                      <rect x="13" y="0" width="1" height="12" fill="currentColor"/>
                      <rect x="15" y="0" width="1" height="12" fill="currentColor"/>
                    </svg>
                    <span className={styles.pdvProductBarcode}>{product.barcode}</span>
                  </div>
                </div>

                <div className={styles.pdvProductColRight}>
                  <span className={styles.pdvProductPrice}>
                    R$ {parseFloat(product.priceSale || 0).toFixed(2)}
                  </span>
                  <div className={styles.pdvProductStock}>
                    <span className={`${styles.pdvStockQuantity} ${product.stock <= 0 ? styles.stockZero : ''}`}>{product.stock}</span>
                    <span className={`${styles.pdvStockUnit} ${product.stock <= 0 ? styles.stockZero : ''}`}>{product.unitType || 'UN'}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className={styles.pdvPagination}>
              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                «
              </button>
              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  if (totalPages <= 7) return true;
                  if (page === 1 || page === totalPages) return true;
                  if (Math.abs(page - currentPage) <= 1) return true;
                  return false;
                })
                .reduce<(number | string)[]>((acc, page, idx, arr) => {
                  if (idx > 0 && typeof arr[idx - 1] === 'number' && (page as number) - (arr[idx - 1] as number) > 1) {
                    acc.push('...');
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  typeof page === 'string' ? (
                    <span key={`dots-${idx}`} className={styles.pdvPageDots}>…</span>
                  ) : (
                    <button
                      key={page}
                      className={`${styles.pdvPageNum} ${currentPage === page ? styles.pdvPageActive : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
              <button
                className={styles.pdvPageBtn}
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                »
              </button>
            </div>
          )}
        </>
      )}
      {outOfStockModal && (
        <div className={styles.modalOverlay} onClick={() => setOutOfStockModal(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalIcon}>!</div>
            <h3 className={styles.modalTitle}>Produto sem estoque</h3>
            <p className={styles.modalText}>Este produto está com <strong>0 unidades</strong> em estoque e não pode ser adicionado ao carrinho.</p>
            <button className={styles.modalBtn} onClick={() => setOutOfStockModal(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default PDVProducts;