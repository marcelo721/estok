import { prisma } from '../lib/prisma.js';
import { mockProducts, mockMovements, mockUsers } from '../lib/mockStore.js';

const VALID_LOSS_REASONS = ['DAMAGE', 'LOSS', 'EXPIRATION', 'OTHER'];
const VALID_TYPES = ['ENTRY', 'EXIT', 'LOSS'];

export const registerMovement = async (req, res) => {
  try {
    const { productId, type, quantity, reason, observation } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado.' });
    }

    const parsedQty = Number(quantity);
    if (!productId || !type || !Number.isInteger(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ error: 'Dados da movimentação inválidos. A quantidade deve ser um número inteiro maior que zero.' });
    }

    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: 'Tipo de movimentação inválido. Tipos permitidos: ENTRY, EXIT, LOSS.' });
    }

    if (type === 'LOSS') {
      if (!reason || !VALID_LOSS_REASONS.includes(reason)) {
        return res.status(400).json({
          error: `Motivo de perda inválido ou não informado. Opções permitidas: ${VALID_LOSS_REASONS.join(', ')}.`
        });
      }
    }

    try {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      if (!product.isActive) {
        return res.status(400).json({ error: 'Não é possível movimentar um produto inativo.' });
      }

      let newStock = product.currentStock;
      if (type === 'ENTRY') {
        newStock += parsedQty;
      } else if (type === 'EXIT' || type === 'LOSS') {
        if (product.currentStock < parsedQty) {
          return res.status(400).json({
            error: `Saldo insuficiente para realizar esta saída. Saldo atual: ${product.currentStock} unidades.`
          });
        }
        newStock -= parsedQty;
      }

      const [movement] = await prisma.$transaction([
        prisma.movement.create({
          data: {
            type,
            quantity: parsedQty,
            reason: type === 'LOSS' ? reason : null,
            observation: observation ? String(observation).trim() : null,
            productId,
            userId
          },
          include: {
            product: { select: { id: true, name: true, sku: true } },
            user: { select: { id: true, name: true } }
          }
        }),
        prisma.product.update({
          where: { id: productId },
          data: { currentStock: newStock }
        })
      ]);

      return res.status(201).json(movement);
    } catch (dbErr) {
      console.warn('[Estok] Banco indisponível. Registrando movimentação na base mockada.');
      const prod = mockProducts.find(p => p.id === productId);
      if (!prod) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      if (!prod.isActive) {
        return res.status(400).json({ error: 'Não é possível movimentar um produto inativo.' });
      }

      let newStock = prod.currentStock;
      if (type === 'ENTRY') {
        newStock += parsedQty;
      } else if (type === 'EXIT' || type === 'LOSS') {
        if (prod.currentStock < parsedQty) {
          return res.status(400).json({
            error: `Saldo insuficiente para realizar esta saída. Saldo atual: ${prod.currentStock} unidades.`
          });
        }
        newStock -= parsedQty;
      }

      prod.currentStock = newStock;
      const user = mockUsers.find(u => u.id === userId) || { id: userId, name: req.user?.name || 'Operador' };

      const newMovement = {
        id: `mov-${Date.now()}`,
        type,
        quantity: parsedQty,
        reason: type === 'LOSS' ? reason : null,
        observation: observation ? String(observation).trim() : null,
        productId,
        product: { id: prod.id, name: prod.name, sku: prod.sku },
        userId,
        user: { id: user.id, name: user.name },
        createdAt: new Date()
      };

      mockMovements.unshift(newMovement);
      return res.status(201).json(newMovement);
    }
  } catch (error) {
    console.error('Erro ao registrar movimentação:', error);
    return res.status(500).json({ error: 'Erro interno ao registrar movimentação.' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const { productId, type, userId, startDate, endDate } = req.query;

    try {
      const where = {};
      if (productId) where.productId = productId;
      if (type && VALID_TYPES.includes(type)) where.type = type;
      if (userId) where.userId = userId;

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          const start = new Date(startDate);
          if (!isNaN(start.getTime())) {
            where.createdAt.gte = start;
          }
        }
        if (endDate) {
          const end = new Date(endDate);
          if (!isNaN(end.getTime())) {
            where.createdAt.lte = end;
          }
        }
        if (Object.keys(where.createdAt).length === 0) {
          delete where.createdAt;
        }
      }

      const history = await prisma.movement.findMany({
        where,
        include: {
          product: { select: { id: true, name: true, sku: true } },
          user: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      return res.json(history);
    } catch (dbErr) {
      console.warn('[Estok] Banco indisponível. Carregando histórico da base mockada.');
      let filtered = [...mockMovements];

      if (productId) filtered = filtered.filter(m => m.productId === productId);
      if (type && VALID_TYPES.includes(type)) filtered = filtered.filter(m => m.type === type);
      if (userId) filtered = filtered.filter(m => m.userId === userId);

      return res.json(filtered);
    }
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    return res.status(500).json({ error: 'Erro ao carregar histórico de movimentações.' });
  }
};