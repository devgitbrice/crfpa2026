'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { CrfpaBlock } from '@/lib/types'

interface SpeechButtonProps {
  pageId: string
  pageTitle: string
  color: string
}

export default function SpeechButton({ pageId, pageTitle, color }: SpeechButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  async function loadPageContent(): Promise<string> {
    const { data: blocks, error } = await supabase
      .from('crfpa_blocks')
      .select('*')
      .eq('page_id', pageId)
      .order('order_index', { ascending: true })

    if (error) {
      throw new Error('Erreur lors du chargement du contenu')
    }

    // Construire le texte à lire
    let text = pageTitle + '. '

    if (blocks && blocks.length > 0) {
      text += blocks
        .filter((block: CrfpaBlock) => block.type !== 'divider' && block.content.trim())
        .map((block: CrfpaBlock) => {
          switch (block.type) {
            case 'heading1':
            case 'heading2':
            case 'heading3':
              return block.content + '. '
            case 'bullet':
            case 'numbered':
              return block.content + '. '
            case 'quote':
              return 'Citation: ' + block.content + '. '
            default:
              return block.content + ' '
          }
        })
        .join('')
    }

    return text.trim()
  }

  async function handleClick() {
    setError(null)

    // Si en cours de lecture, arrêter
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
      return
    }

    setIsLoading(true)

    try {
      const text = await loadPageContent()

      if (!text.trim()) {
        setError('Aucun contenu à lire')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Erreur lors de la génération audio')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      // Nettoyer l'ancien audio si présent
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src)
      }

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
        URL.revokeObjectURL(audioUrl)
      }

      audio.onerror = () => {
        setIsPlaying(false)
        setError('Erreur de lecture audio')
      }

      await audio.play()
      setIsPlaying(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-semibold transition hover:opacity-80 disabled:opacity-50"
        style={{ backgroundColor: color }}
      >
        {isLoading ? (
          <>
            <span className="animate-spin">&#9696;</span>
            Chargement...
          </>
        ) : isPlaying ? (
          <>
            <span>&#9632;</span>
            STOP
          </>
        ) : (
          <>
            <span>&#9658;</span>
            LECTURE
          </>
        )}
      </button>
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  )
}
