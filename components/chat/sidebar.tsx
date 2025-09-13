"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserButton } from "@clerk/nextjs"
import { Plus, MessageSquare, Settings, X, Trash2, Edit3, Brain } from "lucide-react"
import { cn } from "@/lib/utils"
import { useChatHistory, useChatStore } from "@/store"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface SidebarProps {
  onClose?: () => void
  currentChatId?: string
}

export function Sidebar({ onClose, currentChatId }: SidebarProps) {
  const chats = useChatHistory()
  const { loadChatHistory, deleteChat, updateChatTitle, resetCurrentChat } = useChatStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const router = useRouter()
  // console.log(chats,"chat history");
  useEffect(() => {
    loadChatHistory()
  }, [loadChatHistory])

  const handleNewChat = () => {
    resetCurrentChat()
    router.push("/chat")
    onClose?.()
  }

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`)
    onClose?.()
  }

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId)
      if (currentChatId === chatId) {
        router.push("/chat")
      }
    } catch (error) {
      console.error("Failed to delete chat:", error)
    }
  }

  const handleEditTitle = (chat: any) => {
    setEditingId(chat.id)
    setEditTitle(chat.title)
  }

  const handleSaveTitle = async (chatId: string) => {
    try {
      await updateChatTitle(chatId, editTitle)
      setEditingId(null)
    } catch (error) {
      console.error("Failed to update title:", error)
    }
  }

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <h2 className="text-lg font-semibold text-sidebar-foreground">ChatGPT</h2>
        {/* {onClose && (
          <Button variant="ghost" size="sm" onClick={()=>onClose()}>
            <X className="h-4 w-4" />
          </Button>
        )} */}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-3 bg-sidebar-accent hover:bg-sidebar-accent/80 text-sidebar-accent-foreground"
          variant="ghost"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>

      {/* Chat History */}
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-sidebar-accent",
                currentChatId === chat.id && "bg-sidebar-accent",
              )}
              onClick={() => handleChatSelect(chat.id)}
            >
              <MessageSquare className="h-4 w-4 text-sidebar-foreground/60" />

              {editingId === chat.id ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={() => handleSaveTitle(chat.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle(chat.id)
                    if (e.key === "Escape") setEditingId(null)
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-sidebar-foreground"
                  autoFocus
                />
              ) : (
                <span className="flex-1 truncate text-sidebar-foreground">{chat.title}</span>
              )}

              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditTitle(chat)
                  }}
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteChat(chat.id)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4 space-y-3">
        {/* Memory Management Link */}
        <Link href="/settings">
          <Button variant="ghost" className="w-full justify-start gap-3 text-sidebar-foreground">
            <Brain className="h-4 w-4" />
            Memory & Settings
          </Button>
        </Link>

        {/* User Account */}
        <div className="flex items-center gap-3">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">User Account</p>
          </div>
          <Link href="/settings">
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
