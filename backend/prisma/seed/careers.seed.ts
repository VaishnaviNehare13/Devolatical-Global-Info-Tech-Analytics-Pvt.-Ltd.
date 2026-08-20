import { PrismaClient, JobStatus, EmploymentType } from '@prisma/client';

export async function seedCareers(prisma: PrismaClient): Promise<void> {
  console.log('\n🌱 [Careers Seeder] Seeding initial active job postings...');

  const initialJobs = [
    {
      title: 'Senior Enterprise Data Architect',
      department: 'Data Analytics',
      location: 'Andheri West, Mumbai (Hybrid / Remote)',
      employmentType: EmploymentType.FULL_TIME,
      salaryRange: 'Competitive Enterprise Package',
      description: 'Architect high-throughput Spark ETL pipelines, Delta Lake lakehouses, and Snowflake data warehouse schemas.',
      requirements: '8+ years experience in distributed data systems, Spark, Snowflake, dbt, and enterprise data governance.',
      status: JobStatus.ACTIVE,
    },
    {
      title: 'Principal Cloud Infrastructure Engineer',
      department: 'IT Infrastructure',
      location: 'Andheri West, Mumbai (Hybrid / Remote)',
      employmentType: EmploymentType.FULL_TIME,
      salaryRange: 'Competitive Enterprise Package',
      description: 'Design zero-downtime multi-cloud migration frameworks, Terraform IaC templates, and Kubernetes clusters.',
      requirements: '7+ years experience with AWS/Azure multi-region topologies, Terraform, Docker, Kubernetes, and Wazuh security.',
      status: JobStatus.ACTIVE,
    },
    {
      title: 'Senior Custom Software Developer',
      department: 'Custom Software',
      location: 'Andheri West, Mumbai (Hybrid / Remote)',
      employmentType: EmploymentType.FULL_TIME,
      salaryRange: 'Competitive Enterprise Package',
      description: 'Build scalable web applications, REST/gRPC API microservices, and reactive React + TypeScript interfaces.',
      requirements: '5+ years experience in Node.js, Go, React, TypeScript, PostgreSQL, microservices, and automated testing.',
      status: JobStatus.ACTIVE,
    },
    {
      title: 'Enterprise Solution Architect',
      department: 'Architecture',
      location: 'Andheri West, Mumbai (Hybrid / Remote)',
      employmentType: EmploymentType.FULL_TIME,
      salaryRange: 'Competitive Enterprise Package',
      description: 'Lead strategic technical audits, design end-to-end digital ecosystem blueprints, and govern system security.',
      requirements: '10+ years enterprise solution design, cloud topology auditing, security compliance, and stakeholder consulting.',
      status: JobStatus.ACTIVE,
    },
  ];

  for (const jobData of initialJobs) {
    const existing = await prisma.job.findFirst({
      where: { title: jobData.title, deletedAt: null },
    });

    if (!existing) {
      await prisma.job.create({ data: jobData });
      console.log(`  ✓ Created active job: ${jobData.title}`);
    } else {
      console.log(`  ✓ Job already exists: ${jobData.title}`);
    }
  }

  console.log('✅ [Careers Seeder] Initial active jobs seeded successfully.\n');
}
