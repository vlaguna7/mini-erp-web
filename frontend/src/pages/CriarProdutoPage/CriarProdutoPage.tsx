import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, Package } from 'lucide-react';
import { productService, ProductFormData } from '../../services/productService';
import { productCategoryService, ProductCategoryData } from '../../services/productCategoryService';
import { productBrandService, ProductBrandData } from '../../services/productBrandService';
import { productCollectionService, ProductCollectionData } from '../../services/productCollectionService';
import { supplierService, SupplierData } from '../../services/supplierService';
import styles from './CriarProdutoPage.module.css';

const TABS = [
  'Informações gerais',
  'Grade',
  'Valores',
  'Estoque',
  'Imagens',
  'Pesos e dimensões',
  'Dados fiscais',
  'E-commerce',
];

const UNIT_TYPES = ['UN', 'PC', 'CX', 'KG', 'G', 'M'];

// ── Modal genérico para criar item com campo nome ──
const QuickCreateModal: React.FC<{
  title: string;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}> = ({ title, onSave, onClose }) => {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(name.trim());
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>{title}</h3>
        {error && <div className={styles.errorMsg}>{error}</div>}
        <div className={styles.modalField}>
          <label>Nome</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Digite o nome..."
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          />
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose} type="button">Cancelar</button>
          <button className={styles.btnSave} onClick={handleSave} disabled={saving} type="button">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Modal de Fornecedor ──
