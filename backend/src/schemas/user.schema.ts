import { z } from 'zod';

export const updateRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN'])
});

export const updateStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE'])
});
