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

/**
 * @swagger
 * /workspaces:
 *   post:
 *     tags:
 *       - Workspaces
 *     summary: Create a new workspace
 *     description: Create a new workspace, user becomes the owner
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkspaceRequest'
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/',
  validate(createWorkspaceSchema),
  workspaceController.create.bind(workspaceController)
);

/**
 * @swagger
 * /workspaces:
 *   get:
 *     tags:
 *       - Workspaces
 *     summary: List user's workspaces
 *     description: Retrieve all workspaces where the user is a member
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of workspaces
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Workspace'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', workspaceController.list.bind(workspaceController));

/**
 * @swagger
 * /workspaces/{workspaceId}:
 *   get:
 *     tags:
 *       - Workspaces
 *     summary: Get workspace by ID
 *     description: Retrieve a specific workspace (requires membership)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Workspace ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Workspace details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:workspaceId',
  checkWorkspaceAccess(),
  workspaceController.getById.bind(workspaceController)
);

/**
 * @swagger
 * /workspaces/{workspaceId}:
 *   delete:
 *     tags:
 *       - Workspaces
 *     summary: Delete workspace
 *     description: Delete a workspace (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Workspace ID (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Workspace deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Workspace deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:workspaceId',
  checkWorkspaceAccess('admin'),
  workspaceController.delete.bind(workspaceController)
);

/**
 * @swagger
 * /workspaces/{workspaceId}/members:
 *   post:
 *     tags:
 *       - Workspaces
 *     summary: Invite member to workspace
 *     description: Add a new member to the workspace (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Workspace ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InviteMemberRequest'
 *     responses:
 *       200:
 *         description: Member invited successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:workspaceId/members',
  checkWorkspaceAccess('admin'),
  validate(inviteMemberSchema),
  workspaceController.inviteMember.bind(workspaceController)
);

/**
 * @swagger
 * /workspaces/{workspaceId}/members/{userId}:
 *   delete:
 *     tags:
 *       - Workspaces
 *     summary: Remove member from workspace
 *     description: Remove a member from the workspace (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Workspace ID (MongoDB ObjectId)
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: User ID to remove (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Member removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete(
  '/:workspaceId/members/:userId',
  checkWorkspaceAccess('admin'),
  workspaceController.removeMember.bind(workspaceController)
);

/**
 * @swagger
 * /workspaces/{workspaceId}/members/{userId}/role:
 *   patch:
 *     tags:
 *       - Workspaces
 *     summary: Update member role
 *     description: Change a member's role in the workspace (requires admin role)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workspaceId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Workspace ID (MongoDB ObjectId)
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: User ID (MongoDB ObjectId)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateMemberRoleRequest'
 *     responses:
 *       200:
 *         description: Member role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Workspace'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:workspaceId/members/:userId/role',
  checkWorkspaceAccess('admin'),
  validate(updateMemberRoleSchema),
  workspaceController.updateMemberRole.bind(workspaceController)
);

export default router;
