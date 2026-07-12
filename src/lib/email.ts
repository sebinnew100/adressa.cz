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

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
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

  if (error) {
    console.error('sendAppointmentEmail failed:', providerEmail, error);
    return false;
  }
  return true;
}

export async function sendAutopilotReportEmail(
  to: string,
  result: {
    published: { title: string; slug: string }[];
    totalPublished: number;
    target: number;
    reason?: string;
  },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adressa.cz';
  const dateStr = new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' });

  const body = result.published.length > 0
    ? `
      <p style="color:#555;margin-bottom:16px;">Dnes v noci (${dateStr}) bylo automaticky publikováno ${result.published.length} ${result.published.length === 1 ? 'nový článek' : 'nové články'}:</p>
      <ul style="padding-left:20px;color:#111;">
        ${result.published.map(a => `<li style="margin-bottom:8px;"><a href="${baseUrl}/clanky/${a.slug}" style="color:#f97316;">${a.title}</a></li>`).join('')}
      </ul>
    `
    : `<p style="color:#555;margin-bottom:16px;">Dnes v noci se nepublikoval žádný nový článek. Důvod: ${result.reason || 'neznámý'}.</p>`;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: result.published.length > 0
      ? `✅ ${result.published.length} nové články publikovány – adressa.cz`
      : `⚠️ Autopilot dnes nic nepublikoval – adressa.cz`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">Denní report autopilota článků</h2>
        <p style="color:#777;font-size:13px;margin-bottom:24px;">adressa.cz — automatické publikování</p>
        ${body}
        <p style="color:#111;font-size:14px;margin-top:24px;font-weight:600;">
          Celkem publikováno: ${result.totalPublished} / ${result.target}
        </p>
        <p style="color:#999;font-size:12px;margin-top:32px;">
          Tento e-mail byl odeslán automaticky po dokončení denního běhu autopilota.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('sendAutopilotReportEmail failed:', to, error);
    return false;
  }
  return true;
}

export async function sendProviderSalesPitchEmail(
  provider: { id: string; fullName: string; email: string },
  opts: { isReminder: boolean; deadline: Date },
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, error: 'RESEND_API_KEY not configured' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adressa.cz';
  const activateUrl = `${baseUrl}/aktivovat/${provider.id}`;
  const deadlineStr = opts.deadline.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
  const daysLeft = Math.max(0, Math.ceil((opts.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const subject = opts.isReminder
    ? `Zbývá ${daysLeft} ${daysLeft === 1 ? 'den' : daysLeft < 5 ? 'dny' : 'dní'} — profil ${provider.fullName} bude odstraněn z adressa.cz`
    : `${provider.fullName}, váš profil je na adressa.cz živě — potvrďte si ho do ${deadlineStr}`;

  const intro = opts.isReminder
    ? `Připomínáme, že profil <strong>${provider.fullName}</strong> je na adressa.cz stále bez potvrzeného předplatného. Pokud předplatné nezaložíte do <strong>${deadlineStr}</strong>, profil bude z webu odstraněn.`
    : `Váš profil <strong>${provider.fullName}</strong> jsme na adressa.cz vytvořili a je nyní veřejně vidět — zákazníci si ho mohou najít a kontaktovat vás. Aby zůstal na webu i nadále, je potřeba do <strong>${deadlineStr}</strong> (7 dní) potvrdit předplatné.`;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to: provider.email,
    subject,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">${opts.isReminder ? 'Váš profil bude brzy odstraněn' : 'Váš profil je na adressa.cz živě'}</h2>
        <p style="color:#777;font-size:13px;margin-bottom:24px;">adressa.cz — katalog místních služeb</p>
        <p style="color:#333;font-size:14px;line-height:1.6;">${intro}</p>
        <p style="color:#333;font-size:14px;line-height:1.6;">Potvrzení předplatného zabere méně než minutu:</p>
        <ul style="color:#333;font-size:14px;line-height:1.9;padding-left:20px;">
          <li>15 Kč aktivační poplatek (jednorázově)</li>
          <li>7 dní zdarma na vyzkoušení</li>
          <li>poté 299 Kč každých 28 dní, kdykoliv zrušitelné</li>
        </ul>
        <a href="${activateUrl}"
           style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;margin-top:12px;">
          Potvrdit předplatné a ponechat profil
        </a>
        <p style="color:#999;font-size:12px;margin-top:32px;">
          Pokud si profil na adressa.cz nepřejete, nemusíte nic dělat — bude po ${deadlineStr} automaticky odebrán.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('sendProviderSalesPitchEmail failed:', provider.email, error);
    return { ok: false, error: error.message ?? JSON.stringify(error) };
  }
  return { ok: true };
}

export async function sendSalesAutopilotReportEmail(
  to: string,
  result: {
    scheduled: { fullName: string; email: string }[];
    pitched: { fullName: string; email: string }[];
    reminded: { fullName: string; email: string }[];
    removed: { fullName: string; email: string | null }[];
    remainingLeads: number;
  },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const dateStr = new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' });

  const section = (title: string, rows: { fullName: string; email: string | null }[]) =>
    rows.length === 0 ? '' : `
      <p style="color:#111;font-weight:600;margin:20px 0 6px;">${title} (${rows.length})</p>
      <ul style="padding-left:20px;color:#555;font-size:13px;line-height:1.7;">
        ${rows.map(r => `<li>${r.fullName}${r.email ? ` — ${r.email}` : ''}</li>`).join('')}
      </ul>
    `;

  const totalActions = result.scheduled.length + result.pitched.length + result.reminded.length + result.removed.length;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: `Sales autopilot: ${result.pitched.length + result.scheduled.length} osloveno, ${result.removed.length} odebráno – adressa.cz`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">Denní report sales autopilota</h2>
        <p style="color:#777;font-size:13px;margin-bottom:8px;">adressa.cz — ${dateStr}</p>
        <p style="color:#111;font-size:14px;">Zbývá oslovit: <strong>${result.remainingLeads}</strong> profilů</p>
        ${section('📅 Naplánováno strategicky', result.scheduled)}
        ${section('Nově osloveno (pitch)', result.pitched)}
        ${section('Poslána připomínka', result.reminded)}
        ${section('⚠️ Odstraněno (termín vypršel)', result.removed)}
        ${totalActions === 0
          ? '<p style="color:#555;font-size:14px;margin-top:16px;">Dnes nebyla žádná akce potřeba.</p>' : ''}
        <p style="color:#999;font-size:12px;margin-top:32px;">
          Tento e-mail byl odeslán automaticky po dokončení denního běhu sales autopilota.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('sendSalesAutopilotReportEmail failed:', to, error);
    return false;
  }
  return true;
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adressa.cz';
  const verifyUrl = `${baseUrl}/api/verify-email?token=${token}`;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
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

  if (error) {
    console.error('sendVerificationEmail failed:', email, error);
    return false;
  }
  return true;
}
