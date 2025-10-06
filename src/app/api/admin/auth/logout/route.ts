// admin-app/app/api/admin/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  
  return NextResponse.json({ success: true });
}