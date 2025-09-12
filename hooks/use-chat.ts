"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useChat as useAIChat } from "@ai-sdk/react"
import type { Message, FileAttachment } from "@/types/chat"

interface UseChatProps {
  chatId?: string
  initialMessages?: Message[]
}

export function useChat({ chatId, initialMessages = [] }: UseChatProps = {}) {
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [input, setInput] = useState("")

  const { messages, status, error, sendMessage, stop, setMessages, regenerate } = useAIChat({
    api: "/api/chat",
    id: currentChatId,
    initialMessages,
    body: {
      chatId: currentChatId,
      attachments,
    },
    onError: (error) => {
      console.error("Chat error:", error)
    },
    onFinish: () => {
      setAttachments([])
      setInput("")
    },
  })

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const isLoading = status === "streaming" || status === "submitted"

  const createNewChat = useCallback(
    async (firstMessage?: string) => {
      try {
        const response = await fetch("/api/chat/new", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firstMessage }),
        })

        if (!response.ok) {
          throw new Error("Failed to create new chat")
        }

        const { chatId: newChatId } = await response.json()
        setCurrentChatId(newChatId)
        setMessages([])

        return newChatId
      } catch (error) {
        console.error("Error creating new chat:", error)
        throw error
      }
    },
    [setMessages],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim() && attachments.length === 0) return

      // Create new chat if none exists
      if (!currentChatId) {
        try {
          const newChatId = await createNewChat(input.trim())
          setCurrentChatId(newChatId)
        } catch (error) {
          console.error("Failed to create chat:", error)
          return
        }
      }

      sendMessage(input, {
        body: {
          chatId: currentChatId,
          attachments,
        },
      })
    },
    [currentChatId, input, attachments, createNewChat, sendMessage],
  )

  const reload = useCallback(() => {
    regenerate()
  }, [regenerate])

  const addAttachment = useCallback((file: FileAttachment) => {
    setAttachments((prev) => [...prev, file])
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }, [])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
    chatId: currentChatId,
    createNewChat,
    setMessages,
    attachments,
    addAttachment,
    removeAttachment,
  }
}
