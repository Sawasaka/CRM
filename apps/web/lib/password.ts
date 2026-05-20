import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const key = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `scrypt$${salt}$${key.toString('hex')}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, keyHex] = storedHash.split('$')
  if (algorithm !== 'scrypt' || !salt || !keyHex) return false

  const expected = Buffer.from(keyHex, 'hex')
  const actual = (await scrypt(password, salt, expected.length)) as Buffer
  if (expected.length !== actual.length) return false
  return timingSafeEqual(expected, actual)
}

export function createPasswordResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = randomBytes(32).toString('base64url')
  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  }
}

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function isStrongEnoughPassword(password: string): boolean {
  return password.length >= 8
}
