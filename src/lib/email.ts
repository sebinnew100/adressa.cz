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
    reason?: string;
    listingNotified?: number;
  },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const dateStr = new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' });

  const body = result.added.length > 0
    ? `
      <p style="color:#555;margin-bottom:8px;">Dnes (${dateStr}) bylo automaticky přidáno ${result.added.length} nových poskytovatelů z vyhledávání „${result.queries.join('“, „')}“:</p>
      <ul style="padding-left:20px;color:#111;">
        ${result.added.map(p => `<li style="margin-bottom:6px;">${p.fullName} — ${p.serviceNameCz}, ${p.cityNameCz}</li>`).join('')}
      </ul>
      ${result.skippedDuplicates > 0 ? `<p style="color:#999;font-size:13px;">(${result.skippedDuplicates} nalezených firem už v katalogu existovalo, přeskočeno.)</p>` : ''}
    `
    : `<p style="color:#555;margin-bottom:16px;">Dnes nebyl přidán žádný nový poskytovatel. Důvod: ${result.reason || 'neznámý'}.</p>`;

  const notifiedLine = `<p style="color:#555;margin-top:16px;">📧 Dnes byl odeslán informační e-mail o zapsání do katalogu ${result.listingNotified ?? 0} poskytovatelům (jen těm, kteří mají e-mail).</p>`;

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

export type SalesPitchStage = 'intro' | 'waiting' | 'hidden' | 'followup';

const EXAMPLE_CUSTOMER_NAMES = ['Jana Nováková', 'Petr Svoboda', 'Lucie Dvořáková', 'Tomáš Procházka', 'Kateřina Černá', 'Martin Veselý', 'Eva Kučerová', 'Jakub Horák'];
const EXAMPLE_MESSAGE_TEMPLATES = [
  (service: string) => `Dobrý den, sháním spolehlivého odborníka na ${service}. Mohli byste mi prosím zavolat a domluvit termín?`,
  (service: string) => `Dobrý den, potřebuji ${service} co nejdříve, ideálně tento týden. Jaké máte volné termíny?`,
  (service: string) => `Zdravím, hledám někoho na ${service} — doporučili mi vás. Můžete mi prosím napsat cenovou nabídku?`,
];

function randomExampleLead(serviceNameCz: string) {
  const name = EXAMPLE_CUSTOMER_NAMES[Math.floor(Math.random() * EXAMPLE_CUSTOMER_NAMES.length)];
  const template = EXAMPLE_MESSAGE_TEMPLATES[Math.floor(Math.random() * EXAMPLE_MESSAGE_TEMPLATES.length)];
  return { name, message: template(serviceNameCz.toLowerCase()) };
}

