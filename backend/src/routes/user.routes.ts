import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth';
import { db } from '../utils/db';
import { updateRoleSchema, updateStatusSchema } from '../schemas/user.schema';

const router = Router();

// Step 8: Current User Endpoint
router.get('/me', requireAuth, (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.dbUser.id,
      email: req.dbUser.email,
      name: req.dbUser.name,
      role: req.dbUser.role,
      status: req.dbUser.status,
    }
  });
});

// Step 9: Admin User Management

router.patch('/:id/role', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateRoleSchema.parse(req.body);

    const updatedUser = await db.user.update({
      where: { id },
      data: { role: validatedData.role }
    });

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: updatedUser.id,
        role: updatedUser.role
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Invalid role', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Failed to update user role' });
  }
});

router.patch('/:id/status', requireAuth, requireRole(['ADMIN']), async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateStatusSchema.parse(req.body);

    const updatedUser = await db.user.update({
      where: { id },
      data: { status: validatedData.status }
    });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: {
        id: updatedUser.id,
        status: updatedUser.status
      }
    });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ success: false, message: 'Invalid status', errors: error.errors });
    }
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
});

export default router;
