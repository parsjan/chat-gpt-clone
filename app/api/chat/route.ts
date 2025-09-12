import type { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import connectToDatabase from "@/lib/mongoose"
import { Chat } from "@/models"
import { MemoryManager } from "@/lib/memory"

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages, chatId, attachments } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 })
    }

    await connectToDatabase()

    // Process attachments and add context
    let attachmentContext = ""
    if (attachments && attachments.length > 0) {
      attachmentContext = `\n\nAttached files:\n${attachments
        .map((file: any) => `- ${file.name} (${file.type})`)
        .join("\n")}`
    }

    // Get relevant memories for context using enhanced memory manager
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()
    let memoryContext = ""

    if (lastUserMessage) {
      try {
        memoryContext = await MemoryManager.getRelevantContext(lastUserMessage.content, userId, 3)
      } catch (error) {
        console.error("Memory search failed:", error)
      }
    }

    // Prepare messages for AI with context
    const contextualMessages = [...messages]
    if ((memoryContext || attachmentContext) && contextualMessages.length > 0) {
      const lastMessage = contextualMessages[contextualMessages.length - 1]
      if (lastMessage.role === "user") {
        lastMessage.content += attachmentContext + memoryContext
      }
    }

    // Generate streaming response
    const result = streamText({
      model: openai("gpt-4o-mini"),
      messages: contextualMessages,
      temperature: 0.7,
      maxOutputTokens: 2048,
      async onFinish({ text, usage }) {
        try {
          // Save conversation to memory using enhanced memory manager
          await MemoryManager.addConversationMemory(
            [...messages, { role: "assistant", content: text }],
            userId,
            chatId || "temp",
            {
              model: "gpt-4o-mini",
              tokens: usage?.totalTokens,
              attachmentCount: attachments?.length || 0,
            },
          )

          if (chatId) {
            const lastUserMessage = messages[messages.length - 1]

            // Add attachments to the user message if they exist
            if (attachments && attachments.length > 0) {
              lastUserMessage.attachments = attachments
            }

            const userMessage = {
              id: lastUserMessage.id || Date.now().toString(),
              role: lastUserMessage.role,
              content: lastUserMessage.content,
              timestamp: new Date(),
              attachments: lastUserMessage.attachments,
            }

            const assistantMessage = {
              id: (Date.now() + 1).toString(),
              role: "assistant" as const,
              content: text,
              timestamp: new Date(),
              metadata: {
                model: "gpt-4o-mini",
                tokens: usage?.totalTokens,
              },
            }

            await Chat.findOneAndUpdate(
              { id: chatId, userId },
              {
                $push: {
                  messages: {
                    $each: [userMessage, assistantMessage],
                  },
                },
                $inc: {
                  "metadata.messageCount": 2,
                  "metadata.totalTokens": usage?.totalTokens || 0,
                },
                updatedAt: new Date(),
              },
              { upsert: true, new: true },
            )
          }

          console.log("Token usage:", usage)
        } catch (error) {
          console.error("Error saving conversation:", error)
        }
      },
    })

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
