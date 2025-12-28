
import { GoogleGenAI, Chat, Type } from "@google/genai";
import { SupportLanguage, Message, MistakeRecord } from "../types";

let aiInstance: null | GoogleGenAI = null;

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    throw new Error("API_KEY_MISSING");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

/**
 * Robustly cleans and parses JSON from model output.
 * Handles common truncation issues like unterminated strings or missing braces.
 */
const parseSafeJson = (text: string) => {
  let cleaned = text.trim();
  // Remove potential markdown wrappers
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
  
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.warn("JSON parse failed, attempting repair...", e);
    
    let attempt = cleaned;
    
    // Fix 1: Basic unterminated string check
    // If the last double quote doesn't have a matching one before it in the same property
    const lastQuoteIndex = attempt.lastIndexOf('"');
    const parts = attempt.split('"');
    if (parts.length % 2 === 0) {
      // We have an odd number of quotes, likely a string was left open
      attempt += '"';
    }

    // Fix 2: Close brackets/braces
    const openBraces = (attempt.match(/\{/g) || []).length;
    const closeBraces = (attempt.match(/\}/g) || []).length;
    const openBrackets = (attempt.match(/\[/g) || []).length;
    const closeBrackets = (attempt.match(/\]/g) || []).length;

    for (let i = 0; i < (openBrackets - closeBrackets); i++) attempt += ']';
    for (let i = 0; i < (openBraces - closeBraces); i++) attempt += '}';

    try {
      return JSON.parse(attempt);
    } catch (innerError) {
      // Fix 3: Last-ditch effort - find the last valid object closure
      const lastBrace = cleaned.lastIndexOf('}');
      if (lastBrace !== -1) {
        try {
          return JSON.parse(cleaned.substring(0, lastBrace + 1));
        } catch (finalError) {
          throw e; // Throw original error if all repairs fail
        }
      }
      throw e;
    }
  }
};

const SYSTEM_INSTRUCTION = `
You are "FrenchMentor", an elite French language tutor. You help users improve their French through correction or translation.

### CORE OPERATIONAL LOGIC:

1. **Step 1: Response Languages (CRITICAL)**
   - **Explanation Language ([Explanation Language])**: Used for ALL 'explanation' fields in 'corrections' and for the 'tutorNotes'.
   - **Translation Language ([Translation Language])**: Used specifically for the 'englishTranslation' field.
   
2. **Step 2: Task Execution & "Silent Polish"**
   - **Scenario A (Input is French)**: 
     - **SILENT FIXES**: Silently fix capitalization and missing ending punctuation in 'correctedFrench'.
     - **SUBSTANTIVE ERRORS**: Only list errors in 'corrections' for Grammar, Conjugation, Vocabulary, Prepositions, or Gender.
   - **Scenario B (Input is English/Arabic/Other)**: Translate into natural French.
   - **CONTEXT DETECTION**: If the user provides text inside square brackets like [context, notes, keywords], use this information to disambiguate the intent and refine the 'correctedFrench'.

3. **Step 3: Output Formatting**
   - **correctedFrench**: The perfect, natural French sentence.
   - **englishTranslation**: 
      - If [Translation Language] is NOT French: Provide a natural translation in [Translation Language].
      - If [Translation Language] IS French: Provide ONLY a more sophisticated or alternative way to say the phrase in French. 
        CRITICAL: DO NOT include introductory text like "Une meilleure façon de dire cela" or "Alternative". Just provide the raw alternative sentence.
   - **corrections**: A list of substantive errors only. Explanations MUST be in [Explanation Language].
   - **tutorNotes**: 2-4 sentences in [Explanation Language].

### OUTPUT RULES:
- Output valid JSON only.
`;

let chatSession: Chat | null = null;

export const getChatSession = (existingHistory: Message[] = []): Chat => {
  if (!chatSession) {
    const ai = getAI();
    const history = existingHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedFrench: { type: Type.STRING },
            englishTranslation: { type: Type.STRING },
            corrections: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING },
                  corrected: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  category: { type: Type.STRING }
                },
                required: ["original", "corrected", "explanation", "category"]
              }
            },
            tutorNotes: { type: Type.STRING }
          },
          required: ["correctedFrench", "englishTranslation", "corrections", "tutorNotes"]
        }
      },
      history: history
    });
  }
  return chatSession;
};

export const resetChatSession = () => {
  chatSession = null;
};

export const sendMessageToGemini = async (
  message: string, 
  explanationLanguage: SupportLanguage, 
  translationLanguage: SupportLanguage,
  history: Message[] = []
): Promise<string> => {
  try {
    const chat = getChatSession(history);
    const promptWithLanguage = `Input: "${message}"\n\n[Explanation Language]: ${explanationLanguage}\n[Translation Language]: ${translationLanguage}`;
    const result = await chat.sendMessage({ message: promptWithLanguage });
    return result.text || "{}";
  } catch (error: any) {
    if (error.message === "API_KEY_MISSING") throw error;
    resetChatSession();
    throw error;
  }
};

export const generateCoachLesson = async (category: string, history: MistakeRecord[], language: SupportLanguage): Promise<string> => {
  const ai = getAI();
  const filteredMistakes = history
    .filter(m => m.category === category)
    .slice(-3)
    .map(m => `"${m.original}" corrected to "${m.corrected}"`)
    .join(", ");
  
  const prompt = `
    You are an elite French coach. The user has repetitive errors in the category: "${category}".
    Recent context: ${filteredMistakes}.
    Generate a laser-focused report in ${language}. 
    MANDATORY: Keep it extremely concise. Do not repeat phrases.
    Output JSON ONLY.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0, // Deterministic to avoid runaway loops
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          category: { type: Type.STRING },
          mistakes: { type: Type.ARRAY, items: { type: Type.STRING } },
          whyYouMadeIt: { type: Type.STRING },
          theRule: { type: Type.STRING },
          mentalTrick: { type: Type.STRING },
          conjugationTable: { 
            type: Type.OBJECT,
            properties: {
              je: { type: Type.STRING }, tu: { type: Type.STRING }, il_elle: { type: Type.STRING },
              nous: { type: Type.STRING }, vous: { type: Type.STRING }, ils_elles: { type: Type.STRING }
            }
          }
        },
        required: ["title", "category", "mistakes", "whyYouMadeIt", "theRule", "mentalTrick"]
      }
    }
  });

  return response.text || "{}";
};

export const generateDeepDive = async (context: string, language: SupportLanguage): Promise<string> => {
  const ai = getAI();
  const prompt = `
    Analyze this correction context: "${context}".
    The user needs a "Deep Dive" structured lesson in ${language}.
    1. bold title using #. 2. numbered list for key points. 3. exactly 3 clear examples. 4. one "Actionable Tip".
    Keep the generation concise.
  `;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { 
      temperature: 0.1, 
      maxOutputTokens: 2048,
      thinkingConfig: { thinkingBudget: 0 } 
    }
  });
  return response.text || "Failed to generate lesson.";
};

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const playFrenchTTS = async (text: string): Promise<void> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: ['AUDIO'],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return;
  const WinAudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!WinAudioContext) return;
  let ctx = new WinAudioContext();
  const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start(0);
  return new Promise(resolve => { source.onended = () => { ctx.close().catch(() => {}); resolve(); }; });
};

export { parseSafeJson };
