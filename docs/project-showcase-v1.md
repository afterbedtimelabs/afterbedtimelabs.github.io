# Project showcase V1 — review notes

Five short introductions reuse the existing Writing collection and project pages. Mission Control leads the homepage in a larger featured card, followed by Midnight Chiba, Dungeon Deckbuilder, NightStock, and Riku. The nine game captures and their introductory articles are preserved. Existing project URLs, navigation, and Navi information/privacy pages remain available. Tinker Panda artwork and PR #3 are outside this change.

## Evidence and capture scope

Reviewed October 19, 2026. Project READMEs were cross-checked against implementation, assets, and the runtime captures below. No game/application source, configuration, art, or handling was changed for this showcase. Runtime capture scripts write their normal local outputs; their source is not included in this public website repository.

| Project | Evidence inspected | Result |
| --- | --- | --- |
| Midnight Chiba | Current main scene, player/interactions, environment meshes/materials/audio, V8.2 capture script and inherited grounded-camera support | Current V8.2 world rendered successfully. Selected store, shrine, and rice-field road. The roughly 10–20 minute estimate is the project's stated playthrough target, not a newly timed playthrough. |
| Dungeon Deckbuilder | Current friend-demo scene/controller, six class catalogs, equipment progression rules, pixel-art assets, UI capture routine | Current six-class version selected over the older Knight-only copy. Real opening hands and class selection rendered. Existing capture test passed 2,112 bounds checks. No complete manual playthrough or new balance claim. |
| NightStock | Main scene, rigid-body truck/suspension, independent cargo bodies, walking/loading code, runtime course geometry and visual review | Fresh loading, bump-lane drive, and open-tailgate captures. These use the existing scripted visual review, not a human driving session. This is the V0 physics playground; no finished delivery missions are claimed. |
| Riku | Desktop UI/controller/backend, memory and optional voice implementation inspected during the original showcase investigation | Desktop companion; Navi is the internal name. Visual identity is still evolving. No live companion UI or character capture attempted in this revision. Existing abstract illustration retained and labeled. |
| Mission Control | Current dashboard HTML/CSS/JS, HTTP host, ControlPlane, shared ServiceManager, EventMonitor/EventBuffer, hardware sampling, redacted output reader, runtime diagnostics, README and repository history | Working service dashboard with uptime/resource metrics, registered start/stop/restart controls, bounded activity feed, sustained alerts and output logs. Actual UI launched with isolated sample providers; restart, timeline, warning and output views verified. |

Riku is the public desktop companion name. Navi remains in technical/privacy pages and in the unmodified Mission Control UI. Waypoint is a separate Minecraft companion, deferred to a future introduction rather than sharing Riku's card/article. `/projects/riku/`, `/navi/`, and `/navi/privacy/` are preserved. The old `/writing/meet-navi-waypoint/` URL has an Astro static redirect to `/writing/meet-riku/`, with a fallback link; it is omitted from RSS and the sitemap. The October 17 introduction remains unchanged.

Mission Control's inspected local tree is identical to current upstream commit `8d53ec48da506ccacaf4e1641a8fa70c42766e9d` (checked October 19). The local branch has the equivalent pre-squash commit `13c31f4`. Repository history shows the earlier combined Discord/PC-monitor host and subsequent Mission Control/shared-events additions. No PC Guardian integration was found in the current application, so no PC Guardian claim or capture is included. Host-health monitoring is not presented as PC Guardian.

## Screenshot provenance

All nine game screenshots were freshly generated from existing local code on October 19. The source PNGs are 1280 × 720. Nothing was painted, composited, retouched, brightened, or replaced. Web copies use WebP quality 90 at 1280 and 640 pixels wide; metadata is stripped. These eighteen files remain byte-for-byte unchanged in the final revision. Original image hashes and output byte sizes are recorded in `public/images/projects/showcase/provenance.json`.

| Website filename (without `.webp`) | Existing source capture routine | Generated source filename |
| --- | --- | --- |
| `chiba-store` | V8.2 grounded viewpoint review | `11_warm_conbini_island.png` |
| `chiba-shrine` | V8.1 grounded viewpoint review, run against current V8.2 world | `12_shrine_isolated_anchor.png` |
| `chiba-fields` | V8.2 grounded viewpoint review | `12_exposed_paddy_causeway.png` |
| `deck-mage` | Friend-demo UI capture | `mage-combat.png` |
| `deck-classes` | Friend-demo UI capture | `selection.png` |
| `deck-summoner` | Friend-demo UI capture | `summoner-combat.png` |
| `nightstock-loaded` | Existing visual-review script | `01-loading.png` |
| `nightstock-bumps` | Existing visual-review script | `05-driving-bumps.png` |
| `nightstock-tailgate` | Existing visual-review script | `04-recovery.png` |

