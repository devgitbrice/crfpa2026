'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import { SUBJECTS } from '@/lib/types'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">
            Bienvenue dans vos révisions CRFPA 2026
          </h2>
          <p className="text-slate-600">
            Sélectionnez une matière pour commencer à réviser
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.id}
              href={`/${subject.id}`}
              className="p-6 rounded-xl text-white shadow-lg hover:shadow-xl transition-all hover:scale-105"
              style={{ backgroundColor: subject.color }}
            >
              <h3 className="text-xl font-bold mb-2">{subject.name}</h3>
              <p className="text-sm opacity-90">
                Cliquez pour accéder aux fiches de révision
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 bg-white rounded-xl shadow-md">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Comment utiliser cette application ?
          </h3>
          <ul className="space-y-2 text-slate-600">
            <li>
              <strong>1.</strong> Sélectionnez une matière dans le menu
            </li>
            <li>
              <strong>2.</strong> Créez des pages dans la barre latérale gauche
            </li>
            <li>
              <strong>3.</strong> Ajoutez des blocs de contenu (texte, titres,
              listes, citations...)
            </li>
            <li>
              <strong>4.</strong> Tout est sauvegardé automatiquement !
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