export async function sendProviderSalesPitchEmail(
  provider: {
    id: string; fullName: string; email: string; serviceNameCz: string; cityNameCz: string;
    description?: string | null; picturePath?: string | null;
  },
  opts: { stage: SalesPitchStage; deadline: Date },
): Promise<{ ok: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) return { ok: false, error: 'RESEND_API_KEY not configured' };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://adressa.cz';
  const activateUrl = `${baseUrl}/aktivovat/${provider.id}`;
  const profileUrl = `${baseUrl}/providers/${provider.id}`;
  const deadlineStr = opts.deadline.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' });
  const service = provider.serviceNameCz;
  const city = provider.cityNameCz;

  const pricingList = `
    <ul style="color:#333;font-size:14px;line-height:1.9;padding-left:20px;">
      <li>Jednorázová platba <strong>1 344 Kč</strong></li>
      <li>Platí navždy — žádné další poplatky</li>
    </ul>
  `;

  const footer = `
    <p style="color:#999;font-size:12px;margin-top:32px;">
      Pokud si profil na adressa.cz nepřejete, nemusíte nic dělat — bude po ${deadlineStr} automaticky odebrán.
    </p>
    <p style="color:#bbb;font-size:11px;margin-top:8px;">
      Máte dotaz nebo si nepřejete dostávat tyto e-maily? Napište na <a href="mailto:customerserviceentfin@gmail.com" style="color:#bbb;">customerserviceentfin@gmail.com</a>.
    </p>
  `;

  let subject: string;
  let html: string;

  if (opts.stage === 'intro') {
    const lead = randomExampleLead(service);
    const descriptionSnippet = provider.description
      ? provider.description.length > 140 ? provider.description.slice(0, 140).trim() + '…' : provider.description
      : null;
    subject = `${provider.fullName}, vytvořili jsme pro vás profil na adressa.cz`;
    html = emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">Vítejte na adressa.cz</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;">katalog místních služeb</p>
      <p style="color:#333;font-size:14px;line-height:1.6;">
        Ahoj <strong>${provider.fullName}</strong>, jsme adressa.cz — místo, kde lidé v ${city} hledají ${service.toLowerCase()}.
        Váš profil jsme pro vás již vytvořili a je veřejně viditelný.
      </p>
      <div style="margin:20px 0;border:1px solid #eee;border-radius:12px;overflow:hidden;">
        ${provider.picturePath ? `<img src="${provider.picturePath}" alt="${provider.fullName}" style="width:100%;height:160px;object-fit:cover;display:block;" />` : ''}
        <div style="padding:18px;">
          <p style="margin:0 0 4px;font-weight:700;color:#111;font-size:17px;">${provider.fullName}</p>
          <p style="margin:0 0 10px;color:${BRAND_GREEN_DARK};font-size:13px;font-weight:600;">${service} · ${city}</p>
          ${descriptionSnippet ? `<p style="margin:0 0 16px;color:#555;font-size:13px;line-height:1.5;">${descriptionSnippet}</p>` : ''}
          <a href="${profileUrl}"
             style="display:inline-block;background:#111;color:#fff;font-weight:700;padding:13px 26px;border-radius:8px;text-decoration:none;font-size:15px;">
            👀 Zobrazit celý profil
          </a>
        </div>
      </div>
      <p style="color:#333;font-size:14px;line-height:1.6;">Co pro vás adressa.cz dělá:</p>
      <ul style="color:#333;font-size:14px;line-height:1.9;padding-left:20px;">
        <li>Zákazníci vás najdou přímo na Google i na webu</li>
        <li>Poptávky chodí rovnou vám na e-mail</li>
        <li>Profesní profil s recenzemi zvyšuje důvěru zákazníků</li>
      </ul>
      <div style="margin-top:20px;padding:16px;background:#f3faf6;border-radius:8px;border-left:3px solid ${BRAND_GREEN};">
        <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.05em;">Nedávná poptávka pro váš obor</p>
        <p style="margin:0 0 4px;font-weight:600;color:#111;font-size:14px;">${lead.name}</p>
        <p style="margin:0;color:#333;font-size:14px;line-height:1.5;">„${lead.message}"</p>
      </div>
      <p style="color:#333;font-size:14px;line-height:1.6;margin-top:20px;">Zaplaťte jednorázový poplatek a začněte tyto poptávky dostávat:</p>
      ${pricingList}
      ${brandButton(activateUrl, 'Aktivovat profil')}
      ${footer}
    `);
  } else if (opts.stage === 'waiting') {
    subject = `${provider.fullName}, 8 lidí čeká na ${service.toLowerCase()} ve vašem okolí`;
    html = emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">⏳ 8 lidí čeká na odpověď</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;">katalog místních služeb</p>
      <p style="color:#333;font-size:14px;line-height:1.6;">
        Aktuálně máme <strong>8 lidí</strong>, kteří hledají ${service.toLowerCase()} v okolí ${city} a čekají na odpověď od místního odborníka jako jste vy.
      </p>
      <p style="color:#333;font-size:14px;line-height:1.6;">
        Váš profil <strong>${provider.fullName}</strong> zatím není zaplacený, takže tyto poptávky nevidíte.
      </p>
      <p style="color:#333;font-size:14px;line-height:1.6;">Zaplaťte jednorázový poplatek a začněte získávat zákazníky:</p>
      ${pricingList}
      ${brandButton(activateUrl, 'Chci tyto zákazníky')}
      ${footer}
    `);
  } else if (opts.stage === 'hidden') {
    subject = `10 skrytých poptávek čeká na vaši odpověď`;
    html = emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">🔒 10 poptávek čeká, až si je odemknete</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;">katalog místních služeb</p>
      <p style="color:#333;font-size:14px;line-height:1.6;">
        Pro profil <strong>${provider.fullName}</strong> máme připraveno <strong>10 dalších poptávek</strong> na ${service.toLowerCase()} v ${city}, které jsou momentálně skryté.
      </p>
      <p style="color:#333;font-size:14px;line-height:1.6;">
        Jakmile zaplatíte, získáte k nim okamžitý přístup — natrvalo, bez dalších poplatků.
      </p>
      ${pricingList}
      ${brandButton(activateUrl, 'Odemknout poptávky')}
      ${footer}
    `);
  } else {
    subject = `Poslední připomínka — nenechte si ujít zákazníky na adressa.cz`;
    html = emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">⏰ Poslední připomínka</h2>
      <p style="color:#777;font-size:13px;margin-bottom:24px;">katalog místních služeb</p>
      <p style="color:#333;font-size:14px;line-height:1.6;">
        Chápeme, že jste zaneprázdnění — ale profil <strong>${provider.fullName}</strong> na adressa.cz stále čeká na platbu, a zákazníci hledající ${service.toLowerCase()} v ${city} mezitím míří jinam.
      </p>
      <p style="color:#333;font-size:14px;line-height:1.6;">Poslední šance zaplatit a zůstat viditelní natrvalo:</p>
      ${pricingList}
      ${brandButton(activateUrl, 'Aktivovat profil')}
      ${footer}
    `);
  }

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to: provider.email,
    replyTo: 'customerserviceentfin@gmail.com',
    subject,
    html,
  });

  if (error) {
    console.error('sendProviderSalesPitchEmail failed:', provider.email, error);
    return { ok: false, error: error.message ?? JSON.stringify(error) };
  }
  return { ok: true };
}

