'use client'

import { useState, useRef, useEffect } from 'react'
import { useChatbot } from '@/lib/ChatbotContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { insertContent, currentPageId } = useChatbot()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur de communication avec le chatbot')
      }

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.message }
      setMessages([...newMessages, assistantMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Desole, une erreur est survenue. Veuillez reessayer.' }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleInsert = async (content: string) => {
    if (insertContent) {
      await insertContent(content)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div
          className="mb-4 w-96 h-[500px] bg-[var(--card-bg)] rounded-xl shadow-2xl border border-[var(--card-border)] flex flex-col overflow-hidden"
          style={{ maxHeight: 'calc(100vh - 120px)' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="font-semibold text-sm">Assistant CRFPA</h3>
                <p className="text-xs text-blue-100">GPT-5.2</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-[var(--muted)] py-8">
                <span className="text-4xl block mb-3">👋</span>
                <p className="text-sm">
                  Bonjour ! Je suis votre assistant pour la preparation au CRFPA.
                </p>
                <p className="text-xs mt-2">
                  Posez-moi vos questions sur le droit administratif, les obligations, la procedure civile...
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-[var(--muted-bg)] text-[var(--foreground)]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Insert button for assistant messages */}
                  {message.role === 'assistant' && currentPageId && insertContent && (
                    <button
                      onClick={() => handleInsert(message.content)}
                      className="mt-2 flex items-center gap-1 text-xs px-2 py-1 bg-[var(--hover-bg)] hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded transition"
                      title="Inserer dans la page"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Inserer dans la page
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[var(--muted-bg)] rounded-lg px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-2 h-2 bg-[var(--muted)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--card-border)]">
            {!currentPageId && (
              <p className="text-xs text-[var(--muted)] mb-2 text-center">
                Ouvrez une page pour pouvoir inserer les reponses
              </p>
            )}
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                className="flex-1 resize-none rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  )
}
