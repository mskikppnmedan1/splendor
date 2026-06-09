/**
 * Shared server-side input validation helpers.
 */

export type ValidationResult = { ok: true } | { ok: false; message: string }

/** Strip and validate a plain string field. */
export function validateString(
  value: unknown,
  label: string,
  opts: { min?: number; max?: number } = {}
): ValidationResult {
  if (typeof value !== 'string') return { ok: false, message: `${label} harus berupa teks.` }
  const trimmed = value.trim()
  const min = opts.min ?? 1
  const max = opts.max ?? 255
  if (trimmed.length < min) return { ok: false, message: `${label} minimal ${min} karakter.` }
  if (trimmed.length > max) return { ok: false, message: `${label} maksimal ${max} karakter.` }
  return { ok: true }
}

/** Validate password rules. */
export function validatePassword(value: unknown): ValidationResult {
  const res = validateString(value, 'Password', { min: 6, max: 100 })
  if (!res.ok) return res
  return { ok: true }
}

/** Validate kode satker: digits only, 4–10 chars. */
export function validateKodeSatker(value: unknown): ValidationResult {
  const res = validateString(value, 'Kode Satker', { min: 4, max: 10 })
  if (!res.ok) return res
  if (!/^\d+$/.test((value as string).trim())) {
    return { ok: false, message: 'Kode Satker hanya boleh berisi angka.' }
  }
  return { ok: true }
}
