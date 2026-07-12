import { GoogleGenAI, Type, Schema } from '@google/genai';

const apiKey = (import.meta as any).env.VITE_GEMINI_API_KEY;

export const ai = new GoogleGenAI(apiKey ? { apiKey } : {});

export async function parseReceiptWithAI(base64Image: string, mimeType: string) {
  if (!apiKey) {
    throw new Error("Missing Gemini API Key in .env");
  }

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      vendor: {
        type: Type.STRING,
        description: "The name of the store, vendor, or business on the receipt."
      },
      amount: {
        type: Type.NUMBER,
        description: "The total amount paid, extracted as a number without currency symbols."
      },
      date: {
        type: Type.STRING,
        description: "The date of the receipt in YYYY-MM-DD format."
      },
      category: {
        type: Type.STRING,
        description: "The best matching category from: Toll, Parking, Maintenance, Other.",
        enum: ["Toll", "Parking", "Maintenance", "Other"]
      }
    },
    required: ["vendor", "amount", "date", "category"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          { text: "Extract the details from this receipt." },
          { inlineData: { mimeType, data: base64Image } }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.1,
    }
  });

  const text = response.text;
  if (!text) throw new Error("AI returned empty response");
  
  return JSON.parse(text) as {
    vendor: string;
    amount: number;
    date: string;
    category: 'Toll' | 'Parking' | 'Other' | 'Maintenance';
  };
}

export async function chatWithAI(systemInstruction: string, conversationHistory: {role: 'user'|'model', text: string}[], newPrompt: string) {
  if (!apiKey) {
    throw new Error("Missing Gemini API Key in .env");
  }

  const formattedHistory = conversationHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      ...formattedHistory,
      { role: 'user', parts: [{ text: newPrompt }] }
    ],
    config: {
      systemInstruction: { role: 'system', parts: [{ text: systemInstruction }] },
      temperature: 0.7,
    }
  });

  return response.text || "Sorry, I couldn't process that.";
}
