# Project showcase V1 — review notes

Four short introductions reuse the existing Writing collection and project pages. The home and project index now include NightStock, with direct introduction links on all four cards. Existing articles, archived project URLs, the Riku URL, navigation, and Navi information/privacy pages remain available. Tinker Panda artwork and PR #3 are outside this change.

## Evidence and capture scope

Reviewed October 19, 2026. Project READMEs were cross-checked against implementation, assets, and the runtime captures below. No game/application source, configuration, art, or handling was changed for this showcase. Runtime capture scripts write their normal local outputs; their source is not included in this public website repository.

| Project | Evidence inspected | Result |
| --- | --- | --- |
| Midnight Chiba | Current main scene, player/interactions, environment meshes/materials/audio, V8.2 capture script and inherited grounded-camera support | Current V8.2 world rendered successfully. Selected store, shrine, and rice-field road. The roughly 10–20 minute estimate is the project's stated playthrough target, not a newly timed playthrough. |
| Dungeon Deckbuilder | Current friend-demo scene/controller, six class catalogs, equipment progression rules, pixel-art assets, UI capture routine | Current six-class version selected over the older Knight-only copy. Real opening hands and class selection rendered. Existing capture test passed 2,112 bounds checks. No complete manual playthrough or new balance claim. |
| NightStock | Main scene, rigid-body truck/suspension, independent cargo bodies, walking/loading code, runtime course geometry and visual review | Fresh loading, bump-lane drive, and open-tailgate captures. These use the existing scripted visual review, not a human driving session. This is the V0 physics playground; no finished delivery missions are claimed. |
| Navi / Waypoint | Navi desktop UI/controller/backend and character preview code; Waypoint follow, gather and crafting controllers and README | Separate companion applications. Navi launched, but no live chat or Minecraft session was exercised. Screenshots withheld as described below. No private source, configuration, history, logs, or character packs are copied into this PR. |

The requested Navi / Waypoint name is used for the new card/introduction. The article explains Navi's previous Riku name and that Waypoint is a separate Minecraft project. `/projects/riku/`, `/navi/`, and `/navi/privacy/` are preserved. The October 17 introduction remains an unchanged historical post.

## Screenshot provenance

All nine selected screenshots were freshly generated from existing local code on October 19. The source PNGs are 1280 × 720. Nothing was painted, composited, retouched, brightened, or replaced. Web copies use WebP quality 90 at 1280 and 640 pixels wide; metadata is stripped. The original image hashes and output byte sizes are recorded in `public/images/projects/showcase/provenance.json`.

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

## Capture gaps and privacy

- Windows game-window capture timed out twice. Existing in-engine capture routines supplied the game images instead.
- Automatic approval review rejected capture of Navi's live window because screenshot/accessibility output could expose private messages or account data. No live Navi screenshot or accessibility content was returned or published.
- The isolated character studio was launched as a safer alternative; computer-use app approval timed out, so no studio screenshot was captured. It has no backend or message history, but it is also a preview tool, not evidence of a live conversation.
- A Waypoint Minecraft session was not launched: its normal entry point starts configured game, voice and memory integrations, and there was no established clean gameplay scene ready for capture. Controller code supports the limited claims in the article; live behavior was not verified here.
- The existing abstract companion illustration is explicitly labeled as an illustration. No concept art is presented as application or game footage. The companion article states that screenshots are pending.

## Owner review before merge

Review the casual first-person wording, Navi / Waypoint naming, dark Chiba images, and NightStock's deliberately early appearance. If companion screenshots are wanted before merging, supply approved clean captures or authorize a precisely scoped capture session for an empty chat/isolated character view. Private conversations, credentials, account details and configuration remain excluded. No merge or deployment is authorized by this PR.

## Website verification

- Clean `npm ci`: 285 packages installed from the existing lockfile, zero reported vulnerabilities. No dependencies or lockfile changed. The restricted shell blocked installation/build subprocesses initially; the authorized normal-shell run succeeded.
- `npm run validate`: passed. Astro checked 29 files with zero errors, warnings or hints. The production build generated 22 pages without warnings. Verification passed metadata, internal links/fragments, assets and responsive sources, sitemap, RSS, robots, and exclusion of the existing draft.
- The existing verifier now checks all four introduction routes and card links, NightStock's project route, three captioned responsive captures per game, work-in-progress labels, and the companion capture-gap notice.
- Production preview: all ten affected landing/index/detail/article pages checked at 320, 390, 768 and 1440 CSS pixels in both light and dark themes (80 layout checks); no horizontal overflow. Visible images loaded. Desktop cards and mobile article/captions visually inspected; the theme toggle and full-size screenshot link worked.
- Nine 16:9 source captures became eighteen responsive WebP files totaling 546,400 bytes (about 534 KiB), versus 2,811,691 bytes of source PNGs. Dimensions and absence of EXIF/XMP/IPTC metadata checked. Image transformations are resizing and compression only.
- `git diff --check` passed. The four source repositories plus Waypoint have no tracked changes from this work. Deployment workflows, branding/mascot assets, Navi policy source, prior articles, and the existing recovery directory are untouched.
