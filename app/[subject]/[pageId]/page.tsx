'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import BlockEditor from '@/components/BlockEditor'
import { supabase } from '@/lib/supabase'
import { CrfpaPage, Subject, SUBJECTS } from '@/lib/types'

export default function PageView() {
  const params = useParams()
  const subject = params.subject as Subject
  const pageId = params.pageId as string

  const [page, setPage] = useState<CrfpaPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleInput, setTitleInput] = useState('')

  const subjectInfo = SUBJECTS.find((s) => s.id === subject)

  useEffect(() => {
    loadPage()
  }, [pageId])

  async function loadPage() {
    setLoading(true)
    const { data, error } = await supabase
      .from('crfpa_pages')
      .select('*')
      .eq('id', pageId)
      .single()

    if (error) {
      console.error('Error loading page:', error)
    } else {
      setPage(data)
      setTitleInput(data?.title || '')
    }
    setLoading(false)
  }

  async function updateTitle() {
    if (!titleInput.trim() || !page) return

    const { error } = await supabase
      .from('crfpa_pages')
      .update({ title: titleInput, updated_at: new Date().toISOString() })
      .eq('id', page.id)

    if (error) {
      console.error('Error updating title:', error)
    } else {
      setPage({ ...page, title: titleInput })
      setEditingTitle(false)
    }
  }

  if (!subjectInfo) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <Header />
        <main className="p-8 text-center">
          <h2 className="text-2xl font-bold">
            Matière non trouvée
          </h2>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <div className="flex">
        <Sidebar subject={subject} />
        <main className="flex-1">
          {loading ? (
            <div className="p-8 text-center text-[var(--muted)]">Chargement...</div>
          ) : !page ? (
            <div className="p-8 text-center">
              <h2 className="text-2xl font-bold">
                Page non trouvée
              </h2>
            </div>
          ) : (
            <div>
              {/* Page title */}
              <div
                className="border-b px-6 py-4"
                style={{ borderColor: subjectInfo.color + '40' }}
              >
                {editingTitle ? (
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') updateTitle()
                        if (e.key === 'Escape') setEditingTitle(false)
                      }}
                      className="text-2xl font-bold flex-1 px-2 py-1 border rounded bg-[var(--card-bg)] border-[var(--card-border)]"
                      style={{ color: subjectInfo.color }}
                      autoFocus
                    />
                    <button
                      onClick={updateTitle}
                      className="px-4 py-2 text-white rounded-lg"
                      style={{ backgroundColor: subjectInfo.color }}
                    >
                      Enregistrer
                    </button>
                    <button
                      onClick={() => setEditingTitle(false)}
                      className="px-4 py-2 bg-[var(--muted-bg)] rounded-lg"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <h1
                    className="text-2xl font-bold cursor-pointer hover:opacity-70 transition"
                    style={{ color: subjectInfo.color }}
                    onClick={() => setEditingTitle(true)}
                    title="Cliquer pour modifier le titre"
                  >
                    {page.title}
                  </h1>
                )}
              </div>

              {/* Block editor */}
              <BlockEditor pageId={pageId} color={subjectInfo.color} />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
