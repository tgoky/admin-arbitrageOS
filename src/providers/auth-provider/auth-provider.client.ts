// admin-app/src/providers/auth-provider/admin-auth-provider.client.ts
"use client";

import type { AuthProvider } from "@refinedev/core";
import { supabaseBrowserClient as supabase } from "../../utils/supabase/client";

export const adminAuthProviderClient: AuthProvider = {
  login: async ({ email }) => {
    try {
      const trimmedEmail = email.trim().toLowerCase();

      // Send magic link for admin login
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback?next=/admin`,
          shouldCreateUser: false, // Don't auto-create users
        },
      });

      if (error) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: error.message || "Failed to send magic link",
          },
        };
      }

      return {
        success: true,
        successNotification: {
          message: "Check your email!",
          description: "We sent you a magic link to login as admin.",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          name: "LoginError",
          message: error?.message || "Failed to login",
        },
      };
    }
  },

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { 
          success: false, 
          error: {
            name: "LogoutError",
            message: error.message,
          },
        };
      }
      
      return { 
        success: true, 
        redirectTo: "/login" 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: {
          name: "LogoutError",
          message: error.message || "Logout failed",
        },
      };
    }
  },

  check: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return { 
          authenticated: false, 
          logout: true, 
          redirectTo: "/login" 
        };
      }

      // Check admin role via API (Prisma)
      const response = await fetch('/api/admin/verify');
      const { isAdmin } = await response.json();

      if (!isAdmin) {
        return { 
          authenticated: false, 
          logout: true, 
          redirectTo: "/login",
          error: {
            message: "You don't have admin access",
            name: "Unauthorized"
          }
        };
      }
      
      return { authenticated: true };
    } catch (error) {
      return { 
        authenticated: false, 
        logout: true, 
        redirectTo: "/login" 
      };
    }
  },

  getIdentity: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin',
          avatar: user.user_metadata?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`,
        };
      }
      
      return null;
    } catch (error) {
      return null;
    }
  },

  onError: async (error) => {
    if (error.status === 401) {
      return { 
        logout: true, 
        redirectTo: "/login" 
      };
    }
    
    return { error };
  },
};