'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export interface UserSession {
  id?: string;
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'OPERATOR';
}

interface SidebarProps {
  user?: UserSession | null;
}

export default function Sidebar({ user: initialUser }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(initialUser || null);

  useEffect(() => {
    if (!initialUser && typeof window !== 'undefined') {
      const stored = localStorage.getItem('estok_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          // ignore parsing error
        }
      }
    } else if (initialUser) {
      setCurrentUser(initialUser);
    }
  }, [initialUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('estok_token');
      localStorage.removeItem('estok_user');
    }
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Produtos', href: '/products', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Movimentações', href: '/movement', roles: ['ADMIN', 'OPERATOR'] },
    { label: 'Histórico', href: '/history', roles: ['ADMIN', 'OPERATOR'] },
  ];

  const userRole = currentUser?.role || 'OPERATOR';

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between p-5 border-r border-slate-800 shrink-0">
      <div>
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-lg">
            E
          </div>
          <span className="text-xl font-bold tracking-wider text-white">ESTOK</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            if (!item.roles.includes(userRole)) return null;
            const isActive = pathname === item.href || (item.href === '/movement' && pathname === '/movements');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
        <div className="overflow-hidden pr-2">
          <p className="text-sm font-semibold text-white truncate">{currentUser?.name || 'Usuário'}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-xs text-slate-400 truncate max-w-[130px]">{currentUser?.email || 'operador'}</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {userRole}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          title="Encerrar sessão"
          className="text-xs text-red-400 hover:text-red-300 font-medium py-1 px-2 rounded hover:bg-red-950/30 transition"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}