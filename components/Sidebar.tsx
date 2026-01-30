'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CrfpaPage, Subject, SUBJECTS } from '@/lib/types'
import { v4 as uuidv4 } from 'uuid'

interface SidebarProps {
  subject: Subject
}

export default function Sidebar({ subject }: SidebarProps) {
  const [pages, setPages] = useState<CrfpaPage[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const pathname = usePathname()
  const currentPageId = pathname.split('/')[2] || ''

  const subjectInfo = SUBJECTS.find((s) => s.id === subject)

  useEffect(() => {
    loadPages()
  }, [subject])

  async function loadPages() {
    setLoading(true)
    const { data, error } = await supabase
      .from('crfpa_pages')
      .select('*')
      .eq('subject', subject)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error loading pages:', error)
    } else {
      setPages(data || [])
    }
    setLoading(false)
  }

  async function addPage() {
    const newPage: Partial<CrfpaPage> = {
      id: uuidv4(),
      subject,
      title: 'Nouvelle page',
      order_index: pages.length,
    }

    const { error } = await supabase.from('crfpa_pages').insert(newPage)

    if (error) {
      console.error('Error creating page:', error)
      alert('Erreur lors de la création de la page')
    } else {
      loadPages()
    }
  }

  async function updatePageTitle(pageId: string) {
    if (!editTitle.trim()) return

    const { error } = await supabase
      .from('crfpa_pages')
      .update({ title: editTitle, updated_at: new Date().toISOString() })
      .eq('id', pageId)

    if (error) {
      console.error('Error updating page:', error)
    } else {
      setEditingId(null)
      loadPages()
    }
  }

  async function deletePage(pageId: string) {
    if (!confirm('Supprimer cette page et tous ses blocs ?')) return

    // Delete blocks first
    await supabase.from('crfpa_blocks').delete().eq('page_id', pageId)

    // Then delete page
    const { error } = await supabase.from('crfpa_pages').delete().eq('id', pageId)

    if (error) {
      console.error('Error deleting page:', error)
    } else {
      loadPages()
    }
  }

  async function movePage(pageId: string, direction: 'up' | 'down') {
    const pageIndex = pages.findIndex((p) => p.id === pageId)
    if (pageIndex === -1) return

    const newIndex = direction === 'up' ? pageIndex - 1 : pageIndex + 1
    if (newIndex < 0 || newIndex >= pages.length) return

    const currentPage = pages[pageIndex]
    const swapPage = pages[newIndex]

    // Swap order_index values
    await supabase
      .from('crfpa_pages')
      .update({ order_index: newIndex })
      .eq('id', currentPage.id)

    await supabase
      .from('crfpa_pages')
      .update({ order_index: pageIndex })
      .eq('id', swapPage.id)

    loadPages()
  }

  return (
    <aside
      className="w-64 min-h-screen border-r border-[var(--card-border)] p-4 bg-[var(--card-bg)]"
      style={{ borderColor: subjectInfo?.color + '40' }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="font-bold text-lg"
          style={{ color: subjectInfo?.color }}
        >
          Pages
        </h2>
        <button
          onClick={addPage}
          className="px-3 py-1 text-sm rounded-lg text-white hover:opacity-80 transition"
          style={{ backgroundColor: subjectInfo?.color }}
        >
          + Ajouter
        </button>
      </div>

      {loading ? (
        <p className="text-[var(--muted)] text-sm">Chargement...</p>
      ) : pages.length === 0 ? (
        <p className="text-[var(--muted)] text-sm">Aucune page. Créez-en une !</p>
      ) : (
        <ul className="space-y-1">
          {pages.map((page, index) => (
            <li key={page.id} className="group">
              {editingId === page.id ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') updatePageTitle(page.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="flex-1 px-2 py-1 text-sm border rounded bg-[var(--card-bg)] border-[var(--card-border)]"
                    autoFocus
                  />
                  <button
                    onClick={() => updatePageTitle(page.id)}
                    className="px-2 py-1 text-xs bg-green-500 text-white rounded"
                  >
                    OK
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  {/* Boutons de réordonnancement */}
                  <div className="flex flex-col opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => movePage(page.id, 'up')}
                      className={`px-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] ${
                        index === 0 ? 'invisible' : ''
                      }`}
                      title="Monter"
                      disabled={index === 0}
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => movePage(page.id, 'down')}
                      className={`px-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)] ${
                        index === pages.length - 1 ? 'invisible' : ''
                      }`}
                      title="Descendre"
                      disabled={index === pages.length - 1}
                    >
                      ▼
                    </button>
                  </div>
                  <Link
                    href={`/${subject}/${page.id}`}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm transition ${
                      currentPageId === page.id
                        ? 'text-white'
                        : 'hover:bg-[var(--hover-bg)]'
                    }`}
                    style={{
                      backgroundColor:
                        currentPageId === page.id
                          ? subjectInfo?.color
                          : undefined,
                    }}
                  >
                    {page.title}
                  </Link>
                  <button
                    onClick={() => {
                      setEditingId(page.id)
                      setEditTitle(page.title)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deletePage(page.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted)] hover:text-red-500"
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
