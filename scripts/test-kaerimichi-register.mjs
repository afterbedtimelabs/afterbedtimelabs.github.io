import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { parseRegister, exportRegister } from '../src/lib/kaerimichi/register.ts'

const path = new URL('../src/data/kaerimichi/register.json', import.meta.url)
const register = JSON.parse(readFileSync(path, 'utf8'))

test('published UTF-8 JSON round trips with all evidence, dates, and route order intact', () => {
  const parsed = parseRegister(register)
  assert.deepEqual(JSON.parse(exportRegister(parsed)), register)
  assert.deepEqual(parseRegister(JSON.parse(exportRegister(parsed))), parsed)
})

test('coordinates, uncertain locations, observation dates and source references are checked independently', () => {
  const mutate = (change, reason) => {
    const copy = structuredClone(register)
    change(copy)
    assert.throws(() => parseRegister(copy), reason)
  }
  mutate(r => { r.landmarks.push(r.landmarks[0]) }, /duplicate identifier/)
  mutate(r => { r.schemaVersion = 2 }, /schemaVersion/)
  mutate(r => { r.landmarks[0].location.coordinates = [139, 100] }, /WGS84/)
  mutate(r => { r.landmarks[0].location.coordinates = [139, 35]; r.landmarks[0].location.confidence = 'UNKNOWN' }, /null coordinates/)
  mutate(r => { r.landmarks[0].sources[0].url = 'file:///private/notes' }, /HTTP or HTTPS/)
  mutate(r => { r.landmarks[0].sources[0].url = 'https://user:pass@example.test/' }, /HTTP or HTTPS/)
  mutate(r => { r.landmarks[0].location.sourceIds = ['missing-proof'] }, /missing source/)
  mutate(r => {
    r.landmarks[0].observations.push({
      date: '2023-02-29', description: 'test', appearance: null, confidence: 'UNKNOWN',
      sourceIds: [r.landmarks[0].sources[0].id],
    })
  }, /calendar date/)
  mutate(r => { r.landmarks[0].unrecognizedField = true }, /outside the version 1 schema/)
})
