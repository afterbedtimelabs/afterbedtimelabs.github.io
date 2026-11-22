import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function readData(filename) {
  return JSON.parse(readFileSync(new URL('../src/data/kaerimichi/' + filename, import.meta.url), 'utf8'));
}

const map = readData('geography.json');
const register = readData('register.json');
const [west, south, east, north] = map.bbox;
assert(west >= -180 && west < east && east <= 180 && south >= -90 && south < north && north <= 90, 'Invalid WGS 84 bounding box');

for (const { geometry } of map.features) {
  assert(['LineString', 'Polygon'].includes(geometry.type), 'Unsupported map geometry');
  const positions = geometry.type === 'Polygon' ? geometry.coordinates.flat() : geometry.coordinates;
  for (const [lon, lat] of positions) {
    assert(lon >= west && lon <= east && lat >= south && lat <= north, 'Position outside the map extent');
  }
}

const rad = degrees => degrees * Math.PI / 180;
const radius = 6371008.8;
function metres(a, b) {
  const h = Math.sin(rad(b[1] - a[1]) / 2) ** 2
    + Math.cos(rad(a[1])) * Math.cos(rad(b[1])) * Math.sin(rad(b[0] - a[0]) / 2) ** 2;
  return 2 * radius * Math.asin(Math.sqrt(h));
}

function segments(positions) {
  return positions.slice(1).map((point, i) => [positions[i], point]);
}

// Work in a local tangent plane to project a stop onto a short street segment.
function offset(point, [a, b]) {
  const xScale = radius * rad(1) * Math.cos(rad(point[1]));
  const yScale = radius * rad(1);
  const dx = (b[0] - a[0]) * xScale;
  const dy = (b[1] - a[1]) * yScale;
  const x = (point[0] - a[0]) * xScale;
  const y = (point[1] - a[1]) * yScale;
  const fraction = (x * dx + y * dy) / (dx * dx + dy * dy || 1);
  const t = Math.max(0, Math.min(1, fraction));
  return Math.hypot(x - dx * t, y - dy * t);
}

const paths = map.features.filter(f => ['street', 'path'].includes(f.properties.kind))
  .flatMap(f => segments(f.geometry.coordinates));
function checkWalk(segment, expectedLength) {
  const matches = map.features.filter(f => f.properties.kind === 'route' && f.properties.segment === segment);
  assert.equal(matches.length, 1, 'Expected one ' + segment + ' route');
  const points = matches[0].geometry.coordinates;
  const edges = segments(points);
  for (const [a, b] of edges) {
    assert(paths.some(edge => offset(a, edge) < 0.2 && offset(b, edge) < 0.2),
      segment + ' leaves the mapped streets between ' + a + ' and ' + b);
  }
  const length = Math.round(edges.reduce((sum, [a, b]) => sum + metres(a, b), 0));
  assert.equal(length, expectedLength, segment + ' length no longer matches the documented walk');
  return points;
}

const main = checkWalk('main', 822);
const detour = checkWalk('detour', 175);
assert(main.some(point => metres(point, detour[0]) < 0.2), 'Spur must branch from a main-route vertex');
const mainEdges = segments(main);
const walkEdges = mainEdges.concat(segments(detour));

const stops = register.landmarks.filter(stop => stop.location.coordinates !== null);
for (const { id, location } of stops) {
  assert(walkEdges.some(edge => offset(location.coordinates, edge) <= 45), id + ' is outside the walk corridor');
}

const location = id => {
  const point = stops.find(stop => stop.id === id)?.location.coordinates;
  assert(point, id + ' must have a sourced location');
  return point;
};
assert(metres(main[0], location('a2')) < 10, 'The walk must start beside exit A2');
assert(metres(main.at(-1), location('life-nakajuku')) < 30, 'The walk must finish on the street beside LIFE');
assert(metres(detour.at(-1), location('drug-papas')) < 25, 'The northern spur ends at the fork near Drug Papas');
assert(segments(detour).some(edge => offset(location('yasuda'), edge) < 30), 'The spur must pass Yasuda');
const ordered = ['a2', 'yamato-hospital', 'matsuya', 'korai', 'my-basket', 'hair-salon-best',
  'ajishino', 'choryu', 'yasuda', 'drug-papas', 'old-nakasendo', 'itabashi-bridge', 'nakajuku-street', 'life-nakajuku'];
assert.deepEqual(stops.map(stop => stop.id), ordered, 'Every published stop needs its sourced map position in walking order');
const development = readData('development.json');
for (const media of development.media) {
  assert(ordered.includes(media.landmarkId), 'Capture must refer to a mapped landmark');
  assert(development.milestones.some(m => m.version === media.version), 'Capture needs a documented game version');
  for (const asset of [media.src, media.poster].filter(Boolean)) {
    assert(asset.startsWith('/images/kaerimichi/game/'), 'Game media must use a local atlas asset');
    assert(readFileSync(new URL('../public' + asset, import.meta.url)).length, 'Missing game media');
  }
}

// Published crossing position from the independent Tokyo Bridge Library.
const bridge = [139.708892, 35.757304];
assert(metres(location('itabashi-bridge'), bridge) < 10, 'Bridge register point differs from the crossing record');
assert(mainEdges.some(([a,b]) => a[1] >= bridge[1] && b[1] <= bridge[1] && offset(bridge, [a,b]) < 2),
  'The southbound walk must cross the river at Itabashi Bridge');

console.log('Geography verified: ' + map.features.length + ' bounded features, 822 m main route, 175 m spur, '
  + stops.length + ' located stops and the Itabashi Bridge crossing.');
