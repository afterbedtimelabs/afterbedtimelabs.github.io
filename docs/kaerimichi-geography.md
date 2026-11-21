# Kaerimichi atlas geography

The editable GIS data is [geography.json](../src/data/kaerimichi/geography.json), an RFC 7946 FeatureCollection using WGS 84 longitude, latitude in decimal degrees. It covers the streets around Itabashihoncho A2, the north-side shops, Itabashi Bridge and LIFE Nakajuku. Drawing the atlas requires no map-service account or network tile requests.

## Source and license

© OpenStreetMap contributors. The geographic database in this file, including the route geometry derived from it, is distributed under the Open Database License 1.0. [OpenStreetMap attribution](https://www.openstreetmap.org/copyright) · [ODbL 1.0 license](https://opendatacommons.org/licenses/odbl/1-0/)

The source is the Itabashi ward extract of the June 12, 2026 Geofabrik Kantō OSM dataset, distributed as TopoJSON in `hwcharlton/geo-data` release `v1.3.0`. The upstream high-detail road pack already applies geometric simplification. We decoded the TopoJSON transformations, selected local features, clipped to the atlas area and grouped road classes for drawing. Parks come from semantic-ground features classified as parks, grass or recreation grounds. Building footprints give neighborhood context. They do not identify building occupants or historical façades. [Upstream dataset and manifests](https://github.com/hwcharlton/geo-data/tree/v1.3.0/packs/itabashi)

| Feature kind | Source layer | Retained information |
| --- | --- | --- |
| street, path, arterial | road/high | Road geometry and available names |
| water | water/high | Water polygons and named river centerlines |
| park | semantic-ground/high | Selected green spaces |
| building | building/flat | OSM building outlines |
| route | road/high | Connected street and footway vertices, with projected endpoints |

The geographic snapshot remains fixed when a visitor changes the observation year. The historical register controls which dated documentary observations are available.

## Walk geometry

Run `node scripts/test-kaerimichi-geography.mjs` from the repository root to repeat the geographic checks without dependencies or network access. It checks the WGS 84 extent, each walking segment against the mapped streets and footways, the spur junction, both measured lengths and the distance from each located stop to the walk. The bridge check uses the published crossing position independently of the map and register.

The November 21, 2026 run passed for all 2,489 bounded features, the 822 m main route, the 69 m spur, every geolocated stop and the Itabashi Bridge crossing. The command reports the number of pins in the current register.

The main walk starts on the mapped footway by A2, continues east along the hospital frontage, crosses the arterial using mapped footways and proceeds south through Honchō. It follows Old Nakasendō over Itabashi Bridge and ends on the shopping street alongside LIFE. The northern storefront spur leaves the main walk near Kōrai and My Basket. Return along the same spur to continue toward the bridge.

We constructed a bidirectional graph of local footways and walkable street classes. Motorways and arterials were excluded. Distances along the retained segments determined the shortest connected paths via the shop junction and the bridge. Source vertices remain in order. The start, bridge, northern turnaround and endpoint were projected onto the nearest matching street segment. These projections locate the walker on the mapped street. The LIFE building's directory point is about 25 m east of the street endpoint. Storefront pin accuracy is documented per record.

| Line | Vertices | Rounded length |
| --- | ---: | ---: |
| Main route, A2 to the street at LIFE | 45 | 822 m |
| Northern spur, one way | 3 | 69 m |

Lengths are sums of haversine segment lengths on a sphere of mean radius 6,371,008.8 m. The main route excludes the out-and-back spur. The owner's approximately 805 m figure describes the private Godot V0.4 reconstruction. The atlas geometry is an independently derived walking interpretation without an on-site pedestrian or accessibility survey.

The A2 point comes from the exit-specific entry `Toei.Itabashihoncho.A2`. The northern turn uses Yasuda's public location. The bridge is checked against the independent crossing register, and the destination against LIFE's branch address and the public directory's shop point. [Mini Tokyo 3D exit data](https://github.com/nagix/mini-tokyo-3d/blob/master/data/poi.json) · [Toei station guide](https://www.kotsu.metro.tokyo.jp/subway/stations/itabashihoncho.html) · [Itabashi Bridge record](https://www.djq.jp/bridge_liblary/river_syakujii/tokyo_bridge_syakujii162_itabashi.php) · [Official LIFE listing](https://store.lifecorp.jp/detail/east620/) · [LIFE access listing](https://www.ekiten.jp/shop_51970/access/)
