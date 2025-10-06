// admin-app/app/api/admin/invites/[inviteId]/resend/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminInviteService } from '@/services/admin-invite.service';
import { getAuthenticatedAdmin } from '../../../auth-helper';
import { AdminRateLimiters } from '@/lib/adminRateLimiters';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ inviteId: string }> }
) {
  try {
    const { user, admin, error } = await getAuthenticatedAdmin(request);
    
    if (error || !user || !admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' }, 
        { status: 401 }
      );
    }

    // Await params
    const { inviteId } = await params;

    // Rate limit
    const rateLimitResult = await AdminRateLimiters.sendInvite(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many invites. Limit: 50 per hour.' },
        { status: 429 }
      );
    }

    const result = await adminInviteService.resendInvite(inviteId);
    return NextResponse.json(result);
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}