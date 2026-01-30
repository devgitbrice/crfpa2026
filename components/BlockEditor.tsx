'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { CrfpaBlock, BLOCK_TYPES } from '@/lib/types'
import { useChatbot } from '@/lib/ChatbotContext'
import { v4 as uuidv4 } from 'uuid'

interface BlockEditorProps {
  pageId: string
  color: string
}

export default function BlockEditor({ pageId, color }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<CrfpaBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const [showTypeMenu, setShowTypeMenu] = useState<string | null>(null)
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const { registerInsertHandler, unregisterInsertHandler, setCurrentPageId } = useChatbot()

  // Register chatbot insert handler
  const insertContentFromChatbot = useCallback(async (content: string) => {
    const newBlock: Partial<CrfpaBlock> = {
      id: uuidv4(),
      page_id: pageId,
      type: 'text',
      content: content,
      order_index: blocks.length,
    }

    const { error } = await supabase.from('crfpa_blocks').insert(newBlock)

    if (error) {
      console.error('Error creating block from chatbot:', error)
    } else {
      // Reload blocks to show the new content
      const { data } = await supabase
        .from('crfpa_blocks')
        .select('*')
        .eq('page_id', pageId)
        .order('order_index', { ascending: true })

      if (data) {
        setBlocks(data)
        setActiveBlockId(newBlock.id!)
      }
    }
  }, [pageId, blocks.length])

  useEffect(() => {
    setCurrentPageId(pageId)
    registerInsertHandler(insertContentFromChatbot)

    return () => {
      setCurrentPageId(null)
      unregisterInsertHandler()
    }
  }, [pageId, insertContentFromChatbot, registerInsertHandler, unregisterInsertHandler, setCurrentPageId])

  useEffect(() => {
    loadBlocks()
  }, [pageId])

  async function loadBlocks() {
    setLoading(true)
    const { data, error } = await supabase
      .from('crfpa_blocks')
      .select('*')
      .eq('page_id', pageId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error loading blocks:', error)
    } else {
      setBlocks(data || [])
    }
    setLoading(false)
  }

  async function addBlock(afterIndex: number = -1) {
    const newBlock: Partial<CrfpaBlock> = {
      id: uuidv4(),
      page_id: pageId,
      type: 'text',
      content: '',
      order_index: afterIndex + 1,
    }

    // Update order of blocks after this one
    if (afterIndex >= 0) {
      const blocksToUpdate = blocks.filter((b) => b.order_index > afterIndex)
      for (const block of blocksToUpdate) {
        await supabase
          .from('crfpa_blocks')
          .update({ order_index: block.order_index + 1 })
          .eq('id', block.id)
      }
    }

    const { error } = await supabase.from('crfpa_blocks').insert(newBlock)

    if (error) {
      console.error('Error creating block:', error)
    } else {
      loadBlocks()
      setActiveBlockId(newBlock.id!)
    }
  }

  async function updateBlock(blockId: string, updates: Partial<CrfpaBlock>) {
    // Update local state immediately
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, ...updates } : b))
    )

    // Debounce save to database
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(async () => {
      const { error } = await supabase
        .from('crfpa_blocks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', blockId)

      if (error) {
        console.error('Error updating block:', error)
      }
    }, 500)
  }

  async function deleteBlock(blockId: string) {
    const { error } = await supabase
      .from('crfpa_blocks')
      .delete()
      .eq('id', blockId)

    if (error) {
      console.error('Error deleting block:', error)
    } else {
      loadBlocks()
    }
  }

  async function moveBlock(blockId: string, direction: 'up' | 'down') {
    const blockIndex = blocks.findIndex((b) => b.id === blockId)
    if (blockIndex === -1) return

    const newIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1
    if (newIndex < 0 || newIndex >= blocks.length) return

    const currentBlock = blocks[blockIndex]
    const swapBlock = blocks[newIndex]

    await supabase
      .from('crfpa_blocks')
      .update({ order_index: newIndex })
      .eq('id', currentBlock.id)

    await supabase
      .from('crfpa_blocks')
      .update({ order_index: blockIndex })
      .eq('id', swapBlock.id)

    loadBlocks()
  }

  function renderBlockContent(block: CrfpaBlock) {
    const baseClasses =
      'w-full bg-transparent border-none outline-none resize-none'

    switch (block.type) {
      case 'heading1':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Titre 1..."
            className={`${baseClasses} text-3xl font-bold`}
            rows={1}
          />
        )
      case 'heading2':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Titre 2..."
            className={`${baseClasses} text-2xl font-bold`}
            rows={1}
          />
        )
      case 'heading3':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Titre 3..."
            className={`${baseClasses} text-xl font-semibold`}
            rows={1}
          />
        )
      case 'bullet':
        return (
          <div className="flex gap-2">
            <span className="text-lg">•</span>
            <textarea
              value={block.content}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              placeholder="Élément de liste..."
              className={baseClasses}
              rows={1}
            />
          </div>
        )
      case 'numbered':
        const blockIndex = blocks.filter((b) => b.type === 'numbered').indexOf(block) + 1
        return (
          <div className="flex gap-2">
            <span className="text-lg min-w-[20px]">{blockIndex}.</span>
            <textarea
              value={block.content}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              placeholder="Élément de liste..."
              className={baseClasses}
              rows={1}
            />
          </div>
        )
      case 'quote':
        return (
          <div className="border-l-4 pl-4" style={{ borderColor: color }}>
            <textarea
              value={block.content}
              onChange={(e) =>
                updateBlock(block.id, { content: e.target.value })
              }
              placeholder="Citation..."
              className={`${baseClasses} italic text-[var(--muted)]`}
              rows={2}
            />
          </div>
        )
      case 'code':
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Code..."
            className={`${baseClasses} font-mono bg-[var(--muted-bg)] p-3 rounded-lg text-sm`}
            rows={3}
          />
        )
      case 'divider':
        return <hr className="border-t-2 my-2" style={{ borderColor: color }} />
      default:
        return (
          <textarea
            value={block.content}
            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
            placeholder="Tapez '/' pour les commandes, ou commencez à écrire..."
            className={baseClasses}
            rows={1}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement
              target.style.height = 'auto'
              target.style.height = target.scrollHeight + 'px'
            }}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--muted)]">
        Chargement des blocs...
      </div>
    )
  }

  return (
    <div className="p-6">
      {blocks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted)] mb-4">
            Cette page est vide. Ajoutez votre premier bloc !
          </p>
          <button
            onClick={() => addBlock(-1)}
            className="px-4 py-2 rounded-lg text-white hover:opacity-80 transition"
            style={{ backgroundColor: color }}
          >
            + Ajouter un bloc
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`group relative p-3 rounded-lg border transition ${
                activeBlockId === block.id
                  ? 'border-[var(--card-border)] bg-[var(--muted-bg)]'
                  : 'border-transparent hover:border-[var(--card-border)]'
              }`}
              onClick={() => setActiveBlockId(block.id)}
            >
              {/* Block controls */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 opacity-0 group-hover:opacity-100 flex flex-col gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowTypeMenu(showTypeMenu === block.id ? null : block.id)
                  }}
                  className="p-1 text-xs bg-[var(--muted-bg)] rounded hover:bg-[var(--hover-bg)]"
                  title="Changer le type"
                >
                  ⋮⋮
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveBlock(block.id, 'up')
                  }}
                  className="p-1 text-xs bg-[var(--muted-bg)] rounded hover:bg-[var(--hover-bg)]"
                  title="Monter"
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveBlock(block.id, 'down')
                  }}
                  className="p-1 text-xs bg-[var(--muted-bg)] rounded hover:bg-[var(--hover-bg)]"
                  title="Descendre"
                  disabled={index === blocks.length - 1}
                >
                  ↓
                </button>
              </div>

              {/* Type menu */}
              {showTypeMenu === block.id && (
                <div className="absolute left-0 top-0 -translate-x-full mr-2 bg-[var(--card-bg)] shadow-lg rounded-lg border border-[var(--card-border)] p-2 z-10 w-48">
                  <p className="text-xs text-[var(--muted)] mb-2 px-2">Type de bloc</p>
                  {BLOCK_TYPES.map((type) => (
                    <button
                      key={type.type}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateBlock(block.id, { type: type.type })
                        setShowTypeMenu(null)
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-sm hover:bg-[var(--hover-bg)] flex items-center gap-2 ${
                        block.type === type.type ? 'bg-[var(--muted-bg)]' : ''
                      }`}
                    >
                      <span className="w-6 text-center font-mono text-xs">
                        {type.icon}
                      </span>
                      {type.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Block content */}
              {renderBlockContent(block)}

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteBlock(block.id)
                }}
                className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-[var(--muted)] hover:text-red-500"
                title="Supprimer"
              >
                ✕
              </button>
            </div>
          ))}

          {/* Add block button */}
          <button
            onClick={() => addBlock(blocks.length - 1)}
            className="w-full py-3 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--hover-bg)] rounded-lg border-2 border-dashed border-[var(--card-border)] hover:border-[var(--muted)] transition"
          >
            + Ajouter un bloc
          </button>
        </div>
      )}
    </div>
  )
}
