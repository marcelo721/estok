import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o povoamento do banco de dados (seed)...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const operatorPassword = await bcrypt.hash('operador123', 10);

  // 1. Usuários
  const admin = await prisma.user.upsert({
    where: { email: 'admin@estok.com' },
    update: { passwordHash: adminPassword },
    create: {
      name: 'Maria Beatriz',
      email: 'admin@estok.com',
      passwordHash: adminPassword,
      role: 'ADMIN'
    }
  });

  const operator = await prisma.user.upsert({
    where: { email: 'operador@estok.com' },
    update: { passwordHash: operatorPassword },
    create: {
      name: 'Christian Ximenes',
      email: 'operador@estok.com',
      passwordHash: operatorPassword,
      role: 'OPERATOR'
    }
  });

  const operator2 = await prisma.user.upsert({
    where: { email: 'joao.silva@estok.com' },
    update: { passwordHash: operatorPassword },
    create: {
      name: 'João Silva',
      email: 'joao.silva@estok.com',
      passwordHash: operatorPassword,
      role: 'OPERATOR'
    }
  });

  console.log('✓ Usuários criados: admin@estok.com e operador@estok.com');

  // 2. Categorias
  const catAlimentos = await prisma.category.upsert({
    where: { name: 'Alimentos' },
    update: {},
    create: { name: 'Alimentos' }
  });

  const catBebidas = await prisma.category.upsert({
    where: { name: 'Bebidas' },
    update: {},
    create: { name: 'Bebidas' }
  });

  const catLimpeza = await prisma.category.upsert({
    where: { name: 'Limpeza' },
    update: {},
    create: { name: 'Limpeza' }
  });

  const catPapelaria = await prisma.category.upsert({
    where: { name: 'Papelaria' },
    update: {},
    create: { name: 'Papelaria' }
  });

  const catEletronicos = await prisma.category.upsert({
    where: { name: 'Eletrônicos' },
    update: {},
    create: { name: 'Eletrônicos' }
  });

  console.log('✓ Categorias criadas: Alimentos, Bebidas, Limpeza, Papelaria, Eletrônicos');

  // 3. Produtos
  const cafe = await prisma.product.upsert({
    where: { sku: 'CAF-500' },
    update: { currentStock: 4, minStock: 10 },
    create: {
      name: 'Café Tradicional 500g',
      sku: 'CAF-500',
      barcode: '7890000000001',
      currentStock: 4,
      minStock: 10,
      costPrice: 12.50,
      sellPrice: 18.90,
      categoryId: catAlimentos.id
    }
  });

  const arroz = await prisma.product.upsert({
    where: { sku: 'ARR-5KG' },
    update: { currentStock: 86, minStock: 20 },
    create: {
      name: 'Arroz Tipo 1 5kg',
      sku: 'ARR-5KG',
      barcode: '7890000000002',
      currentStock: 86,
      minStock: 20,
      costPrice: 22.00,
      sellPrice: 31.50,
      categoryId: catAlimentos.id
    }
  });

  const feijao = await prisma.product.upsert({
    where: { sku: 'FEJ-1KG' },
    update: { currentStock: 15, minStock: 15 },
    create: {
      name: 'Feijão Carioca 1kg',
      sku: 'FEJ-1KG',
      barcode: '7890000000003',
      currentStock: 15,
      minStock: 15,
      costPrice: 7.20,
      sellPrice: 10.90,
      categoryId: catAlimentos.id
    }
  });

  const refri = await prisma.product.upsert({
    where: { sku: 'REF-COL-2L' },
    update: { currentStock: 52, minStock: 24 },
    create: {
      name: 'Refrigerante Cola 2L',
      sku: 'REF-COL-2L',
      barcode: '7890000000004',
      currentStock: 52,
      minStock: 24,
      costPrice: 5.50,
      sellPrice: 9.00,
      categoryId: catBebidas.id
    }
  });

  const agua = await prisma.product.upsert({
    where: { sku: 'AGU-500ML' },
    update: { currentStock: 120, minStock: 50 },
    create: {
      name: 'Água Mineral sem Gás 500ml',
      sku: 'AGU-500ML',
      barcode: '7890000000005',
      currentStock: 120,
      minStock: 50,
      costPrice: 1.10,
      sellPrice: 3.00,
      categoryId: catBebidas.id
    }
  });

  const detergente = await prisma.product.upsert({
    where: { sku: 'DET-500ML' },
    update: { currentStock: 8, minStock: 25 },
    create: {
      name: 'Detergente Líquido Neutro 500ml',
      sku: 'DET-500ML',
      barcode: '7890000000006',
      currentStock: 8,
      minStock: 25,
      costPrice: 2.30,
      sellPrice: 4.50,
      categoryId: catLimpeza.id
    }
  });

  const sulfite = await prisma.product.upsert({
    where: { sku: 'PAP-A4-500' },
    update: { currentStock: 35, minStock: 15 },
    create: {
      name: 'Papel Sulfite A4 500 Folhas',
      sku: 'PAP-A4-500',
      barcode: '7890000000007',
      currentStock: 35,
      minStock: 15,
      costPrice: 24.00,
      sellPrice: 36.90,
      categoryId: catPapelaria.id
    }
  });

  const mouse = await prisma.product.upsert({
    where: { sku: 'MOU-OPT-USB' },
    update: { currentStock: 2, minStock: 8 },
    create: {
      name: 'Mouse Óptico USB Preto',
      sku: 'MOU-OPT-USB',
      barcode: '7890000000008',
      currentStock: 2,
      minStock: 8,
      costPrice: 28.00,
      sellPrice: 55.00,
      categoryId: catEletronicos.id
    }
  });

  console.log('✓ Produtos criados com saldos normais e alertas de estoque crítico');

  // 4. Movimentações Recentes (Histórico)
  const existingMovements = await prisma.movement.count();
  if (existingMovements === 0) {
    const movementsData = [
      {
        type: 'ENTRY',
        quantity: 100,
        observation: 'Recebimento NF-e 4521 - Fornecedor Minas Café',
        productId: cafe.id,
        userId: admin.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 dias atrás
      },
      {
        type: 'EXIT',
        quantity: 96,
        observation: 'Separação e envio Pedido #1024',
        productId: cafe.id,
        userId: operator.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 dias atrás
      },
      {
        type: 'ENTRY',
        quantity: 100,
        observation: 'Compra direta Distribuidora Alvorada',
        productId: arroz.id,
        userId: admin.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) // 4 dias atrás
      },
      {
        type: 'EXIT',
        quantity: 14,
        observation: 'Transferência para Loja Filial 02',
        productId: arroz.id,
        userId: operator.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18) // 18 horas atrás
      },
      {
        type: 'ENTRY',
        quantity: 150,
        observation: 'Lote semanal de reposição Água da Serra',
        productId: agua.id,
        userId: operator2.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 horas atrás
      },
      {
        type: 'EXIT',
        quantity: 30,
        observation: 'Consumo refeitório e recepção',
        productId: agua.id,
        userId: operator.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 horas atrás
      },
      {
        type: 'LOSS',
        quantity: 2,
        reason: 'DAMAGE',
        observation: 'Garrafas perfuradas no descarregamento do pallet',
        productId: detergente.id,
        userId: operator.id,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 horas atrás
      }
    ];

    for (const mov of movementsData) {
      await prisma.movement.create({ data: mov });
    }
    console.log('✓ Movimentações de teste criadas (Entradas, Saídas e Perdas)');
  }

  console.log('🎉 Banco de dados povoado com sucesso com dados mockados completos!');
}

main()
  .catch((e) => {
    console.error('Erro ao executar o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });