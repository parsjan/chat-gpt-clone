interface MemoryConfig {
  apiKey: string
  baseUrl?: string
}

interface MemoryResult {
  id: string
  memory: string
  score: number
  metadata?: Record<string, any>
}

interface MemorySearchResponse {
  results: MemoryResult[]
  total: number
}

class Mem0Client {
  private apiKey: string
  private baseUrl: string

  constructor(config: MemoryConfig) {
    console.log("cnfig",config.apiKey);
    this.apiKey = config.apiKey
    this.baseUrl = config.baseUrl || "https://api.mem0.ai"
  }

  async add(messages: any[], userId: string, metadata?: Record<string, any>) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/memories/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          user_id: userId,
          metadata: {
            timestamp: new Date().toISOString(),
            source: "chatgpt-clone",
            ...metadata,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Memory API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to add memory:", error)
      return null
    }
  }

  async search(query: string, userId: string, limit = 5): Promise<MemorySearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/memories/search/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          user_id: userId,
          limit,
        }),
      })

      if (!response.ok) {
        throw new Error(`Memory API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to search memory:", error)
      return { results: [], total: 0 }
    }
  }

  async getAll(userId: string, limit = 100): Promise<MemorySearchResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/memories/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Memory API error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        results: data.memories || [],
        total: data.total || 0,
      }
    } catch (error) {
      console.error("Failed to get memories:", error)
      return { results: [], total: 0 }
    }
  }

  async delete(memoryId: string, userId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/memories/${memoryId}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Memory API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to delete memory:", error)
      return null
    }
  }

  async update(memoryId: string, userId: string, newMemory: string) {
    try {
      const response = await fetch(`${this.baseUrl}/v1/memories/${memoryId}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          memory: newMemory,
          user_id: userId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Memory API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Failed to update memory:", error)
      return null
    }
  }
}

export const memoryClient = new Mem0Client({
  apiKey: process.env.NEXT_PUBLIC_MEM0_API_KEY || "",
});

// Enhanced memory management utilities
export class MemoryManager {
  static async addConversationMemory(
    messages: any[],
    userId: string,
    chatId: string,
    metadata?: Record<string, any>
  ) {
    // Filter and prepare messages for memory storage
    const relevantMessages = messages
      .filter((msg) => msg.role !== "system")
      .slice(-10); // Keep last 10 messages for context

    return await memoryClient.add(relevantMessages, userId, {
      chatId,
      messageCount: messages.length,
      ...metadata,
    });
  }

  // static async getRelevantContext(query: string, userId: string, limit = 3): Promise<string> {
  //   const memories = await memoryClient.search(query, userId, limit)

  //   if (!memories.results || memories.results.length === 0) {
  //     return ""
  //   }

  //   const contextItems = memories.results
  //     .filter((memory) => memory.score > 0.7) // Only high-relevance memories
  //     .map((memory) => `- ${memory.memory}`)
  //     .slice(0, limit)

  //   if (contextItems.length === 0) {
  //     return ""
  //   }

  //   return `\n\nRelevant context from previous conversations:\n${contextItems.join("\n")}`
  // }

  static async getRelevantContext(
    userId: string,
    history: { role: string; content: string }[]
  ) {
    try {
      const response = await memoryClient.search(userId, "recent chat",5);

      const results = response?.results ?? [];

      if (results.length > 0) {
        return results
      }

      // ✅ fallback to last 5 message contents (guaranteed string[])
      return history.slice(-5).map((m) => m.content);
    } catch (err) {
      console.error("⚠️ Mem0 failed, using fallback:", err);

      // ✅ also fallback here
      return history.slice(-5).map((m) => m.content);
    }
  }

  static async summarizeConversation(messages: any[]): Promise<string> {
    // Create a summary of the conversation for memory storage
    const userMessages = messages.filter((msg) => msg.role === "user");
    const assistantMessages = messages.filter(
      (msg) => msg.role === "assistant"
    );

    if (userMessages.length === 0) return "";

    const topics = userMessages
      .map((msg) => msg.content.slice(0, 100))
      .join("; ");
    const summary = `Conversation about: ${topics}. ${userMessages.length} user messages, ${assistantMessages.length} assistant responses.`;

    return summary;
  }

  static async cleanupOldMemories(
    userId: string,
    daysOld = 30
  ): Promise<number> {
    // This would require additional API endpoints from mem0
    // For now, we'll implement a placeholder
    console.log(
      `Cleanup requested for memories older than ${daysOld} days for user ${userId}`
    );
    return 0;
  }
}
