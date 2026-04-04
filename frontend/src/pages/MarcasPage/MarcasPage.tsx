import React, { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { productBrandService, ProductBrandData } from '../../services/productBrandService';
import SimpleListPage from '../../components/SimpleListPage';

const MarcasPage: React.FC = () => {
  const [items, setItems] = useState<ProductBrandData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await productBrandService.getAll();
      setItems(data);
    } catch (err) {
      console.error('Erro ao carregar marcas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    const created = await productBrandService.create(name);
    setItems((prev) => [...prev, created]);
  };

  const handleDelete = async (id: number) => {
    await productBrandService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <SimpleListPage
      title="Marcas"
      subtitle="Gerencie as marcas de produtos"
      icon={<Palette size={48} />}
      backPath="/gestao-estoque"
      items={items}
      loading={loading}
      onCreate={handleCreate}
      onDelete={handleDelete}
      createPlaceholder="Nome da marca..."
      createLabel="Nova Marca"
      emptyText="Nenhuma marca cadastrada."
      searchPlaceholder="Buscar marcas..."
    />
  );
};

export default MarcasPage;
