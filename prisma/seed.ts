import { PrismaClient, StatusAccountsPayable, StatusContracts } from "@prisma/client";

const prisma = new PrismaClient();

function generateContractId(index: number): string {
  const timestamp = Date.now();
  return `contract-${timestamp}-${index}`;
}

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...");

  // Buscar ou criar WorkerSpaces
  let workerSpace1 = await prisma.workerSpace.findFirst({
    where: { name: "Obra Principal - Centro" },
  });

  if (!workerSpace1) {
    workerSpace1 = await prisma.workerSpace.create({
      data: {
        name: "Obra Principal - Centro",
        description: "Obra de construção no centro da cidade",
      },
    });
  }

  let workerSpace2 = await prisma.workerSpace.findFirst({
    where: { name: "Obra Secundária - Zona Norte" },
  });

  if (!workerSpace2) {
    workerSpace2 = await prisma.workerSpace.create({
      data: {
        name: "Obra Secundária - Zona Norte",
        description: "Obra de construção na zona norte",
      },
    });
  }

  console.log("✅ WorkerSpaces criados");

  // Criar ou atualizar Users
  const user1 = await prisma.user.upsert({
    where: { email: "joao.silva@example.com" },
    update: {
      workerSpaces: {
        set: [{ id: workerSpace1.id }],
      },
    },
    create: {
      name: "João Silva",
      email: "joao.silva@example.com",
      workerSpaces: {
        connect: { id: workerSpace1.id },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: "maria.santos@example.com" },
    update: {
      workerSpaces: {
        set: [{ id: workerSpace1.id }],
      },
    },
    create: {
      name: "Maria Santos",
      email: "maria.santos@example.com",
      workerSpaces: {
        connect: { id: workerSpace1.id },
      },
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: "pedro.oliveira@example.com" },
    update: {
      workerSpaces: {
        set: [{ id: workerSpace2.id }],
      },
    },
    create: {
      name: "Pedro Oliveira",
      email: "pedro.oliveira@example.com",
      workerSpaces: {
        connect: { id: workerSpace2.id },
      },
    },
  });

  console.log("✅ Users criados");

  // Criar Works
  const work1 = await prisma.work.create({
    data: {
      workerSpaceId: workerSpace1.id,
      name: "Construção de Edifício Residencial",
      description: "Edifício com 20 andares e 80 apartamentos",
    },
  });

  const work2 = await prisma.work.create({
    data: {
      workerSpaceId: workerSpace1.id,
      name: "Reforma de Escritório",
      description: "Reforma completa do escritório comercial",
    },
  });

  const work3 = await prisma.work.create({
    data: {
      workerSpaceId: workerSpace2.id,
      name: "Construção de Galpão Industrial",
      description: "Galpão para armazenamento industrial",
    },
  });

  console.log("✅ Works criados");

  // Criar Equipment
  const equipment1 = await prisma.equipment.create({
    data: {
      workerSpaceId: workerSpace1.id,
      name: "Retroescavadeira",
      mark: "Caterpillar",
      model: "428F2",
      year: "2020",
      hours: 2500,
      amountDays: 30,
      amountMoths: 12,
      description: "Retroescavadeira para escavação e movimentação de terra",
      nextMaintenance: new Date("2024-12-15"),
      lastMaintenance: new Date("2024-06-15"),
    },
  });

  const equipment2 = await prisma.equipment.create({
    data: {
      workerSpaceId: workerSpace1.id,
      name: "Guindaste",
      mark: "Liebherr",
      model: "LTM 1060",
      year: "2019",
      hours: 1800,
      amountDays: 45,
      amountMoths: 18,
      description: "Guindaste para elevação de cargas pesadas",
      nextMaintenance: new Date("2025-01-20"),
      lastMaintenance: new Date("2024-07-20"),
    },
  });

  const equipment3 = await prisma.equipment.create({
    data: {
      workerSpaceId: workerSpace2.id,
      name: "Betoneira",
      mark: "Tramix",
      model: "TM-400",
      year: "2021",
      hours: 1200,
      amountDays: 60,
      amountMoths: 6,
      description: "Betoneira para mistura de concreto",
      nextMaintenance: new Date("2024-11-10"),
      lastMaintenance: new Date("2024-05-10"),
    },
  });

  console.log("✅ Equipment criados");

  // Criar Contracts
  const contract1 = await prisma.contracts.create({
    data: {
      id: generateContractId(1),
      workerSpaceId: workerSpace1.id,
      workId: work1.id,
      equipmentId: equipment1.id,
      name: "Contrato de Locação - Retroescavadeira",
      description: "Contrato de locação de retroescavadeira para obra principal",
      status: StatusContracts.ACTIVE,
      clientName: "Construtora ABC Ltda",
      initDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      valueDaily: 1500.0,
      amountDays: 365,
      amountTotal: 547500.0,
    },
  });

  const contract2 = await prisma.contracts.create({
    data: {
      id: generateContractId(2),
      workerSpaceId: workerSpace1.id,
      workId: work2.id,
      equipmentId: equipment2.id,
      name: "Contrato de Locação - Guindaste",
      description: "Contrato de locação de guindaste para reforma",
      status: StatusContracts.ACTIVE,
      clientName: "Reformas XYZ S.A.",
      initDate: new Date("2024-06-01"),
      endDate: new Date("2024-11-30"),
      valueDaily: 2500.0,
      amountDays: 180,
      amountTotal: 450000.0,
    },
  });

  const contract3 = await prisma.contracts.create({
    data: {
      id: generateContractId(3),
      workerSpaceId: workerSpace2.id,
      workId: work3.id,
      equipmentId: equipment3.id,
      name: "Contrato de Locação - Betoneira",
      description: "Contrato de locação de betoneira para galpão",
      status: StatusContracts.PENDING,
      clientName: "Indústria DEF EIRELI",
      initDate: new Date("2024-09-01"),
      endDate: new Date("2025-02-28"),
      valueDaily: 800.0,
      amountDays: 180,
      amountTotal: 144000.0,
    },
  });

  const contract4 = await prisma.contracts.create({
    data: {
      id: generateContractId(4),
      workerSpaceId: workerSpace1.id,
      name: "Contrato de Locação - Escavadeira",
      description: "Contrato de locação de escavadeira para terraplanagem",
      status: StatusContracts.ACTIVE,
      clientName: "Construtora GHI Ltda",
      initDate: new Date("2024-11-01"),
      endDate: new Date("2025-03-31"),
      valueDaily: 2000.0,
      amountDays: 150,
      amountTotal: 300000.0,
    },
  });

  const contract5 = await prisma.contracts.create({
    data: {
      id: generateContractId(5),
      workerSpaceId: workerSpace1.id,
      name: "Contrato de Locação - Caminhão Munck",
      description: "Contrato de locação de caminhão munck para transporte",
      status: StatusContracts.FINISHED,
      clientName: "Transportes JKL S.A.",
      initDate: new Date("2024-01-15"),
      endDate: new Date("2024-10-15"),
      valueDaily: 1200.0,
      amountDays: 270,
      amountTotal: 324000.0,
    },
  });

  const contract6 = await prisma.contracts.create({
    data: {
      id: generateContractId(6),
      workerSpaceId: workerSpace2.id,
      name: "Contrato de Locação - Compactadora",
      description: "Contrato de locação de compactadora de solo",
      status: StatusContracts.ACTIVE,
      clientName: "Pavimentação MNO EIRELI",
      initDate: new Date("2024-12-01"),
      endDate: new Date("2025-05-31"),
      valueDaily: 900.0,
      amountDays: 180,
      amountTotal: 162000.0,
    },
  });

  const contract7 = await prisma.contracts.create({
    data: {
      id: generateContractId(7),
      workerSpaceId: workerSpace1.id,
      name: "Contrato de Locação - Rolo Compactador",
      description: "Contrato de locação de rolo compactador para asfalto",
      status: StatusContracts.PENDING,
      clientName: "Asfaltos PQR Ltda",
      initDate: new Date("2025-01-10"),
      endDate: new Date("2025-06-10"),
      valueDaily: 1100.0,
      amountDays: 150,
      amountTotal: 165000.0,
    },
  });

  const contract8 = await prisma.contracts.create({
    data: {
      id: generateContractId(8),
      workerSpaceId: workerSpace2.id,
      name: "Contrato de Locação - Pá Carregadeira",
      description: "Contrato de locação de pá carregadeira",
      status: StatusContracts.CANCELLED,
      clientName: "Construções STU S.A.",
      initDate: new Date("2024-08-01"),
      endDate: new Date("2024-12-31"),
      valueDaily: 1800.0,
      amountDays: 150,
      amountTotal: 270000.0,
    },
  });

  console.log("✅ Contracts criados");

  // Criar AccountsPayable
  const accountsPayable1 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-001234",
      issuer: new Date("2024-12-10"),
      supplier: "Materiais de Construção XYZ",
      product_and_services: "Cimento, Areia, Tijolos",
      construction_cost: "Fundação e Estrutura",
      formPayment: "Boleto",
      valueAmount: 50000.0,
      installments: 3,
      valueTotal: 150000.0,
      maturity: new Date("2024-12-10"),
      launchDate: new Date("2024-11-01"),
      paidDate: new Date("2024-11-05"),
      status: StatusAccountsPayable.PAID,
    },
  });

  const accountsPayable2 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-001567",
      issuer: new Date("2024-12-10"),
      supplier: "Distribuidora de Equipamentos",
      product_and_services: "Ferramentas elétricas e manuais",
      construction_cost: "Acabamento",
      formPayment: "Cartão de Crédito",
      valueAmount: 15000.0,
      installments: 2,
      valueTotal: 30000.0,
      maturity: new Date("2024-12-20"),
      launchDate: new Date("2024-11-15"),
      paidDate: new Date("2024-12-18"),
      status: StatusAccountsPayable.PAID,
    },
  });

  const accountsPayable3 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-001890",
      issuer: new Date("2024-12-10"),
      supplier: "Consultoria Técnica",
      product_and_services: "Serviços de engenharia e projeto",
      construction_cost: "Projeto e Consultoria",
      formPayment: "Transferência Bancária",
      valueAmount: 25000.0,
      installments: 1,
      valueTotal: 25000.0,
      maturity: new Date("2024-12-05"),
      launchDate: new Date("2024-11-20"),
      paidDate: new Date("2024-12-10"),
      status: StatusAccountsPayable.LATE,
    },
  });

  const accountsPayable4 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace2.id,
      nf: "NF-002345",
      issuer: new Date("2024-12-10"),
      supplier: "Distribuidora Elétrica",
      product_and_services: "Fios, Cabos, Tubulações",
      construction_cost: "Instalações Elétricas e Hidráulicas",
      formPayment: "Boleto",
      valueAmount: 35000.0,
      installments: 4,
      valueTotal: 140000.0,
      maturity: new Date("2025-01-15"),
      launchDate: new Date("2024-12-01"),
      paidDate: new Date("2025-01-20"),
      status: StatusAccountsPayable.PENDING,
    },
  });

  const accountsPayable5 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace2.id,
      nf: "NF-002678",
      issuer: new Date("2024-12-10"),
      supplier: "Transportadora Rápida",
      product_and_services: "Serviços de transporte de materiais",
      construction_cost: "Logística",
      formPayment: "Dinheiro",
      valueAmount: 8000.0,
      installments: 1,
      valueTotal: 8000.0,
      maturity: new Date("2024-12-25"),
      launchDate: new Date("2024-12-10"),
      paidDate: new Date("2024-12-25"),
      status: StatusAccountsPayable.PENDING,
    },
  });

  // Contas com vencimento hoje (para teste do dashboard)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const accountsPayable6 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-003001",
      issuer: new Date("2024-12-10"),
      supplier: "Acabamentos Premium",
      product_and_services: "Tintas, Revestimentos, Pisos",
      construction_cost: "Acabamento",
      formPayment: "Boleto",
      valueAmount: 45000.0,
      installments: 2,
      valueTotal: 90000.0,
      maturity: today,
      launchDate: new Date(today.getTime() - 15 * 24 * 60 * 60 * 1000),
      paidDate: new Date(today.getTime() + 1000),
      status: StatusAccountsPayable.PENDING,
    },
  });

  const accountsPayable7 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-003002",
      issuer: new Date("2024-12-10"),
      supplier: "Limpeza Profissional",
      product_and_services: "Serviços de limpeza pós-obra",
      construction_cost: "Limpeza",
      formPayment: "PIX",
      valueAmount: 12000.0,
      installments: 1,
      valueTotal: 12000.0,
      maturity: today,
      launchDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
      paidDate: new Date(today.getTime() + 1000),
      status: StatusAccountsPayable.PENDING,
    },
  });

  // Contas atrasadas
  const accountsPayable8 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-003100",
      issuer: new Date("2024-12-10"),
      supplier: "Aços e Estruturas",
      product_and_services: "Vigas, Colunas, Estruturas Metálicas",
      construction_cost: "Estrutura Metálica",
      formPayment: "Boleto",
      valueAmount: 75000.0,
      installments: 3,
      valueTotal: 225000.0,
      maturity: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      launchDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
      paidDate: new Date(today.getTime() + 1000),
      status: StatusAccountsPayable.LATE,
    },
  });

  const accountsPayable9 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace2.id,
      nf: "NF-003101",
      issuer: new Date("2024-12-10"),
      supplier: "Segurança Total",
      product_and_services: "Serviços de segurança e vigilância",
      construction_cost: "Segurança",
      formPayment: "Transferência Bancária",
      valueAmount: 18000.0,
      installments: 1,
      valueTotal: 18000.0,
      maturity: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
      launchDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
      paidDate: new Date(today.getTime() + 1000),
      status: StatusAccountsPayable.LATE,
    },
  });

  // Contas futuras
  const accountsPayable10 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-003200",
      issuer: new Date("2024-12-10"),
      supplier: "Hidráulica Completa",
      product_and_services: "Tubos, Conexões, Registros",
      construction_cost: "Instalações Hidráulicas",
      formPayment: "Boleto",
      valueAmount: 28000.0,
      installments: 2,
      valueTotal: 56000.0,
      maturity: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      launchDate: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
      paidDate: new Date(today.getTime() + 1000),
      status: StatusAccountsPayable.PENDING,
    },
  });

  const accountsPayable11 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-003201",
      issuer: new Date("2024-12-10"),
      supplier: "Elétrica Moderna",
      product_and_services: "Fios, Disjuntores, Quadros Elétricos",
      construction_cost: "Instalações Elétricas",
      formPayment: "Cartão de Crédito",
      valueAmount: 32000.0,
      installments: 3,
      valueTotal: 96000.0,
      maturity: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
      launchDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
      paidDate: new Date(today.getTime() + 1000),
      status: StatusAccountsPayable.PENDING,
    },
  });

  const accountsPayable12 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace2.id,
      nf: "NF-003202",
      issuer: new Date("2024-12-10"),
      supplier: "Materiais de Construção Premium",
      product_and_services: "Tijolos, Cimento, Argamassa",
      construction_cost: "Alvenaria",
      formPayment: "Boleto",
      valueAmount: 55000.0,
      installments: 4,
      valueTotal: 220000.0,
      maturity: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
      launchDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
      paidDate: new Date(today.getTime() + 1000),
      status: StatusAccountsPayable.PENDING,
    },
  });

  // Contas pagas este mês
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const accountsPayable13 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-003300",
      issuer: new Date("2024-12-10"),
      supplier: "Coberturas e Telhas",
      product_and_services: "Telhas, Estruturas de Cobertura",
      construction_cost: "Cobertura",
      formPayment: "Transferência Bancária",
      valueAmount: 42000.0,
      installments: 2,
      valueTotal: 84000.0,
      maturity: new Date(firstDayOfMonth.getTime() + 5 * 24 * 60 * 60 * 1000),
      launchDate: new Date(firstDayOfMonth.getTime() - 10 * 24 * 60 * 60 * 1000),
      paidDate: new Date(firstDayOfMonth.getTime() + 3 * 24 * 60 * 60 * 1000),
      status: StatusAccountsPayable.PAID,
    },
  });

  const accountsPayable14 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace1.id,
      nf: "NF-003301",
      issuer: new Date("2024-12-10"),
      supplier: "Esquadrias Modernas",
      product_and_services: "Portas, Janelas, Esquadrias",
      construction_cost: "Esquadrias",
      formPayment: "PIX",
      valueAmount: 38000.0,
      installments: 1,
      valueTotal: 38000.0,
      maturity: new Date(firstDayOfMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      launchDate: new Date(firstDayOfMonth.getTime() - 8 * 24 * 60 * 60 * 1000),
      paidDate: new Date(firstDayOfMonth.getTime() + 8 * 24 * 60 * 60 * 1000),
      status: StatusAccountsPayable.PAID,
    },
  });

  const accountsPayable15 = await prisma.accountsPayable.create({
    data: {
      workerSpaceId: workerSpace2.id,
      nf: "NF-003302",
      issuer: new Date("2024-12-10"),
      supplier: "Terraplanagem e Movimentação",
      product_and_services: "Serviços de terraplanagem e movimentação de terra",
      construction_cost: "Terraplanagem",
      formPayment: "Boleto",
      valueAmount: 65000.0,
      installments: 3,
      valueTotal: 195000.0,
      maturity: new Date(firstDayOfMonth.getTime() + 12 * 24 * 60 * 60 * 1000),
      launchDate: new Date(firstDayOfMonth.getTime() - 15 * 24 * 60 * 60 * 1000),
      paidDate: new Date(firstDayOfMonth.getTime() + 10 * 24 * 60 * 60 * 1000),
      status: StatusAccountsPayable.PAID,
    },
  });

  console.log("✅ AccountsPayable criados");

  console.log("\n🎉 Seed concluído com sucesso!");
  console.log(`\n📊 Resumo:`);
  console.log(`   - WorkerSpaces: 2`);
  console.log(`   - Users: 3`);
  console.log(`   - Works: 3`);
  console.log(`   - Equipment: 3`);
  console.log(`   - Contracts: 8`);
  console.log(`   - AccountsPayable: 15`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao executar seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

