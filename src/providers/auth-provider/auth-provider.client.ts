// admin-app/src/providers/auth-provider/admin-auth-provider.client.ts
"use client";

import type { AuthProvider } from "@refinedev/core";

export const adminAuthProviderClient: AuthProvider = {
  login: async ({ email }) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      // Store in localStorage
      localStorage.setItem('admin_session', JSON.stringify(result.session));

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
    localStorage.removeItem('admin_session');
    return {
      success: true,
      redirectTo: "/login"
    };
  },

 // admin-app/src/providers/auth-provider/admin-auth-provider.client.ts
check: async () => {
  console.log('🔍 CHECK: Running auth check');
  console.log('🔍 CHECK: typeof localStorage:', typeof localStorage);
  console.log('🔍 CHECK: localStorage available:', typeof window !== 'undefined');
  
  const session = localStorage.getItem('admin_session');
  console.log('🔍 CHECK: Session from localStorage:', session ? 'EXISTS' : 'NULL');
  
  if (!session) {
    console.log('❌ CHECK: No session, will redirect to login');
    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login"
    };
  }

  try {
    const parsed = JSON.parse(session);
    console.log('✅ CHECK: Session valid:', parsed.email);
    return { authenticated: true };
  } catch (e) {
    console.log('❌ CHECK: Session invalid, parsing failed');
    localStorage.removeItem('admin_session');
    return {
      authenticated: false,
      logout: true,
      redirectTo: "/login"
    };
  }
},

  getIdentity: async () => {
    const session = localStorage.getItem('admin_session');
    
    if (!session) return null;

    try {
      const data = JSON.parse(session);
      return {
        id: data.id,
        email: data.email,
        name: data.email?.split('@')[0] || 'Admin',
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${data.email}`,
      };
    } catch {
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