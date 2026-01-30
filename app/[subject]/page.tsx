'use client'

import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { Subject, SUBJECTS } from '@/lib/types'

export default function SubjectPage() {
  const params = useParams()
  const subject = params.subject as Subject

  const subjectInfo = SUBJECTS.find((s) => s.id === subject)

  if (!subjectInfo) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-800">
            Matière non trouvée
          </h2>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex">
        <Sidebar subject={subject} />
        <main className="flex-1 p-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2
              className="text-3xl font-bold mb-4"
              style={{ color: subjectInfo.color }}
            >
              {subjectInfo.name}
            </h2>
            <p className="text-slate-600 mb-8">
              Sélectionnez une page dans le menu de gauche ou créez-en une
              nouvelle pour commencer vos révisions.
            </p>
            <div
              className="inline-block p-8 rounded-xl text-white"
              style={{ backgroundColor: subjectInfo.color + '20' }}
            >
              <p style={{ color: subjectInfo.color }}>
                Utilisez le bouton &quot;+ Ajouter&quot; dans la barre latérale
                pour créer votre première fiche de révision.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
