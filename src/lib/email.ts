import { Resend } from 'resend';

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// Shared branded wrapper so every email looks like it's actually from
// adressa.cz instead of a plain unstyled template — matches the site's real
// brand green (#1DBF73, see tailwind.config.ts) rather than the old orange
// that didn't match anything on the live site.
const BRAND_GREEN = '#1DBF73';
const BRAND_GREEN_DARK = '#14883f';

function emailShell(bodyHtml: string): string {
  return `
    <div style="background:#eef2f0;padding:24px 12px;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,${BRAND_GREEN},${BRAND_GREEN_DARK});border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">🏡 adressa<span style="color:#d7f9e6;">.cz</span></p>
          <p style="margin:6px 0 0;font-size:11px;color:#d7f9e6;letter-spacing:.1em;text-transform:uppercase;">Katalog místních služeb</p>
        </div>
        <div style="background:#ffffff;border-radius:0 0 16px 16px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
          ${bodyHtml}
        </div>
        <p style="text-align:center;color:#9aa0a6;font-size:11px;margin:16px 0 0;">adressa.cz · Česká republika</p>
      </div>
    </div>
  `;
}

function brandButton(url: string, label: string): string {
  return `
    <a href="${url}"
       style="display:inline-block;background:${BRAND_GREEN};color:#fff;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;font-size:15px;margin-top:12px;">
      ${label}
    </a>
  `;
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
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">📬 Nová poptávka schůzky</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;">Zákazník vás kontaktoval přes adressa.cz</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#555;width:140px;">Jméno zákazníka</td><td style="padding:8px 0;font-weight:600;color:#111;">${appt.customerName}</td></tr>
        ${appt.customerEmail ? `<tr><td style="padding:8px 0;color:#555;">E-mail</td><td style="padding:8px 0;"><a href="mailto:${appt.customerEmail}" style="color:${BRAND_GREEN_DARK};">${appt.customerEmail}</a></td></tr>` : ''}
        ${appt.customerPhone ? `<tr><td style="padding:8px 0;color:#555;">Telefon</td><td style="padding:8px 0;"><a href="tel:${appt.customerPhone}" style="color:${BRAND_GREEN_DARK};">${appt.customerPhone}</a></td></tr>` : ''}
        ${appt.customerAddress ? `<tr><td style="padding:8px 0;color:#555;">Adresa</td><td style="padding:8px 0;color:#111;">${appt.customerAddress}</td></tr>` : ''}
      </table>
      ${appt.message ? `<div style="margin-top:20px;padding:16px;background:#f3faf6;border-radius:8px;border-left:3px solid ${BRAND_GREEN};"><p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.05em;">Zpráva</p><p style="margin:0;color:#111;font-size:14px;line-height:1.6;">${appt.message}</p></div>` : ''}
      <p style="color:#999;font-size:12px;margin-top:32px;">Tato zpráva byla odeslána přes adressa.cz</p>
    `),
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
    published: { title: string; slug: string; cityNameCz?: string | null }[];
    totalPublished: number;
    target: number;
    reason?: string;
  },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adressa.cz';
  const dateStr = new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' });

  const warningBanner = result.reason && result.reason.startsWith('⚠️')
    ? `<p style="color:#92400e;background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin-bottom:16px;font-size:13px;">${result.reason}</p>`
    : '';

  const body = result.published.length > 0
    ? `
      ${warningBanner}
      <p style="color:#555;margin-bottom:16px;">Dnes v noci (${dateStr}) bylo automaticky publikováno ${result.published.length} ${result.published.length === 1 ? 'nový článek' : 'nové články'}:</p>
      <ul style="padding-left:20px;color:#111;">
        ${result.published.map(a => `<li style="margin-bottom:8px;"><a href="${baseUrl}/clanky/${a.slug}" style="color:${BRAND_GREEN_DARK};">${a.title}</a>${a.cityNameCz ? ` <span style="color:#999;">— ${a.cityNameCz}</span>` : ''}</li>`).join('')}
      </ul>
    `
    : `<p style="color:#555;margin-bottom:16px;">Dnes v noci se nepublikoval žádný nový článek. Důvod: ${result.reason || 'neznámý'}.</p>`;

  const isCatchUp = result.published.length > 0 && !!result.reason?.startsWith('⚠️');

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: isCatchUp
      ? `⚠️ Autopilot dohnal vynechaný běh – adressa.cz`
      : result.published.length > 0
      ? `✅ ${result.published.length} nové články publikovány – adressa.cz`
      : `⚠️ Autopilot dnes nic nepublikoval – adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">📰 Denní report autopilota článků</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;">automatické publikování</p>
      ${body}
      <p style="color:#111;font-size:14px;margin-top:24px;font-weight:600;">
        Celkem publikováno: ${result.totalPublished} / ${result.target}
      </p>
      <p style="color:#999;font-size:12px;margin-top:32px;">
        Tento e-mail byl odeslán automaticky po dokončení denního běhu autopilota.
      </p>
    `),
  });

  if (error) {
    console.error('sendAutopilotReportEmail failed:', to, error);
    return false;
  }
  return true;
}

export async function sendProviderImportReportEmail(
  to: string,
  result: {
    added: { fullName: string; serviceNameCz: string; cityNameCz: string }[];
    queries: string[];
    skippedDuplicates: number;
    skippedNoEmail?: number;
    reason?: string;
    listingNotified?: number;
  },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const dateStr = new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' });

  const body = result.added.length > 0
    ? `
      <p style="color:#555;margin-bottom:8px;">Dnes (${dateStr}) bylo automaticky přidáno ${result.added.length} nových poskytovatelů z vyhledávání „${result.queries.join('“, „')}“ — všichni s nalezeným e-mailem:</p>
      <ul style="padding-left:20px;color:#111;">
        ${result.added.map(p => `<li style="margin-bottom:6px;">${p.fullName} — ${p.serviceNameCz}, ${p.cityNameCz}</li>`).join('')}
      </ul>
      ${result.skippedDuplicates > 0 ? `<p style="color:#999;font-size:13px;">(${result.skippedDuplicates} nalezených firem už v katalogu existovalo, přeskočeno.)</p>` : ''}
      ${result.skippedNoEmail ? `<p style="color:#999;font-size:13px;">(${result.skippedNoEmail} nalezených firem nemělo dohledatelný e-mail, přeskočeno — nepřidávají se bez e-mailu.)</p>` : ''}
    `
    : `<p style="color:#555;margin-bottom:16px;">Dnes nebyl přidán žádný nový poskytovatel. Důvod: ${result.reason || 'neznámý'}.</p>`;

  const notifiedLine = `<p style="color:#555;margin-top:16px;">📧 Dnes byl odeslán informační e-mail o zapsání do katalogu ${result.listingNotified ?? 0} poskytovatelům.</p>`;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: result.added.length > 0
      ? `✅ ${result.added.length} nových poskytovatelů přidáno – adressa.cz`
      : `⚠️ Dnes nebyl přidán žádný poskytovatel – adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">🧑‍🔧 Denní report – přidávání poskytovatelů</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;">automatický import z Google Places</p>
      ${body}
      ${notifiedLine}
      <p style="color:#999;font-size:12px;margin-top:32px;">
        Tito poskytovatelé jsou reální (z Google Places) a jsou automaticky vyňati z prodejního oslovování, dokud si to sami nezažádají.
      </p>
    `),
  });

  if (error) {
    console.error('sendProviderImportReportEmail failed:', to, error);
    return false;
  }
  return true;
}

export async function sendNewsletterWelcomeEmail(
  to: string,
  unsubscribeToken: string,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adressa.cz';
  const unsubscribeUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: `Přihlášení k odběru novinek – adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 16px;">🎉 Děkujeme za přihlášení!</h2>
      <p style="color:#333;line-height:1.6;">
        Budeme vám občas posílat novinky a tipy z adressa.cz.
      </p>
      <p style="color:#777;line-height:1.6;font-size:13px;margin-top:24px;">
        Kdykoliv se můžete odhlásit — <a href="${unsubscribeUrl}" style="color:${BRAND_GREEN_DARK};">zrušit odběr</a>.
      </p>
    `),
  });

  if (error) {
    console.error('sendNewsletterWelcomeEmail failed:', to, error);
    return false;
  }
  return true;
}

export async function sendListingNotificationEmail(
  to: string,
  providerName: string,
  providerId: string,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adressa.cz';
  const profileUrl = `${baseUrl}/providers/${providerId}`;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: `Vytvořili jsme pro vás profil na adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 16px;">👋 Dobrý den,</h2>
      <p style="color:#333;line-height:1.6;">
        všimli jsme si, že <strong>${providerName}</strong> působí ve svém oboru, a vytvořili jsme pro vás bezplatný profil na katalogu adressa.cz:
      </p>
      <p style="margin:20px 0;">
        ${brandButton(profileUrl, 'Zobrazit váš profil')}
      </p>
      <p style="color:#333;line-height:1.6;">
        Pokud byste měli zájem získat přes adressa.cz více zákazníků, napište nám na
        <a href="mailto:customerserviceentfin@gmail.com" style="color:${BRAND_GREEN_DARK};">customerserviceentfin@gmail.com</a>.
      </p>
      <p style="color:#777;line-height:1.6;font-size:13px;margin-top:24px;">
        Pokud si nepřejete být v katalogu uvedeni, dejte nám prosím vědět na stejný e-mail a profil odstraníme.
      </p>
    `),
  });

  if (error) {
    console.error('sendListingNotificationEmail failed:', to, error);
    return false;
  }
  return true;
}

export async function sendProcurementImportReportEmail(
  to: string,
  result: {
    imported: number;
    scanned: number;
    fileName: string;
    reason?: string;
    importedTitles?: { title: string; cpvCode: string | null }[];
  },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const dateStr = new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' });

  const body = result.imported > 0
    ? `
      <p style="color:#555;margin-bottom:8px;">Dnes (${dateStr}) bylo automaticky přidáno ${result.imported} nových veřejných zakázek ze souboru ${result.fileName} (proskenováno ${result.scanned} záznamů):</p>
      <ul style="padding-left:20px;color:#111;">
        ${(result.importedTitles ?? []).map(t => `<li style="margin-bottom:6px;">${t.title}</li>`).join('')}
      </ul>
    `
    : `<p style="color:#555;margin-bottom:16px;">Dnes nebyla přidána žádná nová veřejná zakázka (proskenováno ${result.scanned} záznamů ze souboru ${result.fileName}). Důvod: ${result.reason || 'žádné relevantní zakázky nenalezeny'}.</p>`;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: result.imported > 0
      ? `✅ ${result.imported} nových veřejných zakázek – adressa.cz`
      : `⚠️ Dnes žádné nové veřejné zakázky – adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">📋 Měsíční report – veřejné zakázky</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;">automatický import z ISVZ Open Data</p>
      ${body}
      <p style="color:#999;font-size:12px;margin-top:32px;">
        Data pochází z oficiálních otevřených dat Registru veřejných zakázek (isvz.nipez.cz/opendata).
      </p>
    `),
  });

  if (error) {
    console.error('sendProcurementImportReportEmail failed:', to, error);
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
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 8px;">Vítejte na adressa.cz</h2>
      <p style="color:#555;margin-bottom:24px;">
        Ahoj <strong>${name}</strong>, pro aktivaci vašeho profilu prosím ověřte svůj e-mail.
      </p>
      ${brandButton(verifyUrl, 'Ověřit e-mail')}
      <p style="color:#999;font-size:12px;margin-top:32px;">
        Pokud jste si nepodali profil, tento e-mail ignorujte.<br/>
        If you didn't register, please ignore this email.
      </p>
    `),
  });

  if (error) {
    console.error('sendVerificationEmail failed:', email, error);
    return false;
  }
  return true;
}

