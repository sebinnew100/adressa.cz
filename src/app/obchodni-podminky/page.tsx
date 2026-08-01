import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Obchodní podmínky | adressa.cz',
  description: 'Obchodní podmínky adressa.cz — pravidla registrace, předplatného poskytovatelů, plateb a dalších funkcí webu.',
  alternates: {
    canonical: 'https://www.adressa.cz/obchodni-podminky',
  },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 prose prose-sm sm:prose-base">
      <h1>Obchodní podmínky</h1>
      <p className="text-gray-500">Platné od 31. 7. 2026</p>

      <p>
        Provozovatelem webu adressa.cz je Sebin Varghese (dále jen &bdquo;provozovatel&ldquo;),
        kontaktní e-mail <a href="mailto:customerserviceentfin@gmail.com">customerserviceentfin@gmail.com</a>,
        telefon <a href="tel:+420728415630">+420 728 415 630</a>, adresa V. Volfa 1335/33, České Budějovice.
        Tyto obchodní podmínky upravují používání webu adressa.cz zákazníky i poskytovateli služeb.
      </p>

      <h2>Co je adressa.cz</h2>
      <p>
        adressa.cz je online adresář místních řemeslníků a poskytovatelů služeb v České republice.
        Zákazníkům umožňuje vyhledat poskytovatele podle služby a města, přečíst si recenze a odeslat
        poptávku nebo žádost o termín. Poskytovatelům umožňuje vytvořit si profil, aby byli zákazníkům
        viditelní. adressa.cz je pouze zprostředkovatel kontaktu — není smluvní stranou žádné dohody
        mezi zákazníkem a poskytovatelem a neodpovídá za kvalitu, cenu ani provedení objednaných služeb.
      </p>

      <h2>Registrace profilu poskytovatele</h2>
      <p>
        Poskytovatel při registraci uvádí pravdivé a aktuální údaje o sobě a nabízených službách.
        Provozovatel si vyhrazuje právo profil odmítnout nebo odstranit, pokud obsahuje nepravdivé,
        klamavé nebo nevhodné informace.
      </p>

      <h2>Předplatné a platby</h2>
      <ul>
        <li>Aktivace profilu je zpoplatněna jednorázovým poplatkem 15 Kč.</li>
        <li>Po aktivaci následuje 7denní zkušební doba zdarma, po kterou je profil plně viditelný.</li>
        <li>
          Pokud předplatné nezrušíte, po skončení zkušební doby se automaticky strhává 299 Kč za
          každých 28 dní, dokud předplatné nezrušíte.
        </li>
        <li>Předplatné lze kdykoliv zrušit; profil zůstává aktivní do konce již zaplaceného období.</li>
        <li>
          Platby zpracovávají výhradně naši platební partneři (Stripe, případně GoPay) —
          adressa.cz nikdy neukládá ani nevidí čísla platebních karet.
        </li>
        <li>
          Pokud platba za obnovení předplatného selže, provozovatel může profil dočasně skrýt, dokud
          nebude platba úspěšně dokončena nebo profil zrušen.
        </li>
      </ul>

      <h2>Poptávky a žádosti o termín</h2>
      <p>
        Odesláním poptávky nebo žádosti o termín souhlasíte s předáním zadaných kontaktních údajů
        vybranému poskytovateli za účelem vyřízení vašeho požadavku. Za obsah a průběh další komunikace
        i samotné služby odpovídá výhradně poskytovatel.
      </p>

      <h2>Recenze</h2>
      <p>
        Recenze musí odrážet skutečnou zkušenost autora se službou. Provozovatel si vyhrazuje právo
        odstranit recenze, které jsou urážlivé, nepravdivé nebo nesouvisí s poskytovanou službou.
      </p>

      <h2>Herní mód (/hra)</h2>
      <p>
        Herní mód je dobrovolná bonusová funkce, ve které hráč za splnění misí (návštěva podniku a
        nahrání fotografie jako důkazu) získává body. Přiznání bodů podléhá ručnímu schválení
        administrátorem. Body nejsou zákonným platidlem ani finančním nástrojem — jejich výplata
        (1000 bodů = 200 Kč) probíhá ručně na bankovní účet uvedený hráčem a je na uvážení
        provozovatele, včetně práva výplatu odmítnout při podezření na podvodné jednání.
      </p>

      <h2>Veřejné zakázky</h2>
      <p>
        Přehled veřejných zakázek na adressa.cz je automaticky agregován z veřejně dostupných zdrojů.
        Provozovatel negarantuje úplnost ani aktuálnost zobrazených údajů — pro závazné informace vždy
        ověřte originální zdroj zakázky.
      </p>

      <h2>Odpovědnost</h2>
      <p>
        adressa.cz je poskytován &bdquo;tak jak je&ldquo;, bez záruky nepřetržité dostupnosti. Provozovatel
        neodpovídá za škodu vzniklou v důsledku výpadku služby, jednání třetích stran (poskytovatelů)
        nebo nesprávně zadaných údajů uživatelem.
      </p>

      <h2>Změny podmínek</h2>
      <p>
        Tyto podmínky můžeme čas od času upravit; aktuální znění je vždy dostupné na této stránce
        s uvedeným datem účinnosti.
      </p>

      <h2>Kontakt</h2>
      <p>
        S jakýmikoli dotazy k těmto podmínkám nás kontaktujte na{' '}
        <a href="mailto:customerserviceentfin@gmail.com">customerserviceentfin@gmail.com</a> nebo telefonicky
        na <a href="tel:+420728415630">+420 728 415 630</a>.
      </p>
    </div>
  );
}
