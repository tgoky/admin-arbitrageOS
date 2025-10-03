// admin-app/lib/adminRateLimiters.ts
import { rateLimit } from './rateLimit';

export const AdminRateLimiters = {
  // Admin invite sending - 50 per hour per admin
  sendInvite: (adminId: string) => 
    rateLimit(`admin_invite:${adminId}`, 50, 3600),
  
  // User suspend/activate - 30 per hour
  userAction: (adminId: string) => 
    rateLimit(`admin_user_action:${adminId}`, 30, 3600),
  
  // Bulk operations - 5 per hour
  bulkOperation: (adminId: string) => 
    rateLimit(`admin_bulk:${adminId}`, 5, 3600),
  
  // API calls - 200 per hour (higher than normal users)
  api: (adminId: string) => 
    rateLimit(`admin_api:${adminId}`, 200, 3600),
};