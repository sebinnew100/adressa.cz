import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://adressa.cz';
  const verifyUrl = `${baseUrl}/api/verify-email?token=${token}`;

  await resend.emails.send({
    from: 'adressa.cz <onboarding@resend.dev>',
    to: email,
    subject: 'Ověřte svůj e-mail / Verify your email – adressa.cz',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:8px;">Vítejte na adressa.cz</h2>
        <p style="color:#555;margin-bottom:24px;">
          Ahoj <strong>${name}</strong>, pro aktivaci vašeho profilu prosím ověřte svůj e-mail.
        </p>
        <a href="${verifyUrl}"
           style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;">
          Ověřit e-mail
        </a>
        <p style="color:#999;font-size:12px;margin-top:32px;">
          Pokud jste si nepodali profil, tento e-mail ignorujte.<br/>
          If you didn't register, please ignore this email.
        </p>
      </div>
    `,
  });

  return true;
}
