import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME, verifyAdminJwt } from '@/lib/jwt'

export async function isAdminSession(): Promise<boolean> {
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value
  if (!token) return false
  try {
    return await verifyAdminJwt(token)
  } catch {
    return false
  }
}
