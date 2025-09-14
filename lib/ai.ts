import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { cohere } from "@ai-sdk/cohere";
import { mistral } from "@ai-sdk/mistral";
import { anthropic } from "@ai-sdk/anthropic";
import { bedrock } from "./bedrock";
import { deepinfra } from "@ai-sdk/deepinfra";
import { generateText, streamText } from "ai";
import fetch from "node-fetch";

async function getImageAsBase64(url: string) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

type ProviderType = "text" | "vision";

function getProviderClient(type: ProviderType) {
  if (type === "vision") {
    if (process.env.OPENAI_API_KEY) {
      return openai("gpt-4o-mini"); // supports images
    }
    if(process.env.DEEPINFRA_API_KEY){
      return deepinfra("meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8"); // supports images
    }
    if(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY){
      return bedrock("amazon.nova-lite-v1:0"); // supports images
    }
    if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return google("models/gemini-1.5-pro-latest"); // supports images
    }
    throw new Error("No vision-capable provider available.");
  }
  
  if (process.env.OPENAI_API_KEY) return openai("gpt-4o-mini");
  if (process.env.COHERE_API_KEY) return cohere("command-r");
  if (process.env.MISTRAL_API_KEY) return mistral("mistral-large-latest");
  if (process.env.ANTHROPIC_API_KEY) return anthropic("claude-3-opus-20240229");

  throw new Error("No valid AI provider API key found.");
}

function cleanMessages(messages: any[]) {
  return messages.filter(
    (m) =>
      m.content &&
      m.content.trim() !== "" &&
      !(Array.isArray(m.content) && m.content.length === 0)
  );
}

const titleModel = getProviderClient("text");

// 📌 Text-only
export async function generateAIResponse(messages: any[]) {
  console.log(messages ,"messages in generateAIResponse");
  const cleanedMessages = cleanMessages(messages);
  const aiModel = getProviderClient("text");

  return streamText({
    model: aiModel,
    messages:cleanedMessages,
    temperature: 0.7,
    maxOutputTokens: 2048,
  });
}

// 📌 Vision-capable
// inside the same file where generateVisionResponse is defined
export async function generateVisionResponse(
  messages: any[],
  imageUrls?: string[]
) {
  console.log(messages, "messages in generateVisionResponse");

  const aiModel = getProviderClient("vision");

  // Convert imageUrls into message content (if any)
  const imageContents = await Promise.all(
    imageUrls?.map(async (url) => ({
      type: "image",
      image: await getImageAsBase64(url),
    })) ?? []
  );

  // Take the last user message (or add a default)
  const lastMessage = messages[messages.length - 1] || {
    role: "user",
    content: "",
  };

  // If there are images, append them to the last user message
  const updatedMessages = [
    ...messages.slice(0, -1),
    {
      ...lastMessage,
      content: [
        {
          type: "text",
          text: lastMessage.content || "",
        },
        ...imageContents,
      ],
    },
  ];

  return streamText({
    model: aiModel,
    messages: updatedMessages,
    temperature: 0.7,
    maxOutputTokens: 2048,
  });
}



// -------------------- Generate a short title --------------------
export async function generateTitle(content: string) {
  try {
    const { text } = await generateText({
      model: titleModel,
      prompt: `Generate a short, descriptive title (max 6 words) for this conversation: "${content.slice(
        0,
        200
      )}..."`,
      temperature: 0.3,
      maxOutputTokens: 20,
    });

    return text.replace(/['"]/g, "").trim();
  } catch (err: any) {
    console.error("AI Title Generation Error:", err.message);
    throw new Error("Failed to generate title.");
  }
}
