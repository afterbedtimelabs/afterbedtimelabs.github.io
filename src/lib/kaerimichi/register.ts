/** Portable, versioned snapshot. Array order is the editorial walking order. */
export type Confidence = 'VERIFIED' | 'APPROXIMATED' | 'UNKNOWN'
export type Coordinates = [longitude: number, latitude: number]
export interface Source {
  id: string
  title: string
  url: string | null
}
export interface Observation {
  date: string
  description: string
  appearance: string | null
  confidence: Confidence
  sourceIds: string[]
}
export interface Landmark {
  id: string
  nameJa: string
  nameEn: string
  category: string
  description: string
  location: { coordinates: Coordinates | null; confidence: Confidence; note: string; sourceIds: string[] }
  sources: Source[]
  observations: Observation[]
  operatingPeriod: { description: string; confidence: Confidence; sourceIds: string[] }
  reconstructionConfidence: Confidence
  uncertainties: string[]
  godotAssetId: string | null
}
export interface Register {
  schemaVersion: 1
  landmarks: Landmark[]
}

const storageKey = 'afterbedtimelabs.kaerimichi.register.v1'

function invalid(path: string, reason: string): never {
  throw new Error(path + ' ' + reason + '.')
}

function object(value: unknown, path: string, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) invalid(path, 'must be an object')
  for (const key of Object.keys(value)) {
    if (!keys.includes(key)) invalid(path + '.' + key, 'is outside the version 1 schema')
  }
  return value as Record<string, unknown>
}

function string(value: unknown, path: string): string {
  if (typeof value !== 'string' || !value.trim()) invalid(path, 'requires nonempty text')
  return value
}

function optionalString(value: unknown, path: string): string | null {
  return value === null ? null : string(value, path)
}

function identifier(value: unknown, path: string): string {
  const id = string(value, path)
  if (!/^[a-z0-9][a-z0-9._-]*$/i.test(id)) invalid(path, 'requires a stable identifier using letters, digits, dots, underscores or hyphens')
  return id
}

function array<T>(value: unknown, path: string, parse: (item: unknown, path: string) => T): T[] {
  if (!Array.isArray(value)) invalid(path, 'must be an array')
  return value.map((item, index) => parse(item, path + '[' + index + ']'))
}

function unique(ids: string[], path: string) {
  if (new Set(ids).size !== ids.length) invalid(path, 'contains a duplicate identifier')
}

function confidence(value: unknown, path: string): Confidence {
  if (value === 'VERIFIED' || value === 'APPROXIMATED' || value === 'UNKNOWN') return value
  return invalid(path, 'requires VERIFIED, APPROXIMATED or UNKNOWN')
}

function coordinates(value: unknown, path: string): Coordinates | null {
  if (value === null) return null
  if (!Array.isArray(value) || value.length !== 2) invalid(path, 'requires [longitude, latitude] or null')
  const [lng, lat] = value
  if (!Number.isFinite(lng) || Math.abs(lng) > 180 || !Number.isFinite(lat) || Math.abs(lat) > 90) invalid(path, 'requires valid WGS84 decimal degrees')
  return [lng, lat]
}

function evidenceDate(value: unknown, path: string): string {
  const date = string(value, path)
  const parts = /^(\d{4})(?:-(0[1-9]|1[0-2])(?:-(0[1-9]|[12]\d|3[01]))?)?$/.exec(date)
  if (!parts) invalid(path, 'requires YYYY, YYYY-MM or YYYY-MM-DD')
  if (parts[3]) {
    const day = new Date(date + 'T00:00:00Z')
    if (Number.isNaN(day.valueOf()) || day.toISOString().slice(0, 10) !== date) invalid(path, 'is not a calendar date')
  }
  return date
}

function source(value: unknown, path: string): Source {
  const s = object(value, path, ['id', 'title', 'url'])
  const url = optionalString(s.url, path + '.url')
  if (url !== null) {
    let parsed: URL
    try { parsed = new URL(url) } catch { return invalid(path + '.url', 'requires an absolute URL') }
    if (!['https:', 'http:'].includes(parsed.protocol) || parsed.username || parsed.password) invalid(path + '.url', 'requires a public HTTP or HTTPS address')
  }
  return { id: identifier(s.id, path + '.id'), title: string(s.title, path + '.title'), url }
}

