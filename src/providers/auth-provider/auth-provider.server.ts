// admin-app/src/providers/auth-provider/auth-provider.server.ts
import type { AuthProvider } from "@refinedev/core";

export const authProviderServer: Pick<AuthProvider, "check"> = {
  check: async () => {
    // Since we're using localStorage client-side, 
    // server-side checks should just pass through
    return {
      authenticated: true,
    };
  },
};