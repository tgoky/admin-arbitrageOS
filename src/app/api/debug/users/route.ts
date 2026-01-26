// app/api/debug/users/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();
    
    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Return all users for debugging
    const usersInfo = data.users?.map(u => ({
      id: u.id,
      email: u.email,
      confirmed_at: u.email_confirmed_at,
      created_at: u.created_at
    }));

    return NextResponse.json({ users: usersInfo, count: usersInfo?.length || 0 });
  } catch (error: any) {
    console.error('Debug users error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}