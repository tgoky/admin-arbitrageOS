// admin-app/app/api/admin/statistics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminInviteService } from '@/services/admin-invite.service';
import { getAuthenticatedAdmin } from '../auth-helper';

export async function GET(request: NextRequest) {
  try {
    const { user, admin, error } = await getAuthenticatedAdmin(request);
    
    if (error || !user || !admin) {
      return NextResponse.json(
        { error: 'Admin authentication required', code: 'ADMIN_AUTH_REQUIRED' }, 
        { status: 401 }
      );
    }
    
    const result = await adminInviteService.getStatistics();
    return NextResponse.json(result);
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500 }
    );
  }
}