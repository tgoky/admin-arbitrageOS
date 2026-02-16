// lib/email-templates.ts
// Branded HTML + plain-text email templates for auth flows.

interface MagicLinkEmailProps {
  magicLink: string;
  email: string;
}

interface InviteEmailProps {
  magicLink: string;
  email: string;
  inviteId: string;
}

export function magicLinkEmailHtml({ magicLink, email }: MagicLinkEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in to ArbitrageOS</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0b1a17;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1a17;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / Title -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">arbitrageOS</span>
              <span style="font-size:14px;color:#6b7280;display:block;margin-top:4px;font-family:'Manrope',sans-serif;">by GrowAI</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0f2e2c;border:1px solid rgba(92,196,157,0.2);border-radius:16px;padding:40px 36px;">

              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#ffffff;font-family:'Manrope',sans-serif;">
                Sign in to your account
              </h1>
              <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;line-height:1.6;font-family:'Manrope',sans-serif;">
                Click the button below to sign in to ArbitrageOS. This link is valid for <strong style="color:#d1fae5;font-weight:600;">1 hour</strong> and can only be used once.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${magicLink}"
                       style="display:inline-block;background:#5CC49D;color:#000000;font-size:15px;font-weight:600;
                              text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;font-family:'Manrope',sans-serif;">
                      Sign in to ArbitrageOS
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.08);font-size:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;font-family:'Manrope',sans-serif;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="margin:0;font-size:11px;color:#5CC49D;word-break:break-all;line-height:1.5;font-family:'Manrope',sans-serif;">
                ${magicLink}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;font-family:'Manrope',sans-serif;">
                If you didn't request this email, you can safely ignore it.<br/>
                This link was sent to <span style="color:#6b7280;">${email}</span>
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#374151;font-family:'Manrope',sans-serif;">
                &copy; ${new Date().getFullYear()} ArbitrageOS &middot; <a href="mailto:team@growaiagency.io" style="color:#5CC49D;text-decoration:none;">team@growaiagency.io</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function inviteEmailHtml({ magicLink, email }: InviteEmailProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>You're invited to ArbitrageOS</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#0b1a17;font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0b1a17;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Logo / Title -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <span style="font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">arbitrageOS</span>
              <span style="font-size:14px;color:#6b7280;display:block;margin-top:4px;font-family:'Manrope',sans-serif;">by GrowAI</span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#0f2e2c;border:1px solid rgba(92,196,157,0.2);border-radius:16px;padding:40px 36px;">

              <!-- Badge -->
              <table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="background:rgba(92,196,157,0.1);border:1px solid rgba(92,196,157,0.3);
                              border-radius:20px;padding:5px 14px;">
                    <span style="font-size:12px;font-weight:600;color:#5CC49D;letter-spacing:0.5px;font-family:'Manrope',sans-serif;">
                      YOU'VE BEEN INVITED
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;color:#ffffff;font-family:'Manrope',sans-serif;">
                Welcome to ArbitrageOS
              </h1>
              <p style="margin:0 0 28px;font-size:14px;color:#9ca3af;line-height:1.6;font-family:'Manrope',sans-serif;">
                You've been granted access to ArbitrageOS — ArbitrageOS combines cutting-edge AI tools with workflow automation to identify and capitalize on market opportunities faster than ever before.
                <br/><br/>
                Click below to activate your account. This invitation expires in <strong style="color:#d1fae5;font-weight:600;">7 days</strong>.
              </p>

              <!-- Features preview -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background:rgba(255,255,255,0.04);border-radius:10px;padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#5CC49D;letter-spacing:0.5px;font-family:'Manrope',sans-serif;">WHAT YOU GET ACCESS TO</p>
                    <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.8;font-family:'Manrope',sans-serif;">
                      &#10022; Workspaces &amp; team management<br/>
                      &#10022; Next gen  automation tools<br/>
                      &#10022; Real-time deliverables &amp; submissions<br/>
                      &#10022; Activity heatmaps &amp; milestones
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:28px;">
                    <a href="${magicLink}"
                       style="display:inline-block;background:#5CC49D;color:#000000;font-size:15px;font-weight:600;
                              text-decoration:none;padding:14px 36px;border-radius:10px;letter-spacing:0.2px;font-family:'Manrope',sans-serif;">
                      Accept Invitation &amp; Sign In
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="border-top:1px solid rgba(255,255,255,0.08);font-size:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:0 0 8px;font-size:12px;color:#6b7280;font-family:'Manrope',sans-serif;">
                Or copy and paste this URL into your browser:
              </p>
              <p style="margin:0;font-size:11px;color:#5CC49D;word-break:break-all;line-height:1.5;font-family:'Manrope',sans-serif;">
                ${magicLink}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0;font-size:12px;color:#4b5563;line-height:1.6;font-family:'Manrope',sans-serif;">
                This invitation was sent to <span style="color:#6b7280;">${email}</span><br/>
                If you didn't expect this, you can safely ignore it.
              </p>
              <p style="margin:12px 0 0;font-size:11px;color:#374151;font-family:'Manrope',sans-serif;">
                &copy; ${new Date().getFullYear()} ArbitrageOS &middot; <a href="mailto:team@growaiagency.io" style="color:#5CC49D;text-decoration:none;">team@growaiagency.io</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function magicLinkEmailText({ magicLink, email }: MagicLinkEmailProps): string {
  return `Sign in to ArbitrageOS

Click the link below to sign in. This link expires in 1 hour and can only be used once.

${magicLink}

If you didn't request this, you can safely ignore this email.
This link was sent to ${email}

ArbitrageOS - team@growaiagency.io
  `.trim();
}

export function inviteEmailText({ magicLink, email }: InviteEmailProps): string {
  return `You've been invited to ArbitrageOS

You've been granted access to ArbitrageOS - The Next Generation Business Intelligence Platform.

Click the link below to accept your invitation and sign in. This invitation expires in 7 days.

${magicLink}

If you didn't expect this invitation, you can safely ignore this email.
This was sent to ${email}

ArbitrageOS - team@growaiagency.io
  `.trim();
}