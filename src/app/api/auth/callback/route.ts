// admin-app/app/api/auth/callback/route.ts
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  console.log('🔗 Admin auth callback triggered');
  
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const error = searchParams.get('error');

  console.log('Callback params:', { code: !!code, next, error });

  if (error) {
    console.error('❌ Auth callback error:', error);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, origin));
  }

  if (code) {
    try {
      console.log('🔄 Exchanging code for session...');
      const supabase = await createSupabaseServerClient();
      
      const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
      
      if (exchangeError) {
        console.error('❌ Code exchange error:', exchangeError);
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, origin));
      }

      if (!session) {
        console.error('❌ No session created');
        return NextResponse.redirect(new URL('/login?error=Failed to create session', origin));
      }

      console.log('✅ Admin session created for:', session.user.email);

      // Verify this user is actually an admin
      try {
        const adminProfile = await prisma.adminProfile.findUnique({
          where: { id: session.user.id }
        });

        if (!adminProfile) {
          console.error('❌ User is not an admin');
          await supabase.auth.signOut();
          return NextResponse.redirect(new URL('/login?error=Not authorized as admin', origin));
        }

        console.log('✅ Admin verified, role:', adminProfile.role);
      } catch (dbError) {
        console.error('❌ Admin verification error:', dbError);
        return NextResponse.redirect(new URL('/login?error=Failed to verify admin status', origin));
      }

      console.log('🚀 Redirecting to:', next);
      return NextResponse.redirect(new URL(next, origin));
      
    } catch (error: any) {
      console.error('❌ Auth confirmation error:', error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, origin));
    }
  }

  console.error('❌ No authentication code provided');
  return NextResponse.redirect(new URL('/login?error=Missing authentication code', origin));
}