Camera/test staging is disclosed in each article. Chiba's script places and settles the real player capsule at existing viewpoints. Dungeon captures use the real opening hands before the test's later artificial full-hand cases; none of those full-hand cases are published. NightStock's routine positions the camera/player and applies throttle to the real physics simulation. Its stock HUD contains FPS/wheel/cargo counters; no clean HUD toggle exists in the inspected UI, so the counters remain. Help and tuning panels are closed. The simple test course is the current implemented environment, not a substitute for a more complete scene.

The older PNG assets and their provenance in `project-assets.md` are preserved. New cards use the optimized fresh captures.

### Mission Control demo captures

Three genuine browser screenshots use the real application server and unchanged UI. A temporary, isolated bootstrap injects in-memory service, hardware, and runtime providers into the existing ControlPlane. It does not use the production entry point, load `.env`, create a real ServiceManager, start real services, contact providers, or open production databases/logs. The host is loopback-only on a separate port, with normal authentication and a disposable sample-only credential. No credential appears in the captures or repository.

All service states, uptime, resource readings, provider statuses, events and output are sample data. A simulated service restart exercises the real action queue and shared event pipeline; the staged warning demonstrates rendering, not an actual host incident. This verifies the UI with fixtures, not live Discord, model inference or production process ownership. The temporary bootstrap is not copied into the public repository.

| Capture | What it shows |
| --- | --- |
| `mission-overview` | Service totals, resource summary and internal host/provider status; visible DEMO / SAMPLE DATA notice |
| `mission-activity` | Sample fleet cards, recent activity, active-alert count and a staged warning |
| `mission-output` | Service inspector's Output tab showing five harmless sample log lines |

The browser produced 1265 × 712 JPEGs (approximately 16:9). WebP copies preserve that size without upscaling, plus 640-pixel responsive variants, at quality 90. Captions and alt text identify the isolated demo; screenshot content includes sample-data labels. No application markup, styling, source, production data, or real-service state was altered for capture. Only resizing and compression were applied to the images.

## Capture gaps and privacy

- Existing in-engine capture routines supplied the game images after native-window capture was unavailable in the original investigation.
- Riku character/chat screenshots are deliberately deferred at the owner's request. No attempt was made to access those windows in this revision. The retained abstract illustration is labeled as illustrative.
- Waypoint gameplay and PC Guardian are not shown. Waypoint is deferred; PC Guardian is not integrated in the inspected version.
- Mission Control's optional memory/financial integrations remain disconnected in the isolated demo. There are no real messages, financial records, user identifiers, private IPs or logs in the images.

## Owner review before merge

Review the Mission Control emphasis, casual first-person wording and clearly labeled sample-data captures. The existing dark Chiba images and early NightStock presentation remain intentional. Riku character screenshots are not a merge prerequisite. No merge or deployment is authorized by this PR.

## Website verification

- Clean `npm ci`: 285 packages installed from the existing lockfile, zero reported vulnerabilities. No dependencies or lockfile changed. The restricted shell blocked installation/build subprocesses initially; the authorized normal-shell run succeeded.
- `npm run validate`: passed for the final revision. Astro checked 29 files with zero errors, warnings or hints. Production output contains 24 HTML documents including the legacy redirect. Verification passed metadata, internal links/fragments, responsive assets, sitemap, RSS, robots, and exclusion of the existing draft.
- The verifier checks all five introduction routes/card links, homepage project priority, three captioned captures per game and Mission Control, sample-data disclosure, work-in-progress labels, and the companion redirect/fallback.
- Production preview: 48 layout checks across the six changed home/index/detail/article pages at 320, 390, 768 and 1440 pixels, in light and dark themes. No horizontal overflow; visible images loaded. Desktop feature, mobile card and article captions visually reviewed. Legacy URL redirect and full-size image links exercised successfully.
- Mission Control's existing dashboard and shared-events test suites: 100 tests passed against isolated fixtures. These cover authentication, state projection, service dispatch, logs, event retention and alert transitions without using production integrations.
- Nine 16:9 source captures became eighteen responsive WebP files totaling 546,400 bytes (about 534 KiB), versus 2,811,691 bytes of source PNGs. Dimensions and absence of EXIF/XMP/IPTC metadata checked. Image transformations are resizing and compression only.
- Mission Control adds six responsive WebP files totaling 173,772 bytes (about 170 KiB), with provenance hashes, native dimensions, alt text, full-size links and sample-data captions. No embedded EXIF/XMP/IPTC metadata.
- `git diff --check` passed. The four source repositories plus Waypoint have no tracked changes from this work. Deployment workflows, branding/mascot assets, Navi policy source, prior articles, and the existing recovery directory are untouched.
