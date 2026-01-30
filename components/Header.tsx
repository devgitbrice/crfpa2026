'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SUBJECTS } from '@/lib/types'
import { useTheme } from '@/lib/ThemeContext'

const VERSION_DATE = '30 janvier 2026 - 23:30'

export default function Header() {
  const pathname = usePathname()
  const currentSubject = pathname.split('/')[1] || ''
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-[var(--card-bg)] border-b border-[var(--card-border)] shadow-lg">
      <div className="px-4 py-2 text-center text-xs text-[var(--muted)] border-b border-[var(--card-border)] flex justify-between items-center">
        <span className="flex-1"></span>
        <span>Dernière mise à jour : {VERSION_DATE}</span>
        <span className="flex-1 flex justify-end">
          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded-lg text-sm bg-[var(--muted-bg)] hover:bg-[var(--hover-bg)] transition"
            title={theme === 'light' ? 'Activer le mode sombre' : 'Activer le mode clair'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </span>
      </div>
      <div className="px-4 py-3">
        <h1 className="text-xl font-bold text-center mb-4">
          CRFPA 2026 - Révisions
        </h1>
        <nav className="flex flex-wrap justify-center gap-2">
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.id}
              href={`/${subject.id}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                currentSubject === subject.id
                  ? 'text-white shadow-md'
                  : 'bg-[var(--muted-bg)] hover:bg-[var(--hover-bg)]'
              }`}
              style={{
                backgroundColor: currentSubject === subject.id ? subject.color : undefined,
              }}
            >
              {subject.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