export async function sendQrPaymentReminderEmail(
  providerEmail: string,
  providerName: string,
  opts: { dueToday: boolean; dueDate: Date; aktivovatUrl: string },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const dateStr = opts.dueDate.toLocaleDateString('cs-CZ', { dateStyle: 'long' });

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to: providerEmail,
    subject: opts.dueToday
      ? `Dnes je splatná vaše platba – adressa.cz`
      : `Připomínka platby za profil – adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">${opts.dueToday ? '⏰ Platba je splatná dnes' : '🔔 Blíží se splatnost platby'}</h2>
      <p style="color:#555;font-size:14px;line-height:1.6;">
        Ahoj ${providerName}, ${opts.dueToday
          ? `dnes (${dateStr}) je splatná platba za váš profil na adressa.cz.`
          : `${dateStr} je splatná platba za váš profil na adressa.cz.`}
        Naskenujte QR kód a zaplaťte bankovním převodem, aby váš profil zůstal viditelný.
      </p>
      ${brandButton(opts.aktivovatUrl, 'Zobrazit QR platbu')}
      <p style="color:#999;font-size:12px;margin-top:32px;">
        Pokud jste již zaplatili, na stejné stránce najdete tlačítko "Již jsem zaplatil/a".
      </p>
    `),
  });

  if (error) {
    console.error('sendQrPaymentReminderEmail failed:', providerEmail, error);
    return false;
  }
  return true;
}

