# Night Workshop V1.1 — editable artwork and animation

This is an owner-review candidate. Tinker Panda is the lab's fictional resident mascot, separate from Isaac. The owner-reviewed V1 seated artwork is the canonical visual reference for this action; the original scene and approved mascot sprite are unchanged.

## Rebuild

From this worktree, with its existing Node/Sharp installation:

```powershell
node scripts/assemble-night-environment.mjs
node scripts/assemble-night-typing.mjs
node scripts/verify-night-typing.mjs
```

The scripts use local source files only. Regeneration does not call an image service. No Aseprite installation was available; this package is a layered PNG/mask/timing source, **not an Aseprite file**. Node, Sharp, and FFmpeg were available. The built-in image generator supplied three source studies; no API/CLI image-generation fallback was used.

## Source organization

| File or directory | Role |
| --- | --- |
| `environment/` | Generated night plate, registered source, exact glass selection, steam-removal masks, reconstructed sill, full assembled PNG, and environment instructions |
| `source/typing-reference.png` | Exact 300×170 crop of V1 at scene coordinate (890,575) |
| `source/typing-reference-4x.png` | Nearest-neighbor enlarged canonical crop supplied to generation |
| `source/clean-paws-generated.png` | Generated background reconstruction source; only revealed paw footprints are used |
| `source/contact-study-generated.png` | Unapproved generated contact study; **not used at runtime** because it changed the proportions and texture too much |
| `layers/near-paw-original.png`, `far-paw-original.png` | Registered original paw/forearm pixels on transparency |
| `layers/near-mask.png`, `far-mask.png` | Editable selection outputs; authoritative polygon coordinates are in the assembly script and mirrored in timing data |
| `layers/clean-background.png` | Local reconstructed background, with a bounded dark cast-shadow cleanup under the near wrist |
| `layers/keyboard-laptop-foreground.png` | Original foreground restored last in assembly |
| `frames/` | Seven lossless 300×170 crop cels, including the exact original resting cel |
| `frames-full/` | Registered full-scene PNG exports for direct inspection |
| `typing-atlas.png` | Seven crop cels in one horizontal strip; runtime uses a lossless WebP export |
| `timing.json` | Pose names, coordinates, durations, quiet-hold range, and source selection polygons |
| `review.html` | Offline source playback and frame inspection; open in a browser |
| `typing-motion-study.gif` | Separate source-crop motion study; not a browser recording or owner-approved artwork |

## How the action is authored

The original image flattens paws, forearms, clothing, keyboard, laptop, and desk together. The two paw/forearm selections are extracted once from that drawing. Small generated clean-plate areas fill the pixels exposed when a fingertip lifts. A narrow under-wrist shadow is cleaned with the original outline palette. Original keyboard and laptop foreground pixels are restored last.

`scripts/assemble-night-typing.mjs` is the editable assembly source. Edit its `polygons`, `poses`, `displacement()` and `burst` values to change the selections, fingertip articulation, and timing. The mapping pins the proximal cuff and concentrates movement at a distal finger lobe; a smaller wrist response coordinates the action. Nearest-neighbor sampling keeps moving pixel clusters from interpolating into smooth new colors. These are locally articulated raster cels, not independently regenerated characters. The generated contact study guided inspection but was rejected as a production source.

The seven poses are rest, near lift, near contact, near release, far lift, far contact, and settle. A burst lasts 1.36 seconds, followed by a randomized 6.8–9.2-second resting hold. The existing eye-only blink remains independent. The canvas paints only the 300×170 registered crop. At rest, on Pause motion, reduced motion, viewport exit, page hiding, or failed atlas loading, the complete resting illustration is shown. There is no continuous JavaScript rendering loop during holds.

For a manual bitmap edit, edit the layer or frame PNG in a pixel editor and inspect it in `review.html`. To keep that edit reproducible, incorporate it as an explicit source layer in the assembly script before rebuilding: the assembly regenerates its layer, mask, frame, atlas, and timing outputs. Do not silently edit only the runtime WebP.

`docs/night-workshop-v1-1/animation-pixel-checks.json` records direct pixel comparisons. Pixels outside the explicit motion region must remain identical; this establishes registration, not artistic quality. Assess contact, rhythm, and seams in the actual 40-second browser recording as well as the individual cels.

## Artistic limits and review status

This is restrained fingertip/paw articulation with a small wrist response, not a new fully hand-drawn character rig. It does not move the head, body, scarf, tail, chair, camera, or laptop. The small action is easiest to judge in expanded desktop mode; no mobile redesign was attempted. The source includes the best isolated motion study for comparison. Owner approval of the new lighting and typing remains pending.

The environment preserves a few very dim stationary marks in narrow glass-edge transition bands. The conspicuous long rain streaks and large steam ribbon were removed. The new rain is clipped by the same glass/foreground selection, and the small stepped steam starts at the mug rim.

Exact source-generation prompts are recorded in `generation-prompts.json`.
