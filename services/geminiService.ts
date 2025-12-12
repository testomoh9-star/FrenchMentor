import { GoogleGenAI, Chat, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are "FrenchMentor", an expert French language tutor.
Your goal is to correct user inputs or translate them, providing structured feedback.

Logic:
1. **Analyze**: Check if input is French or English.
2. **If French**:
   - Correct grammar, spelling, and syntax.
   - Identify specific errors.
   - For each error, provide the 'original' mistake, the 'corrected' version, and a brief 'explanation'.
   - Provide an English translation of the corrected phrase.
   - Write helpful 'tutorNotes' summarizing the main grammar rules applied.
3. **If English**:
   - Translate to natural French.
   - Leave 'corrections' array empty (or identify if they used 'Franglais').
   - Provide the English original as 'englishTranslation'.
   - Use 'tutorNotes' to explain the French vocabulary/grammar choices.

Output **JSON** only.
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4, // Lower temperature for consistent JSON
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedFrench: { type: Type.STRING, description: "The corrected or translated French sentence." },
            englishTranslation: { type: Type.STRING, description: "English translation of the French sentence." },
            corrections: {
              type: Type.ARRAY,
              description: "List of specific corrections made.",
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "The specific word/phrase that was incorrect." },
                  corrected: { type: Type.STRING, description: "The corrected version of that specific word/phrase." },
                  explanation: { type: Type.STRING, description: "Brief grammar rule explaining the fix." }
                }
              }
            },
            tutorNotes: { type: Type.STRING, description: "A paragraph of general explanation and grammar tips." }
          }
        }
      },
    });
  }
  return chatSession;
};

export const resetChatSession = () => {
  chatSession = null;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  const chat = getChatSession();
  
  try {
    // We do not stream here because we need valid JSON to render the UI components correctly.
    const result = await chat.sendMessage({ message });
    return result.text || "{}";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};