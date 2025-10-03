// admin-app/app/api/admin/invites/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminInviteService } from '@/services/admin-invite.service';
import { getAuthenticatedAdmin } from '../../auth-helper';
import { AdminRateLimiters } from '@/lib/adminRateLimiters';

export async function POST(request: NextRequest) {
  try {
    const { user, admin, error } = await getAuthenticatedAdmin(request);
    
    if (error || !user || !admin) {
      return NextResponse.json(
        { error: 'Admin authentication required', code: 'ADMIN_AUTH_REQUIRED' }, 
        { status: 401 }
      );
    }
    
    // Use admin-specific rate limiter
    const rateLimitResult = await AdminRateLimiters.sendInvite(user.id);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many invite requests. You can send 50 invites per hour.',
          retryAfter: rateLimitResult.reset,
          remaining: rateLimitResult.remaining,
        },
        { status: 429 }
      );
    }
    
    const body = await request.json();
    const { email } = body;
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' }, 
        { status: 400 }
      );
    }
    
    const result = await adminInviteService.sendInvite({
      email,
      invitedBy: user.email || 'admin',
    });
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Send invite error:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}