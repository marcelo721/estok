'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MetricCard from '@/components/MetricCard';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

interface DashboardData {
  metrics: {
    activeProducts: number;
    lowStockCount: number;
    totalItems: number;
    totalValue: number | null;
    monthlyExits: number;
  };
  lowStockProducts: Array<{
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
  }>;
  recentMovements: Array<{
    id: string;
    type: 'ENTRY' | 'EXIT' | 'LOSS';
    quantity: number;
    createdAt: string;
    product?: { name: string };
    user?: { name: string };
  }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const result = await apiFetch('/dashboard');
        setData(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro ao carregar dados do dashboard.');
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Visão Geral</h1>
            <p className="text-sm text-slate-500 mt-1">
              Indicadores de performance de estoque, alertas e atividades recentes.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/movement"
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
            >
              Nova Movimentação
            </Link>
          </div>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-slate-400">Carregando métricas...</p>
          </div>
        ) : data ? (
          <div className="space-y-8">
            {/* Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <MetricCard
                title="Itens em Estoque"
                value={data.metrics.totalItems.toLocaleString('pt-BR')}
                subtext="Total de unidades físicas"
              />
              <MetricCard
                title="Produtos Ativos"
                value={data.metrics.activeProducts}
                subtext="Cadastrados no catálogo"
              />
              <MetricCard
                title="Alerta de Reposição"
                value={data.metrics.lowStockCount}
                subtext={data.metrics.lowStockCount > 0 ? "Abaixo do estoque mínimo" : "Estoque regular"}
              />
              <MetricCard
                title="Saídas do Mês"
                value={data.metrics.monthlyExits.toLocaleString('pt-BR')}
                subtext={data.metrics.totalValue !== null 
                  ? `Valor total: R$ ${data.metrics.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                  : 'Total de retiradas'}
              />
            </div>

            {/* Painéis Inferiores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Produtos com Estoque Baixo */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900">Alerta de Reposição Crítica</h2>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold">
                    {data.lowStockProducts.length} itens
                  </span>
                </div>

                {data.lowStockProducts.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">Nenhum produto em nível crítico no momento.</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {data.lowStockProducts.map((p) => (
                      <div key={p.id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{p.name}</p>
                          <p className="text-xs text-slate-400">Mínimo recomendado: {p.minStock} un.</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                            {p.currentStock} un.
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Movimentações Recentes */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-slate-900">Últimas Movimentações</h2>
                  <Link href="/history" className="text-xs font-semibold text-blue-600 hover:underline">
                    Ver histórico completo
                  </Link>
                </div>

                {data.recentMovements.length === 0 ? (
                  <p className="text-sm text-slate-400 py-6 text-center">Nenhuma movimentação registrada.</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                    {data.recentMovements.map((m) => (
                      <div key={m.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                m.type === 'ENTRY'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.type === 'EXIT'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {m.type === 'ENTRY' ? 'ENTRADA' : m.type === 'EXIT' ? 'SAÍDA' : 'PERDA'}
                            </span>
                            <span className="text-sm font-medium text-slate-800">
                              {m.product?.name || 'Produto'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {m.user?.name ? `Por ${m.user.name} • ` : ''}
                            {new Date(m.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <span className="text-sm font-bold text-slate-800">
                          {m.type === 'ENTRY' ? '+' : '-'}{m.quantity} un.
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
