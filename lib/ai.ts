import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { mistral } from "@ai-sdk/mistral";
import { cohere } from "@ai-sdk/cohere";
import { generateText, streamText } from "ai";

function getProviderClient() {
  if (process.env.COHERE_API_KEY) {
    console.log("inside cohere");
    return cohere("command-r");
  }
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.log("inside gemini");
    return google("models/gemini-1.5-pro-latest");
  }
  if (process.env.MISTRAL_API_KEY) {
    console.log("inside mistral");
    return mistral("mistral-large-latest");
  }
  if (process.env.OPENAI_API_KEY) {
    console.log("inside openai");
    return openai("gpt-4o-mini");
  }
  if (process.env.ANTHROPIC_API_KEY) {
    console.log("inside anthropic");
    return anthropic("claude-3-opus-20240229");
  }

  throw new Error(
    "No valid AI provider API key found. Please check your environment variables."
  );
}

const aiModel = getProviderClient();

// ✅ Stream AI responses (chat-like)
export async function generateAIResponse(messages: any[]) {
  try {
    return await streamText({
      model: aiModel,
      messages,
      temperature: 0.7,
      maxOutputTokens: 2048,
    });
  } catch (err: any) {
    console.error("AI Response Error:", err.message);
    throw new Error("Failed to generate AI response.");
  }
}

// ✅ Generate a short title
export async function generateTitle(content: string) {
  try {
    const { text } = await generateText({
      model: aiModel,
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
