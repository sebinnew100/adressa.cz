import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ochrana osobních údajů | adressa.cz',
  description: 'Zásady ochrany osobních údajů adressa.cz — jaké údaje zpracováváme, proč, a jak můžete požádat o jejich opravu nebo výmaz.',
  alternates: {
    canonical: 'https://www.adressa.cz/ochrana-osobnich-udaju',
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-sm sm:prose-base">
      <h1>Ochrana osobních údajů</h1>
      <p className="text-gray-500">Platné od 13. 7. 2026</p>

      <p>
        Provozovatelem webu adressa.cz je Sebin Varghese (dále jen &bdquo;provozovatel&ldquo;),
        kontaktní e-mail <a href="mailto:customerserviceentfin@gmail.com">customerserviceentfin@gmail.com</a>,
        telefon <a href="tel:+420728415630">+420 728 415 630</a>, adresa V. Volfa 1335/33, České Budějovice.
        Tento dokument popisuje, jaké osobní údaje na adressa.cz zpracováváme, za jakým účelem a jaká máte práva.
      </p>

      <h2>Jaké údaje zpracováváme</h2>
      <ul>
        <li>
          <strong>Poskytovatelé služeb (registrace profilu):</strong> jméno/název firmy, e-mail, telefon,
          adresa, kategorie a popis služby, profilová fotografie, a údaje potřebné ke zpracování platby
          předplatného (platby zpracovává výhradně Stripe — čísla platebních karet nikdy neukládáme ani
          nevidíme).
        </li>
        <li>
          <strong>Poptávky a objednávky termínů:</strong> jméno, e-mail, telefon, adresa a text zprávy,
          které zadáte při odeslání poptávky nebo žádosti o termín poskytovateli.
        </li>
        <li>
          <strong>Recenze:</strong> jméno autora, hodnocení a text recenze, které se zobrazují veřejně
          u profilu poskytovatele.
        </li>
        <li>
          <strong>Herní mód (/hra):</strong> anonymní identifikátor zařízení uložený v localStorage
          vašeho prohlížeče (nejde o osobní účet), volitelná přezdívka pro žebříček, a fotografie nahrané
          jako důkaz splnění mise.
        </li>
        <li>
          <strong>Technické a analytické údaje:</strong> běžné cookies potřebné pro chod webu a zobrazování
          reklam prostřednictvím Google AdSense. Google může k personalizaci reklam používat vlastní
          cookies dle svých zásad ({' '}
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">
            policies.google.com/technologies/ads
          </a>).
        </li>
      </ul>

      <h2>Proč údaje zpracováváme</h2>
      <p>
        Údaje zpracováváme za účelem provozu adresáře (zobrazení profilů poskytovatelů zákazníkům),
        zprostředkování kontaktu mezi zákazníkem a poskytovatelem, zpracování plateb předplatného,
        provozu herního módu a jeho žebříčku, a informování poskytovatelů o stavu jejich profilu
        (např. blížící se konec zkušební doby nebo předplatného).
      </p>

      <h2>S kým údaje sdílíme</h2>
      <p>
        Údaje sdílíme pouze s poskytovateli služeb nezbytných pro chod webu: Stripe (zpracování plateb),
        Resend (odesílání e-mailů), Vercel a Neon (hosting a databáze) a Google (zobrazování reklam
        přes AdSense). Žádné osobní údaje neprodáváme třetím stranám.
      </p>

      <h2>Jak dlouho údaje uchováváme</h2>
      <p>
        Údaje profilu poskytovatele uchováváme po dobu aktivního profilu. Poptávky a recenze uchováváme
        po dobu, po kterou je relevantní profil poskytovatele aktivní. Údaje smažeme dříve na základě
        vaší žádosti.
      </p>

      <h2>Vaše práva</h2>
      <p>
        Máte právo požádat o přístup ke svým osobním údajům, jejich opravu, výmaz nebo omezení zpracování.
        Žádost o výmaz nebo opravu údajů zašlete na{' '}
        <a href="mailto:customerserviceentfin@gmail.com">customerserviceentfin@gmail.com</a> — vyřídíme ji
        do 30 dnů. Máte také právo podat stížnost u Úřadu pro ochranu osobních údajů (uoou.cz), pokud se
        domníváte, že vaše údaje zpracováváme v rozporu s právními předpisy.
      </p>

      <h2>Kontakt</h2>
      <p>
        S jakýmikoli dotazy ohledně zpracování osobních údajů nás kontaktujte na{' '}
        <a href="mailto:customerserviceentfin@gmail.com">customerserviceentfin@gmail.com</a> nebo telefonicky
        na <a href="tel:+420728415630">+420 728 415 630</a>.
      </p>
    </div>
  );
}
