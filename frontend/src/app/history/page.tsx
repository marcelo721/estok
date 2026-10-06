'use client';
import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { apiFetch } from '@/lib/api';

interface MovementRecord {
  id: string;
  type: 'ENTRY' | 'EXIT' | 'LOSS';
  quantity: number;
  reason?: string | null;
  observation?: string | null;
  createdAt: string;
  product?: { id: string; name: string; sku: string };
  user?: { id: string; name: string };
}

export default function HistoryPage() {
  const [history, setHistory] = useState<MovementRecord[]>([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      let query = '';
      if (typeFilter) query += `?type=${typeFilter}`;

      const data = await apiFetch(`/movements/history${query}`);
      setHistory(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao carregar histórico.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [typeFilter]);

  const getReasonLabel = (reason?: string | null) => {
    switch (reason) {
      case 'DAMAGE': return 'Avaria / Quebra';
      case 'EXPIRATION': return 'Validade Vencida';
      case 'LOSS': return 'Extravio';
      case 'OTHER': return 'Outro';
      default: return '-';
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Histórico de Movimentações</h1>
            <p className="text-sm text-slate-500 mt-1">
              Registro completo de todas as entradas, saídas e perdas registradas pelos operadores.
            </p>
          </div>

          <div className="w-full sm:w-56">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
            >
              <option value="">Todas as Movimentações</option>
              <option value="ENTRY">Somente Entradas</option>
              <option value="EXIT">Somente Saídas</option>
              <option value="LOSS">Somente Perdas / Avarias</option>
            </select>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="p-4">Data / Hora</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Qtd</th>
                  <th className="p-4">Motivo / Obs</th>
                  <th className="p-4">Operador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Carregando histórico...
                    </td>
                  </tr>
                ) : history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Nenhuma movimentação encontrada.
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            item.type === 'ENTRY'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.type === 'EXIT'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.type === 'ENTRY' ? 'ENTRADA' : item.type === 'EXIT' ? 'SAÍDA' : 'PERDA'}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-slate-900">{item.product?.name || 'Produto removido'}</p>
                        {item.product?.sku && (
                          <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {item.product.sku}</p>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-800 whitespace-nowrap">
                        {item.type === 'ENTRY' ? '+' : '-'}{item.quantity} un.
                      </td>
                      <td className="p-4 text-xs text-slate-600">
                        {item.type === 'LOSS' && item.reason && (
                          <span className="font-semibold text-amber-700 block">
                            {getReasonLabel(item.reason)}
                          </span>
                        )}
                        {item.observation ? (
                          <span className="text-slate-500 italic">"{item.observation}"</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                        {item.user?.name || 'Sistema'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
