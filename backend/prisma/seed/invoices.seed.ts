import { PrismaClient, InvoiceStatus, TicketStatus, TicketPriority } from '@prisma/client';

export async function seedInvoicesAndClientData(prisma: PrismaClient): Promise<void> {
  console.log('🌱 [Client Data Seeder] Seeding clients, projects, invoices, and tickets...');

  // 1. Ensure client user exists
  const clientUser = await prisma.user.findUnique({
    where: { email: 'client@devolatical.com' },
  });

  // 2. Upsert Client Organization
  const acmeClient = await prisma.client.upsert({
    where: { code: 'ACME' },
    update: {
      name: 'Acme Global Logistics',
      email: 'contact@acmelogistics.com',
      status: 'ACTIVE',
      accountManagerId: clientUser?.id || null,
    },
    create: {
      code: 'ACME',
      name: 'Acme Global Logistics',
      email: 'contact@acmelogistics.com',
      status: 'ACTIVE',
      accountManagerId: clientUser?.id || null,
    },
  });

  // 3. Upsert Sample Projects
  const proj1 = await prisma.project.upsert({
    where: { code: 'PROJ-ACME-01' },
    update: {
      name: 'Enterprise Cloud Architecture Setup',
      status: 'ACTIVE',
      clientId: acmeClient.id,
      budget: 150000.0,
      startDate: new Date('2026-01-15'),
    },
    create: {
      code: 'PROJ-ACME-01',
      name: 'Enterprise Cloud Architecture Setup',
      status: 'ACTIVE',
      clientId: acmeClient.id,
      budget: 150000.0,
      startDate: new Date('2026-01-15'),
    },
  });

  const proj2 = await prisma.project.upsert({
    where: { code: 'PROJ-ACME-02' },
    update: {
      name: 'Advanced Data Pipelines Provisioning',
      status: 'ACTIVE',
      clientId: acmeClient.id,
      budget: 95000.0,
      startDate: new Date('2026-03-01'),
    },
    create: {
      code: 'PROJ-ACME-02',
      name: 'Advanced Data Pipelines Provisioning',
      status: 'ACTIVE',
      clientId: acmeClient.id,
      budget: 95000.0,
      startDate: new Date('2026-03-01'),
    },
  });

  // 4. Upsert Sample Invoices
  const sampleInvoices = [
    {
      invoiceNumber: 'INV-2026-004',
      description: 'Enterprise Cloud Architecture Setup - Milestone 2 Deliverables',
      amount: 42500.0,
      status: InvoiceStatus.PAID,
      dueDate: new Date('2026-06-30'),
      paidAt: new Date('2026-06-28'),
      clientId: acmeClient.id,
      projectId: proj1.id,
    },
    {
      invoiceNumber: 'INV-2026-003',
      description: 'Advanced Data Pipelines Provisioning - Ingestion Engine Sync',
      amount: 28000.0,
      status: InvoiceStatus.PAID,
      dueDate: new Date('2026-05-15'),
      paidAt: new Date('2026-05-14'),
      clientId: acmeClient.id,
      projectId: proj2.id,
    },
    {
      invoiceNumber: 'INV-2026-002',
      description: 'BI Dashboards Custom Integration - Initial Setup',
      amount: 15400.0,
      status: InvoiceStatus.PAID,
      dueDate: new Date('2026-04-01'),
      paidAt: new Date('2026-03-30'),
      clientId: acmeClient.id,
      projectId: proj1.id,
    },
    {
      invoiceNumber: 'INV-2026-001',
      description: 'Initial Consulting and Discovery Phase',
      amount: 10000.0,
      status: InvoiceStatus.PAID,
      dueDate: new Date('2026-03-01'),
      paidAt: new Date('2026-02-28'),
      clientId: acmeClient.id,
      projectId: proj1.id,
    },
  ];

  for (const inv of sampleInvoices) {
    await prisma.invoice.upsert({
      where: { invoiceNumber: inv.invoiceNumber },
      update: {
        description: inv.description,
        amount: inv.amount,
        status: inv.status,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        clientId: inv.clientId,
        projectId: inv.projectId,
      },
      create: inv,
    });
  }

  // 5. Upsert Sample Tickets
  const sampleTickets = [
    {
      subject: 'Snowflake analytics pipeline latency spikes',
      description: 'Observed intermittent latency during peak data processing window.',
      severity: TicketPriority.HIGH,
      status: TicketStatus.OPEN,
      clientId: acmeClient.id,
      projectId: proj2.id,
    },
    {
      subject: 'Establish staging SSO SAML access configurations',
      description: 'Configure SSO identity mapping for staging user environment.',
      severity: TicketPriority.MEDIUM,
      status: TicketStatus.RESOLVED,
      clientId: acmeClient.id,
      projectId: proj1.id,
    },
    {
      subject: 'AWS cloud billing export automation adjustments',
      description: 'Modify daily S3 cost metrics export target folder.',
      severity: TicketPriority.LOW,
      status: TicketStatus.CLOSED,
      clientId: acmeClient.id,
      projectId: proj1.id,
    },
  ];

  for (const tck of sampleTickets) {
    const existing = await prisma.ticket.findFirst({
      where: { subject: tck.subject, clientId: tck.clientId },
    });
    if (!existing) {
      await prisma.ticket.create({
        data: {
          subject: tck.subject,
          description: tck.description,
          priority: tck.severity,
          status: tck.status,
          clientId: tck.clientId,
          projectId: tck.projectId,
        },
      });
    }
  }

  const samplePipelines = [
    {
      name: 'healthcare-telemetry-ingest',
      description: 'Ingestion stream processing medical device metrics.',
      status: 'ACTIVE' as const,
      source: 'Azure IoT Hub',
      target: 'Databricks Lakehouse',
      volume: '800k req/hr',
      progress: 85,
      clientId: acmeClient.id,
      projectId: proj1.id,
    },
    {
      name: 'financial-ledger-sync',
      description: 'Real-time transaction synchronization for ledger reporting.',
      status: 'ACTIVE' as const,
      source: 'Kinesis Kafka',
      target: 'Snowflake Core DW',
      volume: '1.2M req/hr',
      progress: 94,
      clientId: acmeClient.id,
      projectId: proj1.id,
    },
    {
      name: 'retail-recommender-update',
      description: 'Syncing clickstream user features into feature store.',
      status: 'SYNCING' as const,
      source: 'Web Telemetry SDK',
      target: 'MongoDB Atlas',
      volume: '3.4M req/hr',
      progress: 34,
      clientId: acmeClient.id,
      projectId: proj1.id,
    },
  ];

  for (const pip of samplePipelines) {
    const existing = await prisma.dataPipeline.findFirst({
      where: { name: pip.name, clientId: pip.clientId },
    });
    if (!existing) {
      await prisma.dataPipeline.create({
        data: pip,
      });
    }
  }

  console.log('✅ [Client Data Seeder] Clients, projects, invoices, tickets, and pipelines seeded successfully.');
}

