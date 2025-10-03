// admin-app/app/api/admin/verify/route.ts
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    // Check admin_profiles table via Prisma
    const adminProfile = await prisma.adminProfile.findUnique({
      where: { id: user.id },
    });

    return NextResponse.json({ 
      isAdmin: !!adminProfile,
      user: adminProfile ? {
        id: user.id,
        email: user.email,
        role: adminProfile.role,
      } : null
    });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}