'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SUBJECTS } from '@/lib/types'

const VERSION_DATE = '30 janvier 2026 - 23:30'

export default function Header() {
  const pathname = usePathname()
  const currentSubject = pathname.split('/')[1] || ''

  return (
    <header className="bg-slate-900 text-white shadow-lg">
      <div className="px-4 py-2 text-center text-xs text-slate-400 border-b border-slate-700">
        Dernière mise à jour : {VERSION_DATE}
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
                  : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
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
