# Kaerimichi historical register

The version 1 interchange document is UTF-8 JSON. The published snapshot lives in `src/data/kaerimichi/register.json`. TypeScript interfaces and executable validation rules live in `src/lib/kaerimichi/register.ts`. An import replaces the complete working snapshot. Array order is the sequence used by the walking journal. Geographic routing data has separate provenance.

## Fields

| Field | Type and meaning |
| --- | --- |
| `schemaVersion` | Integer 1. Importers reject unfamiliar versions and fields so a round trip cannot silently discard data. |
| `landmarks` | Nonempty array. Each record has a unique stable `id` using letters, digits, hyphens, underscores or dots. Use this identifier to join atlas records to external project data. |
| `nameJa`, `nameEn` | Display names in Japanese and English or romanization. |
| `category`, `description` | Category and plain-text introduction. |
| `location` | Object with `coordinates`, `confidence`, `note` and `sourceIds`. Coordinates use WGS84 decimal degrees in **longitude, latitude** order. An unresolved location uses `null` and `UNKNOWN`. Explain precision, such as a shop entrance or an address representative point, in the note. Each located point cites supporting evidence. |
| `sources` | Record-local bibliography. A source has an `id`, a descriptive `title`, and an absolute HTTP(S) `url`. Use `null` for evidence without a shareable public URL, such as a project-supplied observation. Identify the origin in its title. |
| `observations` | Dated items with `date`, `description`, `appearance`, `confidence` and one or more `sourceIds`. The date has precision YYYY, YYYY-MM or YYYY-MM-DD. Use plain text for a supported visual detail and `null` for unknown appearance. An empty array represents a lack of dated observations. |
| `operatingPeriod` | Object with `description`, `confidence` and `sourceIds`. Describe the supported period or identify the missing opening or closing dates. Each supported claim cites a source. |
| `reconstructionConfidence` | Overall confidence in reconstructing the visual subject. A precise coordinate can coexist with unknown visual evidence. |
| `uncertainties` | Array of plain-text gaps, disagreements or limits in the evidence. |
| `godotAssetId` | Stable identifier assigned by the reconstruction project, or `null` until a genuine asset has been assigned. Avoid machine-local file paths. |

Each referenced source identifier must exist in the same record. `VERIFIED` means the cited evidence directly supports the recorded claim. `APPROXIMATED` means it supports a limited approximation whose limits are stated in the record. `UNKNOWN` means the evidence leaves the question unresolved. An observation supports only its own date precision. A single image of a shutter provides no final trading date. Keep acquisition dates distinct from capture dates. Keep personal memories and private addresses out of public snapshots.

## Working copies

Open the register editor in the atlas. Import a JSON file or edit the text directly. **Apply to this browser** validates the complete snapshot and saves it to this origin's local storage. **Download JSON** validates and exports the editor text, including unsaved edits. **Restore published records** clears the stored working copy and displays the bundled snapshot. A failed validation identifies the problematic field and leaves the last applied copy in place. Download a copy for transfer or archival.

For a future pipeline, parse a JSON file and call `parseRegister(input)`. Use landmark IDs for joins and the full source and confidence fields when handling historical data. Call `exportRegister(register)` for a formatted, validated interchange file. A publication requires a separate reviewed change to the bundled snapshot.

## Game material

`src/lib/kaerimichi/game.ts` holds the owner-supplied milestones and a typed media list. Add a cleared capture with its kind, URL, accessible description, matching landmark ID (or null for a whole-route view), game version and credit. The V0.4 route length is the project's estimate for its private Godot walk. The register supplies no conversion from real-world coordinates to game metres.
