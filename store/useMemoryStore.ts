import { create } from "zustand"
import { devtools } from "zustand/middleware"

interface Memory {
  id: string
  memory: string
  score: number
  metadata?: Record<string, any>
}

interface MemoryState {
  memories: Memory[]
  isLoading: boolean
  error: string | null

  // Actions
  setMemories: (memories: Memory[]) => void
  addMemory: (memory: Memory) => void
  updateMemory: (id: string, updates: Partial<Memory>) => void
  removeMemory: (id: string) => void
  setIsLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // API actions
  loadMemories: () => Promise<void>
  searchMemories: (query: string) => Promise<Memory[]>
  createMemory: (memory: string, metadata?: Record<string, any>) => Promise<void>
  deleteMemory: (memoryId: string) => Promise<void>
  updateMemoryContent: (memoryId: string, content: string) => Promise<void>
}

export const useMemoryStore = create<MemoryState>()(
  devtools(
    (set, get) => ({
      memories: [],
      isLoading: false,
      error: null,

      setMemories: (memories) => set({ memories }),
      addMemory: (memory) =>
        set((state) => ({
          memories: [...state.memories, memory],
        })),
      updateMemory: (id, updates) =>
        set((state) => ({
          memories: state.memories.map((memory) => (memory.id === id ? { ...memory, ...updates } : memory)),
        })),
      removeMemory: (id) =>
        set((state) => ({
          memories: state.memories.filter((memory) => memory.id !== id),
        })),
      setIsLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      loadMemories: async () => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch("/api/memory")
          if (!response.ok) {
            throw new Error("Failed to load memories")
          }

          const { memories } = await response.json()
          set({ memories })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          set({ error: errorMessage })
        } finally {
          set({ isLoading: false })
        }
      },

      searchMemories: async (query) => {
        try {
          set({ isLoading: true, error: null })

          const response = await fetch("/api/memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, action: "search" }),
          })

          if (!response.ok) {
            throw new Error("Failed to search memories")
          }

          const { memories } = await response.json()
          return memories
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          set({ error: errorMessage })
          return []
        } finally {
          set({ isLoading: false })
        }
      },

      createMemory: async (memory, metadata) => {
        try {
          const response = await fetch("/api/memory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memory, metadata, action: "create" }),
          })

          if (!response.ok) {
            throw new Error("Failed to create memory")
          }

          const result = await response.json()
          get().addMemory(result.memory)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          set({ error: errorMessage })
          throw error
        }
      },

      deleteMemory: async (memoryId) => {
        try {
          const response = await fetch(`/api/memory/${memoryId}`, {
            method: "DELETE",
          })

          if (!response.ok) {
            throw new Error("Failed to delete memory")
          }

          get().removeMemory(memoryId)
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          set({ error: errorMessage })
          throw error
        }
      },

      updateMemoryContent: async (memoryId, content) => {
        try {
          const response = await fetch(`/api/memory/${memoryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memory: content }),
          })

          if (!response.ok) {
            throw new Error("Failed to update memory")
          }

          get().updateMemory(memoryId, { memory: content })
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Unknown error"
          set({ error: errorMessage })
          throw error
        }
      },
    }),
    { name: "memory-store" },
  ),
)

// Selectors
export const useMemories = () => useMemoryStore((state) => state.memories)
export const useMemoryLoading = () => useMemoryStore((state) => state.isLoading)
export const useMemoryError = () => useMemoryStore((state) => state.error)
