import request from 'supertest';
import app from '../../../app';
import { prisma } from '../../../config/db';

describe('Public Lead Submission Integration Test', () => {
  let createdLeadId: string | null = null;

  afterAll(async () => {
    if (createdLeadId) {
      await prisma.lead.deleteMany({ where: { id: createdLeadId } });
    }
  });

  it('should allow unauthenticated public visitor to submit a contact inquiry creating a Lead record in the database', async () => {
    const payload = {
      name: 'Jane Contact Public',
      email: 'jane_public@example.com',
      companyName: 'Acme Enterprise Solutions',
      source: 'WEBSITE',
      industry: 'Advanced Data Analytics',
      notes: 'Need scoping estimate for enterprise BI migration.',
    };

    const res = await request(app)
      .post('/api/v1/leads')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Jane Contact Public');
    expect(res.body.data.email).toBe('jane_public@example.com');
    expect(res.body.data.companyName).toBe('Acme Enterprise Solutions');
    expect(res.body.data.source).toBe('WEBSITE');
    expect(res.body.data.status).toBe('NEW');

    createdLeadId = res.body.data.id;

    // Verify DB record existence
    const dbLead = await prisma.lead.findUnique({ where: { id: createdLeadId! } });
    expect(dbLead).not.toBeNull();
    expect(dbLead?.name).toBe('Jane Contact Public');
    expect(dbLead?.createdById).toBeNull();
  });

  it('should reject invalid lead submissions with 400 Bad Request', async () => {
    const invalidPayload = {
      email: 'not-an-email',
      source: 'INVALID_SOURCE',
    };

    const res = await request(app)
      .post('/api/v1/leads')
      .send(invalidPayload);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
