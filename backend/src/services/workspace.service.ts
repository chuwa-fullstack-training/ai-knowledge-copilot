import mongoose from 'mongoose';
import { Workspace, type IWorkspace } from '../models/Workspace';
import logger from '../config/logger';

export interface CreateWorkspaceData {
  name: string;
  userId: string;
}

export interface InviteMemberData {
  workspaceId: string;
  userId: string;
  invitedUserId: string;
  role?: 'admin' | 'member';
}

export interface UpdateMemberRoleData {
  workspaceId: string;
  userId: string;
  targetUserId: string;
  newRole: 'admin' | 'member';
}

export class WorkspaceService {
  async create(data: CreateWorkspaceData): Promise<IWorkspace> {
    const { name, userId } = data;

    const workspace = await Workspace.create({
      name,
      createdBy: new mongoose.Types.ObjectId(userId),
      members: [
        {
          userId: new mongoose.Types.ObjectId(userId),
          role: 'admin',
          joinedAt: new Date(),
        },
      ],
    });

    logger.info(`Workspace created: ${name} by user ${userId}`);

    return workspace;
  }

  async getById(workspaceId: string): Promise<IWorkspace | null> {
    return Workspace.findById(workspaceId).populate('members.userId', 'email role');
  }

  async getUserWorkspaces(userId: string): Promise<IWorkspace[]> {
    return Workspace.find({
      'members.userId': new mongoose.Types.ObjectId(userId),
    }).populate('members.userId', 'email role');
  }

  async inviteMember(data: InviteMemberData): Promise<IWorkspace> {
    const { workspaceId, userId, invitedUserId, role = 'member' } = data;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check if requester is admin
    const requesterMember = workspace.members.find(
      (m) => m.userId.toString() === userId
    );
    if (!requesterMember || requesterMember.role !== 'admin') {
      throw new Error('Only admins can invite members');
    }

    // Check if user is already a member
    const existingMember = workspace.members.find(
      (m) => m.userId.toString() === invitedUserId
    );
    if (existingMember) {
      throw new Error('User is already a member');
    }

    // Add member
    workspace.members.push({
      userId: new mongoose.Types.ObjectId(invitedUserId),
      role,
      joinedAt: new Date(),
    });

    await workspace.save();

    logger.info(`User ${invitedUserId} invited to workspace ${workspaceId}`);

    return workspace;
  }

  async removeMember(
    workspaceId: string,
    userId: string,
    targetUserId: string
  ): Promise<IWorkspace> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check if requester is admin
    const requesterMember = workspace.members.find(
      (m) => m.userId.toString() === userId
    );
    if (!requesterMember || requesterMember.role !== 'admin') {
      throw new Error('Only admins can remove members');
    }

    // Don't allow removing the last admin
    const adminCount = workspace.members.filter((m) => m.role === 'admin').length;
    const targetMember = workspace.members.find(
      (m) => m.userId.toString() === targetUserId
    );
    if (targetMember?.role === 'admin' && adminCount === 1) {
      throw new Error('Cannot remove the last admin');
    }

    // Remove member
    workspace.members = workspace.members.filter(
      (m) => m.userId.toString() !== targetUserId
    );

    await workspace.save();

    logger.info(`User ${targetUserId} removed from workspace ${workspaceId}`);

    return workspace;
  }

  async updateMemberRole(data: UpdateMemberRoleData): Promise<IWorkspace> {
    const { workspaceId, userId, targetUserId, newRole } = data;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check if requester is admin
    const requesterMember = workspace.members.find(
      (m) => m.userId.toString() === userId
    );
    if (!requesterMember || requesterMember.role !== 'admin') {
      throw new Error('Only admins can update member roles');
    }

    // Find target member
    const targetMember = workspace.members.find(
      (m) => m.userId.toString() === targetUserId
    );
    if (!targetMember) {
      throw new Error('Member not found');
    }

    // Don't allow demoting the last admin
    if (targetMember.role === 'admin' && newRole === 'member') {
      const adminCount = workspace.members.filter((m) => m.role === 'admin').length;
      if (adminCount === 1) {
        throw new Error('Cannot demote the last admin');
      }
    }

    // Update role
    targetMember.role = newRole;
    await workspace.save();

    logger.info(
      `User ${targetUserId} role updated to ${newRole} in workspace ${workspaceId}`
    );

    return workspace;
  }

  async delete(workspaceId: string, userId: string): Promise<void> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      throw new Error('Workspace not found');
    }

    // Check if requester is admin
    const requesterMember = workspace.members.find(
      (m) => m.userId.toString() === userId
    );
    if (!requesterMember || requesterMember.role !== 'admin') {
      throw new Error('Only admins can delete workspaces');
    }

    await Workspace.findByIdAndDelete(workspaceId);

    logger.info(`Workspace ${workspaceId} deleted by user ${userId}`);
  }

  async checkMembership(
    workspaceId: string,
    userId: string
  ): Promise<'admin' | 'member' | null> {
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return null;
    }

    const member = workspace.members.find((m) => m.userId.toString() === userId);
    return member ? member.role : null;
  }
}

export const workspaceService = new WorkspaceService();