export async function sendQrPaymentDeactivatedEmail(
  providerEmail: string,
  providerName: string,
  aktivovatUrl: string,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to: providerEmail,
    subject: `Váš profil byl skryt – adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">Váš profil byl dočasně skryt</h2>
      <p style="color:#555;font-size:14px;line-height:1.6;">
        Ahoj ${providerName}, platba za váš profil na adressa.cz nebyla přijata včas, proto byl profil skryt z veřejného seznamu.
        Zaplaťte prosím QR kódem níže a jakmile platbu potvrdíme, profil znovu zveřejníme.
      </p>
      ${brandButton(aktivovatUrl, 'Zobrazit QR platbu')}
    `),
  });

  if (error) {
    console.error('sendQrPaymentDeactivatedEmail failed:', providerEmail, error);
    return false;
  }
  return true;
}

export async function sendQrSelfReportedEmail(
  to: string,
  providerName: string,
  variableSymbol: number,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: `Poskytovatel hlásí zaplaceno (VS ${variableSymbol}) – adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">💬 Poskytovatel hlásí zaplacenou QR platbu</h2>
      <p style="color:#555;font-size:14px;line-height:1.6;">
        <strong>${providerName}</strong> označil/a, že zaplatil/a QR platbu. Zkontrolujte bankovní výpis
        podle variabilního symbolu <strong>${variableSymbol}</strong> a potvrďte platbu v administraci.
      </p>
    `),
  });

  if (error) {
    console.error('sendQrSelfReportedEmail failed:', to, error);
    return false;
  }
  return true;
}

