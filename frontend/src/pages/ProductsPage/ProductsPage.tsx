import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useAuthStore } from '../../store/authStore';
import ProductForm from '../../components/ProductForm';
import styles from './ProductsPage.module.css';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productService.getProducts();
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(id);
        loadProducts();
      } catch (error) {
        console.error('Failed to delete product:', error);
      }
    }
  };

  return (
    <div className={styles.productsPage}>
      <nav className="navbar">
        <div className="nav-content">
          <h1>Mini ERP - Products</h1>
          <div className="nav-user">
            <span>Welcome, {user?.name}</span>
            <button onClick={handleLogout} className="btn btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="page-content">
        <div className={styles.productsHeader}>
          <h2>Products Management</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            {showForm ? 'Hide Form' : 'Add New Product'}
          </button>
        </div>

        {showForm && (
          <div className={styles.formSection}>
            <ProductForm onSuccess={loadProducts} />
          </div>
        )}

        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {isLoading ? (
          <div className="loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <p>No products found. Create your first product!</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <h3>{product.name}</h3>
                  <span className="product-code">[{product.code}]</span>
                </div>
                <div className="product-category">{product.category}</div>
                <div className="product-details">
                  <div className="detail-row">
                    <span>Stock:</span>
                    <strong>{product.quantity_stock}</strong>
                  </div>
                  <div className="detail-row">
                    <span>Min Stock:</span>
                    <strong>{product.min_stock || '—'}</strong>
                  </div>
                  {product.quantity_stock <= (product.min_stock || 0) && (
                    <div className="alert alert-low-stock">
                      ⚠ Low Stock Alert
                    </div>
                  )}
                </div>
                <div className="product-prices">
                  <div className="price-row">
                    <span>Cost:</span>
                    <strong>R$ {parseFloat(product.price_cost || 0).toFixed(2)}</strong>
                  </div>
                  <div className="price-row">
                    <span>Sale:</span>
                    <strong>R$ {parseFloat(product.price_sale).toFixed(2)}</strong>
                  </div>
                  {product.price_cost && (
                    <div className="price-row">
                      <span>Margin:</span>
                      <strong>
                        {(
                          ((product.price_sale - product.price_cost) / product.price_sale) *
                          100
                        ).toFixed(1)}
                        %
                      </strong>
                    </div>
                  )}
                </div>
                <div className="product-actions">
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="btn btn-danger btn-small"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
