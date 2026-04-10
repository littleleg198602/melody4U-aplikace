📜 MANIFEST PROJEKTU MELODY4U

Verze: 2.1
Stav: SCHVÁLENO
Typ: Závazný řídicí, architektonický a procesní dokument
Platnost: do vydání verze 3.0

⚠️ POVINNÉ ČTENÍ (ZÁVAZNÉ)

Tento manifest MUSÍ být přečten a respektován před jakoukoli prací
na projektu Melody4U (návrh, kód, grafika, konzultace, změna).

➡️ Pokud návrh, odpověď nebo úprava není v souladu s tímto manifestem,
NESMÍ být provedena, bez ohledu na to, jak „dobře zní“.

1️⃣ SMYSL PROJEKTU (WHY)

Melody4U je digitální služba pro vytváření osobních hudebních dárků
(kombinace hlasu, hudby a emocí), které lze:

snadno vytvořit

okamžitě zaplatit

bezpečně sdílet

Cílem není technologická hračka, ale funkční komerční produkt, za který jsou lidé ochotni platit, protože:

je osobní

je jednoduchý

funguje bez vysvětlování

2️⃣ CO JE MELODY4U (WHAT)

Melody4U je:

produkční webová aplikace (FE + BE)

služba s přímou monetizací (Stripe)

systém s jasným uživatelským tokem

Závazný tok uživatele:
Landing → Vysvětlení → Ukázka → Cena → Create → Pay → Share → Play


Zaměření:

mobile-first

minimální kognitivní zátěž

stabilita a důvěra

3️⃣ CO MELODY4U NENÍ (WHAT IT IS NOT)

Melody4U není:

experimentální playground

demo bez obchodního cíle

projekt, kde se přepisuje funkční kód „protože by šel líp“

systém bez paměti a historie rozhodnutí

➡️ Jakmile něco funguje nebo vydělává, je to chráněné.

4️⃣ HIERARCHIE PRIORIT (ZÁVAZNÁ)

Funkčnost

Platby

Jednoduchost pro uživatele

Stabilní UX/UI

Vizuální efekt

Experimenty

❗ Body 1–4 nikdy nesmí být obětovány bodům 5–6.

5️⃣ POSVÁTNÉ ZÓNY (NESAHAT BEZ SOUHLASU)

Bez výslovného rozhodnutí se NESMÍ:

měnit platební flow

refaktorovat CORE „pro čistotu“

mazat funkční cesty

měnit architekturu bez aktualizace dokumentace

➡️ Funkční věci se verzují, ne přepisují.

6️⃣ ZÓNOVÉ ROZDĚLENÍ SYSTÉMU
🟥 CORE (chráněné jádro)

platby (Stripe)

vazba platba ↔ výsledek

render audia

share + play protection

📌 CORE = peníze + hodnota
Jakýkoliv zásah = vysoké riziko.

🟧 FLOW (chování)

pořadí kroků

význam sekcí

navigace, scroll, CTA logika

FLOW lze optimalizovat, nesmí se rozbít význam.

🟦 UI / VIZUÁL

barvy, layout, animace

texty bez změny významu

emoční složka

UI nesmí skrývat CTA ani zvyšovat zmatek.

🟩 LAB

experimenty

alternativní návrhy

testy „co kdyby“

LAB nesmí být propojen s CORE.

7️⃣ HOMEPAGE – ZVLÁŠTNÍ PRAVIDLA

Homepage je prezentační vrstva, nikoliv aplikace.

Povolené:

UI-only komponenty

demo obsah

statické audio ukázky

Zakázané:

backend volání

práce s DB

práce s platbami

změna CORE stavu

📌 Ukázky přání = demo, ne skutečné přehrávání.

8️⃣ TRUST & LEGAL – ROZHODNUTÍ

Trust & Legal patří do obsahu homepage

je součást sekce „Proč Melody4U“

nepatří do footeru

Footer má být minimalistický:

copyright

odkazy (Podmínky, Ochrana dat)

9️⃣ ROZHODOVACÍ FILTR

Každá změna musí projít otázkou:

„Pomůže tato změna tomu, aby uživatel zaplatil a byl spokojený?“

Pokud odpověď není jasné ANO, změna:

patří do LAB

nebo se odkládá

9️⃣A️⃣ POVINNÝ POSTUP PRÁCE A KOMUNIKACE (ZÁVAZNÉ – NOVÉ)

Jakákoli práce na projektu Melody4U
(návrh, kód, grafika, architektura, konzultace, AI asistence)
MUSÍ začít potvrzením aktuální reality projektu.

Povinný postup:

Nejprve se ověří aktuální stav

podle MANIFEST_MELODY4U.md

podle PROJECT_STRUCTURE.md

podle PROJECT_FLOW.md

Explicitně se uvede, zda:

se pouze popisuje aktuální stav, nebo

se navrhuje změna

Návrh změny se podává výhradně jako minimální rozdíl (diff)
– nikoli jako paralelní struktura, přepis nebo „lepší verze“.

Bez výslovného souhlasu NESMÍ dojít k:

úpravě architektury

změně Project Structure

zavedení nových pravidel

přepisování základních dokumentů

Zakázané chování:

míchání popisu reality a návrhu změny v jedné odpovědi

navrhování „jak by to mělo být“ bez vazby na dokumentaci

vytváření paralelní reality projektu

➡️ Tento postup je závazný pro všechny účastníky projektu,
včetně externích konzultantů a AI asistence.

🔟 DOKUMENTAČNÍ STRUKTURA PROJEKTU (ZÁVAZNÁ)

Tato struktura je součást manifestu a je neměnná bez změny verze manifestu.

/manifest/
├── MANIFEST_MELODY4U.md        ← tento dokument
├── PROJECT_BOARD.txt           ← aktuální stav (CO JE TEĎ)
├── PROJECT_FLOW.txt            ← chování systému (JAK SE CHOVÁ)
├── PROJECT_STRUCTURE.md        ← architektura (JAK JE POSTAVEN)
├── PROJECT_HISTORY.txt         ← paměť projektu (PROČ)

📌 Pravidla

každá informace má jedno místo

dokumenty se významově nepřekrývají

pokud něco není v Boardu → neexistuje

změna architektury = změna STRUCTURE + zmínka v HISTORY

1️⃣1️⃣ UKOTVENÍ PROJECT_STRUCTURE

PROJECT_STRUCTURE.md je:

architektonická pravda projektu

závazná pro FE, BE i deployment

referenční dokument pro nové vývojáře

Manifest explicitně říká, že:

struktura je oddělená od Boardu a History

FORPSI = pouze build

GitHub = zdrojáky

API = logika + peníze

➡️ PROJECT_STRUCTURE je nedílnou součástí Manifestu.

 🔚 ZÁVĚR

Tento manifest není doporučení.

Je to:

kompas

kontrakt

ochrana projektu před chaosem

pojistka proti improvizaci

Jakákoli práce, která nerespektuje tento manifest,
je automaticky považována za chybnou.

✅ CO TÍM JE TEĎ JEDNOU PROVŽDY VYŘEŠENO

vždy se začíná čtením manifestu

vždy se nejdřív potvrzuje baseline

žádné „já myslel“

žádné paralelní návrhy

žádné přepisování základního kamene