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

**Vigtigst (gratis GitHub):** Adressen `https://dit-brugernavn.github.io/repo-navn/` virker normalt **kun**, hvis repo’et er **public** (offentligt). Er repo’et **private**, får du ofte **404** på Pages — så skal du enten sætte det til **public** (*Settings → General → Danger zone → Change repository visibility*) eller hoste `docs/` et andet sted (fx Vercel/Cloudflare).

Brug **kun én** metode ad gangen (vælg enten **Metode 1** eller **Metode 2** under *Settings → Pages → Source*).

#### Metode 1 — Branch `gh-pages` (klassisk)

1. **Settings** → **Actions** → **General** → **Workflow permissions** → **Read and write permissions** → **Save**.
2. **Actions** → **Publish GitHub Pages** → **Run workflow** (eller push til `main`). Vent til **grøn**. Tjek **Code** → branch **gh-pages** → skal indeholde **index.html** i roden.
3. **Settings** → **Pages** → **Source** → **Deploy from a branch** → branch **gh-pages**, mappe **/** → **Save**.

#### Metode 2 — Hvis du stadig får 404 (kilde: GitHub Actions)

1. **Settings** → **Pages** → **Source** → vælg **GitHub Actions** (ikke “Deploy from a branch”).
2. **Actions** → **Deploy Pages (Actions-kilde)** → **Run workflow** eller vent på push til `main`.
3. Første gang: under **Actions** kan der stå **“Waiting for your approval”** for miljøet **github-pages** → godkend. Alternativt: **Settings** → **Environments** → **github-pages** → slå **Required reviewers** fra.
4. Når jobbet er grønt, vises den aktive URL under **Settings → Pages**.

### Fejlsøgning (GitHub Pages)

- **404 “There isn’t a GitHub Pages site here”**: Repo **public**? Er **Pages → Source** sat til den metode du bruger (**branch gh-pages** *eller* **GitHub Actions**)? Har den tilhørende workflow kørt **færdig og grøn**? (Ved Actions-kilde: brug **Deploy Pages (Actions-kilde)**; ved branch: brug **Publish GitHub Pages** og peg Pages på **gh-pages**.)
- **Workflow fejler på push** (kun metode 1): **Read and write** skal være slået til.
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


