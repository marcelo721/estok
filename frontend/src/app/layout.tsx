import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Estok - Controle Inteligente de Estoque',
  description: 'Sistema de gestão, inventário e controle de movimentações de estoque.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-50 antialiased text-slate-800">
        {children}
      </body>
    </html>
  );
}
