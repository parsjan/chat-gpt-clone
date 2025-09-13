import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { Chat } from "@/models";
import { generateAIResponse } from "@/lib/ai";
import { randomUUID } from "crypto"; // for unique message IDs

function buildCustomContext(
  messages: { role: string; content: string }[],
  attachments: { name: string; type: string }[] = []
): string {
  let context = "";

  const lastFewMessages = messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => `- ${m.content}`)
    .join("\n");

  if (lastFewMessages) {
    context += `\n\nRecent conversation context:\n${lastFewMessages}`;
  }

  if (attachments.length > 0) {
    const attachmentContext = attachments
      .map((file) => `- ${file.name} (${file.type})`)
      .join("\n");

    context += `\n\nAttached files:\n${attachmentContext}`;
  }

  return context;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, chatId, attachments } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    await connectToDatabase();

    // Build custom context
    const context = buildCustomContext(messages, attachments);

    // Merge context into last user message
    const contextualMessages = [...messages];
    if (context && contextualMessages.length > 0) {
      const lastMessage = contextualMessages[contextualMessages.length - 1];
      if (lastMessage.role === "user") {
        lastMessage.content += `\n\n${context}`;
      }
    }

    // Generate AI response (streaming)
    const result = await generateAIResponse(contextualMessages);

    let fullResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        for await (const delta of result.textStream) {
          fullResponse += delta;
          controller.enqueue(new TextEncoder().encode(delta));
        }

        // ✅ Once streaming is done, save both messages to DB
        const userMessage = messages[messages.length - 1];

        await Chat.findOneAndUpdate(
          { id: chatId, userId },
          {
            $push: {
              messages: [
                {
                  id: userMessage.id || randomUUID(),
                  role: "user",
                  content: userMessage.content,
                  timestamp: new Date(),
                  attachments: userMessage.attachments || [],
                },
                {
                  id: randomUUID(),
                  role: "assistant",
                  content: fullResponse,
                  timestamp: new Date(),
                },
              ],
            },
            $inc: { "metadata.messageCount": 2 },
          },
          { upsert: true, new: true }
        );

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