function landmark(value: unknown, path: string): Landmark {
  const l = object(value, path, [
    'id', 'nameJa', 'nameEn', 'category', 'description', 'location', 'sources', 'observations',
    'operatingPeriod', 'reconstructionConfidence', 'uncertainties', 'godotAssetId',
  ])
  const sources = array(l.sources, path + '.sources', source)
  const ids = sources.map(s => s.id)
  unique(ids, path + '.sources')
  function sourceIds(input: unknown, field: string, required: boolean) {
    const refs = array(input, field, identifier)
    unique(refs, field)
    if (required && !refs.length) invalid(field, 'requires supporting evidence')
    for (const ref of refs) if (!ids.includes(ref)) invalid(field, 'references missing source ' + ref)
    return refs
  }
  const locPath = path + '.location'
  const loc = object(l.location, locPath, ['coordinates', 'confidence', 'note', 'sourceIds'])
  const point = coordinates(loc.coordinates, locPath + '.coordinates')
  const locConfidence = confidence(loc.confidence, locPath + '.confidence')
  if ((point === null) !== (locConfidence === 'UNKNOWN')) invalid(locPath, 'requires null coordinates exactly when confidence is UNKNOWN')
  const periodPath = path + '.operatingPeriod'
  const period = object(l.operatingPeriod, periodPath, ['description', 'confidence', 'sourceIds'])
  const periodConfidence = confidence(period.confidence, periodPath + '.confidence')
  return {
    id: identifier(l.id, path + '.id'), nameJa: string(l.nameJa, path + '.nameJa'), nameEn: string(l.nameEn, path + '.nameEn'),
    category: string(l.category, path + '.category'), description: string(l.description, path + '.description'),
    location: {
      coordinates: point, confidence: locConfidence, note: string(loc.note, locPath + '.note'),
      sourceIds: sourceIds(loc.sourceIds, locPath + '.sourceIds', point !== null),
    },
    sources,
    observations: array(l.observations, path + '.observations', (input, obsPath) => {
      const o = object(input, obsPath, ['date', 'description', 'appearance', 'confidence', 'sourceIds'])
      return {
        date: evidenceDate(o.date, obsPath + '.date'), description: string(o.description, obsPath + '.description'),
        appearance: optionalString(o.appearance, obsPath + '.appearance'), confidence: confidence(o.confidence, obsPath + '.confidence'),
        sourceIds: sourceIds(o.sourceIds, obsPath + '.sourceIds', true),
      }
    }),
    operatingPeriod: {
      description: string(period.description, periodPath + '.description'), confidence: periodConfidence,
      sourceIds: sourceIds(period.sourceIds, periodPath + '.sourceIds', periodConfidence !== 'UNKNOWN'),
    },
    reconstructionConfidence: confidence(l.reconstructionConfidence, path + '.reconstructionConfidence'),
    uncertainties: array(l.uncertainties, path + '.uncertainties', string),
    godotAssetId: optionalString(l.godotAssetId, path + '.godotAssetId'),
  }
}

export function parseRegister(input: unknown): Register {
  const data = object(input, 'register', ['schemaVersion', 'landmarks'])
  if (data.schemaVersion !== 1) invalid('register.schemaVersion', 'must be 1')
  const landmarks = array(data.landmarks, 'landmarks', landmark)
  if (!landmarks.length) invalid('landmarks', 'requires at least one record')
  unique(landmarks.map(l => l.id), 'landmarks')
  return { schemaVersion: 1, landmarks }
}

export function exportRegister(register: Register): string {
  return JSON.stringify(parseRegister(register), null, 2) + '\n'
}

export function readWorkingRegister(): Register | null {
  const json = window.localStorage.getItem(storageKey)
  return json === null ? null : parseRegister(JSON.parse(json))
}

export function saveWorkingRegister(register: Register): void {
  window.localStorage.setItem(storageKey, exportRegister(register))
}

export function clearWorkingRegister(): void {
  window.localStorage.removeItem(storageKey)
}
