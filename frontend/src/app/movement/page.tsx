'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { apiFetch } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string | null;
  currentStock: number;
  minStock: number;
  category?: { name: string };
}

export default function MovementPage() {
  const [type, setType] = useState<'ENTRY' | 'EXIT' | 'LOSS'>('ENTRY');
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('DAMAGE');
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Carregar produtos da API
  useEffect(() => {
    async function loadProducts() {
      setFetchingProducts(true);
      try {
        const data = await apiFetch(`/products?search=${encodeURIComponent(search)}&status=active`);
        setProducts(data);
        if (data.length > 0 && !selectedProduct) {
          setSelectedProduct(data[0]);
        }
      } catch (err: unknown) {
        console.error('Erro ao buscar produtos:', err);
      } finally {
        setFetchingProducts(false);
      }
    }

    const timer = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const qtyNumber = parseInt(quantity, 10) || 0;
  const currentStock = selectedProduct?.currentStock ?? 0;

  const simulatedStock = type === 'ENTRY'
    ? currentStock + qtyNumber
    : currentStock - qtyNumber;

  const isInvalid = !selectedProduct || qtyNumber <= 0 || (type !== 'ENTRY' && simulatedStock < 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isInvalid || !selectedProduct) return;

    setLoading(true);
    setMessage(null);

    try {
      await apiFetch('/movements', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedProduct.id,
          type,
          quantity: qtyNumber,
          reason: type === 'LOSS' ? reason : null,
          observation: observation.trim() || undefined,
        }),
      });

      // Atualizar o saldo local do produto selecionado
      setSelectedProduct({
        ...selectedProduct,
        currentStock: simulatedStock,
      });

      // Atualizar lista de produtos
      setProducts(prev =>
        prev.map(p => (p.id === selectedProduct.id ? { ...p, currentStock: simulatedStock } : p))
      );

      setMessage({
        text: `Movimentação de ${type === 'ENTRY' ? 'entrada' : type === 'EXIT' ? 'saída' : 'perda'} registrada com sucesso!`,
        isError: false,
      });
      setQuantity('');
      setObservation('');
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Erro ao registrar movimentação.';
      setMessage({ text: errMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 max-w-5xl">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Registrar Movimentação</h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle entradas de mercadorias, saídas de pedidos e perdas de estoque.
          </p>
        </header>

        {/* Tipo de Movimentação */}
        <div className="flex gap-2 p-1 bg-slate-200/70 rounded-xl w-fit mb-6">
          <button
            type="button"
            onClick={() => { setType('ENTRY'); setMessage(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              type === 'ENTRY' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Entrada (+)
          </button>
          <button
            type="button"
            onClick={() => { setType('EXIT'); setMessage(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              type === 'EXIT' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Saída (-)
          </button>
          <button
            type="button"
            onClick={() => { setType('LOSS'); setMessage(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              type === 'LOSS' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Perda / Avaria (!)
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-medium ${
              message.isError
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-6">
          <div>
            <label className="text-xs font-semibold text-slate-700">Buscar Produto</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Digite o nome, SKU ou leia o código de barras..."
              className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
            {fetchingProducts && (
              <p className="text-xs text-slate-400 mt-1">Pesquisando produtos...</p>
            )}

            {/* Dropdown de Seleção se houver produtos */}
            {products.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 bg-slate-50/50">
                {products.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProduct(p)}
                    className={`w-full p-2.5 text-left text-xs flex justify-between items-center hover:bg-white transition ${
                      selectedProduct?.id === p.id ? 'bg-blue-50/80 font-semibold text-blue-900' : 'text-slate-700'
                    }`}
                  >
                    <span>{p.name} <span className="text-slate-400 font-normal">({p.sku})</span></span>
                    <span className="font-semibold text-slate-500">Saldo: {p.currentStock}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedProduct && (
            <div className="p-4 bg-slate-50 rounded-xl flex justify-between items-center border border-slate-100">
              <div>
                <p className="font-semibold text-slate-900">{selectedProduct.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  SKU: {selectedProduct.sku} {selectedProduct.barcode ? `• Barcode: ${selectedProduct.barcode}` : ''} {selectedProduct.category?.name ? `• ${selectedProduct.category.name}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Saldo atual</p>
                <p className="text-lg font-bold text-slate-900">{selectedProduct.currentStock} unidades</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Quantidade (número inteiro) *</label>
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Ex.: 10"
                className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                required
              />
            </div>

            {type === 'LOSS' ? (
              <div>
                <label className="text-xs font-semibold text-slate-700">Motivo da Perda *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  <option value="DAMAGE">Avaria / Danificado</option>
                  <option value="EXPIRATION">Validade Vencida</option>
                  <option value="LOSS">Extravio / Sumiço</option>
                  <option value="OTHER">Outro Motivo</option>
                </select>
              </div>
            ) : (
              <div>
                <label className="text-xs font-semibold text-slate-700">Referência / Observação</label>
                <input
                  type="text"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  placeholder="Ex.: NF 1234, fornecedor ou motivo"
                  className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            )}
          </div>

          {selectedProduct && qtyNumber > 0 && (
            <div
              className={`p-4 rounded-xl flex justify-between items-center border ${
                simulatedStock < 0
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : type === 'ENTRY'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-blue-50 text-blue-800 border-blue-200'
              }`}
            >
              <span className="text-sm font-medium">Novo saldo projetado:</span>
              <span className="text-xl font-bold">{simulatedStock} unidades</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isInvalid || loading}
            className={`py-3 px-6 rounded-xl text-white font-medium self-start transition flex items-center gap-2 ${
              isInvalid || loading
                ? 'bg-slate-300 cursor-not-allowed'
                : type === 'ENTRY'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : type === 'EXIT'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processando...</span>
              </>
            ) : (
              `Confirmar ${type === 'ENTRY' ? 'Entrada' : type === 'EXIT' ? 'Saída' : 'Perda'}`
            )}
          </button>
        </form>
      </main>
    </div>
  );
}