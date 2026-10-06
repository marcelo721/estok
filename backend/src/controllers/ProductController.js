import { prisma } from '../lib/prisma.js';
import { mockCategories, mockProducts } from '../lib/mockStore.js';

export const listCategories = async (req, res) => {
  try {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' }
      });
      return res.json(categories);
    } catch (dbErr) {
      console.warn('[Estok] Banco de dados primário indisponível. Usando categorias mockadas.');
      return res.json(mockCategories);
    }
  } catch (error) {
    console.error('Erro ao listar categorias:', error);
    return res.status(500).json({ error: 'Erro ao carregar categorias.' });
  }
};

export const listProducts = async (req, res) => {
  try {
    const { search, status, categoryId } = req.query;
    const trimmedSearch = typeof search === 'string' ? search.trim().toLowerCase() : '';

    try {
      const where = {};

      if (trimmedSearch) {
        where.OR = [
          { name: { contains: trimmedSearch, mode: 'insensitive' } },
          { sku: { contains: trimmedSearch, mode: 'insensitive' } },
          { barcode: { contains: trimmedSearch, mode: 'insensitive' } }
        ];
      }

      if (status === 'active') where.isActive = true;
      if (status === 'inactive') where.isActive = false;
      if (categoryId) where.categoryId = categoryId;

      const products = await prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' }
      });

      return res.json(products);
    } catch (dbErr) {
      console.warn('[Estok] Banco de dados primário indisponível. Usando produtos mockados.');
      let filtered = [...mockProducts];

      if (trimmedSearch) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(trimmedSearch) ||
          p.sku.toLowerCase().includes(trimmedSearch) ||
          (p.barcode && p.barcode.toLowerCase().includes(trimmedSearch))
        );
      }

      if (status === 'active') filtered = filtered.filter(p => p.isActive);
      if (status === 'inactive') filtered = filtered.filter(p => !p.isActive);
      if (categoryId) filtered = filtered.filter(p => p.categoryId === categoryId);

      return res.json(filtered);
    }
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return res.status(500).json({ error: 'Erro ao carregar produtos.' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const { name, sku, barcode, minStock, costPrice, sellPrice, categoryId, isActive } = req.body;

    if (!name || !sku || !categoryId) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos (nome, SKU e categoria).' });
    }

    const trimmedSku = String(sku).trim().toUpperCase();
    const cleanBarcode = barcode && String(barcode).trim() ? String(barcode).trim() : null;

    try {
      const existingSku = await prisma.product.findUnique({ where: { sku: trimmedSku } });
      if (existingSku) {
        return res.status(400).json({ error: 'Já existe um produto cadastrado com este SKU.' });
      }

      if (cleanBarcode) {
        const existingBarcode = await prisma.product.findUnique({ where: { barcode: cleanBarcode } });
        if (existingBarcode) {
          return res.status(400).json({ error: 'Já existe um produto cadastrado com este código de barras.' });
        }
      }

      const product = await prisma.product.create({
        data: {
          name: String(name).trim(),
          sku: trimmedSku,
          barcode: cleanBarcode,
          minStock: Number(minStock) || 0,
          costPrice: Number(costPrice) || 0,
          sellPrice: Number(sellPrice) || 0,
          categoryId,
          isActive: isActive !== undefined ? Boolean(isActive) : true
        },
        include: {
          category: true
        }
      });

      return res.status(201).json(product);
    } catch (dbErr) {
      console.warn('[Estok] Banco indisponível. Inserindo produto na base mockada.');
      if (mockProducts.some(p => p.sku === trimmedSku)) {
        return res.status(400).json({ error: 'Já existe um produto cadastrado com este SKU.' });
      }

      const category = mockCategories.find(c => c.id === categoryId) || { id: categoryId, name: 'Geral' };
      const newProduct = {
        id: `prod-${Date.now()}`,
        name: String(name).trim(),
        sku: trimmedSku,
        barcode: cleanBarcode,
        minStock: Number(minStock) || 0,
        costPrice: Number(costPrice) || 0,
        sellPrice: Number(sellPrice) || 0,
        categoryId,
        category,
        currentStock: 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockProducts.unshift(newProduct);
      return res.status(201).json(newProduct);
    }
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar produto.' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, barcode, minStock, costPrice, sellPrice, categoryId, isActive } = req.body;

    try {
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      const updateData = {};
      if (name !== undefined) updateData.name = String(name).trim();

      if (sku !== undefined) {
        const trimmedSku = String(sku).trim().toUpperCase();
        if (trimmedSku !== product.sku) {
          const existingSku = await prisma.product.findUnique({ where: { sku: trimmedSku } });
          if (existingSku) {
            return res.status(400).json({ error: 'Já existe outro produto cadastrado com este SKU.' });
          }
        }
        updateData.sku = trimmedSku;
      }

      if (barcode !== undefined) {
        const cleanBarcode = barcode && String(barcode).trim() ? String(barcode).trim() : null;
        if (cleanBarcode && cleanBarcode !== product.barcode) {
          const existingBarcode = await prisma.product.findUnique({ where: { barcode: cleanBarcode } });
          if (existingBarcode) {
            return res.status(400).json({ error: 'Já existe outro produto cadastrado com este código de barras.' });
          }
        }
        updateData.barcode = cleanBarcode;
      }

      if (minStock !== undefined) updateData.minStock = Math.max(0, Number(minStock) || 0);
      if (costPrice !== undefined) updateData.costPrice = Math.max(0, Number(costPrice) || 0);
      if (sellPrice !== undefined) updateData.sellPrice = Math.max(0, Number(sellPrice) || 0);
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (isActive !== undefined) updateData.isActive = Boolean(isActive);

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: updateData,
        include: { category: true }
      });

      return res.json(updatedProduct);
    } catch (dbErr) {
      console.warn('[Estok] Banco indisponível. Atualizando produto na base mockada.');
      const prodIndex = mockProducts.findIndex(p => p.id === id);
      if (prodIndex === -1) {
        return res.status(404).json({ error: 'Produto não encontrado.' });
      }

      const prod = mockProducts[prodIndex];
      if (name !== undefined) prod.name = String(name).trim();
      if (sku !== undefined) prod.sku = String(sku).trim().toUpperCase();
      if (barcode !== undefined) prod.barcode = barcode ? String(barcode).trim() : null;
      if (minStock !== undefined) prod.minStock = Math.max(0, Number(minStock) || 0);
      if (costPrice !== undefined) prod.costPrice = Math.max(0, Number(costPrice) || 0);
      if (sellPrice !== undefined) prod.sellPrice = Math.max(0, Number(sellPrice) || 0);
      if (categoryId !== undefined) {
        prod.categoryId = categoryId;
        prod.category = mockCategories.find(c => c.id === categoryId) || prod.category;
      }
      if (isActive !== undefined) prod.isActive = Boolean(isActive);
      prod.updatedAt = new Date();

      return res.json(prod);
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ error: 'Erro interno ao atualizar produto.' });
  }
};