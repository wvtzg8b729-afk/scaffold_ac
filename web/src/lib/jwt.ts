import * as jose from 'jose'

const COOKIE = 'ac_admin'

export function getJwtSecretKey() {
  const s = process.env.JWT_SECRET
  if (!s) throw new Error('JWT_SECRET is not set')
  return new TextEncoder().encode(s)
}

export async function signAdminJwt() {
  return new jose.SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecretKey())
}

export async function verifyAdminJwt(token: string) {
  const { payload } = await jose.jwtVerify(token, getJwtSecretKey())
  return payload.role === 'admin'
}

export { COOKIE as ADMIN_COOKIE_NAME }
