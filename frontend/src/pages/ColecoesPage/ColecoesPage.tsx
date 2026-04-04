import React, { useState, useEffect } from 'react';
import { Layers } from 'lucide-react';
import { productCollectionService, ProductCollectionData } from '../../services/productCollectionService';
import SimpleListPage from '../../components/SimpleListPage';

const ColecoesPage: React.FC = () => {
  const [items, setItems] = useState<ProductCollectionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await productCollectionService.getAll();
      setItems(data);
    } catch (err) {
      console.error('Erro ao carregar coleções:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    const created = await productCollectionService.create(name);
    setItems((prev) => [...prev, created]);
  };

  const handleDelete = async (id: number) => {
    await productCollectionService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <SimpleListPage
      title="Coleções"
      subtitle="Gerencie as coleções de produtos"
      icon={<Layers size={48} />}
      backPath="/gestao-estoque"
      items={items}
      loading={loading}
      onCreate={handleCreate}
      onDelete={handleDelete}
      createPlaceholder="Nome da coleção..."
      createLabel="Nova Coleção"
      emptyText="Nenhuma coleção cadastrada."
      searchPlaceholder="Buscar coleções..."
    />
  );
};

export default ColecoesPage;
