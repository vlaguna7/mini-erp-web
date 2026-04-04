import React, { useState, useEffect } from 'react';
import { Truck } from 'lucide-react';
import { supplierService, SupplierData } from '../../services/supplierService';
import SimpleListPage from '../../components/SimpleListPage';

const FornecedoresPage: React.FC = () => {
  const [items, setItems] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await supplierService.getAll();
      setItems(data);
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (name: string) => {
    const created = await supplierService.create({ name });
    setItems((prev) => [...prev, created]);
  };

  const handleDelete = async (id: number) => {
    await supplierService.delete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <SimpleListPage
      title="Fornecedores"
      subtitle="Gerencie os fornecedores de produtos"
      icon={<Truck size={48} />}
      backPath="/gestao-estoque"
      items={items}
      loading={loading}
      onCreate={handleCreate}
      onDelete={handleDelete}
      createPlaceholder="Nome do fornecedor..."
      createLabel="Novo Fornecedor"
      emptyText="Nenhum fornecedor cadastrado."
      searchPlaceholder="Buscar fornecedores..."
    />
  );
};

export default FornecedoresPage;
