'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface ChatbotContextType {
  insertContent: ((content: string) => Promise<void>) | null
  registerInsertHandler: (handler: (content: string) => Promise<void>) => void
  unregisterInsertHandler: () => void
  currentPageId: string | null
  setCurrentPageId: (pageId: string | null) => void
}

const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined)

export function ChatbotProvider({ children }: { children: ReactNode }) {
  const [insertHandler, setInsertHandler] = useState<((content: string) => Promise<void>) | null>(null)
  const [currentPageId, setCurrentPageId] = useState<string | null>(null)

  const registerInsertHandler = useCallback((handler: (content: string) => Promise<void>) => {
    setInsertHandler(() => handler)
  }, [])

  const unregisterInsertHandler = useCallback(() => {
    setInsertHandler(null)
  }, [])

  return (
    <ChatbotContext.Provider
      value={{
        insertContent: insertHandler,
        registerInsertHandler,
        unregisterInsertHandler,
        currentPageId,
        setCurrentPageId,
      }}
    >
      {children}
    </ChatbotContext.Provider>
  )
}

export function useChatbot() {
  const context = useContext(ChatbotContext)
  if (context === undefined) {
    throw new Error('useChatbot must be used within a ChatbotProvider')
  }
  return context
}
