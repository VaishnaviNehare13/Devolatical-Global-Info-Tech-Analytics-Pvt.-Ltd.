import { Router } from 'express';
import healthRouter from './health.routes';

const v1Router = Router();

// Mount Health routes (which defines GET /health)
v1Router.use(healthRouter);

/**
 * Placeholder mounts for future module routing:
 *
 * - Authentication: v1Router.use('/auth', authRouter);
 * - User Profiles:  v1Router.use('/users', usersRouter);
 * - Portal Clients: v1Router.use('/clients', clientsRouter);
 * - Leads Tracking: v1Router.use('/leads', leadsRouter);
 * - Projects:       v1Router.use('/projects', projectsRouter);
 * - Milestones:     v1Router.use('/projects/:projectId/milestones', milestonesRouter);
 * - Support Desk:   v1Router.use('/tickets', ticketsRouter);
 * - Portal Assets:  v1Router.use('/documents', documentsRouter);
 */

export default v1Router;
//
