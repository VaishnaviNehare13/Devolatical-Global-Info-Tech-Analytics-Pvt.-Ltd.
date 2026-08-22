import {
  PrismaClient,
  InvoiceStatus,
  TicketStatus,
  TicketPriority,
  MilestoneStatus,
  MilestoneReviewStatus,
  TaskStatus,
  TaskPriority,
} from '@prisma/client';
import fs from 'fs';
import path from 'path';

export async function seedInvoicesAndClientData(prisma: PrismaClient): Promise<void> {
  console.log('🌱 [Client Data Seeder] Seeding clients, projects, milestones, tasks, documents, invoices, and tickets...');

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

  // 4. Upsert Sample Milestones
  const sampleMilestones = [
    {
      title: 'Requirements & Cloud Architecture',
      description: 'Initial cloud architecture specification and IAM role design.',
      status: MilestoneStatus.COMPLETED,
      reviewStatus: MilestoneReviewStatus.APPROVED,
      projectId: proj1.id,
      completedAt: new Date('2026-02-15'),
      approvedAt: new Date('2026-02-16'),
    },
    {
      title: 'Cloud Architecture Deliverables',
      description: 'Infrastructure-as-Code Terraform templates and core network deployment.',
      status: MilestoneStatus.IN_PROGRESS,
      reviewStatus: MilestoneReviewStatus.SUBMITTED,
      projectId: proj1.id,
      submittedForReviewAt: new Date('2026-03-01'),
    },
    {
      title: 'Real-Time Telemetry Pipeline',
      description: 'Kinesis Kafka ingestion stream and Databricks lakehouse synchronization.',
      status: MilestoneStatus.IN_PROGRESS,
      reviewStatus: MilestoneReviewStatus.SUBMITTED,
      projectId: proj2.id,
      submittedForReviewAt: new Date('2026-03-10'),
    },
  ];

  for (const ms of sampleMilestones) {
    const existing = await prisma.milestone.findFirst({
      where: { title: ms.title, projectId: ms.projectId },
    });
    if (!existing) {
      await prisma.milestone.create({ data: ms });
    }
  }

  // 5. Upsert Sample Sprint Tasks
  const sampleTasks = [
    {
      code: 'TASK-ACME-01',
      title: 'Configure Kafka topic partition retention',
      description: 'Set retention policy to 7 days on real-time event streaming cluster.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      projectId: proj2.id,
    },
    {
      code: 'TASK-ACME-02',
      title: 'Validate S3 bucket KMS encryption policy',
      description: 'Enforce server-side AES-256 encryption on all telemetry buckets.',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.MEDIUM,
      projectId: proj1.id,
    },
  ];

  for (const tsk of sampleTasks) {
    await prisma.task.upsert({
      where: { code: tsk.code },
      update: {
        title: tsk.title,
        description: tsk.description,
        status: tsk.status,
        priority: tsk.priority,
        projectId: tsk.projectId,
      },
      create: tsk,
    });
  }

  // 6. Ensure Physical Uploads Directory & Sample Documents Exist
  const uploadDirs = [
    path.resolve(process.cwd(), 'uploads/documents'),
    path.resolve(__dirname, '../../uploads/documents'),
    path.resolve(__dirname, '../../../uploads/documents'),
  ];

  for (const dir of uploadDirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const sampleDocFiles = [
    {
      title: 'Architecture Specification v2',
      fileName: 'Architecture_Specification_v2.pdf',
      relativeUrl: 'uploads/documents/Architecture_Specification_v2.pdf',
      fileSize: 2516582,
      mimeType: 'application/pdf',
      description: 'Technical Cloud Architecture & Security Governance Specification v2.0.',
      projectId: proj1.id,
    },
    {
      title: 'Data Governance SLA',
      fileName: 'Data_Governance_SLA.pdf',
      relativeUrl: 'uploads/documents/Data_Governance_SLA.pdf',
      fileSize: 1153433,
      mimeType: 'application/pdf',
      description: 'Enterprise Data Lake Service Level Agreement & Compliance Standards.',
      projectId: proj1.id,
    },
  ];

  const dummyPdfHeader = Buffer.from(
    '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources <<>> /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 55 >>\nstream\nBT /F1 12 Tf 100 700 Td (Devolatical Sample Document) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000206 00000 n \ntrailer\n<< /Size 5 /Root 1 0 R >>\nstartxref\n310\n%%EOF\n'
  );

  for (const docFile of sampleDocFiles) {
    const targetPaths = [
      path.resolve(process.cwd(), docFile.relativeUrl),
      path.resolve(__dirname, '../../', docFile.relativeUrl),
      path.resolve(__dirname, '../../../', docFile.relativeUrl),
    ];

    for (const targetPath of targetPaths) {
      const parentDir = path.dirname(targetPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      if (!fs.existsSync(targetPath)) {
        fs.writeFileSync(targetPath, dummyPdfHeader);
      }
    }

    const existing = await prisma.document.findFirst({
      where: { fileName: docFile.fileName, clientId: acmeClient.id },
    });
    if (!existing) {
      await prisma.document.create({
        data: {
          title: docFile.title,
          fileName: docFile.fileName,
          fileUrl: docFile.relativeUrl,
          fileSize: docFile.fileSize,
          mimeType: docFile.mimeType,
          description: docFile.description,
          clientId: acmeClient.id,
          projectId: docFile.projectId,
        },
      });
    }
  }

  // 7. Upsert Sample Invoices
  const sampleInvoices = [
    {
      invoiceNumber: 'INV-2026-004',
      description: 'Enterprise Cloud Architecture Setup - Milestone 2 Deliverables',
      amount: 42500.0,
      currency: 'INR',
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
      currency: 'INR',
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
      currency: 'INR',
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
      currency: 'INR',
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
        currency: inv.currency,
        status: inv.status,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        clientId: inv.clientId,
        projectId: inv.projectId,
      },
      create: inv,
    });
  }

  // 8. Upsert Sample Tickets
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

  // 9. Upsert Sample Pipelines
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

  console.log('✅ [Client Data Seeder] Clients, projects, milestones, tasks, documents, invoices, tickets, and pipelines seeded successfully.');
}
