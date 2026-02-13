// admin-app/src/services/admin-invite.service.ts
//
// Migrated from signInWithOtp → generateLink + Resend for branded email delivery.
//
import { prisma } from "../lib/prisma";
import { createClient } from "@supabase/supabase-js";
import { getResendClient, FROM_EMAIL, APP_URL } from "../lib/resend";
import { inviteEmailHtml, inviteEmailText } from "../lib/email-templates";

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

// Admin client — server-side only, used to generate links without sending email.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const adminInviteService = {
  // Send invite to new user
  sendInvite: async ({ email, invitedBy }: InviteUserParams) => {
    console.log("📧 Starting invite process for:", email);
    try {
      const trimmedEmail = email.trim().toLowerCase();
      console.log("📧 Trimmed email:", trimmedEmail);

      // Check for existing invite
      const existingInvite = await prisma.userInvite.findUnique({
        where: { email: trimmedEmail },
      });

      if (existingInvite && existingInvite.status === "accepted") {
        return {
          success: false,
          error: "User already accepted an invite",
        };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });

      if (existingUser && existingUser.status === "active") {
        return {
          success: false,
          error: "User already has an active account",
        };
      }

      // Create or update invite record
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      const invite = await prisma.userInvite.upsert({
        where: { email: trimmedEmail },
        update: {
          status: "sent",
          invited_by: invitedBy,
          sent_at: new Date(),
          expires_at: expiresAt,
        },
        create: {
          email: trimmedEmail,
          status: "sent",
          invited_by: invitedBy,
          sent_at: new Date(),
          expires_at: expiresAt,
        },
      });
      console.log("✅ Invite record created/updated:", invite.id);

      // ── Generate magic link via Supabase Admin (no email sent by Supabase) ──
      const redirectTo = `${APP_URL}/api/auth/callback?next=/&invite_id=${invite.id}`;
      console.log("🔗 Generating magic link with redirectTo:", redirectTo);

      const { data: linkData, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: trimmedEmail,
          options: {
            redirectTo,
            data: {
              invited_by: invitedBy,
              invite_id: invite.id,
            },
          },
        });

      if (linkError || !linkData?.properties?.action_link) {
        console.error("❌ Supabase generateLink error:", linkError);
        return {
          success: false,
          error: "Failed to generate magic link. Please try again.",
        };
      }

      const magicLink = linkData.properties.action_link;

      // ── Send via Resend ─────────────────────────────────────────────────────
      const resend = getResendClient();

      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: trimmedEmail,
        subject: "You're invited to ArbitrageOS",
        html: inviteEmailHtml({ magicLink, email: trimmedEmail, inviteId: invite.id }),
        text: inviteEmailText({ magicLink, email: trimmedEmail, inviteId: invite.id }),
      });

      if (sendError) {
        console.error("❌ Resend send error:", sendError);
        return {
          success: false,
          error: "Failed to send invite email. Please try again.",
        };
      }

      console.log("✅ Invite email sent via Resend to:", trimmedEmail);
      return {
        success: true,
        inviteId: invite.id,
      };
    } catch (error: any) {
      console.error("Send invite error:", error);
      return {
        success: false,
        error: error.message || "Failed to send invite",
      };
    }
  },

  // Resend an existing invite
  resendInvite: async (inviteId: string) => {
    try {
      const invite = await prisma.userInvite.findUnique({
        where: { id: inviteId },
      });

      if (!invite) {
        return { success: false, error: "Invite not found" };
      }

      if (invite.status === "accepted") {
        return { success: false, error: "This invite has already been used" };
      }

      // Refresh expiry window
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await prisma.userInvite.update({
        where: { id: inviteId },
        data: {
          status: "sent",
          sent_at: new Date(),
          expires_at: expiresAt,
        },
      });

      // ── Generate magic link via Supabase Admin ──────────────────────────────
      const redirectTo = `${APP_URL}/api/auth/callback?next=/&invite_id=${invite.id}`;

      const { data: linkData, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: invite.email,
          options: { redirectTo },
        });

      if (linkError || !linkData?.properties?.action_link) {
        console.error("❌ Supabase generateLink error:", linkError);
        return {
          success: false,
          error: "Failed to generate magic link. Please try again.",
        };
      }

      const magicLink = linkData.properties.action_link;

      // ── Send via Resend ─────────────────────────────────────────────────────
      const resend = getResendClient();

      const { error: sendError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: invite.email,
        subject: "You're invited to ArbitrageOS",
        html: inviteEmailHtml({ magicLink, email: invite.email, inviteId: invite.id }),
        text: inviteEmailText({ magicLink, email: invite.email, inviteId: invite.id }),
      });

      if (sendError) {
        console.error("❌ Resend send error:", sendError);
        return {
          success: false,
          error: "Failed to send invite email. Please try again.",
        };
      }

      console.log(`✅ Invite email re-sent via Resend to: ${invite.email}`);
      return { success: true, inviteId: invite.id };
    } catch (error: any) {
      console.error("Resend invite error:", error);
      return {
        success: false,
        error: error.message || "Failed to resend invite",
      };
    }
  },

  // Get all invites
  getInvites: async () => {
    try {
      const invites = await prisma.userInvite.findMany({
        orderBy: { sent_at: "desc" },
      });

      return { success: true, data: invites };
    } catch (error: any) {
      console.error("Get invites error:", error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get all users with statistics
  getUsers: async (): Promise<{
    success: boolean;
    data: UserWithStats[];
    error?: string;
  }> => {
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
        orderBy: { created_at: "desc" },
      });

      const usersWithStats: UserWithStats[] = users.map((user) => ({
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
      console.error("Get users error:", error);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Suspend user
  suspendUser: async (userId: string) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "suspended" },
      });

      return { success: true };
    } catch (error: any) {
      console.error("Suspend user error:", error);
      return { success: false, error: error.message };
    }
  },

  // Activate user
  activateUser: async (userId: string) => {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "active" },
      });

      return { success: true };
    } catch (error: any) {
      console.error("Activate user error:", error);
      return { success: false, error: error.message };
    }
  },

  // Get dashboard statistics
  getStatistics: async () => {
    try {
      const [totalUsers, activeUsers, pendingInvites, totalWorkspaces] =
        await Promise.all([
          prisma.user.count(),
          prisma.user.count({ where: { status: "active" } }),
          prisma.userInvite.count({ where: { status: "sent" } }),
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
      console.error("Get statistics error:", error);
      return { success: false, error: error.message };
    }
  },
};