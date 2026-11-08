# Ambient Homepage V1 artwork

New scene and animation cels for owner review, created 2026-11-08 with the built-in `image_gen` tool. No paid API, downloaded stock art, or external concept image was used. The rainy-workshop concept attachment was not available in this task; the supplied written direction and approved local Tinker asset guided this work.

The canonical reference is `public/mascot/tinker-panda-v3.4/front.png` from approved release `8d792a4af95c17e7d697b223228bc4d9300bd4f2`. It was inspected before generation and used as the character reference. This source and all canonical V3.4 artwork remain unchanged. These new images are candidate interpretations, not newly approved canonical assets.

## Files and production use

| File | Dimensions | Purpose |
| --- | --- | --- |
| `art/ambient-v1/rainy-workshop-v1.png` | 1659 × 948 | Original generated full scene |
| `art/ambient-v1/rainy-workshop-blink-v1.png` | 1659 × 948 | Generated closed-eye animation cel |
| `art/ambient-v1/rainy-workshop-typing-v1.png` | 1660 × 948 | Exploratory tiny finger adjustment cel |
| `public/images/ambient/rainy-workshop-v1.webp` | 1659 × 948 | Lossless production scene |
| `public/images/ambient/rainy-workshop-blink-v1.webp` | 1659 × 948 | Lossless eye-overlay source |
| `art/ambient-v1/rainy-workshop-typing-v1.webp` | 1660 × 948 | Archived exploratory cel; not shipped or enabled |

Production WebPs were converted with the already installed Sharp library using `webp({ lossless: true, effort: 6 })`; no image resizing, drawing, or palette changes were applied. Keep source PNGs out of the public bundle. No new dependencies were required.

The scene leaves roughly the left 30% quiet for real HTML text. Tinker's face is around (60%, 50%), the lamp (85%, 43%), and the mug (82%, 69%). The rainy window spans approximately x=49–91%, y=4–61%. A mobile crop around x=35–100% retains the tail and lamp; narrower crops should prioritize the face, lamp, and window.

The implemented blink uses an organic SVG clip around the two eyes, never a full-scene replacement: generation introduces minor differences elsewhere. Its actual browser capture was inspected and showed natural eyelids without visible seams. The alternate paw cel changes sleeve and keyboard details as well as fingers, so it is archived outside the public bundle and is not used. There are no authored ear, tail, or glance animation cels in this release. No actions are simulated by stretching the flat scene.

## Exact generation prompts

### Base scene

> Use case: stylized-concept. Asset type: original landscape background illustration for After Bedtime Labs ambient homepage, 1792x1024 or 2048x1152 wide. Input image 1 is the approved canonical Tinker Panda character reference; faithfully preserve his design in a NEW seated three-quarter pose. Primary request: detailed deliberate pixel art with clean chunky pixel clusters and silhouettes, balanced with soft cinematic lighting like a cozy illustrated anime study background. A warmly lit personal workshop at night, wooden desk beside large rain-speckled window overlooking a quiet Japanese-inspired urban neighborhood with blue-gray violet buildings, subdued windows, reflected wet street light. Tinker sits at the desk, orange/cream red-panda markings, white eyebrows/cheeks, expressive big eyes, teal scarf, dark charcoal outfit, original small compact proportions, large cream-and-orange ringed tail visible curling to side. His face is readable in a natural three-quarter view, looking gently toward computer while partly toward viewer. Include computer, keyboard, notebook, cream mug with subtle steam, small electronics circuit project and steady warm amber desk lamp. Restrained lived-in clutter; warm wood and amber inside, muted blue/violet outside. Composition: LEFT 28-32 percent quiet dark brown wall with subdued texture, suitable for HTML intro text overlay; all important scene action grouped on RIGHT two thirds. Tinker face centered at approximately x=64%, y=48%; body below. Warm desk lamp at x=82%, y=44%. Large rainy window behind Tinker and lamp spanning x=46%-96%, y=10%-65%. Mug around x=78%, y=65%. Desk spans lower right. Camera wide, cozy and cinematic, carefully composed. Entire important Tinker, lamp and window stay within central-right crop x=43%-95% for mobile. Pixel art rendering consistent across panda furniture scenery; not smooth vector, not 3D, not photoreal. No text, lettering, logo, UI or watermark. Preserve canonical Tinker identity and facial proportions closely; do not substitute generic unrelated red panda. This is new candidate art for owner review, do not alter original reference.

### Blink cel

> Use case: precise-object-edit. The input is a completed original pixel-art rainy workshop background. Create exactly the same full frame at exactly the same 1659x948 dimensions and identical framing, palette, details, geometry. Change ONLY Tinker Panda's two eyes from open to gently fully CLOSED for a single blink animation frame. The eyes are on his orange-and-cream face centered around x=61%, y=51% of whole image. Replace each eye with a small softly curved dark closed eyelid line and matching cream eyelid area, keeping the surrounding face, eyebrows, cheek fur, smile, ears, head outline, scarf, body, paws and desk untouched. The closed eyes should look relaxed and natural. Keep the face geometry absolutely identical; no expression change beyond eyelids, no moving eyebrows or cheeks, no new smile. Do not redraw or shift any other part of scene. Output same complete opaque frame with exact full image bounds, no text or labels.

### Exploratory typing cel

> Use case: precise-object-edit. Input is completed original pixel-art rainy workshop scene 1659x948. Create exactly same full frame and framing with all original pixels and geometry held stable except a tiny typing hand movement. Keep eyes OPEN, head face and expression exactly as source. ONLY change the fingers of Tinker Panda's nearer dark-gloved paw resting just above laptop keyboard at x=60%, y=71% (approximately x=990,y=672): slightly raise the two middle fingertips by 5 pixels while retaining the same wrist, forearm, outfit and silhouette envelope. The farther paw at x=67%,y=68% may lower its fingertips by 3 pixels onto keyboard. This is a subtle alternating typing animation cel; no whole body pose changes, no shaking, no moving head, no changing desk, chair, clothes, tail, laptop, screen, lamp, rain, window or camera. Exact same 1659x948 full opaque scene. No labels or text. Small discrete finger articulation only; preserve original pixels everywhere else as much as possible.

## Owner review

Judge the new seated interpretation against the canonical design: especially eye size, cheek markings, expression, scarf, dark clothing, and body proportions. Review the scene's pixel crispness, warmth, and mobile crop in the actual browser. The static artwork was visually inspected during creation; generated images are not browser-test evidence. Browser evidence and implemented animation status belong in the implementation report.
