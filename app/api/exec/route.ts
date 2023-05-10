import { NextResponse } from 'next/server';
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: "org-1O43dozdfALET5nbGRspn7Zv",
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
 
export async function GET() {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{
      role: "system",
      content: process.env.SYS_PROMPT ?? "",
    }],
  })
  return NextResponse.json({ ok : "ok" });
}