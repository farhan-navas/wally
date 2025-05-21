export const runtime = "nodejs";
import "server-only";

import type z from "zod";
import { type formSchema } from "~/app/_components/schema";
import { openai } from "@ai-sdk/openai";
import { smoothStream, streamText } from "ai";
import type { LanguageModelV1, UIMessage, TextStreamPart, ToolSet } from "ai";
import { type NextRequest } from "next/server";
// import { type IncomingMessage, type ServerResponse } from "http";

// FOR STREAM OBJECT
// const openAiElement = z.object({
//   type: z.string().describe("the html tag of the message"),
//   text: z.string().describe("the text content of the message"),
// });

// const openAiSchema = z.object({
//   elements: openAiElement.array(),
// });

// smooth streaming for chinese characters
const chineseSplitter = smoothStream({
  chunking: /[\u4E00-\u9FFF]|\S+\s+/,
});

// wrap chineseSplitter in custom stream
const mixedLangTransform = () => {
  // create the smooth‐stream instance
  const transformer = chineseSplitter({ tools: {} });
  const { readable, writable } = transformer;

  return new TransformStream<TextStreamPart<ToolSet>, TextStreamPart<ToolSet>>({
    async transform(part, controller) {
      const text = part.type ?? "";
      if (/[\u4E00-\u9FFF]/.test(text)) {
        // send through chinese splitter writable
        const writer = writable.getWriter();
        await writer.write(part);
        writer.releaseLock();

        // pull smoothed chunks from the readable stream
        const reader = readable.getReader();
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        // english or non‐chinese chunks: emit immediately
        controller.enqueue(part);
      }
    },
  });
};

export async function POST(req: NextRequest) {
  const model: LanguageModelV1 = openai(
    // "ft:gpt-4o-mini-2024-07-18:personal:wally:BAqpHxk2", // training dataset #1 - 75 convos
    // "ft:gpt-4o-mini-2024-07-18:personal:wally:BArfmkN1", // training dataset #1 - 25 convos
    "gpt-4o-mini-2024-07-18",
  );

  const {
    messages,
    emotion,
    profileData,
  }: {
    messages: UIMessage[];
    emotion: string;
    profileData: z.infer<typeof formSchema>;
  } = (await req.json()) as {
    messages: UIMessage[];
    emotion: string;
    profileData: z.infer<typeof formSchema>;
  };

  const {
    name,
    gender,
    birthDate,
    relationship,
    heartLevel,
    race,
    country,
    language,
  } = profileData;

  const systemPrompt = `You are Wally, a caring and savvy relationship wellness assistant with a unique Asian flair. 
  Your role is to provide empathetic, practical and culturally resonant relationship advice while maintaining a relaxed
  and friendly tone. Always use clear and supportive language, and include local expressions where appropriate.
  If a user asks about topics outside your area of expertise, such as medical advice, legal matters, etc., politely inform them
  that you are not qualified to provide guidance on those subjects and suggest they consult with the appropriate professionals.`;

  const contextPrompt = `The user is currently trying to speak to ${name}. I want you to use the information provided to tailor 
  your responses to be more personalized and culturally resonant. This is what I know about ${name}: Gender: ${gender}, Birth Date:
  ${birthDate}, Relationship between user and ${name}: ${relationship}, Heart Level: ${heartLevel},  Race: ${race}, 
  Country: ${country}, Language: ${language}.`;

  const emotionPrompt = `The user is currently feeling ${emotion}. Tailor your responses to be more empathetic towards
  the user's current emotional state.`;

  // TRY STREAM OBJECT!!!
  // const result = streamObject({
  //   model: model,
  //   output: "array",
  //   schema: openAiSchema,
  //   schemaName: "Wally Relationship Assistant Response",
  //   schemaDescription:
  //     "A message object with type (h1, h2, h3, p, etc.) and text.",
  //   messages: [
  //     {
  //       role: "system",
  //       content: systemPrompt + " " + contextPrompt + " " + emotionPrompt,
  //     },
  //     ...messages,
  //   ],
  // });

  // return result.toTextStreamResponse({
  //   status: 200
  // });

  // STREAM TEXT
  const result = streamText({
    model: model,
    messages: [
      {
        role: "system",
        content: systemPrompt + " " + contextPrompt + " " + emotionPrompt,
      },
      ...messages,
    ],
    experimental_transform: mixedLangTransform,
  });

  return result.toDataStreamResponse({
    getErrorMessage: (error) => {
      if (error == null) {
        return "Unknown error occurred.";
      }
      if (typeof error === "string") {
        return error;
      }
      if (error instanceof Error) {
        return error.message;
      }
      return JSON.stringify(error);
    },
    sendUsage: false,
  });
}