const STAGE_LABEL_CZ: Record<string, string> = {
  intro: '1️⃣ Úvod',
  waiting: '2️⃣ Čekají',
  hidden: '3️⃣ Skryté',
  followup: '4️⃣ Follow-up',
};

export async function sendSalesAutopilotReportEmail(
  to: string,
  result: {
    scheduled: { fullName: string; email: string; stage: string; cityNameCz?: string }[];
    sent: { fullName: string; email: string; stage: string; cityNameCz?: string }[];
    pastDeadline: { fullName: string; email: string | null; cityNameCz?: string }[];
    remainingNeverContacted: number;
    gapWarning?: string;
  },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const dateStr = new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' });

  const section = (title: string, rows: { fullName: string; email: string | null; cityNameCz?: string }[]) =>
    rows.length === 0 ? '' : `
      <p style="color:#111;font-weight:600;margin:20px 0 6px;">${title} (${rows.length})</p>
      <ul style="padding-left:20px;color:#555;font-size:13px;line-height:1.7;">
        ${rows.map(r => `<li>${r.fullName}${r.cityNameCz ? ` — ${r.cityNameCz}` : ''}${r.email ? ` — ${r.email}` : ''}</li>`).join('')}
      </ul>
    `;

  const byStage = (rows: { fullName: string; email: string; stage: string; cityNameCz?: string }[]) => {
    const groups = new Map<string, { fullName: string; email: string; cityNameCz?: string }[]>();
    for (const r of rows) {
      const list = groups.get(r.stage) ?? [];
      list.push({ fullName: r.fullName, email: r.email, cityNameCz: r.cityNameCz });
      groups.set(r.stage, list);
    }
    return Array.from(groups.entries())
      .map(([stage, group]) => section(STAGE_LABEL_CZ[stage] ?? stage, group))
      .join('');
  };

  const totalActions = result.scheduled.length + result.sent.length + result.pastDeadline.length;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: `Sales autopilot: ${result.sent.length + result.scheduled.length} osloveno, ${result.pastDeadline.length} po termínu – adressa.cz`,
    html: emailShell(`
      <h2 style="color:#111;margin:0 0 4px;">📊 Denní report sales autopilota</h2>
      <p style="color:#777;font-size:13px;margin-bottom:8px;">${dateStr}</p>
      <p style="color:#111;font-size:14px;font-weight:600;">
        Celkem odesláno dnes: ${result.sent.length + result.scheduled.length} e-mailů
      </p>
      <p style="color:#111;font-size:14px;">Nikdy neosloveno: <strong>${result.remainingNeverContacted}</strong> profilů</p>
      ${result.gapWarning ? `<p style="color:#92400e;background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin:12px 0;font-size:13px;">${result.gapWarning}</p>` : ''}
      ${result.scheduled.length ? `<p style="color:#111;font-weight:600;margin:20px 0 6px;">📅 Naplánováno strategicky (${result.scheduled.length})</p>${byStage(result.scheduled)}` : ''}
      ${result.sent.length ? `<p style="color:#111;font-weight:600;margin:20px 0 6px;">✉️ Automaticky odesláno (${result.sent.length})</p>${byStage(result.sent)}` : ''}
      ${section('⏰ Po termínu, ale NEODEBRÁNO (žádná akce)', result.pastDeadline)}
      ${totalActions === 0
        ? '<p style="color:#555;font-size:14px;margin-top:16px;">Dnes nebyla žádná akce potřeba.</p>' : ''}
      <p style="color:#999;font-size:12px;margin-top:32px;">
        Tento e-mail byl odeslán automaticky po dokončení denního běhu sales autopilota.
      </p>
    `),
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
