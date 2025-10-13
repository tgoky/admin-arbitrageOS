// admin-app/app/api/admin/auth/validate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSessionExpired, type AdminSession } from '@/lib/session';

export async function GET(req: NextRequest) {
  try {
    // Get session from cookie
    const sessionCookie = req.cookies.get('admin_session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      );
    }

    // Parse session data
    let session: AdminSession;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid session format' },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (isSessionExpired(session)) {
      console.log('Session expired for user:', session.email);
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    // Validate user still exists and is admin in Prisma
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { id: session.id }
    });

    if (!adminProfile) {
      console.log('User validation failed - not in admin_profiles');
      return NextResponse.json(
        { success: false, error: 'Session invalid or user not admin' },
        { status: 401 }
      );
    }

    // Session is valid
    return NextResponse.json({
      success: true,
      user: {
        id: adminProfile.id,
        email: session.email,
        role: adminProfile.role
      },
      expires_at: session.expires_at
    });

  } catch (error) {
    console.error('Session validation error:', error);
    return NextResponse.json(
      { success: false, error: 'Validation failed' },
      { status: 500 }
    );
  }
}