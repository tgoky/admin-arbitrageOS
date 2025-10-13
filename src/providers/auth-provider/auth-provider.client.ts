// admin-app/src/providers/auth-provider/admin-auth-provider.client.ts
"use client";

import type { AuthProvider } from "@refinedev/core";
import { isSessionExpired, shouldRefreshSession, type AdminSession } from "@/lib/session";

// Helper to validate session with the server
async function validateSession(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/auth/validate', {
      method: 'GET',
      credentials: 'include',
    });
    
    return response.ok;
  } catch (error) {
    console.error('Session validation error:', error);
    return false;
  }
}

// Helper to refresh session
async function refreshSessionOnServer(session: AdminSession): Promise<AdminSession | null> {
  if (!shouldRefreshSession(session)) {
    return session; // No refresh needed
  }

  console.log('🔄 Session near expiry, refreshing...');
  
  try {
    const response = await fetch('/api/admin/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const result = await response.json();
      
      if (result.refreshed && result.session) {
        console.log('✅ Session refreshed successfully');
        return result.session;
      }
    }
  } catch (error) {
    console.error('Failed to refresh session:', error);
  }
  
  return null;
}

// Helper to clear all auth data
function clearAuthData() {
  localStorage.removeItem('admin_session');
  document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
}

export const adminAuthProviderClient: AuthProvider = {
  login: async ({ email }) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: {
            name: "LoginError",
            message: result.error || "Login failed",
          },
        };
      }

      // Store session with expiration data
      const sessionData = JSON.stringify(result.session);
      localStorage.setItem('admin_session', sessionData);
      
      console.log('✅ Login successful, session expires:', result.session.expires_at);

      return { success: true };
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
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
    
    return {
      success: true,
      redirectTo: "/login"
    };
  },

  check: async () => {
    console.log('🔍 AUTH CHECK: Starting');
    
    // Check localStorage first
    const sessionStr = localStorage.getItem('admin_session');
    
    if (!sessionStr) {
      console.log('❌ AUTH CHECK: No session in localStorage');
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login"
      };
    }

    // Parse and validate session structure
    let session: AdminSession;
    try {
      session = JSON.parse(sessionStr);
      
      // Validate session has required fields
      if (!session.id || !session.email || !session.expires_at) {
        throw new Error('Invalid session structure');
      }
    } catch (e) {
      console.log('❌ AUTH CHECK: Invalid session format');
      clearAuthData();
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login"
      };
    }

    // Check if session is expired (client-side check)
    if (isSessionExpired(session)) {
      console.log('❌ AUTH CHECK: Session expired (client-side)');
      clearAuthData();
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
        error: {
          name: "SessionExpired",
          message: "Your session has expired. Please login again."
        }
      };
    }

    // Try to refresh if needed (sliding session)
    const refreshedSession = await refreshSessionOnServer(session);
    if (refreshedSession && refreshedSession !== session) {
      // Update localStorage with refreshed session
      localStorage.setItem('admin_session', JSON.stringify(refreshedSession));
      session = refreshedSession;
    } else if (refreshedSession === null) {
      // Refresh failed
      console.log('⚠️ Failed to refresh session');
    }

    // Validate with server (checks database and Supabase)
    const isValid = await validateSession();
    
    if (!isValid) {
      console.log('❌ AUTH CHECK: Session invalid on server');
      clearAuthData();
      return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
        error: {
          name: "SessionExpired",
          message: "Your session has expired. Please login again."
        }
      };
    }

    console.log('✅ AUTH CHECK: Session valid');
    return { authenticated: true };
  },

  getIdentity: async () => {
    const sessionStr = localStorage.getItem('admin_session');
    
    if (!sessionStr) return null;

    try {
      const session: AdminSession = JSON.parse(sessionStr);
      
      return {
        id: session.id,
        email: session.email,
        name: session.email?.split('@')[0] || 'Admin',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${session.email}`,
      };
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    console.error('🚨 AUTH ERROR:', error);
    
    if (error.status === 401 || error.statusCode === 401) {
      console.log('🚨 401 Error - Clearing auth and redirecting');
      clearAuthData();
      return {
        logout: true,
        redirectTo: "/login",
        error: {
          name: "Unauthorized",
          message: "Your session has expired. Please login again."
        }
      };
    }

    return { error };
  },
};