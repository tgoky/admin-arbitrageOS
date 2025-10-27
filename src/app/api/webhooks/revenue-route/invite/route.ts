// admin-app/app/api/webhooks/revenue-route/invite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { adminInviteService } from '@/services/admin-invite.service';
import { headers } from 'next/headers';

// Webhook secret for security - set this in your .env
const WEBHOOK_SECRET = process.env.REVENUE_ROUTE_WEBHOOK_SECRET;

/**
 * POST endpoint that RevenueRoute calls when a user gets the "Contract Funded" tag
 * 
 * Expected payload from RevenueRoute:
 * {
 *   "email": "user@example.com",
 *   "name": "John Doe",
 *   "tag": "Contract Funded DFY", // or "Contract Funded DIY", etc.
 *   "timestamp": "2025-10-23T10:30:00Z"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook signature for security
    const headersList = await headers();
    const signature = headersList.get('x-webhook-signature');
    
    if (WEBHOOK_SECRET && signature !== WEBHOOK_SECRET) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse the webhook payload
    const body = await request.json();
    const { email, name, tag } = body;

    // 3. Validate required fields
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // 4. Log the webhook event
    console.log('📨 RevenueRoute webhook received:', {
      email,
      name,
      tag,
      timestamp: new Date().toISOString(),
    });

    // 5. Send the invite
    const result = await adminInviteService.sendInvite({
      email: email.trim().toLowerCase(),
      invitedBy: 'Grow AI', // Track that this came from automation
    });

    // 6. Handle success/failure
    if (result.success) {
      console.log('✅ Invite sent successfully via webhook:', email);
      return NextResponse.json({
        success: true,
        message: `Invite sent to ${email}`,
        inviteId: result.inviteId,
      });
    } else {
      console.error('❌ Failed to send invite:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to verify webhook is working
export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: 'RevenueRoute Invite Webhook',
    version: '1.0',
  });
}