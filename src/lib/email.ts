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

  const warningBanner = result.reason && result.reason.startsWith('⚠️')
    ? `<p style="color:#92400e;background:#fef3c7;border:1px solid #fde68a;border-radius:6px;padding:12px 16px;margin-bottom:16px;font-size:13px;">${result.reason}</p>`
    : '';

  const body = result.published.length > 0
    ? `
      ${warningBanner}
      <p style="color:#555;margin-bottom:16px;">Dnes v noci (${dateStr}) bylo automaticky publikováno ${result.published.length} ${result.published.length === 1 ? 'nový článek' : 'nové články'}:</p>
      <ul style="padding-left:20px;color:#111;">
        ${result.published.map(a => `<li style="margin-bottom:8px;"><a href="${baseUrl}/clanky/${a.slug}" style="color:#f97316;">${a.title}</a></li>`).join('')}
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

export async function sendProviderImportReportEmail(
  to: string,
  result: {
    added: { fullName: string; serviceNameCz: string; cityNameCz: string }[];
    query: string;
    skippedDuplicates: number;
    reason?: string;
  },
): Promise<boolean> {
  const resend = getResend();
  if (!resend) return false;

  const dateStr = new Date().toLocaleDateString('cs-CZ', { dateStyle: 'long' });

  const body = result.added.length > 0
    ? `
      <p style="color:#555;margin-bottom:8px;">Dnes (${dateStr}) bylo automaticky přidáno ${result.added.length} nových poskytovatelů z vyhledávání „${result.query}“:</p>
      <ul style="padding-left:20px;color:#111;">
        ${result.added.map(p => `<li style="margin-bottom:6px;">${p.fullName} — ${p.serviceNameCz}, ${p.cityNameCz}</li>`).join('')}
      </ul>
      ${result.skippedDuplicates > 0 ? `<p style="color:#999;font-size:13px;">(${result.skippedDuplicates} nalezených firem už v katalogu existovalo, přeskočeno.)</p>` : ''}
    `
    : `<p style="color:#555;margin-bottom:16px;">Dnes nebyl přidán žádný nový poskytovatel. Důvod: ${result.reason || 'neznámý'}.</p>`;

  const { error } = await resend.emails.send({
    from: 'adressa.cz <noreply@adressa.cz>',
    to,
    subject: result.added.length > 0
      ? `✅ ${result.added.length} nových poskytovatelů přidáno – adressa.cz`
      : `⚠️ Dnes nebyl přidán žádný poskytovatel – adressa.cz`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">Denní report – přidávání poskytovatelů</h2>
        <p style="color:#777;font-size:13px;margin-bottom:24px;">adressa.cz — automatický import z Google Places</p>
        ${body}
        <p style="color:#999;font-size:12px;margin-top:32px;">
          Tito poskytovatelé jsou reální (z Google Places) a jsou automaticky vyňati z prodejního oslovování, dokud si to sami nezažádají.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error('sendProviderImportReportEmail failed:', to, error);
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

  const ctaButton = (label: string) => `
    <a href="${activateUrl}"
       style="display:inline-block;background:#f97316;color:#fff;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;margin-top:12px;">
      ${label}
    </a>
  `;

  const pricingList = `
    <ul style="color:#333;font-size:14px;line-height:1.9;padding-left:20px;">
      <li>Spuštění profilu jen za <strong>15 Kč</strong></li>
      <li>7 dní zdarma na vyzkoušení</li>
    </ul>
  `;

  const footer = `
    <p style="color:#999;font-size:12px;margin-top:32px;">
      Pokud si profil na adressa.cz nepřejete, nemusíte nic dělat — bude po ${deadlineStr} automaticky odebrán.
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
    html = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">Vítejte na adressa.cz</h2>
        <p style="color:#777;font-size:13px;margin-bottom:24px;">adressa.cz — katalog místních služeb</p>
        <p style="color:#333;font-size:14px;line-height:1.6;">
          Ahoj <strong>${provider.fullName}</strong>, jsme adressa.cz — místo, kde lidé v ${city} hledají ${service.toLowerCase()}.
          Váš profil jsme pro vás již vytvořili a je veřejně viditelný.
        </p>
        <div style="margin:20px 0;border:1px solid #eee;border-radius:12px;overflow:hidden;">
          ${provider.picturePath ? `<img src="${provider.picturePath}" alt="${provider.fullName}" style="width:100%;height:160px;object-fit:cover;display:block;" />` : ''}
          <div style="padding:18px;">
            <p style="margin:0 0 4px;font-weight:700;color:#111;font-size:17px;">${provider.fullName}</p>
            <p style="margin:0 0 10px;color:#f97316;font-size:13px;font-weight:600;">${service} · ${city}</p>
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
        <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:8px;border-left:3px solid #f97316;">
          <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:.05em;">Nedávná poptávka pro váš obor</p>
          <p style="margin:0 0 4px;font-weight:600;color:#111;font-size:14px;">${lead.name}</p>
          <p style="margin:0;color:#333;font-size:14px;line-height:1.5;">„${lead.message}"</p>
        </div>
        <p style="color:#333;font-size:14px;line-height:1.6;margin-top:20px;">Potvrďte předplatné a začněte tyto poptávky dostávat:</p>
        ${pricingList}
        ${ctaButton('Potvrdit předplatné')}
        ${footer}
      </div>
    `;
  } else if (opts.stage === 'waiting') {
    subject = `${provider.fullName}, 8 lidí čeká na ${service.toLowerCase()} ve vašem okolí`;
    html = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">8 lidí čeká na odpověď</h2>
        <p style="color:#777;font-size:13px;margin-bottom:24px;">adressa.cz — katalog místních služeb</p>
        <p style="color:#333;font-size:14px;line-height:1.6;">
          Aktuálně máme <strong>8 lidí</strong>, kteří hledají ${service.toLowerCase()} v okolí ${city} a čekají na odpověď od místního odborníka jako jste vy.
        </p>
        <p style="color:#333;font-size:14px;line-height:1.6;">
          Váš profil <strong>${provider.fullName}</strong> zatím nemá potvrzené předplatné, takže tyto poptávky nevidíte.
        </p>
        <p style="color:#333;font-size:14px;line-height:1.6;">Potvrďte předplatné a začněte získávat zákazníky:</p>
        ${pricingList}
        ${ctaButton('Chci tyto zákazníky')}
        ${footer}
      </div>
    `;
  } else if (opts.stage === 'hidden') {
    subject = `10 skrytých poptávek čeká na vaši odpověď`;
    html = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">10 poptávek čeká, až si je odemknete</h2>
        <p style="color:#777;font-size:13px;margin-bottom:24px;">adressa.cz — katalog místních služeb</p>
        <p style="color:#333;font-size:14px;line-height:1.6;">
          Pro profil <strong>${provider.fullName}</strong> máme připraveno <strong>10 dalších poptávek</strong> na ${service.toLowerCase()} v ${city}, které jsou momentálně skryté.
        </p>
        <p style="color:#333;font-size:14px;line-height:1.6;">
          Jakmile potvrdíte předplatné, získáte k nim okamžitý přístup.
        </p>
        ${pricingList}
        ${ctaButton('Odemknout poptávky')}
        ${footer}
      </div>
    `;
  } else {
    subject = `Poslední připomínka — nenechte si ujít zákazníky na adressa.cz`;
    html = `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">Poslední připomínka</h2>
        <p style="color:#777;font-size:13px;margin-bottom:24px;">adressa.cz — katalog místních služeb</p>
        <p style="color:#333;font-size:14px;line-height:1.6;">
          Chápeme, že jste zaneprázdnění — ale profil <strong>${provider.fullName}</strong> na adressa.cz stále čeká na potvrzení předplatného, a zákazníci hledající ${service.toLowerCase()} v ${city} mezitím míří jinam.
        </p>
        <p style="color:#333;font-size:14px;line-height:1.6;">Poslední šance potvrdit předplatné a zůstat viditelní:</p>
        ${pricingList}
        ${ctaButton('Potvrdit předplatné')}
        ${footer}
      </div>
    `;
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
    scheduled: { fullName: string; email: string; stage: string }[];
    sent: { fullName: string; email: string; stage: string }[];
    pastDeadline: { fullName: string; email: string | null }[];
    remainingNeverContacted: number;
    gapWarning?: string;
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

  const byStage = (rows: { fullName: string; email: string; stage: string }[]) => {
    const groups = new Map<string, { fullName: string; email: string }[]>();
    for (const r of rows) {
      const list = groups.get(r.stage) ?? [];
      list.push({ fullName: r.fullName, email: r.email });
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
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#fff;">
        <h2 style="color:#111;margin-bottom:4px;">Denní report sales autopilota</h2>
        <p style="color:#777;font-size:13px;margin-bottom:8px;">adressa.cz — ${dateStr}</p>
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
