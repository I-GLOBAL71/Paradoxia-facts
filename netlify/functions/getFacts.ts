import { GoogleGenAI, Type } from "@google/genai";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { ParanormalFact } from "../../src/types";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (!process.env.API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "API_KEY environment variable is not set." }),
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        summary: { type: Type.STRING },
        details: { type: Type.STRING },
        category: { type: Type.STRING },
        videoUrl: { type: Type.STRING },
        imageUrl: { type: Type.STRING },
      },
      required: ['id', 'title', 'summary', 'details', 'category', 'videoUrl', 'imageUrl'],
    },
  };

  const prompt = `Generate a list of 5 unique, real-world paranormal or witchcraft facts. For each fact, provide: a unique id (string), a catchy title, a short summary (max 30 words), a detailed explanation (150-200 words), a category from ['Ghost', 'Witchcraft', 'Cryptid', 'UFO', 'Supernatural Phenomenon'], a URL to a relevant, atmospheric, royalty-free stock video (from pexels.com), and a URL for a spooky cover image using picsum.photos with a unique seed (e.g., https://picsum.photos/seed/yourseed/600/800). Ensure the generated content is unique each time this prompt is called.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonText = response.text.trim();
    // We parse and stringify to ensure it's valid JSON being sent.
    const facts = JSON.parse(jsonText);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(facts),
    };
  } catch (error) {
    console.error("Error fetching facts from Gemini:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch data from Gemini API." }),
    };
  }
};

export { handler };
