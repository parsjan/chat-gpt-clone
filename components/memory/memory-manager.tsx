"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Trash2, Edit3, Brain } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface Memory {
  id: string
  memory: string
  score?: number
  metadata?: Record<string, any>
}

export function MemoryManager() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null)
  const [editContent, setEditContent] = useState("")

  const fetchMemories = async (query?: string) => {
    setIsLoading(true)
    try {
      const url = query ? `/api/memory?query=${encodeURIComponent(query)}` : "/api/memory"
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch memories")
      }

      const data = await response.json()
      setMemories(data.results || [])
    } catch (error) {
      console.error("Error fetching memories:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const deleteMemory = async (memoryId: string) => {
    try {
      const response = await fetch(`/api/memory/${memoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete memory")
      }

      setMemories((prev) => prev.filter((m) => m.id !== memoryId))
    } catch (error) {
      console.error("Error deleting memory:", error)
    }
  }

  const updateMemory = async (memoryId: string, newContent: string) => {
    try {
      const response = await fetch(`/api/memory/${memoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ memory: newContent }),
      })

      if (!response.ok) {
        throw new Error("Failed to update memory")
      }

      setMemories((prev) => prev.map((m) => (m.id === memoryId ? { ...m, memory: newContent } : m)))
      setEditingMemory(null)
    } catch (error) {
      console.error("Error updating memory:", error)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchMemories(searchQuery)
  }

  const startEdit = (memory: Memory) => {
    setEditingMemory(memory)
    setEditContent(memory.memory)
  }

  const saveEdit = () => {
    if (editingMemory && editContent.trim()) {
      updateMemory(editingMemory.id, editContent.trim())
    }
  }

  useEffect(() => {
    fetchMemories()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          <h2 className="text-xl font-semibold">Memory Management</h2>
        </div>
        <Badge variant="secondary">{memories.length} memories</Badge>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          placeholder="Search memories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={isLoading}>
          <Search className="h-4 w-4" />
        </Button>
        <Button type="button" variant="outline" onClick={() => fetchMemories()} disabled={isLoading}>
          All
        </Button>
      </form>

      {/* Memory List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-3">
          {memories.map((memory) => (
            <Card key={memory.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{memory.memory}</p>
                    {memory.metadata && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {memory.metadata.chatId && (
                          <Badge variant="outline" className="text-xs">
                            Chat: {memory.metadata.chatId.slice(-8)}
                          </Badge>
                        )}
                        {memory.score && (
                          <Badge variant="outline" className="text-xs">
                            Score: {(memory.score * 100).toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => startEdit(memory)}>
                      <Edit3 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMemory(memory.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {memories.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No memories found</p>
              <p className="text-sm">Start chatting to build your memory bank</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={!!editingMemory} onOpenChange={() => setEditingMemory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Memory content..."
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingMemory(null)}>
                Cancel
              </Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
