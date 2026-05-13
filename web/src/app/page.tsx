import { redirect } from 'next/navigation'
import { isAdminSession } from '@/lib/session'

export default async function Home() {
  if (await isAdminSession()) redirect('/dashboard')
  redirect('/login')
}
