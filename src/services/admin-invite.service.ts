// admin-app/src/services/admin-invite.service.ts
import { prisma } from "../lib/prisma";
import { supabaseBrowserClient as supabase } from "@/utils/supabase/client";

export interface InviteUserParams {
  email: string;
  invitedBy: string;
}

export interface UserWithStats {
  id: string;
  email: string;
  name: string | null;
  status: string | null;
  last_login: Date | null;
  invite_sent_at: Date | null;
  workspaceCount: number;
  toolsUsed: number;
  created_at: Date;
}

export const adminInviteService = {
  // Send invite to new user
  sendInvite: async ({ email, invitedBy }: InviteUserParams) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Check for existing invite via Prisma (not auth.admin)
      const existingInvite = await prisma.userInvite.findUnique({
        where: { email: trimmedEmail },
      });

      if (existingInvite && existingInvite.status === 'accepted') {
        return {
          success: false,
          error: 'User already accepted an invite',
        };
      }

      // Check if user already exists in our database
      const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (existingUser && existingUser.status === 'active') {
        return {
          success: false,
          error: 'User already has an active account',
        };
      }

      // Create or update invite
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const invite = await prisma.userInvite.upsert({
        where: { email: trimmedEmail },
        update: {
          status: 'sent',
          invited_by: invitedBy,
          sent_at: new Date(),
          expires_at: expiresAt,
        },
        create: {
          email: trimmedEmail,
          status: 'sent',
          invited_by: invitedBy,
          sent_at: new Date(),
          expires_at: expiresAt,
        },
      });

      // Send magic link via Supabase Auth
      // This redirects to the MAIN APP, not admin
      const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${mainAppUrl}/api/auth/callback?next=/&invite_id=${invite.id}`,
          shouldCreateUser: true,
          data: {
            invited_by: invitedBy,
            invite_id: invite.id,
          },
        },
      });

      if (authError) {
        return {
          success: false,
          error: authError.message,
        };
      }

      return {
        success: true,
        inviteId: invite.id,
      };
    } catch (error: any) {
      console.error('Send invite error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send invite',
      };
    }
  },

  // Get all invites
  getInvites: async () => {
    try {
      const invites = await prisma.userInvite.findMany({
        orderBy: { sent_at: 'desc' },
      });

      return { success: true, data: invites };
    } catch (error: any) {
      console.error('Get invites error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get all users with statistics
getUsers: async (): Promise<{ success: boolean; data: UserWithStats[]; error?: string }> => {
  try {
    const users = await prisma.user.findMany({
      include: {
        workspaces: {
          select: { id: true },
        },
        deliverables: {
          select: { id: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });
    

      const usersWithStats: UserWithStats[] = users.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        last_login: user.last_login,
        invite_sent_at: user.invite_sent_at,
        workspaceCount: user.workspaces.length,
        toolsUsed: user.deliverables.length,
        created_at: user.created_at,
      }));

      return { success: true, data: usersWithStats };
    } catch (error: any) {
      console.error('Get users error:', error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Resend invite
  resendInvite: async (inviteId: string) => {
    try {
      const invite = await prisma.userInvite.findUnique({
        where: { id: inviteId },
      });

      if (!invite) {
        return { success: false, error: 'Invite not found' };
      }

      // Update invite
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.userInvite.update({
        where: { id: inviteId },
        data: {
          status: 'sent',
          sent_at: new Date(),
          expires_at: expiresAt,
        },
      });

      // Resend magic link
      const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: invite.email,
        options: {
          emailRedirectTo: `${mainAppUrl}/api/auth/callback?next=/&invite_id=${invite.id}`,
          shouldCreateUser: true,
        },
      });

      if (authError) {
        return { success: false, error: authError.message };
      }

      return { success: true, inviteId: invite.id };
    } catch (error: any) {
      console.error('Resend invite error:', error);
      return { success: false, error: error.message };
    }
  },

  // Suspend user
  suspendUser: async (userId: string) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'suspended' },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Suspend user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Activate user
  activateUser: async (userId: string) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status: 'active' },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Activate user error:', error);
      return { success: false, error: error.message };
    }
  },

  // Get dashboard statistics
  getStatistics: async () => {
    try {
      const [totalUsers, activeUsers, pendingInvites, totalWorkspaces] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'active' } }),
        prisma.userInvite.count({ where: { status: 'sent' } }),
        prisma.workspace.count(),
      ]);

      const totalDeliverables = await prisma.deliverable.count();

      return {
        success: true,
        data: {
          totalUsers,
          activeUsers,
          pendingInvites,
          totalWorkspaces,
          totalToolsUsed: totalDeliverables,
        },
      };
    } catch (error: any) {
      console.error('Get statistics error:', error);
      return { success: false, error: error.message };
    }
  },
};