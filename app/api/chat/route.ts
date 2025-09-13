import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { Chat } from "@/models";
import { generateAIResponse } from "@/lib/ai";

// 🔹 Custom Context Creator
function buildCustomContext(
  messages: { role: string; content: string }[],
  attachments: { name: string; type: string }[] = []
): string {
  let context = "";

  // 1. Last few messages (conversation context)
  const lastFewMessages = messages
    .filter((m) => m.role === "user")
    .slice(-3) // take last 3 user messages
    .map((m) => `- ${m.content}`)
    .join("\n");

  if (lastFewMessages) {
    context += `\n\nRecent conversation context:\n${lastFewMessages}`;
  }

  // 2. Attachments
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

    // 🔹 Build custom context
    const context = buildCustomContext(messages, attachments);

    // 🔹 Merge context into last user message
    const contextualMessages = [...messages];
    if (context && contextualMessages.length > 0) {
      const lastMessage = contextualMessages[contextualMessages.length - 1];
      if (lastMessage.role === "user") {
        lastMessage.content += `\n\n${context}`;
      }
    }

    // 🔹 Stream AI response (from dynamic provider)
    const result = await generateAIResponse(contextualMessages);

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
