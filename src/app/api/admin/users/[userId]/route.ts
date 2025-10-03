// admin-app/app/api/admin/users/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminInviteService } from '@/services/admin-invite.service';
import { getAuthenticatedAdmin } from '../../auth-helper';
import { AdminRateLimiters } from '@/lib/adminRateLimiters';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { user, admin, error } = await getAuthenticatedAdmin(request);
    
    if (error || !user || !admin) {
      return NextResponse.json(
        { error: 'Admin authentication required' }, 
        { status: 401 }
      );
    }

    // Rate limit
    const rateLimitResult = await AdminRateLimiters.userAction(user.id);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many actions. Limit: 30 per hour.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { action } = body; // 'suspend' or 'activate'

    let result;
    if (action === 'suspend') {
      result = await adminInviteService.suspendUser(params.userId);
    } else if (action === 'activate') {
      result = await adminInviteService.activateUser(params.userId);
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}