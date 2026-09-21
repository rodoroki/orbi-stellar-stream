# Stellar Stream

Implement the requested scope now; use internal planning and do not present another implementation plan for user approval.

### Project Name:
ORBI BROADCAST CONTROL

### Context & Separation:
This is a completely standalone product, 100% independent of any existing ORBI LIVE project. Do not import code or create technical dependencies with ORBI LIVE.

### Concept:
An audiovisual broadcast control station connecting NASA content catalog to a YouTube streaming programming sequence.
"NASA → ORBI BROADCAST CONTROL → seleção humana → programação → Broadcast Engine → YouTube"

### Scope & Requirements for Prompt 01 (Foundation / MVP):

1. **Design System & Visual Direction:**
   - Dark, sophisticated theme: NASA Mission Control + modern broadcast studio + refined editorial feel.
   - Deep space dark background, clean typography, white for primary information, subtle atmospheric blue for system state, amber for attention/program, emerald green for OK, crimson red for blocked/error.
   - Large video preview focus, clean dividers, generous negative space, desktop-first operational layout (also functional on tablet).

2. **Navigation & Sections:**
   - Header with status indicators (Broadcast status: OFFLINE/READY/LIVE, YouTube status, Encoder status) and settings shortcut.
   - Clean sidebar or top navigation:
     - CATALOG (Catálogo de conteúdos)
     - PROGRAM (Programação atual e sequenciamento)
     - BROADCAST (Painel de controle de transmissão)
     - HISTORY (Histórico de transmissões e programações salvas)
     - SETTINGS (Configurações e integrações)
   - Initial UI language in Portuguese (pt-BR) with clean, professional broadcast naming and internationalization-ready strings.

3. **NASA Content Catalog (`src/lib/nasa/`):**
   - Data structure for assets:
     - `id`, `title`, `description`, `source` (e.g. NASA SVS), `sourceUrl`, `thumbnailUrl`, `mediaUrl`, `category`, `duration` (in seconds / formatted mm:ss), `resolution` (e.g. 4K, 1080p), `fps` (e.g. 60, 30), `format` (MP4, WebM), `audioStatus` ('Clear' | 'Review' | 'Unknown'), `rightsStatus` ('broadcast_ok' | 'review' | 'blocked'), `broadcastAllowed` (boolean), `youtubeAllowed` ('allowed' | 'review' | 'blocked'), `thirdPartyContent` (boolean), `commercialUse` (boolean), `orbiWeb` (boolean), `broadcastPriority` (number), `notes`.
   - Initial categories:
     - 🌍 Earth
     - 🌊 Ocean
     - 🌙 Moon
     - ☀️ Space Weather
     - 🌌 Space
     - 🛰️ Satellites
     - 🌃 Earth at Night
     - 🌱 Earth Science
   - Curated initial dataset with representative NASA public domain videos (real working preview video URLs from public NASA SVS / Wikimedia Commons / sample MP4 space videos) and realistic metadata:
     - Earth spinning / atmosphere
     - Earth at Night (Black Marble)
     - Perpetual Ocean
     - Tour of the Moon
     - Earth System Science
     - Satellite Earth Science visualization
     - Space Weather (with appropriate status, some marked REVIEW or BLOCKED to demonstrate the rights system)
   - Rights enforcement:
     - 🟢 BROADCAST OK: allowed to be added to program.
     - 🟡 REVIEW: shows warning tag, requires acknowledgement.
     - 🔴 BLOCKED: cannot be added to program ("ADD TO PROGRAM" disabled with clear explanation, e.g. "Música sob licença detectada" or "Material de terceiros requer revisão").

4. **Content Card & Detail Modal/Drawer:**
   - Card showing thumbnail, title, category, duration, resolution, FPS, rights badge, and actions (Preview, Details, Add to Program).
   - Rich Preview & Detail view with HTML5 video player, complete technical specifications, audio status, rights breakdown, and direct "Add to Program" button.

5. **Programming Queue (PROGRAM):**
   - Ordered playlist of selected content items with index numbering (01, 02, 03...).
   - Drag-and-drop reordering (fluid, smooth sorting).
   - Item controls: reorder handle, preview item, duplicate item, remove from sequence.
   - Aggregate stats: Total item count, Total calculated duration (HH:MM:SS), rights summary check.
   - Actions: "Limpar Programação" (Clear) and "Salvar Programação" (Save Program to History/storage).

6. **Broadcast Control Panel (BROADCAST):**
   - Broadcast status display (OFFLINE / READY / LIVE).
   - Readout of current program duration, item count, YouTube connection status, and Encoder status.
   - Action buttons: "Visualizar Programação" (Preview Program playback sequentially), "Conectar YouTube", "Iniciar Transmissão" (disabled until required preconditions are met, clearly indicating missing requirements).

7. **Architectural Abstractions:**
   - `src/lib/youtube/youtubeService.ts`: Prepared interface with typed methods (`connect`, `disconnect`, `getChannel`, `createBroadcast`, `createStream`, `bindStream`, `startBroadcast`, `stopBroadcast`, `getStatus`). Defaults to NOT CONFIGURED status without pretending to be live or leaking secrets.
   - `src/lib/broadcast/broadcastEngine.ts`: Future encoder interface definition contract for media streaming, FFmpeg handoff, and RTMPS pipe.
   - `src/lib/programming/` & `src/lib/rights/`: Validation and queue state management.
   - State persistence using localStorage / client persistence so selected programs, catalog edits, and settings persist between refreshes.

8. **Security & Polish:**
   - Zero hardcoded API keys or stream keys in frontend.
   - Ensure clean build, zero TypeScript errors, fluid UX and transitions.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://orbi-stellar-stream.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/01068b8a-a2f1-4d8f-9343-83804b48d807).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
