# Scaffold AC



Proprietær licens — se [`LICENSE`](LICENSE).



## Hvad ligger hvor



| Del | Beskrivelse |

| --- | --- |

| `docs/` | Statisk forside til **GitHub Pages** (kun HTML/CSS — ingen API). |

| `web/` | **Fuld** admin-oplevelse: Next.js, API-ruter, Prisma — kræver Node-hosting og database. |

| `fivem-resource/scaffold_ac/` | FiveM-resource (`ensure scaffold_ac`). |

**Bemærk:** Mappen `fivem-resource/ac_panel/` er et ekstra/parallelt udkast — brug **`scaffold_ac`** som den understøttede resource, så du ikke blander to fxmanifest-navne.



## Statisk site (GitHub Pages)

Når sitet er deployet, ligger det typisk på:

**https://wvtzg8b729-afk.github.io/scaffold_ac/**

(udskift bruger og repo i URL, hvis dit GitHub-navn eller repo-navn er anderledes.)

Den byggede side er **ikke** panelet — den linker kun og forklarer. Se også `GITHUB_SETUP.txt` for remote og push.

### Sådan får du siden til at virke

**Vigtigst (gratis GitHub):** Ifølge [GitHub Docs om 404 på Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/troubleshooting-404-errors-for-github-pages-sites) skal du bl.a. have **`index.html`** på det rigtige sted i **publiceringskilden** — og på **gratis GitHub** skal repo’et som udgangspunkt være **public**, ellers kan den offentlige `github.io`-adresse give **404** (private Pages kræver betalt plan).

Se også filen **`GITHUB_PAGES_CHECKLIST.txt`** i roden (trin-for-trin + links).

Brug **kun én** publiceringskilde ad gangen under **Settings → Pages**.

#### Metode 0 — `/docs` på `main` (anbefalet: ingen Actions)

Det er GitHubs **simpleste** model og kræver **ikke** workflows.

1. Repo skal være **public** (medmindre I betaler for private Pages).
2. **Settings** → **Pages** → **Source** → **Deploy from a branch**.
3. Branch: **`main`**, mappe: **`/docs`** (vælg præcis **`/docs`** i dropdown — ikke `/` i repo-roden).
4. **Save**, vent 1–2 minutter, genindlæs `https://dit-brugernavn.github.io/repo-navn/`.

#### Metode 1 — Branch `gh-pages` (workflow)

1. **Settings** → **Actions** → **General** → **Workflow permissions** → **Read and write permissions** → **Save**.
2. **Actions** → **Publish GitHub Pages** → kør workflow. Tjek at branch **`gh-pages`** findes med **`index.html`** i roden.
3. **Settings** → **Pages** → **Source** → **Deploy from a branch** → **`gh-pages`** → mappe **`/`** → **Save**.

#### Metode 2 — Kilde: **GitHub Actions**

1. **Settings** → **Pages** → **Source** → **GitHub Actions**.
2. **Actions** → **Deploy Pages (Actions-kilde)** → kør / vent på grøn.
3. Godkend evt. miljøet **github-pages** første gang, eller slå **Required reviewers** fra under **Settings → Environments → github-pages**.

### Fejlsøgning (GitHub Pages)

- **404 “There isn’t a GitHub Pages site here”**: Er repo **public**? Er **Pages → Source** og mappe/branch **korrekt**? (Mange vælger ved en fejl **`/`** på **`main`** i stedet for **`/docs`** — så findes der ingen `index.html` i publiceringsroden og du får 404.) Prøv **Metode 0** først.
- **Workflow fejler** (metode 1): **Read and write** skal være slået til.
- **Fork / andet repo-navn**: Opdatér `<base href="...">` i `docs/index.html` og `docs/404.html`.

Mappen `docs/` indeholder desuden en tom **`docs/.nojekyll`**, så Jekyll ignoreres og filer med `_` i navnet ikke skjules, hvis du tilføjer sådanne senere.



## Panel (`web/`) — fuld hosting



Panelet skal køre et sted med Node.js og en database (SQLite som standard via `DATABASE_URL`). **Det kan ikke hostes som statisk GitHub Pages.**



Fra mappen `web/`:



1. `cp .env.example .env` (Windows: kopiér filen manuelt) og sæt stærke værdier til `JWT_SECRET` og admin-adgang.

2. `npm install`

3. `npx prisma migrate dev` (første gang lokalt) eller `npx prisma migrate deploy` (produktion)

4. `npm run dev` til udvikling, eller `npm run build` og `npm start` til produktion.



Miljøvariabler: se `web/.env.example`.



## FiveM



1. Kopiér `fivem-resource/scaffold_ac` til serverens `resources/` som mappen **`scaffold_ac`**.

2. Sæt convars og `ensure scaffold_ac` efter `SERVER_CFG_SNIPPET.txt` og `INSTALL.txt` i resource-mappen.

3. `ac_api_url` skal pege på den **deployede** web-app (samme origin som `/api/...`), uden trailing slash.



Uden kørende FiveM-server kan du stadig verificere Lua-syntaks lokalt og teste panelet mod SQLite.


