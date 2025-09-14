import type { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import connectToDatabase from "@/lib/mongoose";
import { Chat } from "@/models";
import { generateAIResponse, generateVisionResponse } from "@/lib/ai";
import { randomUUID } from "crypto";
  // import pdfParse from "pdf-parse";
// import pdf from "pdf-parse";
// import * as pdfjsLib from "pdfjs-dist";
// import pdf from "pdf-parse-debugging-disabled";
import { PdfReader,TableParser } from "pdfreader";
import fetch from "node-fetch"; 

// --- Custom context builder ---
type Message = { role: string; content: string };
type Attachment = { name: string; type: string; extractedText?: string };

interface ContextResult {
  context: string;
  recommendedModel: "text" | "image";
}

function buildCustomContext(
  messages: Message[],
  attachments: Attachment[] = []
): ContextResult {
  let contextSections: string[] = [];

  // ---- TEXT SECTION ----
  const lastFewMessages = messages
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => `- ${m.content}`)
    .join("\n");

  if (lastFewMessages) {
    contextSections.push(`Recent conversation context:\n${lastFewMessages}`);
  }

  // ---- PDF SECTION ----
  const pdfFiles = attachments.filter((f) => f.type === "application/pdf");
  if (pdfFiles.length > 0) {
    const pdfContext = pdfFiles
      .map((file) =>
        file.extractedText
          ? `- ${file.name} (PDF): ${file.extractedText.slice(0,500)}...`
          : `- ${file.name} (PDF)`
      )
      .join("\n");
    console.log();
    contextSections.push(`Attached PDFs:\n${pdfContext}`);
  }

  // ---- IMAGE SECTION ----
  const imageFiles = attachments.filter((f) => f.type.startsWith("image/"));
  if (imageFiles.length > 0) {
    const imageContext = imageFiles
      .map((file) => `- ${file.name} (Image)`)
      .join("\n");

    // contextSections.push(`Attached Images:\n${imageContext}`);
  }

  // ---- Decide recommended model ----
  let recommendedModel: "text" | "image" = "text";
  if (imageFiles.length > 0) {
    // If there is any image, always go for image model
    recommendedModel = "image";
  }

  return {
    context: contextSections.join("\n\n"),
    recommendedModel,
  };
}

 async function fetchPdfAsBase64(url: string): Promise<string> {
   const res = await fetch(url);
   if (!res.ok) {
     throw new Error(`Failed to fetch PDF: ${res.statusText}`);
   }
   const buffer = await res.arrayBuffer();
   return Buffer.from(buffer).toString("base64");
 }

async function extractPdfText(base64Data: string): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");

  return new Promise((resolve, reject) => {
    let table = new TableParser();
    let allText: string[] = [];

    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
      } else if (!item || (item as any).page) {
        // End of page
        const matrix = table.getMatrix();
        if (matrix) {
          const formatted = matrix
            .map((row: any) =>
              row.map((cell: any) => (cell ? cell.text : "")).join(" | ")
            )
            .join("\n");
          allText.push(formatted);
        }

        if (!item) {
          // End of file
          resolve(allText.join("\n\n"));
        } else {
          // Reset table for new page
          table = new TableParser();
        }
      } else if ((item as any).text) {
        const textItem = item as { text: string; x: number; y: number };

        // derive column index from x position
        const columnIndex = Math.floor((textItem.x || 0) / 50);

        table.processItem(textItem as any, columnIndex);
        allText.push(textItem.text);
      }
    });
  });
}


export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return new Response("Unauthorized", { status: 401 });

    const { messages, chatId, attachments } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    await connectToDatabase();

    // --- Preprocess attachments (extract PDF text if needed) ---
   const processedAttachments = await Promise.all(
     (attachments || []).map(async (file: any) => {
       if (file.type === "application/pdf" && file.url) {
         try {
           const base64 = await fetchPdfAsBase64(file.url);
           const text = await extractPdfText(base64);
           console.log("extracted text from pdf",text);
           return { ...file, extractedText: text };
         } catch (err) {
           console.error(`Failed to parse PDF ${file.name}:`, err);
           return file;
         }
       }
       return file;
     })
   );

   
      // --- Detect image or pdf ---
    const hasImage = processedAttachments?.some((f) =>
      f.type.startsWith("image/")
    );
    const hasPdf = processedAttachments?.some(
      (f) => f.type === "application/pdf"
    );

    // --- Build context ---
    const context = buildCustomContext(messages, processedAttachments);
    const contextualMessages = messages.map((m: any) => ({ ...m }));
    if (context.context && hasPdf) {
      contextualMessages.push({
        role: "system",
        content: `Additional context:\n${context.context}`,
      });
    }

    if (context && contextualMessages.length > 0) {
      const lastMessage = contextualMessages[contextualMessages.length - 1];
      if (lastMessage.role === "user") {
        lastMessage.content += `\n\n${context}`;
      }
    }


    var imageUrl: string[] = [];
    if (hasImage) {
      imageUrl = attachments
        .filter((f: any) => f.type.startsWith("image/"))
        .map((f: any) => f.url);
    }

    // --- Choose correct model ---
    let result;
    if (hasImage) {
      // console.log("inside image",contextualMessages);
      result = await generateVisionResponse(contextualMessages, imageUrl);
    } else if (hasPdf) {
      // console.log(contextualMessages, "messages in chat route with pdf");
      // console.log("inside pdf",contextualMessages);
      result = await generateAIResponse(contextualMessages);
    } else {
      // console.log("inside text",contextualMessages);
      result = await generateAIResponse(contextualMessages);
    }

    let fullResponse = "";
    const stream = new ReadableStream({
      async start(controller) {
        for await (const delta of result.textStream) {
          fullResponse += delta;
          controller.enqueue(new TextEncoder().encode(delta));
        }

        // Save conversation to DB
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
