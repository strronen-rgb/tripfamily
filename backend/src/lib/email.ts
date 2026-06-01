import nodemailer from 'nodemailer';

// Reusable transporter — configured from env vars
// Supports: SMTP ( Gmail, SendGrid, Mailgun, etc. ) or Ethereal for dev
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    // Real SMTP (Gmail, SendGrid, Mailgun, etc.)
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Dev fallback — Ethereal (fake SMTP, prints email to console transporter)
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'dev@tripfamily.app',
        pass: 'dev-password',
      },
    });
  }

  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    const tp = getTransporter();
    const from = process.env.SMTP_FROM || 'TripFamily <noreply@tripfamily.app>';

    const info = await tp.sendMail({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[EMAIL] Sent to ${to}: ${info.messageId}`);
      // Log Ethereal preview URL in dev
      const previewUrl = (nodemailer as any).getTestMessageUrl?.(info);
      if (previewUrl) console.log(`[EMAIL] Preview: ${previewUrl}`);
    }

    return true;
  } catch (err) {
    console.error('[EMAIL] Send failed:', err);
    return false;
  }
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
): Promise<boolean> {
  const subject = '✈️ TripFamily — אמת את האימייל שלך';
  const html = `
    <div dir="rtl" style="font-family:Inter,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px;background:#0F0F23;border-radius:16px;border:1px solid rgba(255,255,255,0.08)">
      <div style="text-align:center;margin-bottom:24px">
        <span style="font-size:48px">✈️</span>
        <h1 style="font-size:24px;font-weight:700;background:linear-gradient(to left,#6C63FF,#FF6B6B);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:8px 0">TripFamily</h1>
      </div>
      <p style="color:#E8E8F0;font-size:16px">שלום <strong>${escapeHtml(name)}</strong>,</p>
      <p style="color:#94A3B8;font-size:14px;line-height:1.6">תודה שנרשמת ל-TripFamily! כדי להשלים את ההרשמה, אנא אמת את כתובת האימייל שלך בלחיצה על הכפתור הבא:</p>
      <div style="text-align:center;margin:24px 0">
        <a href="${escapeHtml(verifyUrl)}" style="display:inline-block;padding:14px 32px;background:#6C63FF;color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">אמת אימייל ✓</a>
      </div>
      <p style="color:#94A3B8;font-size:12px;line-height:1.6">אם הכפתור לא עובד, הדבק את הקישור הבא בדפדפן:<br/><a href="${escapeHtml(verifyUrl)}" style="color:#6C63FF;word-break:break-all">${escapeHtml(verifyUrl)}</a></p>
      <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0"/>
      <p style="color:#64748B;font-size:12px;text-align:center">הקישור תקף שעה אחת. אם לא ביקשת להירשם, התעלם מהודעה זו.</p>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

// Prevent XSS in email content
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
