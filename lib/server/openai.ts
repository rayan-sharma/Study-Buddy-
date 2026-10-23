// One OpenAI client for summaries and follow-up answers. Server-only.
import OpenAI from "openai";
import { env, requireEnv } from "./env";

let client: OpenAI | undefined;

export function openai(): OpenAI {
  client ??= new OpenAI({ apiKey: requireEnv("OPENAI_API_KEY") });
  return client;
}

export const textModel = () => env("OPENAI_TEXT_MODEL") ?? "gpt-5.4-mini";
