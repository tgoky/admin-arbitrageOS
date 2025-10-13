// admin-app/app/api/admin/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AdminSession, isSessionExpired, refreshSession, shouldRefreshSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('admin_session');
    
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: 'No session found' },
        { status: 401 }
      );
    }

    let session: AdminSession;
    try {
      session = JSON.parse(decodeURIComponent(sessionCookie.value));
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Invalid session format' },
        { status: 401 }
      );
    }

    // Don't refresh if already expired
    if (isSessionExpired(session)) {
      return NextResponse.json(
        { success: false, error: 'Session expired' },
        { status: 401 }
      );
    }

    // Check if refresh is needed
    if (!shouldRefreshSession(session)) {
      return NextResponse.json({
        success: true,
        refreshed: false,
        message: 'Session still valid, no refresh needed'
      });
    }

    // Verify user still exists and is admin in Prisma
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { id: session.id }
    });

    if (!adminProfile) {
      return NextResponse.json(
        { success: false, error: 'User validation failed' },
        { status: 401 }
      );
    }

    // Refresh the session
    const newSession = refreshSession(session);
    console.log('✅ Session refreshed for:', session.email);
    
    const response = NextResponse.json({
      success: true,
      refreshed: true,
      session: newSession,
      message: 'Session refreshed successfully'
    });

    // Update cookie
    const cookieExpires = new Date(newSession.expires_at);
    response.cookies.set('admin_session', JSON.stringify(newSession), {
      path: '/',
      expires: cookieExpires,
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;

  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { success: false, error: 'Refresh failed' },
      { status: 500 }
    );
  }
}