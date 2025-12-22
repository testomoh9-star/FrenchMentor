
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

2. **Step 2: Task Execution & "Silent Polish" (NEW)**
   - **Scenario A (Input is French)**: 
     - **SILENT FIXES**: Silently fix capitalization (e.g., 'je' -> 'Je') and missing ending punctuation (periods, question marks) in the 'correctedFrench' field. 
     - **DO NOT** list these silent fixes in the 'corrections' array. They are not considered mistakes for the user's progress.
     - **SUBSTANTIVE ERRORS**: Only list errors in the 'corrections' array if they are: Grammar, Conjugation, Vocabulary, Prepositions, or clear Gender mismatches.
     - **GENDER DEFAULTING**: Masculine is the default. If a user says "Je suis content", do NOT flag it as an error. If you think they might be female based on context, mention the feminine version in 'tutorNotes' only.
   - **Scenario B (Input is English/Arabic)**: Translate into natural French.

3. **Step 3: Output Formatting**
   - **correctedFrench**: The final perfect French sentence.
   - **englishTranslation**: A natural English translation (Always English).
   - **corrections**: A list of objects {original, corrected, explanation, category}. 
     - CATEGORIES: "Grammar", "Vocabulary", "Conjugation", "Gender", "Preposition". 
     - (Note: Punctuation and Capitalization are NO LONGER categories).
   - **tutorNotes**: 2-4 sentences in [Response Language]. If the user's input was grammatically perfect (even if you fixed their capitalization), start by saying "Excellent work! Your sentence is grammatically perfect."

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

    chatSession = ai.chats.create({
      model: 'gemini-3-flash-preview',
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
              description: "List of substantive errors ONLY.",
              items: {
                type: Type.OBJECT,
                properties: {
                  original: { type: Type.STRING, description: "The incorrect word/phrase." },
                  corrected: { type: Type.STRING, description: "The fixed word/phrase." },
                  explanation: { type: Type.STRING, description: "The grammar rule or reason for the fix in the Response Language." },
                  category: { type: Type.STRING, description: "One of: Grammar, Vocabulary, Conjugation, Gender, Preposition." }
                },
                required: ["original", "corrected", "explanation", "category"]
              }
            },
            tutorNotes: { type: Type.STRING, description: "A summary of the lesson in the Response Language." }
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

const MAX_RETRIES = 2;

export const sendMessageToGemini = async (message: string, language: SupportLanguage, history: Message[] = []): Promise<string> => {
  let currentAttempt = 0;

  while (currentAttempt < MAX_RETRIES) {
    try {
      const chat = getChatSession(history);
      const promptWithLanguage = `Input: "${message}"\n\n[Response Language]: ${language}`;
      
      const result = await chat.sendMessage({ message: promptWithLanguage });
      return result.text || "{}";
    } catch (error) {
      currentAttempt++;
      if (currentAttempt >= MAX_RETRIES) {
        resetChatSession();
        throw error;
      }
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
    if (!base64Audio) throw new Error("No audio data");

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
    const outputNode = outputAudioContext.destination;

    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, outputAudioContext, 24000, 1);
    
    const source = outputAudioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(outputNode);
    source.start();
    
    return new Promise((resolve) => {
        source.onended = () => resolve();
    });
  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};
