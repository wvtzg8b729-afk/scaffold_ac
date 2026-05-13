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

### Sådan får du siden til at virke (én metode)

**Vigtigst (gratis GitHub):** Adressen `https://dit-brugernavn.github.io/repo-navn/` virker normalt **kun**, hvis repo’et er **public** (offentligt). Er repo’et **private**, får du ofte **404** på Pages — så skal du enten sætte det til **public** (*Settings → General → Danger zone → Change repository visibility*) eller hoste `docs/` et andet sted (fx Vercel/Cloudflare).

Vi bruger **kun** branchen **`gh-pages`** (ingen “GitHub Actions”-kilde i Pages-menuen — det undgår 404 og miljø-godkendelse).

1. **Settings** → **Actions** → **General** → **Workflow permissions** → vælg **Read and write permissions** → **Save**. Uden dette kan workflow’en ikke pushe til `gh-pages`.
2. Push til `main` (eller kør workflow manuelt): **Actions** → **Publish GitHub Pages** → **Run workflow**. Vent til den er **grøn** — så findes branchen `gh-pages` med dit `docs/`-indhold. Tjek under **Code** → branch-dropdown at **`gh-pages`** findes og at **`index.html`** ligger i roden af den branch.
3. **Settings** → **Pages** → **Build and deployment** → **Source**: vælg **Deploy from a branch** (ikke “GitHub Actions”).
4. Branch: **gh-pages**, mappe: **/** (rod) → **Save**.
5. Vent et minut og genindlæs din `github.io`-URL (fx linket øverst i dette afsnit).

### Fejlsøgning (GitHub Pages)

- **404 “There isn’t a GitHub Pages site here”**: (1) Repo **skal typisk være public** på gratis GitHub — se den **vigtigste** note ovenfor. (2) Under **Code** skal branchen **`gh-pages`** findes; findes den ikke, er workflow ikke kørt grønt eller **Read and write** er ikke slået til. (3) Under **Settings → Pages** skal **Source** være **Deploy from a branch** → **gh-pages** → **/** — ellers viser GitHub stadig 404.
- **Workflow fejler på push**: **Workflow permissions** skal være **Read and write** (se trin 1 ovenfor).
- **Fork / andet repo-navn**: Opdatér `<base href="...">` i `docs/index.html` og `docs/404.html`, så stien matcher dit repo (fx `/mit-repo-navn/`).

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


