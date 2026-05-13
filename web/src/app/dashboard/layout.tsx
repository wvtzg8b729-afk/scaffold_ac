import Link from 'next/link'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { ADMIN_COOKIE_NAME } from '@/lib/jwt'

async function logout() {
  'use server'
  cookies().set(ADMIN_COOKIE_NAME, '', { path: '/', maxAge: 0 })
  redirect('/login')
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-800 bg-slate-900/80">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Panel
            </Link>
            <Link href="/dashboard/bans" className="text-slate-300 hover:text-white">
              Bans
            </Link>
          </nav>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
            >
              Log ud
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  )
}
