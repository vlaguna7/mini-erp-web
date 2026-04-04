import React, { useState, useEffect } from 'react';
import { Tags } from 'lucide-react';
import { productCategoryService, ProductCategoryData } from '../../services/productCategoryService';
import SimpleListPage from '../../components/SimpleListPage';

const CategoriasPage: React.FC = () => {
  const [items, setItems] = useState<ProductCategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await productCategoryService.getAll();
      setItems(data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    const created = await productCategoryService.create(name);
    setItems((prev) => [...prev, created]);
  };

  const handleDelete = async (id: number) => {
    await productCategoryService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <SimpleListPage
      title="Categorias"
      subtitle="Gerencie as categorias de produtos"
      icon={<Tags size={48} />}
      backPath="/gestao-estoque"
      items={items}
      loading={loading}
      onCreate={handleCreate}
      onDelete={handleDelete}
      createPlaceholder="Nome da categoria..."
      createLabel="Nova Categoria"
      emptyText="Nenhuma categoria cadastrada."
      searchPlaceholder="Buscar categorias..."
    />
  );
};

export default CategoriasPage;
