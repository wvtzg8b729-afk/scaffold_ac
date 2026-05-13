import { redirect } from 'next/navigation'
import { isAdminSession } from '@/lib/session'
import LoginClient from './login-client'

export default async function LoginPage() {
  if (await isAdminSession()) redirect('/dashboard')
  return <LoginClient />
}