const SupplierModal: React.FC<{
  onSave: (data: { name: string; cnpj?: string; email?: string; phone?: string }) => Promise<void>;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Nome é obrigatório'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave({
        name: name.trim(),
        cnpj: cnpj.replace(/\D/g, '') || undefined,
        email: email.trim() || undefined,
        phone: phone.replace(/\D/g, '') || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>Novo Fornecedor</h3>
        {error && <div className={styles.errorMsg}>{error}</div>}
        <div className={styles.modalField}>
          <label>Nome *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do fornecedor" autoFocus />
        </div>
        <div className={styles.modalField}>
          <label>CNPJ</label>
          <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
        </div>
        <div className={styles.modalField}>
          <label>E-mail</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" />
        </div>
        <div className={styles.modalField}>
          <label>Telefone</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
        </div>
        <div className={styles.modalActions}>
          <button className={styles.btnCancel} onClick={onClose} type="button">Cancelar</button>
          <button className={styles.btnSave} onClick={handleSave} disabled={saving} type="button">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Componente principal ──
const CriarProdutoPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: productId } = useParams<{ id: string }>();
  const isEditing = Boolean(productId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lookups
  const [categories, setCategories] = useState<ProductCategoryData[]>([]);
  const [brands, setBrands] = useState<ProductBrandData[]>([]);
  const [collections, setCollections] = useState<ProductCollectionData[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);

  // Modals
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  // ── Form state ──
  // Informações gerais
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitType, setUnitType] = useState('');
  const [brandId, setBrandId] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [code, setCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [observations, setObservations] = useState('');

  // Valores
  const [priceCost, setPriceCost] = useState('');
  const [markup, setMarkup] = useState('');
  const [priceSale, setPriceSale] = useState('');

  // Estoque
  const [quantityStock, setQuantityStock] = useState('');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');

  // Imagens
  const [images, setImages] = useState<string[]>([]);

  // Pesos e dimensões
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [width, setWidth] = useState('');
  const [depth, setDepth] = useState('');

  // Dados fiscais
  const [ncm, setNcm] = useState('');
  const [cest, setCest] = useState('');
  const [cfop, setCfop] = useState('');
  const [icmsOrigin, setIcmsOrigin] = useState('');
  const [icmsCst, setIcmsCst] = useState('');

  // E-commerce
  const [ecommerceActive, setEcommerceActive] = useState(false);
  const [ecommerceDescription, setEcommerceDescription] = useState('');
  const [ecommerceSeoTitle, setEcommerceSeoTitle] = useState('');
  const [ecommerceSeoDescription, setEcommerceSeoDescription] = useState('');

  // ── Carregar lookups + produto (se editando) ──
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cats, brs, cols, sups] = await Promise.all([
          productCategoryService.getAll(),
          productBrandService.getAll(),
          productCollectionService.getAll(),
          supplierService.getAll(),
        ]);
        setCategories(cats);
        setBrands(brs);
        setCollections(cols);
        setSuppliers(sups);

        if (productId) {
          const p = await productService.getProduct(productId);
          setName(p.name || '');
          setCategoryId(p.categoryId ? String(p.categoryId) : '');
          setUnitType(p.unitType || '');
          setBrandId(p.brandId ? String(p.brandId) : '');
          setCollectionId(p.collectionId ? String(p.collectionId) : '');
          setSupplierId(p.supplierId ? String(p.supplierId) : '');
          setCode(p.code || '');
          setBarcode(p.barcode || '');
          setObservations(p.observations || '');
          setPriceCost(p.priceCost != null ? String(p.priceCost) : '');
          setMarkup(p.markup != null ? String(p.markup) : '');
          setPriceSale(p.priceSale != null ? String(p.priceSale) : '');
          setQuantityStock(p.quantityStock != null ? String(p.quantityStock) : '');
          setMinStock(p.minStock != null ? String(p.minStock) : '');
          setMaxStock(p.maxStock != null ? String(p.maxStock) : '');
          setImages(p.images ? p.images.map((img: any) => img.url) : []);
          setWeight(p.weight != null ? String(p.weight) : '');
          setHeight(p.height != null ? String(p.height) : '');
          setWidth(p.width != null ? String(p.width) : '');
          setDepth(p.depth != null ? String(p.depth) : '');
          setNcm(p.ncm || '');
          setCest(p.cest || '');
          setCfop(p.cfop || '');
          setIcmsOrigin(p.icmsOrigin || '');
          setIcmsCst(p.icmsCst || '');
          setEcommerceActive(p.ecommerceActive || false);
          setEcommerceDescription(p.ecommerceDescription || '');
          setEcommerceSeoTitle(p.ecommerceSeoTitle || '');
          setEcommerceSeoDescription(p.ecommerceSeoDescription || '');
        }
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        if (productId) setErrorMsg('Erro ao carregar produto.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [productId]);

  // ── Cálculo bidirecional Markup ↔ Preço de Venda ──
  const handlePriceCostChange = (val: string) => {
    setPriceCost(val);
    const cost = parseFloat(val);
    const mk = parseFloat(markup);
    if (!isNaN(cost) && !isNaN(mk) && cost > 0) {
      setPriceSale((cost * (1 + mk / 100)).toFixed(2));
    }
  };

  const handleMarkupChange = (val: string) => {
    setMarkup(val);
    const cost = parseFloat(priceCost);
    const mk = parseFloat(val);
    if (!isNaN(cost) && !isNaN(mk) && cost > 0) {
      setPriceSale((cost * (1 + mk / 100)).toFixed(2));
    }
  };

  const handlePriceSaleChange = (val: string) => {
    setPriceSale(val);
    const cost = parseFloat(priceCost);
    const sale = parseFloat(val);
    if (!isNaN(cost) && !isNaN(sale) && cost > 0) {
      setMarkup((((sale - cost) / cost) * 100).toFixed(2));
    }
  };

  // ── Upload de imagens ──
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return;

      const reader = new FileReader();
      reader.onload = () => {
        setImages((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Validação ──
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Nome do produto é obrigatório';
    if (!code.trim()) newErrors.code = 'Código do produto (SKU) é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ── Salvar ──
  const handleSave = async () => {
    if (!validate()) {
      setActiveTab(0);
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data: ProductFormData = {
        name: name.trim(),
        code: code.trim(),
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        category: categoryId ? categories.find(c => c.id === parseInt(categoryId))?.name : undefined,
        unitType: unitType || undefined,
        brandId: brandId ? parseInt(brandId) : undefined,
        collectionId: collectionId ? parseInt(collectionId) : undefined,
        supplierId: supplierId ? parseInt(supplierId) : undefined,
        barcode: barcode.trim() || undefined,
        observations: observations.trim() || undefined,
        priceCost: priceCost ? parseFloat(priceCost) : undefined,
        markup: markup ? parseFloat(markup) : undefined,
        priceSale: priceSale ? parseFloat(priceSale) : undefined,
        quantityStock: quantityStock ? parseInt(quantityStock) : 0,
        minStock: minStock ? parseInt(minStock) : undefined,
        maxStock: maxStock ? parseInt(maxStock) : undefined,
        images: images.length > 0 ? images : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        width: width ? parseFloat(width) : undefined,
        depth: depth ? parseFloat(depth) : undefined,
        ncm: ncm.trim() || undefined,
        cest: cest.trim() || undefined,
        cfop: cfop.trim() || undefined,
        icmsOrigin: icmsOrigin.trim() || undefined,
        icmsCst: icmsCst.trim() || undefined,
        ecommerceActive,
        ecommerceDescription: ecommerceDescription.trim() || undefined,
        ecommerceSeoTitle: ecommerceSeoTitle.trim() || undefined,
        ecommerceSeoDescription: ecommerceSeoDescription.trim() || undefined,
      };

      if (isEditing) {
        await productService.updateProduct(productId!, data);
      } else {
        await productService.createProduct(data);
      }
      navigate('/estoque');
    } catch (err: any) {
      const msg =
        err?.response?.data?.errors?.[0]?.msg ||
        err?.response?.data?.error ||
        'Erro ao salvar produto.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setName(''); setCategoryId(''); setUnitType(''); setBrandId('');
    setCollectionId(''); setSupplierId(''); setCode(''); setBarcode('');
    setObservations(''); setPriceCost(''); setMarkup(''); setPriceSale('');
    setQuantityStock(''); setMinStock(''); setMaxStock(''); setImages([]);
    setWeight(''); setHeight(''); setWidth(''); setDepth('');
    setNcm(''); setCest(''); setCfop(''); setIcmsOrigin(''); setIcmsCst('');
    setEcommerceActive(false); setEcommerceDescription('');
    setEcommerceSeoTitle(''); setEcommerceSeoDescription('');
    setErrors({});
  };

  // ── Render das abas ──
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: return renderInfoGeral();
      case 1: return renderGrade();
      case 2: return renderValores();
      case 3: return renderEstoque();
      case 4: return renderImagens();
      case 5: return renderPesosDimensoes();
      case 6: return renderDadosFiscais();
      case 7: return renderEcommerce();
      default: return null;
    }
  };

  const renderInfoGeral = () => (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label>Nome do Produto *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do produto"
          className={errors.name ? styles.error : ''}
        />
        {errors.name && <span className={styles.errorText}>{errors.name}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label>Categoria de Produto</label>
        <select value={categoryId} onChange={(e) => {
          if (e.target.value === '__create__') {
            setShowCategoryModal(true);
          } else {
            setCategoryId(e.target.value);
          }
        }}>
          <option value="">Selecione...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
          <option value="__create__">+ Criar novo</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label>Tipo de Unidade</label>
        <select value={unitType} onChange={(e) => setUnitType(e.target.value)}>
          <option value="">Selecione...</option>
          {UNIT_TYPES.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label>Marca</label>
        <select value={brandId} onChange={(e) => {
          if (e.target.value === '__create__') {
            setShowBrandModal(true);
          } else {
            setBrandId(e.target.value);
          }
        }}>
          <option value="">Selecione...</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
          <option value="__create__">+ Criar novo</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label>Coleção</label>
        <select value={collectionId} onChange={(e) => {
          if (e.target.value === '__create__') {
            setShowCollectionModal(true);
          } else {
            setCollectionId(e.target.value);
          }
        }}>
          <option value="">Selecione...</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
          <option value="__create__">+ Criar novo</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label>Fornecedor</label>
        <select value={supplierId} onChange={(e) => {
          if (e.target.value === '__create__') {
            setShowSupplierModal(true);
          } else {
            setSupplierId(e.target.value);
          }
        }}>
          <option value="">Selecione...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
          <option value="__create__">+ Criar novo</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label>Código do Produto (SKU) *</label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Ex: PROD-001"
          className={errors.code ? styles.error : ''}
        />
        {errors.code && <span className={styles.errorText}>{errors.code}</span>}
      </div>

      <div className={styles.fieldGroup}>
        <label>Código de Barras</label>
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          placeholder="Gerado automaticamente se vazio"
        />
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
        <label>Observações</label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Observações sobre o produto..."
        />
      </div>
    </div>
  );

  const renderGrade = () => (
    <div className={styles.sectionPlaceholder}>
      <Package size={48} />
      <p>Gerenciamento de grades (tamanho, cor, etc.) estará disponível em breve.</p>
    </div>
  );

  const renderValores = () => (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label>Valor de Custo (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={priceCost}
          onChange={(e) => handlePriceCostChange(e.target.value)}
          placeholder="0,00"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Markup (%)</label>
        <input
          type="number"
          step="0.01"
          value={markup}
          onChange={(e) => handleMarkupChange(e.target.value)}
          placeholder="0,00"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Valor de Venda (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={priceSale}
          onChange={(e) => handlePriceSaleChange(e.target.value)}
          placeholder="0,00"
        />
      </div>
    </div>
  );

  const renderEstoque = () => (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label>Estoque Disponível</label>
        <input
          type="number"
          min="0"
          value={quantityStock}
          onChange={(e) => setQuantityStock(e.target.value)}
          placeholder="0"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Estoque Mínimo</label>
        <input
          type="number"
          min="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          placeholder="0"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Estoque Máximo</label>
        <input
          type="number"
          min="0"
          value={maxStock}
          onChange={(e) => setMaxStock(e.target.value)}
          placeholder="0"
        />
      </div>
    </div>
  );

  const renderImagens = () => (
    <div>
      <div className={styles.imagesGrid}>
        {images.map((img, idx) => (
          <div key={idx} className={styles.imageCard}>
            <img src={img} alt={`Produto ${idx + 1}`} />
            <button className={styles.imageRemoveBtn} onClick={() => removeImage(idx)} type="button">×</button>
          </div>
        ))}
        <div className={styles.imageUploadArea} onClick={() => fileInputRef.current?.click()}>
          <Camera size={32} />
          <span>Adicionar imagem</span>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        style={{ display: 'none' }}
      />
    </div>
  );

  const renderPesosDimensoes = () => (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label>Peso (kg)</label>
        <input
          type="number"
          step="0.001"
          min="0"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="0,000"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Altura (cm)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          placeholder="0,00"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Largura (cm)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          placeholder="0,00"
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Profundidade (cm)</label>
        <input
          type="number"
          step="0.01"
          min="0"
          value={depth}
          onChange={(e) => setDepth(e.target.value)}
          placeholder="0,00"
        />
      </div>
    </div>
  );

  const renderDadosFiscais = () => (
    <div className={styles.formGrid}>
      <div className={styles.fieldGroup}>
        <label>NCM</label>
        <input
          value={ncm}
          onChange={(e) => setNcm(e.target.value)}
          placeholder="Ex: 61091000"
          maxLength={10}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>CEST</label>
        <input
          value={cest}
          onChange={(e) => setCest(e.target.value)}
          placeholder="Ex: 2804200"
          maxLength={10}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>CFOP</label>
        <input
          value={cfop}
          onChange={(e) => setCfop(e.target.value)}
          placeholder="Ex: 5102"
          maxLength={10}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Origem do ICMS</label>
        <select value={icmsOrigin} onChange={(e) => setIcmsOrigin(e.target.value)}>
          <option value="">Selecione...</option>
          <option value="0">0 - Nacional</option>
          <option value="1">1 - Estrangeira (importação direta)</option>
          <option value="2">2 - Estrangeira (adquirida no mercado interno)</option>
          <option value="3">3 - Nacional (conteúdo importação 40%-70%)</option>
          <option value="4">4 - Nacional (processos produtivos básicos)</option>
          <option value="5">5 - Nacional (conteúdo importação &lt; 40%)</option>
          <option value="6">6 - Estrangeira (importação direta, sem similar)</option>
          <option value="7">7 - Estrangeira (mercado interno, sem similar)</option>
          <option value="8">8 - Nacional (conteúdo importação &gt; 70%)</option>
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label>CST do ICMS</label>
        <input
          value={icmsCst}
          onChange={(e) => setIcmsCst(e.target.value)}
          placeholder="Ex: 00"
          maxLength={10}
        />
      </div>
    </div>
  );

  const renderEcommerce = () => (
    <div className={styles.formGrid}>
      <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
        <label>Ativo no E-commerce</label>
        <div className={styles.toggleGroup}>
          <button
            type="button"
            className={`${styles.toggleSwitch} ${ecommerceActive ? styles.active : ''}`}
            onClick={() => setEcommerceActive(!ecommerceActive)}
          />
          <span className={styles.toggleLabel}>{ecommerceActive ? 'Sim' : 'Não'}</span>
        </div>
      </div>

      <div className={`${styles.fieldGroup} ${styles.fullWidth}`}>
        <label>Descrição para E-commerce</label>
        <textarea
          value={ecommerceDescription}
          onChange={(e) => setEcommerceDescription(e.target.value)}
          placeholder="Descrição detalhada do produto para a loja virtual..."
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Título SEO</label>
        <input
          value={ecommerceSeoTitle}
          onChange={(e) => setEcommerceSeoTitle(e.target.value)}
          placeholder="Título para mecanismos de busca"
          maxLength={200}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label>Descrição SEO</label>
        <input
          value={ecommerceSeoDescription}
          onChange={(e) => setEcommerceSeoDescription(e.target.value)}
          placeholder="Meta description para SEO"
          maxLength={500}
        />
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{isEditing ? 'Editar Produto' : 'Cadastrar Produto'}</h1>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab, idx) => (
          <button
            key={tab}
            className={`${styles.tab} ${idx === activeTab ? styles.active : ''}`}
            onClick={() => setActiveTab(idx)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {successMsg && <div className={styles.successMsg}>{successMsg}</div>}
      {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}

      {/* Tab content */}
      {renderTabContent()}

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.btnCancel} onClick={() => navigate('/estoque')} type="button">
          Cancelar
        </button>
        <button className={styles.btnSave} onClick={handleSave} disabled={saving || loading} type="button">
          {saving ? 'Salvando...' : isEditing ? 'Atualizar Produto' : 'Salvar Produto'}
        </button>
      </div>

      {/* Modals */}
      {showCategoryModal && (
        <QuickCreateModal
          title="Nova Categoria"
          onSave={async (n) => {
            const item = await productCategoryService.create(n);
            setCategories((prev) => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
            setCategoryId(String(item.id));
          }}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {showBrandModal && (
        <QuickCreateModal
          title="Nova Marca"
          onSave={async (n) => {
            const item = await productBrandService.create(n);
            setBrands((prev) => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
            setBrandId(String(item.id));
          }}
          onClose={() => setShowBrandModal(false)}
        />
      )}

      {showCollectionModal && (
        <QuickCreateModal
          title="Nova Coleção"
          onSave={async (n) => {
            const item = await productCollectionService.create(n);
            setCollections((prev) => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
            setCollectionId(String(item.id));
          }}
          onClose={() => setShowCollectionModal(false)}
        />
      )}

      {showSupplierModal && (
        <SupplierModal
          onSave={async (data) => {
            const item = await supplierService.create(data);
            setSuppliers((prev) => [...prev, item].sort((a, b) => a.name.localeCompare(b.name)));
            setSupplierId(String(item.id));
          }}
          onClose={() => setShowSupplierModal(false)}
        />
      )}
    </div>
  );
};

export default CriarProdutoPage;
