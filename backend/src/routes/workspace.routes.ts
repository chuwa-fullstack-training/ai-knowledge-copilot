import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller';
import { authenticate } from '../middleware/auth';
import { checkWorkspaceAccess } from '../middleware/authorization';
import { validate } from '../middleware/validation';
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validators/workspace.validators';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Workspace CRUD
router.post(
  '/',
  validate(createWorkspaceSchema),
  workspaceController.create.bind(workspaceController)
);
router.get('/', workspaceController.list.bind(workspaceController));
router.get(
  '/:workspaceId',
  checkWorkspaceAccess(),
  workspaceController.getById.bind(workspaceController)
);
router.delete(
  '/:workspaceId',
  checkWorkspaceAccess('admin'),
  workspaceController.delete.bind(workspaceController)
);

// Member management
router.post(
  '/:workspaceId/members',
  checkWorkspaceAccess('admin'),
  validate(inviteMemberSchema),
  workspaceController.inviteMember.bind(workspaceController)
);
router.delete(
  '/:workspaceId/members/:userId',
  checkWorkspaceAccess('admin'),
  workspaceController.removeMember.bind(workspaceController)
);
router.patch(
  '/:workspaceId/members/:userId/role',
  checkWorkspaceAccess('admin'),
  validate(updateMemberRoleSchema),
  workspaceController.updateMemberRole.bind(workspaceController)
);

export default router;
