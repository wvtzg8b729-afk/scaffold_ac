import bcrypt from 'bcryptjs'
import crypto from 'crypto'

export async function hashApiKey(plain: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(plain, salt)
}

export async function verifyApiKey(plain: string, hash: string) {
  return bcrypt.compare(plain, hash)
}

export function generateApiKey() {
  return crypto.randomBytes(24).toString('hex')
}