export async function sendLifetimeAccessConfirmedEmail(
  providerEmail: string,
  providerName: string,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to: providerEmail,
    replyTo: 'customerserviceentfin@gmail.com',
    subject: `🎉 Gratulujeme, máte doživotní přístup – adressa.cz`,
    html: emailShell(`
      <div style="text-align:center;font-size:40px;margin-bottom:8px;">🎉</div>
      <h2 style="color:#111;margin:0 0 4px;text-align:center;">Gratulujeme, ${providerName}!</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;text-align:center;">katalog místních služeb</p>
      <div style="background:#f3faf6;border:1px solid #d7f9e6;border-radius:12px;padding:20px;margin-bottom:20px;text-align:center;">
        <p style="margin:0;color:${BRAND_GREEN_DARK};font-weight:700;font-size:16px;">✅ Platba přijata a potvrzena</p>
      </div>
      <p style="color:#333;font-size:14px;line-height:1.6;">
        Váš profil je nyní aktivní <strong>natrvalo</strong> — žádné další platby, žádné obnovování, žádné termíny.
      </p>
      <p style="color:#333;font-size:14px;line-height:1.6;">
        Zákazníci vás od teď mohou najít a kontaktovat přímo přes adressa.cz. Děkujeme za důvěru!
      </p>
    `),
  });

  if (error) {
    console.error('sendLifetimeAccessConfirmedEmail failed:', providerEmail, error);
    return false;
  }
  return true;
}

export async function sendQrPaymentConfirmedAdminEmail(
  to: string,
  providerName: string,
  variableSymbol: number,
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: `✅ Platba potvrzena — ${providerName} (VS ${variableSymbol})`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">💰 Platba potvrzena</h2>
      <p style="color:#555;font-size:14px;line-height:1.6;">
        Právě jste v administraci potvrdili doživotní platbu (1 344 Kč) od <strong>${providerName}</strong>
        (variabilní symbol ${variableSymbol}). Profil je nyní aktivní natrvalo.
      </p>
    `),
  });

  if (error) {
    console.error('sendQrPaymentConfirmedAdminEmail failed:', to, error);
    return false;
  }
  return true;
}

export async function sendQrReminderCronReportEmail(
  to: string,
  result: { reminded: number; dueToday: number; deactivated: number; reason?: string },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const dateStr = new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' });
  const hasActivity = result.reminded > 0 || result.dueToday > 0 || result.deactivated > 0;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: hasActivity
      ? `QR platby: ${result.reminded} připomínek, ${result.deactivated} skrytí – adressa.cz`
      : `QR platby: bez akce dnes – adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">🏦 Denní report – QR platby profilů</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;">${dateStr}</p>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr><td style="padding:8px 0;color:#555;">Připomínky (−3 dny)</td><td style="padding:8px 0;text-align:right;color:#111;">${result.reminded}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">Splatné dnes</td><td style="padding:8px 0;text-align:right;color:#111;">${result.dueToday}</td></tr>
        <tr><td style="padding:8px 0;color:#555;">Skryto (neplaceno)</td><td style="padding:8px 0;text-align:right;color:#111;">${result.deactivated}</td></tr>
      </table>
      ${result.reason ? `<p style="color:#c0392b;font-size:13px;margin-top:16px;">Chyba: ${result.reason}</p>` : ''}
    `),
  });

  if (error) {
    console.error('sendQrReminderCronReportEmail failed:', to, error);
    return false;
  }
  return true;
}
