# Tinker Panda 2.1 production assets

Candidate **B was approved by the owner on 2026-10-17** as the canonical
facial base. The front master is copied byte-for-byte from that approved PNG.
No polish change to the approved face was needed after inspecting 1x/4x/8x.
Derived side/portrait/expression/animation artwork is ready for visual review.
Approval of B is recorded separately from approval of these derived assets.

## Review and exports

- `public/mascot/tinker-panda-v2.1/front.png`: approved B master, transparent 64x64.
- `side.png`, `back.png`, `portrait.png`: matching native 64x64 views.
- `expressions/`: neutral, happy, blink, curious, sleepy, all 64x64.
- `frames/`: 14 transparent 64x64 PNGs, with fixed 64px cell origin.
- `atlases/`: expressions 320x64, views 256x64, idle 128x64, and blink/happy/tail 256x64.
- `previews/`: each animation at 64x64, 256x256 and 512x512, transparent GIF.
- `manifest.json`: explicit hexadecimal palette, approval, dimensions, timings and paths.

Open `docs/mascot-v2.1/review.html` after extracting the whole package. It shows
all four GIF loops at selectable 1x/4x/8x on light/dark backgrounds, with pause
and reduced-motion support. This is an offline asset inspector, not an Astro
page or website integration. During recovery, browser checks covered all four
loops, 1x/4x/8x sizing, light/dark backgrounds and pause/resume. Reduced-motion
handling was source-reviewed; OS preference changes were not exercised. The
GIFs were also decoded and validated independently at all three scales.

`production-review.png` shows expressions and views at 4x. The nine
`*-scales.png` boards show every master and expression at 1x/4x/8x against
both light and dark. View those files at 100% zoom for their stated display
sizes. `animation-frames.png` shows each animation frame and duration at 4x.
Labels may use font smoothing; every sprite enlargement is nearest-neighbor.

## Preserved identity and authored variations

The front silhouette, rounded attached ears, body proportions, charcoal hoodie,
teal drawstrings, utility pouch, crescent-over-bed emblem, three-band tail and
teal bow match the approved B PNG. Front neutral retains B's open, welcoming
smile. The entire original back view is unchanged; side and portrait keep their
external silhouettes, clothing and accessories, with matching B-style eyes
and localized cream/peach facial shading.

Expressions modify only the two 10x11 eye regions and the 6x4 mouth region:
happy uses upward-curving closed eyes and B's smile; blink uses relaxed closed
lids and B's smile; curious keeps round amber eyes with a sideways gaze and
small O mouth; sleepy has lowered rounded lids and a small closed smile.
Nose, cheek markings, head outline and bow never move between expressions.
The side eye and portrait eyes are separately authored at their native sizes;
neither was made by resizing the full-body eye.

## Animation timings

| Action | Frames | Durations (ms) | Loop | Intended motion |
| --- | ---: | --- | ---: | --- |
| Idle | 2 | 1200, 1200 | 2400 ms | One-pixel rigid head lift with collar/drawstring change; feet stay fixed. |
| Blink | 4 | 2800, 80, 120, 80 | 3080 ms | Open, half, closed, half; only eye pixels change. |
| Happy bounce | 4 | 500, 120, 160, 120 | 900 ms | Rigid offsets y=0,-1,-3,-1; no part deforms. |
| Tail sway | 4 | 280, 280, 280, 280 | 1120 ms | Distal tail moves y=0,+1,0,-1; head, body and attachment stay fixed. |

Each source frame uses the same 64px origin and logical ground anchor (32,60).
The bounce intentionally leaves that anchor by an integer vertical offset.
No subpixel shifts, random motion, palette tweening or cumulative transforms
are used. GIF transparency/disposal is checked to prevent trails and ghosts.

## Reproduction

Use Python 3.10+ and Pillow 12.3.0, plus Node dependencies from the repository
lockfile. Run from the repository root:

```powershell
python -m pip install -r art/tinker-panda/requirements.txt
python scripts/generate-tinker-panda-v2-1.py
node scripts/validate-tinker-panda-v2-1.mjs
```

The production generator imports the existing V2 body/ear/accessory geometry
from `scripts/generate-tinker-panda.py` and the authored candidate-face grids
from `art/tinker-panda-v2.1/generate.py`. Importing them does not run their
exporters. The frozen 64px `previous.png`, candidate B, palette and dedicated
validation baselines are included. The rejected 48px prototype is not used.
The production command writes only the new V2.1 assets and review documents.

Every eye/mouth grid character is one source pixel. Edit the grids to extend
expressions and preserve the shared anchors. Change the approved B master
only through an explicit future design approval, then update its pinned hash.
To add an action, declare integer transforms and frame durations in
`sequences()`, document its allowed moving regions and extend the validator.

## Palette: 19 opaque colors plus transparent index 0

| Name | Hex | Name | Hex |
| --- | --- | --- | --- |
| outline | #392B2A | furShadow | #B64F30 |
| fur | #E47A3E | furLight | #F5A45A |
| creamShadow | #E7C69A | cream | #FFF0CB |
| ear | #A75B46 | cheek | #E99B77 |
| hoodShadow | #282D32 | hood | #3C4348 |
| hoodLight | #535D60 | tealShadow | #367A79 |
| teal | #79C5B6 | amber | #E5A044 |
| eyeLight | #FFD584 | leather | #815236 |
| leatherLight | #B67C48 | gold | #E9BA62 |
| highlight | #FFF9EB | | |

## Validation and remaining review

`validation.json` records dimensions and hashes. Validation passes for 29 PNGs,
14 source animation frames and 12 GIFs. It checks binary alpha, palette,
all atlas cells, expression isolation, B's exact master hash, unchanged body,
bow and view silhouettes, rigid idle/bounce motion, fixed tail attachment,
connected front ears, transparent animation margins, frame counts/timings,
every decoded GIF pixel, and light/dark static previews at all three scales.
Repeated generation is byte-identical. Alignment checks total 57,344 source
pixel comparisons, in addition to GIF/preview checks.

The deliberate 1px/3px movements are the only allowed alignment changes;
there is no detected unplanned drift under those checks. Visual timing and
the new side/portrait/expression artwork still require owner review. The
recovered inspector was checked in the browser. The full site validation
(`npm run validate`) passes: zero Astro diagnostics, successful production
build, and all 16 HTML pages verified. No website integration, homepage,
favicon, privacy or OAuth content was changed. Nothing was merged or deployed.
