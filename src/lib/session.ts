/**
 * Centralized, safe session helpers.
 * - Wraps JSON.parse in try/catch so a malformed cookie never crashes the app.
 * - Single source of truth for cookie names and session types.
 */

export const COOKIE_KPPN = 'kppn_session'
export const COOKIE_SATKER = 'satker_session'

export type KppnSession = {
  id: string
  username: string
  nama: string
  role: 'kppn'
  kode_kppn?: string
}

export type SatkerSession = {
  id: string
  username: string
  nama: string
  role: 'satker'
}

export type AnySession = KppnSession | SatkerSession

/** Safely parse a raw cookie string. Returns null on any error. */
function safeParse<T>(raw: string | undefined): T | null {
  if (!raw) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function parseKppnSession(raw: string | undefined): KppnSession | null {
  return safeParse<KppnSession>(raw)
}

export function parseSatkerSession(raw: string | undefined): SatkerSession | null {
  return safeParse<SatkerSession>(raw)
}
