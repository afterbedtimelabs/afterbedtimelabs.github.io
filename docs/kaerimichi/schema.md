# Kaerimichi historical register

The version 1 interchange document is UTF-8 JSON. The production site serves the validated snapshot at `/kaerimichi/register.json`. Its source lives in `src/data/kaerimichi/register.json`. TypeScript interfaces and executable validation rules live in `src/lib/kaerimichi/register.ts`. An import replaces the complete working snapshot. Array order is the sequence used by the walking journal. Geographic routing data has separate provenance.

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

Use `src/data/kaerimichi/development.json` for the development journal. Append a milestone with its version, title and description. Each media entry has a kind (image or video), a local asset URL in `src`, a version, a landmark ID from the published register, and a description that explains what the capture shows. Videos may include a local poster URL. Set `journalTitle` to include an entry in the journal gallery. The first image for a landmark appears on its map card.

Place rendered media under `public/images/kaerimichi/game/`. Current game material is credited to After Bedtime Labs under the gallery. Include maker, upstream geography credits and applicable license links for future contributions. Keep historic photographs tied to their dated observations. A game screenshot depicts an interpretation of a place.

For V0.4 joins, the register’s `godotAssetId` is an opaque model group from the game's public-place history table or a named mesh such as BridgeDeck. Storefronts that share a building can share a group. A null value leaves the asset join open. No game binaries or notebook fields are needed.
