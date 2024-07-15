import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/src/resources/index.js";
import { generatePrompt } from "./promt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const run = async(name:string, history:ChatCompletionMessageParam[]): Promise<string>=> {
    const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [{
          "role": "system",
          "content": generatePrompt(name)
        },  
        ...history
      ],
        temperature: 1,
        max_tokens: 800,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
    });
    return response.choices[0].message.content
}

export {run}

