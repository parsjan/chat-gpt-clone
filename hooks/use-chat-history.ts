"use client"

import { useState, useEffect, useCallback } from "react"
import type { Chat } from "@/types/chat"

export function useChatHistory() {
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChatHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/chat/history")

      if (!response.ok) {
        throw new Error("Failed to fetch chat history")
      }

      const { chats: chatHistory } = await response.json()
      setChats(chatHistory)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Error fetching chat history:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteChat = useCallback(async (chatId: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete chat")
      }

      setChats((prev) => prev.filter((chat) => chat.id !== chatId))
    } catch (err) {
      console.error("Error deleting chat:", err)
      throw err
    }
  }, [])

  const updateChatTitle = useCallback(async (chatId: string, title: string) => {
    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title }),
      })

      if (!response.ok) {
        throw new Error("Failed to update chat title")
      }

      setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, title } : chat)))
    } catch (err) {
      console.error("Error updating chat title:", err)
      throw err
    }
  }, [])

  useEffect(() => {
    fetchChatHistory()
  }, [fetchChatHistory])

  return {
    chats,
    isLoading,
    error,
    refetch: fetchChatHistory,
    deleteChat,
    updateChatTitle,
  }
}
