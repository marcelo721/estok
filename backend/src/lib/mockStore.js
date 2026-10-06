import bcrypt from 'bcrypt';

// Senhas pré-hasheadas para 'admin123' e 'operador123'
const ADMIN_HASH = bcrypt.hashSync('admin123', 10);
const OPERATOR_HASH = bcrypt.hashSync('operador123', 10);

export const mockUsers = [
  {
    id: 'u-admin-1',
    name: 'Maria Beatriz',
    email: 'admin@estok.com',
    passwordHash: ADMIN_HASH,
    role: 'ADMIN',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'u-oper-1',
    name: 'Christian Ximenes',
    email: 'operador@estok.com',
    passwordHash: OPERATOR_HASH,
    role: 'OPERATOR',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'u-oper-2',
    name: 'João Silva',
    email: 'joao.silva@estok.com',
    passwordHash: OPERATOR_HASH,
    role: 'OPERATOR',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export const mockCategories = [
  { id: 'cat-1', name: 'Alimentos', createdAt: new Date() },
  { id: 'cat-2', name: 'Bebidas', createdAt: new Date() },
  { id: 'cat-3', name: 'Limpeza', createdAt: new Date() },
  { id: 'cat-4', name: 'Papelaria', createdAt: new Date() },
  { id: 'cat-5', name: 'Eletrônicos', createdAt: new Date() }
];

export const mockProducts = [
  {
    id: 'prod-1',
    name: 'Café Tradicional 500g',
    sku: 'CAF-500',
    barcode: '7890000000001',
    currentStock: 4,
    minStock: 10,
    costPrice: 12.50,
    sellPrice: 18.90,
    isActive: true,
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Alimentos' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date()
  },
  {
    id: 'prod-2',
    name: 'Arroz Tipo 1 5kg',
    sku: 'ARR-5KG',
    barcode: '7890000000002',
    currentStock: 86,
    minStock: 20,
    costPrice: 22.00,
    sellPrice: 31.50,
    isActive: true,
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Alimentos' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    updatedAt: new Date()
  },
  {
    id: 'prod-3',
    name: 'Feijão Carioca 1kg',
    sku: 'FEJ-1KG',
    barcode: '7890000000003',
    currentStock: 15,
    minStock: 15,
    costPrice: 7.20,
    sellPrice: 10.90,
    isActive: true,
    categoryId: 'cat-1',
    category: { id: 'cat-1', name: 'Alimentos' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
    updatedAt: new Date()
  },
  {
    id: 'prod-4',
    name: 'Refrigerante Cola 2L',
    sku: 'REF-COL-2L',
    barcode: '7890000000004',
    currentStock: 52,
    minStock: 24,
    costPrice: 5.50,
    sellPrice: 9.00,
    isActive: true,
    categoryId: 'cat-2',
    category: { id: 'cat-2', name: 'Bebidas' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    updatedAt: new Date()
  },
  {
    id: 'prod-5',
    name: 'Água Mineral sem Gás 500ml',
    sku: 'AGU-500ML',
    barcode: '7890000000005',
    currentStock: 120,
    minStock: 50,
    costPrice: 1.10,
    sellPrice: 3.00,
    isActive: true,
    categoryId: 'cat-2',
    category: { id: 'cat-2', name: 'Bebidas' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    updatedAt: new Date()
  },
  {
    id: 'prod-6',
    name: 'Detergente Líquido Neutro 500ml',
    sku: 'DET-500ML',
    barcode: '7890000000006',
    currentStock: 8,
    minStock: 25,
    costPrice: 2.30,
    sellPrice: 4.50,
    isActive: true,
    categoryId: 'cat-3',
    category: { id: 'cat-3', name: 'Limpeza' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    updatedAt: new Date()
  },
  {
    id: 'prod-7',
    name: 'Papel Sulfite A4 500 Folhas',
    sku: 'PAP-A4-500',
    barcode: '7890000000007',
    currentStock: 35,
    minStock: 15,
    costPrice: 24.00,
    sellPrice: 36.90,
    isActive: true,
    categoryId: 'cat-4',
    category: { id: 'cat-4', name: 'Papelaria' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
    updatedAt: new Date()
  },
  {
    id: 'prod-8',
    name: 'Mouse Óptico USB Preto',
    sku: 'MOU-OPT-USB',
    barcode: '7890000000008',
    currentStock: 2,
    minStock: 8,
    costPrice: 28.00,
    sellPrice: 55.00,
    isActive: true,
    categoryId: 'cat-5',
    category: { id: 'cat-5', name: 'Eletrônicos' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date()
  }
];

export const mockMovements = [
  {
    id: 'mov-1',
    type: 'ENTRY',
    quantity: 100,
    reason: null,
    observation: 'Recebimento NF-e 4521 - Fornecedor Minas Café',
    productId: 'prod-1',
    product: { id: 'prod-1', name: 'Café Tradicional 500g', sku: 'CAF-500' },
    userId: 'u-admin-1',
    user: { id: 'u-admin-1', name: 'Maria Beatriz' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
  },
  {
    id: 'mov-2',
    type: 'EXIT',
    quantity: 96,
    reason: null,
    observation: 'Separação e envio Pedido #1024',
    productId: 'prod-1',
    product: { id: 'prod-1', name: 'Café Tradicional 500g', sku: 'CAF-500' },
    userId: 'u-oper-1',
    user: { id: 'u-oper-1', name: 'Christian Ximenes' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
  },
  {
    id: 'mov-3',
    type: 'ENTRY',
    quantity: 100,
    reason: null,
    observation: 'Compra direta Distribuidora Alvorada',
    productId: 'prod-2',
    product: { id: 'prod-2', name: 'Arroz Tipo 1 5kg', sku: 'ARR-5KG' },
    userId: 'u-admin-1',
    user: { id: 'u-admin-1', name: 'Maria Beatriz' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4)
  },
  {
    id: 'mov-4',
    type: 'EXIT',
    quantity: 14,
    reason: null,
    observation: 'Transferência para Loja Filial 02',
    productId: 'prod-2',
    product: { id: 'prod-2', name: 'Arroz Tipo 1 5kg', sku: 'ARR-5KG' },
    userId: 'u-oper-1',
    user: { id: 'u-oper-1', name: 'Christian Ximenes' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18)
  },
  {
    id: 'mov-5',
    type: 'ENTRY',
    quantity: 150,
    reason: null,
    observation: 'Lote semanal de reposição Água da Serra',
    productId: 'prod-5',
    product: { id: 'prod-5', name: 'Água Mineral sem Gás 500ml', sku: 'AGU-500ML' },
    userId: 'u-oper-2',
    user: { id: 'u-oper-2', name: 'João Silva' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12)
  },
  {
    id: 'mov-6',
    type: 'EXIT',
    quantity: 30,
    reason: null,
    observation: 'Consumo refeitório e recepção',
    productId: 'prod-5',
    product: { id: 'prod-5', name: 'Água Mineral sem Gás 500ml', sku: 'AGU-500ML' },
    userId: 'u-oper-1',
    user: { id: 'u-oper-1', name: 'Christian Ximenes' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6)
  },
  {
    id: 'mov-7',
    type: 'LOSS',
    quantity: 2,
    reason: 'DAMAGE',
    observation: 'Garrafas perfuradas no descarregamento do pallet',
    productId: 'prod-6',
    product: { id: 'prod-6', name: 'Detergente Líquido Neutro 500ml', sku: 'DET-500ML' },
    userId: 'u-oper-1',
    user: { id: 'u-oper-1', name: 'Christian Ximenes' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2)
  }
];
