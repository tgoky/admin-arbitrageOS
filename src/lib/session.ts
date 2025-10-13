// admin-app/src/lib/session.ts

export interface AdminSession {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
  last_refreshed?: string;
}

// Configuration
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
const REFRESH_THRESHOLD = 24 * 60 * 60 * 1000; // Refresh if < 1 day remaining

export function createSession(userId: string, email: string, role: string): AdminSession {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION);
  
  return {
    id: userId,
    email,
    role,
    created_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    last_refreshed: now.toISOString()
  };
}

export function isSessionExpired(session: AdminSession): boolean {
  const now = new Date();
  const expiresAt = new Date(session.expires_at);
  return now > expiresAt;
}

export function shouldRefreshSession(session: AdminSession): boolean {
  const timeRemaining = getSessionTimeRemaining(session);
  return timeRemaining < REFRESH_THRESHOLD && timeRemaining > 0;
}

export function refreshSession(session: AdminSession): AdminSession {
  const now = new Date();
  const newExpiresAt = new Date(now.getTime() + SESSION_DURATION);
  
  return {
    ...session,
    expires_at: newExpiresAt.toISOString(),
    last_refreshed: now.toISOString()
  };
}

export function getSessionTimeRemaining(session: AdminSession): number {
  const now = new Date();
  const expiresAt = new Date(session.expires_at);
  return Math.max(0, expiresAt.getTime() - now.getTime());
}

export function formatTimeRemaining(milliseconds: number): string {
  const days = Math.floor(milliseconds / (24 * 60 * 60 * 1000));
  const hours = Math.floor((milliseconds % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((milliseconds % (60 * 60 * 1000)) / (60 * 1000));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}