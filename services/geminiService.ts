import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ParanormalFact } from '../types';

// This function now fetches fact data including a prompt for image generation.
export async function fetchParanormalFacts(lang: 'fr' | 'en'): Promise<(Omit<ParanormalFact, 'imageUrl'> & { imagePrompt: string })[]> {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
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
        imagePrompt: { type: Type.STRING }, // Changed from imageUrl
      },
      required: ['id', 'title', 'summary', 'details', 'category', 'videoUrl', 'imagePrompt'],
    },
  };

  const categories = lang === 'fr'
    ? "['Fantôme', 'Sorcellerie', 'Créature', 'OVNI', 'Phénomène Surnaturel']"
    : "['Ghost', 'Witchcraft', 'Cryptid', 'UFO', 'Supernatural Phenomenon']";

  const prompt = `Generate a list of 5 unique, real-world paranormal or witchcraft facts in ${lang === 'fr' ? 'FRENCH' : 'ENGLISH'}. For each fact, provide: a unique id (string), a catchy title, a short summary (max 30 words), a detailed explanation (150-200 words), a category from ${categories}, a URL to a relevant, atmospheric, royalty-free stock video (from pexels.com), and a descriptive, detailed prompt (string, max 25 words) for an image generation model to create a spooky, atmospheric cover image that matches the fact. Call this property 'imagePrompt'. Ensure the generated content is unique each time this prompt is called. The entire response must be in ${lang === 'fr' ? 'FRENCH' : 'ENGLISH'}.`;

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
    const facts = JSON.parse(jsonText);
    return facts;

  } catch (error) {
    console.error("Error fetching facts from Gemini:", error);
    throw new Error("Failed to fetch data from Gemini API.");
  }
}

export async function generateImage(prompt: string): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        const candidate = response.candidates?.[0];
        if (candidate?.content?.parts) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    return part.inlineData.data; // This is the base64 string
                }
            }
        }
        
        throw new Error("No image data received from API.");
    } catch (error) {
        console.error("Error generating image from Gemini:", error);
        throw new Error("Failed to generate image from Gemini API.");
    }
}


export async function generateSpeech(text: string): Promise<string> {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' }, // A calm, deep voice
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech from Gemini:", error);
        throw new Error("Failed to generate speech from Gemini API.");
    }
}