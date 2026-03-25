import React, { useState, useMemo, useEffect } from 'react';
import { Image as ImageIcon, Code } from 'lucide-react';
import { productService } from '../services/productService';
import { usePDVStore } from '../store/pdvStore';
import './PDVProducts.css';

const ITEMS_PER_PAGE = 15;

export const PDVProducts: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart, cart } = usePDVStore();

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
        stock: p.quantity_stock ?? 0,
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

  const isInCart = (productId: string) =>
    cart.some((item) => item.id === productId);

  const handleAddToCart = (product: any) => {
    // Prevent duplicate additions - only add if not already in cart
    if (isInCart(product.id)) {
      return;
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price_sale) || 0,
      quantity: 1,
      code: product.code,
    });
  };

  if (isLoading) {
    return (
      <div className="pdv-products">
        <div className="pdv-loading">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="pdv-products">
      <div className="pdv-products-header">
        <h2 className="pdv-products-title">Produtos</h2>
      </div>

      <div className="pdv-products-search">
        <input
          type="text"
          placeholder="Buscar por nome ou código..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="pdv-search-input"
        />
      </div>

      {paginatedProducts.length === 0 ? (
        <div className="pdv-products-empty">
          <p>Nenhum produto encontrado</p>
        </div>
      ) : (
        <>
          <div className="pdv-products-grid">
            {paginatedProducts.map((product: any) => (
              <button
                key={product.id}
                className={`pdv-product-card ${
                  isInCart(product.id) ? 'in-cart' : ''
                }`}
                onClick={() => handleAddToCart(product)}
              >
                {/* Coluna 1: Placeholder de Imagem */}
                <div className="pdv-product-image-placeholder">
                  <ImageIcon size={24} className="pdv-image-icon" />
                </div>

                {/* Coluna 2: Informações Básicas (Categoria + Nome) */}
                <div className="pdv-product-info-basic">
                  <div className="pdv-product-category-wrapper">
                    <span className="pdv-product-category-label">Categoria:</span>
                    <span className="pdv-product-category">{product.category}</span>
                  </div>
                  <span className="pdv-product-name">{product.name}</span>
                </div>

                {/* Coluna 3: Informações Técnicas (SKU + Código de Barras) */}
                <div className="pdv-product-info-technical">
                  <span className="pdv-product-sku">{product.sku}</span>
                  <div className="pdv-product-barcode-group">
                    <Code size={16} className="pdv-barcode-icon" />
                    <span className="pdv-product-barcode">{product.barcode}</span>
                  </div>
                </div>

                {/* Coluna 4: Informações Comerciais (Preço + Quantidade) */}
                <div className="pdv-product-info-commercial">
                  <span className="pdv-product-price">
                    R$ {parseFloat(product.price_sale || 0).toFixed(2)}
                  </span>
                  <div className="pdv-product-stock">
                    <span className="pdv-stock-quantity">{product.stock}</span>
                    <span className="pdv-stock-unit">UN</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pdv-pagination">
              <button
                className="pdv-page-btn"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                ← Anterior
              </button>

              <div className="pdv-page-info">
                Página {currentPage} de {totalPages}
              </div>

              <button
                className="pdv-page-btn"
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
