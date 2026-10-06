import { prisma } from '../lib/prisma.js';
import { mockProducts, mockMovements } from '../lib/mockStore.js';

export const getDashboardData = async (req, res) => {
  try {
    try {
      const activeProductsCount = await prisma.product.count({ where: { isActive: true } });

      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { currentStock: true, minStock: true, costPrice: true, name: true, id: true }
      });

      const totalItems = products.reduce((acc, p) => acc + (Number(p.currentStock) || 0), 0);

      const totalValue = products.reduce((acc, p) => {
        const stock = Number(p.currentStock) || 0;
        const cost = Number(p.costPrice) || 0;
        return acc + (stock * cost);
      }, 0);

      const lowStockProducts = products
        .filter(p => Number(p.currentStock) <= Number(p.minStock))
        .map(p => ({
          id: p.id,
          name: p.name,
          currentStock: p.currentStock,
          minStock: p.minStock
        }));

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthExits = await prisma.movement.aggregate({
        _sum: { quantity: true },
        where: {
          type: { in: ['EXIT', 'LOSS'] },
          createdAt: { gte: startOfMonth }
        }
      });

      const recentMovements = await prisma.movement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true } },
          user: { select: { name: true } }
        }
      });

      return res.json({
        metrics: {
          activeProducts: activeProductsCount,
          lowStockCount: lowStockProducts.length,
          totalItems,
          totalValue: req.user?.role === 'ADMIN' ? totalValue : null,
          monthlyExits: monthExits._sum?.quantity || 0
        },
        lowStockProducts,
        recentMovements
      });
    } catch (dbErr) {
      console.warn('[Estok] Banco indisponível. Calculando métricas da base mockada.');
      const active = mockProducts.filter(p => p.isActive);
      const totalItems = active.reduce((acc, p) => acc + (Number(p.currentStock) || 0), 0);
      const totalValue = active.reduce((acc, p) => acc + ((Number(p.currentStock) || 0) * (Number(p.costPrice) || 0)), 0);

      const lowStockProducts = active
        .filter(p => Number(p.currentStock) <= Number(p.minStock))
        .map(p => ({
          id: p.id,
          name: p.name,
          currentStock: p.currentStock,
          minStock: p.minStock
        }));

      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const monthlyExits = mockMovements
        .filter(m => (m.type === 'EXIT' || m.type === 'LOSS') && new Date(m.createdAt) >= startOfMonth)
        .reduce((acc, m) => acc + (Number(m.quantity) || 0), 0);

      const recentMovements = mockMovements.slice(0, 5);

      return res.json({
        metrics: {
          activeProducts: active.length,
          lowStockCount: lowStockProducts.length,
          totalItems,
          totalValue: req.user?.role === 'ADMIN' ? totalValue : null,
          monthlyExits
        },
        lowStockProducts,
        recentMovements
      });
    }
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
    return res.status(500).json({ error: 'Erro ao carregar dados do dashboard.' });
  }
};