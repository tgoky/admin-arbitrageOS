// admin-app/app/api/admin/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminInviteService } from '@/services/admin-invite.service';
import { getAuthenticatedAdmin } from '../auth-helper';

export async function GET(request: NextRequest) {
  try {
    const { user, admin, error } = await getAuthenticatedAdmin(request);
    
    if (error || !user || !admin) {
      console.error('Admin auth failed:', error);
      
      const response = NextResponse.json(
        { 
          error: 'Admin authentication required',
          code: 'ADMIN_AUTH_REQUIRED'
        }, 
        { status: 401 }
      );
      
      // Clear potentially corrupted cookies
      ['sb-access-token', 'sb-refresh-token', 'supabase-auth-token'].forEach(name => {
        response.cookies.set(name, '', { expires: new Date(0), path: '/' });
      });
      
      return response;
    }
    
    console.log('Admin authenticated:', user.id);
    
    const result = await adminInviteService.getUsers();
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch users' 
      }, 
      { status: 500 }
    );
  }
}