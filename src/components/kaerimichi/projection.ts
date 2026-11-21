export type Point = [number, number];

export function localProjection(bbox: number[]) {
  // Local equirectangular coordinates in metres, with north at the top.
  const longitude = (bbox[0] + bbox[2]) / 2;
  const latitude = (bbox[1] + bbox[3]) / 2;
  const degrees = Math.PI / 180;
  const yScale = degrees * 6371008.8;
  const xScale = yScale * Math.cos(latitude * degrees);
  return ([lon,lat]: number[]): Point => [(lon-longitude)*xScale,(latitude-lat)*yScale];
}

export interface Geometry {
  type: string;
  coordinates: number[] | number[][] | number[][][] | number[][][][];
}

export function geometryPath(geometry: Geometry, project: (coord: number[]) => Point): string {
  function line(coords: number[][], closed = false) {
    const vertices = coords.map(coord => project(coord).map(n => n.toFixed(1)).join(','));
    return vertices.length ? 'M'+vertices.join('L')+(closed ? 'Z' : '') : '';
  }
  if (geometry.type === 'LineString') return line(geometry.coordinates as number[][]);
  if (geometry.type === 'MultiLineString') return (geometry.coordinates as number[][][]).map(r => line(r)).join('');
  if (geometry.type === 'Polygon') return (geometry.coordinates as number[][][]).map(r => line(r,true)).join('');
  if (geometry.type === 'MultiPolygon') return (geometry.coordinates as number[][][][]).flatMap(p => p.map(r => line(r,true))).join('');
  return '';
}
