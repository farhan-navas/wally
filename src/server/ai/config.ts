import { OpenAI } from "openai";
import { env } from "~/envServer";

const openAi = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export default openAi;
