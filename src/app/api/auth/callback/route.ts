// app/api/auth/callback/route.ts
import { createClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const inviteId = requestUrl.searchParams.get('invite_id');

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Update user status and login time in Prisma
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            status: 'active',
            last_login: new Date(),
          },
        });

        // If there's an invite ID, mark it as accepted
        if (inviteId) {
          await prisma.userInvite.update({
            where: { id: inviteId },
            data: {
              status: 'accepted',
              accepted_at: new Date(),
            },
          });
        }
      } catch (dbError) {
        console.error('Database update error:', dbError);
        // Continue with redirect even if DB update fails
      }

      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // If there's an error, redirect to login
  return NextResponse.redirect(new URL('/login', requestUrl.origin));
}