# Kaerimichi neighborhood atlas

The atlas lives at `/kaerimichi/` and is linked from the Projects page. Its route begins at Itabashihoncho Station exit A2 and ends at LIFE Nakajuku. A checkout of this site is sufficient to run it. The private Godot project is independent of the atlas.

## Preview the production build

Use Node.js 24 and npm. In the supplied atlas checkout, start at `npm ci`. To set up a second checkout after the branch is pushed, run the full sequence.

```sh
git clone --single-branch --branch codex/kaerimichi-historical-atlas https://github.com/afterbedtimelabs/afterbedtimelabs.github.io.git kaerimichi-atlas
cd kaerimichi-atlas
npm ci
npm run validate
npm run preview -- --host 127.0.0.1 --port 4397
```

Open [the atlas](http://127.0.0.1:4397/kaerimichi/) or enter from [Projects](http://127.0.0.1:4397/projects/). Press Ctrl+C in the preview terminal to stop it. In an existing checkout of the atlas branch, start at `npm ci`.

## Restore a review bundle

If the branch is supplied as `kaerimichi-atlas.bundle`, clone public main and import the local branch. Place the bundle in the directory where you run the first command.

```sh
git clone https://github.com/afterbedtimelabs/afterbedtimelabs.github.io.git kaerimichi-review
cd kaerimichi-review
git bundle verify ../kaerimichi-atlas.bundle
git fetch ../kaerimichi-atlas.bundle refs/heads/codex/kaerimichi-historical-atlas:refs/heads/codex/kaerimichi-historical-atlas
git switch codex/kaerimichi-historical-atlas
```

Continue with `npm ci` and the preview commands above.

## Read a storefront record

Start at A2 and advance through the route in order, or select an individual landmark. The map uses modern geographic context. Changing the year filters the dated observations. A year with no matching observation is a gap in this register.

Ajishino and Chōryū are a useful pair to compare. The February 2021 photograph documents Ajishino's sign panels. The August 2024 photograph of Chōryū also shows a shutter next door. The shutter establishes what the camera saw that day. Ajishino's final trading date remains unknown.

## Work on the register

Download the licensed geographic data at [geography.geojson](http://127.0.0.1:4397/kaerimichi/geography.geojson). The [geography notes](../kaerimichi-geography.md) document the source, license and distance calculation.

See [the register format](schema.md) for the versioned JSON and how the game can use it. Importing or editing a working copy takes effect in the current browser. Export a JSON file to share a draft or move it to another device. Changes to the public register go through normal repository review.

## Cover artwork

Keisai Eisen’s *Itabashi Station* is an Edo-period woodblock design, dated circa 1835–36 by the Chiba City Museum of Art. The atlas displays a cropped view of a public-domain scan from the National Diet Library. [Collection record](https://dl.ndl.go.jp/pid/1306225) · [Design and date](https://www.ccma-net.jp/collection/works/4180/) · [Scan and rights information](https://commons.wikimedia.org/wiki/File:NDL-DC_1306225-Keisai_Eisen-第二_木曽街道板橋之駅-crd.jpg) · [Resized copy used in this atlas](https://github.com/SIMPLYBOYS/nakasendo-pixel/blob/3a8480b3274fac8ef48fd05bca42dbc58db2b707/game-assets/originals/02-itabashi.jpg)

## Photographs and game captures

The A2 record includes LERK’s 21 March 2020 photograph in the Commons reduced-resolution edition. The caption credits the author and links the source and license. Storefront evidence from other publishers opens on their original sites. [A2 file record](https://commons.wikimedia.org/wiki/File:Toei-subway-I19-Itabashihoncho-station-entrance-A2-20200321-131829.jpg) · [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)

All 14 route cards include original V0.4 Godot screenshots. The journal includes a silent 14-second excerpt from the V0.5 street-activity film. These are renders of the game’s public streets. Their geometry adapts Tokyo Metropolitan Government's FY2025 Itabashi city model and OpenStreetMap. Milestones were checked against the companion project's release histories through V0.6. [PLATEAU dataset](https://www.geospatial.jp/ckan/dataset/plateau-13119-itabashi-ku-2025) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) · [OpenStreetMap attribution and license](https://www.openstreetmap.org/copyright)

Use the area controls to frame the station-side shops, the old highway or the stretch between the bridge and LIFE. Arrow keys pan a focused map, + and − zoom, and Home fits the full walk. Tab reaches the numbered pins. Enter opens a grouped pin and Escape closes its chooser. The stop selector provides an alternative to navigating pins.
