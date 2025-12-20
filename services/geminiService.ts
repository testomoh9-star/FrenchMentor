import { GoogleGenAI, Chat, Type, Modality } from "@google/genai";
import { SupportLanguage, ModelID } from "../types";

const SYSTEM_INSTRUCTION = `
You are "FrenchMentor", an elite French language tutor known for meticulous, word-by-word feedback and deep pedagogical explanations.
Your goal is to transform user input into perfect French while acting as a supportive teacher.

### OPERATIONAL LOGIC:

1. **Step 1: Language Detection**
   - Determine if the user input is primarily English or French.

2. **Step 2: English-to-French Path (If Input is English)**
   - **Fix English First**: Before translating, identify any grammar/spelling errors in the user's English (e.g., "i" to "I", missing articles).
   - **Corrections List**: For every English fix, add an item to 'corrections'.
     - 'original': the mistake.
     - 'corrected': the fixed English word/phrase.
     - 'explanation': MUST start with "English Improvement: " followed by a brief reason in the [Response Language].
   - **Translation**: Translate the *corrected* English into natural Standard French.
   - **Fields**: 
     - 'correctedFrench': The final French translation.
     - 'englishTranslation': The corrected/optimized English sentence.

3. **Step 3: French-Correction Path (If Input is French)**
   - **Granular Fixes**: Identify every spelling, grammar, or syntax error. 
   - **DO NOT GROUP**: If "j'ai aller" is wrong, create two items: one for "ai" -> "suis" and one for "aller" -> "allé".
   - **Fields**:
     - 'correctedFrench': The perfectly fixed French sentence.
     - 'englishTranslation': A natural English translation of that fixed sentence.

4. **Step 4: Tutor's Notes (CONCISE BUT STRUCTURED)**
   - **Volume Control**: Keep this section to 2-4 high-impact sentences (about 50-70% of the previous detail).
   - **Organization**: Use a professional tone. Explain the "Why" using logical transitions (e.g., "Note that...", "Specifically...", "In French...").
   - **Content**: Focus only on the 1 or 2 most important grammatical points from the input.

5. **Step 5: Response Language**
   - You MUST write the 'tutorNotes' and all 'explanation' fields in the [Response Language] specified in the prompt.

### OUTPUT RULES:
- Output valid JSON only.
- Tone: Professional, encouraging, and detailed.
- Ensure 'original' and 'corrected' fields contain only the specific word or short phrase being fixed.
`;

let chatSession: Chat | null = null;
let currentModelId: ModelID | null = null;

export const getChatSession = (modelId: ModelID): Chat => {
  // If model changed, we MUST reset the session
  if (!chatSession || currentModelId !== modelId) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    currentModelId = modelId;
    chatSession = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1, 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            correctedFrench: { type: Type.STRING, description: "The corrected or translated French sentence." },
            englishTranslation: { type: Type.STRING, description: "English translation of the French sentence." },
            corrections: {
              type: Type.ARRAY,
              description: "List of specific word-level corrections.",
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "The incorrect word/phrase." },
                  corrected: { type: Type.STRING, description: "The fixed word/phrase." },
                  explanation: { type: Type.STRING, description: "The grammar rule or reason for the fix." }
                },
                required: ["original", "corrected", "explanation"]
              }
            },
            tutorNotes: { type: Type.STRING, description: "A detailed, structured pedagogical summary of the grammar lessons." }
          },
          propertyOrdering: ["correctedFrench", "englishTranslation", "corrections", "tutorNotes"]
        }
      },
    });
  }
  return chatSession;
};

export const resetChatSession = () => {
  chatSession = null;
  currentModelId = null;
};

const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendMessageToGemini = async (message: string, language: SupportLanguage, modelId: ModelID): Promise<string> => {
  let currentAttempt = 0;

  while (currentAttempt < MAX_RETRIES) {
    try {
      const chat = getChatSession(modelId);
      const promptWithLanguage = `Input: "${message}"\n\n[Response Language]: ${language}\n[Instruction]: Correct English errors first if applicable. Ensure word-by-word granularity. Keep tutorNotes to 3-4 structured sentences.`;
      
      const result = await chat.sendMessage({ message: promptWithLanguage });
      return result.text || "{}";
    } catch (error) {
      currentAttempt++;
      console.warn(`Gemini API Attempt ${currentAttempt} failed:`, error);
      
      if (currentAttempt >= MAX_RETRIES) {
        resetChatSession();
        throw error;
      }
      
      await delay(RETRY_DELAY * currentAttempt);
    }
  }
  return "{}";
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

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
        throw new Error("No audio data returned from Gemini TTS");
    }

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const outputNode = outputAudioContext.destination;

    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
    
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNode);
    source.start();
    
    return new Promise((resolve) => {
        source.onended = () => {
            resolve();
        };
    });

  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};