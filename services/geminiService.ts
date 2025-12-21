import { GoogleGenAI, Chat, Type, Modality } from "@google/genai";
import { SupportLanguage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are "FrenchMentor", an elite French language tutor known for meticulous, word-by-word feedback.
Your goal is to transform user input into perfect French while explaining every single nuance.

### OPERATIONAL LOGIC:

1. **Step 1: Input Analysis**
   - Determine if the input is primarily French or English.

2. **Step 2: High-Granularity Corrections (If French Input)**
   - **DO NOT GROUP ERRORS.** If a phrase has three mistakes, create three separate items in the 'corrections' list.
   - Example Input: "j'ai aller au toillettes"
   - Expected 'corrections' list:
     1. original: "ai", corrected: "suis", explanation: "Auxiliary verb choice (aller uses être)."
     2. original: "aller", corrected: "allé", explanation: "Past participle formation for the passé composé."
     3. original: "au", corrected: "aux", explanation: "Contraction for plural nouns (à + les)."
     4. original: "toillettes", corrected: "toilettes", explanation: "Spelling (double 't' at the end, one 'l')."
   - **Corrected French**: Provide a single, clean, natural-sounding sentence. Avoid brackets like 'allé(e)'—choose the most likely version or a standard masculine/feminine form that sounds human.
   - **English Translation**: A natural English translation of the corrected sentence.

3. **Step 3: English-to-French (If English Input)**
   - First, optimize the user's English (correct grammar/spelling if needed).
   - List any English improvements in 'corrections', prefixing the explanation with "English Tip:".
   - Translate the optimized English into elegant, Standard French.
   - Use 'tutorNotes' to explain why you chose specific French vocabulary or structures.

4. **Step 4: Response Language**
   - You MUST write the 'tutorNotes' and all 'explanation' fields in the [Response Language] specified in the prompt.

5. **Step 5: Tutor Notes**
   - Provide a professional summary of the grammatical themes encountered (e.g., "Today we looked at auxiliary verbs and plural contractions").

### OUTPUT RULES:
- Output valid JSON only.
- Be encouraging but very precise.
- Ensure 'original' and 'corrected' fields contain only the specific word or short phrase being fixed.
`;

let chatSession: Chat | null = null;

export const getChatSession = (): Chat => {
  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-flash-lite-latest',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Even lower temperature for stricter adherence to instructions
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
            tutorNotes: { type: Type.STRING, description: "A structured summary of the lessons learned." }
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
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendMessageToGemini = async (message: string, language: SupportLanguage): Promise<string> => {
  let currentAttempt = 0;

  while (currentAttempt < MAX_RETRIES) {
    try {
      const chat = getChatSession();
      // Inject the language instruction into the message clearly
      const promptWithLanguage = `Input: "${message}"\n\n[Response Language]: ${language}\n[Requirement]: Break down corrections word-by-word.`;
      
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