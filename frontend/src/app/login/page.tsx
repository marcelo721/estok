'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || `Falha no login (Status ${res.status}). Verifique suas credenciais.`);
      }

      if (typeof window !== 'undefined') {
        if (data.token) {
          localStorage.setItem('estok_token', data.token);
        }
        if (data.user) {
          localStorage.setItem('estok_user', JSON.stringify(data.user));
        }
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao tentar entrar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 p-12 flex-col justify-between text-white">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-lg">
              E
            </div>
            <h1 className="text-xl font-bold tracking-wider">ESTOK</h1>
          </div>
          <h2 className="text-3xl font-bold mt-20 text-white">Controle inteligente do seu estoque</h2>
          <p className="text-slate-400 mt-3 max-w-md">
            Gerencie entradas, saídas, perdas e auditoria com rapidez e precisão operacional.
          </p>
        </div>
        <p className="text-xs text-slate-500">Segurança, integridade e rastreabilidade ponta a ponta.</p>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm w-full max-w-md">
          <h2 className="text-2xl font-bold text-slate-900">Bem-vindo ao Estok</h2>
          <p className="text-sm text-slate-500 mt-1">Entre com seu e-mail e senha para continuar.</p>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@empresa.com"
                className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full mt-1.5 p-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition mt-2 flex items-center justify-center gap-2 ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-xs text-slate-400 text-center">
            <p className="font-semibold text-slate-500 mb-1">Usuários de Teste (Seed):</p>
            <p>Admin: <span className="font-mono text-slate-600">admin@estok.com</span> / <span className="font-mono text-slate-600">admin123</span></p>
            <p className="mt-0.5">Operador: <span className="font-mono text-slate-600">operador@estok.com</span> / <span className="font-mono text-slate-600">operador123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}