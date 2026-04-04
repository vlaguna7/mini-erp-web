import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderTree, FilePlus2, ChevronRight, Settings2, LayoutGrid,
} from 'lucide-react';
import {
  iconPackage, iconMagnifyingGlass, iconCardIndexDividers, iconLabel,
  iconBooks, iconDepartmentStore, iconDeliveryTruck, iconInboxTray,
  iconBalanceScale, iconArtistPalette, iconControlKnobs, iconIdentificationCard,
} from '../../assets/icons';
import { productService } from '../../services/productService';
import { productCategoryService } from '../../services/productCategoryService';
import { productBrandService } from '../../services/productBrandService';
import { productCollectionService } from '../../services/productCollectionService';
import { supplierService } from '../../services/supplierService';
import styles from './GestaoEstoquePage.module.css';

const GestaoEstoquePage: React.FC = () => {
  const navigate = useNavigate();

  const [productCount, setProductCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [brandCount, setBrandCount] = useState(0);
  const [collectionCount, setCollectionCount] = useState(0);
  const [supplierCount, setSupplierCount] = useState(0);

  const loadCounts = useCallback(async () => {
    const [prodRes, catRes, brandRes, colRes, supRes] = await Promise.allSettled([
      productService.getProducts(1, 10000),
      productCategoryService.getAll(),
      productBrandService.getAll(),
      productCollectionService.getAll(),
      supplierService.getAll(),
    ]);

    if (prodRes.status === 'fulfilled') {
      const prods = Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.products ?? [];
      setProductCount(prods.length);
    }
    if (catRes.status === 'fulfilled') setCategoryCount(catRes.value.length);
    if (brandRes.status === 'fulfilled') setBrandCount(brandRes.value.length);
    if (colRes.status === 'fulfilled') setCollectionCount(colRes.value.length);
    if (supRes.status === 'fulfilled') setSupplierCount(supRes.value.length);
  }, []);

  useEffect(() => { loadCounts(); }, [loadCounts]);

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <header className={styles.header}>
        <h1 className={styles.title}>Gestão de Estoque</h1>
        <p className={styles.subtitle}>Gerencie produtos, categorias, marcas e fornecedores em um só lugar</p>
      </header>

      {/* ── GESTÃO DE PRODUTOS ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <LayoutGrid size={18} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Gestão de Produtos</h2>
        </div>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard} onClick={() => navigate('/estoque/criar-produto')}>
            <div className={styles.actionIconWrap}>
              <img src={iconPackage} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Cadastrar Produtos</span>
              <span className={styles.actionDesc}>Adicionar novo produto ao catálogo</span>
            </div>
            <ChevronRight size={16} className={styles.actionArrow} />
          </button>

          <button className={styles.actionCard} onClick={() => navigate('/estoque')}>
            <div className={styles.actionIconWrap}>
              <img src={iconMagnifyingGlass} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Ver Produtos</span>
              <span className={styles.actionDesc}>{productCount} produto{productCount !== 1 ? 's' : ''} cadastrado{productCount !== 1 ? 's' : ''}</span>
            </div>
            <ChevronRight size={16} className={styles.actionArrow} />
          </button>
        </div>
      </section>

      {/* ── ORGANIZAÇÃO ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <FolderTree size={18} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Organização</h2>
        </div>
        <div className={styles.actionGrid3}>
          <button className={styles.actionCard} onClick={() => navigate('/gestao-estoque/categorias')}>
            <div className={styles.actionIconWrap}>
              <img src={iconCardIndexDividers} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Categorias</span>
              <span className={styles.actionDesc}>{categoryCount} cadastrada{categoryCount !== 1 ? 's' : ''}</span>
            </div>
            <ChevronRight size={16} className={styles.actionArrow} />
          </button>

          <button className={styles.actionCard} onClick={() => navigate('/gestao-estoque/marcas')}>
            <div className={styles.actionIconWrap}>
              <img src={iconLabel} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Marcas</span>
              <span className={styles.actionDesc}>{brandCount} cadastrada{brandCount !== 1 ? 's' : ''}</span>
            </div>
            <ChevronRight size={16} className={styles.actionArrow} />
          </button>

          <button className={styles.actionCard} onClick={() => navigate('/gestao-estoque/colecoes')}>
            <div className={styles.actionIconWrap}>
              <img src={iconBooks} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Coleções</span>
              <span className={styles.actionDesc}>{collectionCount} cadastrada{collectionCount !== 1 ? 's' : ''}</span>
            </div>
            <ChevronRight size={16} className={styles.actionArrow} />
          </button>
        </div>
      </section>

      {/* ── OPERAÇÃO ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <Settings2 size={18} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Operação</h2>
        </div>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard} onClick={() => navigate('/estoque')}>
            <div className={styles.actionIconWrap}>
              <img src={iconDepartmentStore} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Controle de Estoque</span>
              <span className={styles.actionDesc}>Visualizar e gerenciar quantidades</span>
            </div>
            <ChevronRight size={16} className={styles.actionArrow} />
          </button>

          <button className={styles.actionCard} onClick={() => navigate('/gestao-estoque/fornecedores')}>
            <div className={styles.actionIconWrap}>
              <img src={iconDeliveryTruck} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Fornecedores</span>
              <span className={styles.actionDesc}>{supplierCount} cadastrado{supplierCount !== 1 ? 's' : ''}</span>
            </div>
            <ChevronRight size={16} className={styles.actionArrow} />
          </button>

          <button className={styles.actionCard} onClick={() => alert('Lançar Compra de Mercadoria — em breve!')}>
            <div className={styles.actionIconWrap}>
              <img src={iconInboxTray} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Lançar Compra de Mercadoria</span>
              <span className={styles.actionDesc}>Registrar entrada de produtos</span>
            </div>
            <ChevronRight size={16} className={styles.actionArrow} />
          </button>

          <button className={styles.actionCard} disabled>
            <div className={styles.actionIconWrap}>
              <img src={iconBalanceScale} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Unidades</span>
              <span className={styles.actionDesc}>Unidades de medida dos produtos</span>
            </div>
            <div className={styles.comingSoon}>Em breve</div>
          </button>

          <button className={styles.actionCard} disabled>
            <div className={styles.actionIconWrap}>
              <img src={iconArtistPalette} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Variações</span>
              <span className={styles.actionDesc}>Tamanhos, cores e variantes</span>
            </div>
            <div className={styles.comingSoon}>Em breve</div>
          </button>
        </div>
      </section>

      {/* ── ESTRUTURA AVANÇADA ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <FilePlus2 size={18} className={styles.sectionIcon} />
          <h2 className={styles.sectionTitle}>Estrutura Avançada</h2>
        </div>
        <div className={styles.actionGrid}>
          <button className={styles.actionCard} disabled>
            <div className={styles.actionIconWrap}>
              <img src={iconControlKnobs} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>Atributos</span>
              <span className={styles.actionDesc}>Atributos customizáveis para produtos</span>
            </div>
            <div className={styles.comingSoon}>Em breve</div>
          </button>

          <button className={styles.actionCard} disabled>
            <div className={styles.actionIconWrap}>
              <img src={iconIdentificationCard} alt="" width={28} height={28} />
            </div>
            <div className={styles.actionInfo}>
              <span className={styles.actionLabel}>SKUs</span>
              <span className={styles.actionDesc}>Códigos individuais por variação</span>
            </div>
            <div className={styles.comingSoon}>Em breve</div>
          </button>
        </div>
      </section>
    </div>
  );
};

export default GestaoEstoquePage;
