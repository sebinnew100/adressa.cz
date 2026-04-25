import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function sendAppointmentEmail(
  providerEmail: string,
  providerName: string,
  appt: {
    customerName: string;
    customerEmail?: string | null;
    customerPhone?: string | null;
    customerAddress?: string | null;
    message?: string | null;
  },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  await resend.emails.send({
    from: 'adressa.cz <onboarding@resend.dev>',
    to: providerEmail,
    subject: `Nová poptávka od ${appt.customerName} – adressa.cz`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">Nová poptávka schůzky</h2>
        <p style="color:#777;font-size:13px;margin-bottom:24px;">Zákazník vás kontaktoval přes adressa.cz</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:8px 0;color:#555;width:140px;">Jméno zákazníka</td><td style="padding:8px 0;font-weight:600;color:#111;">${appt.customerName}</td></tr>
          ${appt.customerEmail ? `<tr><td style="padding:8px 0;color:#555;">E-mail</td><td style="padding:8px 0;"><a href="mailto:${appt.customerEmail}" style="color:#f97316;">${appt.customerEmail}</a></td></tr>` : ''}
          ${appt.customerPhone ? `<tr><td style="padding:8px 0;color:#555;">Telefon</td><td style="padding:8px 0;"><a href="tel:${appt.customerPhone}" style="color:#f97316;">${appt.customerPhone}</a></td></tr>` : ''}
          ${appt.customerAddress ? `<tr><td style="padding:8px 0;color:#555;">Adresa</td><td style="padding:8px 0;color:#111;">${appt.customerAddress}</td></tr>` : ''}
        </table>
        ${appt.message ? `<div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:8px;"><p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.05em;">Zpráva</p><p style="margin:0;color:#111;font-size:14px;line-height:1.6;">${appt.message}</p></div>` : ''}
        <p style="color:#999;font-size:12px;margin-top:32px;">Tato zpráva byla odeslána přes adressa.cz</p>
      </div>
    `,
  });

  return true;
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
