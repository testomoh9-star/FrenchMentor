
import { GoogleGenAI, Chat, Type, Modality } from "@google/genai";
import { SupportLanguage, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are "FrenchMentor", an elite French language tutor. You help users improve their French through correction or translation.

### CORE OPERATIONAL LOGIC:

1. **Step 1: Response Language (CRITICAL)**
   - The user has selected a System Language ([Response Language]).
   - ALL 'explanation' fields in the 'corrections' list MUST be written in the [Response Language].
   - The 'tutorNotes' MUST be written in the [Response Language].
   - If [Response Language] is Arabic, use formal Modern Standard Arabic for explanations.

2. **Step 2: Task Execution**
   - **Scenario A (Input is French)**: Meticulously find every error (spelling, grammar, gender agreement). List them item-by-item in 'corrections'. 
   - **Assign a category to each correction** from: "Grammar", "Spelling", "Vocabulary", "Conjugation".
   - **Scenario B (Input is English or Arabic)**: Translate the input into natural, Standard French. Use 'corrections' to explain why specific French structures were chosen (prefix with "Translation Tip:").

3. **Step 3: Output Formatting**
   - **correctedFrench**: The final perfect French sentence.
   - **englishTranslation**: A natural English translation of that sentence (Always English).
   - **corrections**: A list of objects {original, corrected, explanation, category}.
   - **tutorNotes**: A brief pedagogical summary (2-4 sentences) in the [Response Language].

### OUTPUT RULES:
- Output valid JSON only.
- DO NOT use English for explanations if the [Response Language] is French or Arabic.
`;

let chatSession: Chat | null = null;

export const getChatSession = (existingHistory: Message[] = []): Chat => {
  if (!chatSession) {
    const history = existingHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    }));

    // Use gemini-3-flash-preview for correction tasks as it's the recommended model for basic text tasks
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
                  category: { type: Type.STRING, enum: ["Grammar", "Spelling", "Vocabulary", "Conjugation"] }
                },
                required: ["original", "corrected", "explanation", "category"]
              }
            },
            tutorNotes: { type: Type.STRING }
          },
          propertyOrdering: ["correctedFrench", "englishTranslation", "corrections", "tutorNotes"]
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

export const sendMessageToGemini = async (message: string, language: SupportLanguage, history: Message[] = []): Promise<string> => {
  const chat = getChatSession(history);
  const promptWithLanguage = `Input: "${message}"\n\n[Response Language]: ${language}`;
  const result = await chat.sendMessage({ message: promptWithLanguage });
  // Directly access .text property from GenerateContentResponse
  return result.text || "{}";
};

// --- Personalized Lesson Generator (The Brain) ---

export const generateLessonFromHistory = async (mistakes: any[], language: SupportLanguage): Promise<string> => {
  // Use gemini-3-flash-preview for lesson generation
  const model = 'gemini-3-flash-preview';
  const historyText = mistakes.slice(0, 15).map(m => `- Original: ${m.original}, Corrected: ${m.corrected}, Reason: ${m.explanation}`).join('\n');
  
  const prompt = `
    The user has made the following mistakes in French recently:
    ${historyText}

    Based ONLY on these specific mistakes, write a short, encouraging French lesson.
    The lesson MUST be in ${language}.
    Focus on the common patterns you see.
    Use Markdown formatting (bold, bullet points).
    Keep it concise and pedagogical.
  `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
    config: { thinkingConfig: { thinkingBudget: 0 } }
  });

  // Directly access .text property from GenerateContentResponse
  return response.text || "No lesson generated.";
};

// --- Audio / TTS Logic ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
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
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data");

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const bytes = decode(base64Audio);
    const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
    return new Promise(r => source.onended = () => r());
  } catch (e) {
    console.error(e);
  }
};
