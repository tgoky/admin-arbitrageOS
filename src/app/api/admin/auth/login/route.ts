// admin-app/app/api/admin/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/session';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  console.log('🔐 Admin login attempt');
  
  try {
    const { email } = await req.json();
    console.log('📧 Email:', email);

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Supabase error:', error);
      return NextResponse.json({ error: 'Auth error' }, { status: 500 });
    }

    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase().trim());
    
    if (!user) {
      console.log('❌ User not found in Supabase');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ Found user:', user.id);

    const adminProfile = await prisma.adminProfile.findUnique({
      where: { id: user.id }
    });

    if (!adminProfile) {
      console.log('❌ User not in admin_profiles table');
      return NextResponse.json({ error: 'Not authorized as admin' }, { status: 403 });
    }

    console.log('✅ Admin profile found, role:', adminProfile.role);

    // ✨ NEW: Create session with expiration tracking
    const session = createSession(user.id, user.email!, adminProfile.role);
    console.log('✅ Session created, expires:', session.expires_at);

    // ✨ NEW: Prepare response with session
    const response = NextResponse.json({ 
      success: true,
      session: session  // This now includes expires_at, created_at, etc.
    });

    // ✨ NEW: Set cookie with proper expiration
    const cookieExpires = new Date(session.expires_at);
    response.cookies.set('admin_session', JSON.stringify(session), {
      path: '/',
      expires: cookieExpires,
      httpOnly: false,  // Needs to be readable by client
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;

  } catch (error: any) {
    console.error('💥 Admin login error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}