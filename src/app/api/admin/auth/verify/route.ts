// admin-app/app/api/admin/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  console.log('🔍 Verify endpoint hit');
  
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    console.log('📦 Cookie header:', cookieHeader);
    
    const adminSessionMatch = cookieHeader.match(/admin_session=([^;]+)/);
    
    if (!adminSessionMatch) {
      console.log('❌ No session cookie found in headers');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const sessionValue = decodeURIComponent(adminSessionMatch[1]);
    console.log('🍪 Session value:', sessionValue);
    
    const session = JSON.parse(sessionValue);
    console.log('✅ Session data:', session);

    return NextResponse.json({
      success: true,
      user: session
    });
  } catch (error) {
    console.error('❌ Verify error:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }
}