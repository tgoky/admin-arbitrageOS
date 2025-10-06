// admin-app/app/api/admin/auth-helper.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function getAuthenticatedAdmin(request: NextRequest) {
  try {
    // Read admin session from cookie (set by browser)
    const cookieHeader = request.headers.get('cookie') || '';
    const adminSessionMatch = cookieHeader.match(/admin_session=([^;]+)/);
    
    if (!adminSessionMatch) {
      return { 
        user: null, 
        admin: null, 
        error: 'No admin session found' 
      };
    }

    const sessionValue = decodeURIComponent(adminSessionMatch[1]);
    const session = JSON.parse(sessionValue);

    // Verify admin exists in database
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { id: session.id }
    });

    if (!adminProfile) {
      return { 
        user: null, 
        admin: null, 
        error: 'Admin profile not found' 
      };
    }

    return {
      user: {
        id: session.id,
        email: session.email,
      },
      admin: {
        id: adminProfile.id,
        role: adminProfile.role,
      },
      error: null
    };
  } catch (error: any) {
    console.error('Auth helper error:', error);
    return { 
      user: null, 
      admin: null, 
      error: error.message 
    };
  }
}