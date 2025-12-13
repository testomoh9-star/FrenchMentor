import { GoogleGenAI, Chat, Type, Modality } from "@google/genai";
import { SupportLanguage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are "FrenchMentor", an expert French language tutor.
Your goal is to correct user inputs or translate them, providing structured feedback.

Logic:
1. **Analyze**: Check if the input is primarily French or English.

2. **If French Input**:
   - Correct grammar, spelling, and syntax to Standard French.
   - Identify specific errors.
   - For each error, populate the 'corrections' list with the 'original' mistake, the 'corrected' version, and a brief 'explanation'.
   - Set 'correctedFrench' to the fully corrected French sentence.
   - Set 'englishTranslation' to the English translation of that corrected sentence.
   - Write helpful 'tutorNotes' summarizing the main French grammar rules applied.

3. **If English Input**:
   - **Step A (English Optimization)**: Check the user's English input for grammar, spelling, or awkward phrasing errors.
   - If errors are found:
     - Add them to the 'corrections' list.
     - In the 'explanation' field, explicitly start with "English Improvement:" to distinguish it.
     - Set 'englishTranslation' to the *corrected/optimized* English version.
   - If no errors:
     - Set 'englishTranslation' to the original input.
   
   - **Step B (Translation)**: Translate the (optimized) English to natural Standard French.
   - Set 'correctedFrench' to this French translation.
   - Use 'tutorNotes' to primarily explain the French vocabulary/grammar choices used in the translation. You may briefly mention English improvements if relevant to the context.

IMPORTANT: The user will specify a "Response Language" in the prompt. You MUST write the content of 'tutorNotes' and the 'explanation' fields in that specified language (English, French, or Arabic).

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
            englishTranslation: { type: Type.STRING, description: "English translation of the French sentence (or the corrected English input)." },
            corrections: {
              type: Type.ARRAY,
              description: "List of specific corrections made (French or English).",
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

export const sendMessageToGemini = async (message: string, language: SupportLanguage): Promise<string> => {
  const chat = getChatSession();
  
  try {
    // Inject the language instruction into the message without showing it to the user in the UI
    const promptWithLanguage = `${message}\n\n[System Requirement]: Please provide the 'tutorNotes' and all 'explanation' fields in ${language}.`;
    
    // We do not stream here because we need valid JSON to render the UI components correctly.
    const result = await chat.sendMessage({ message: promptWithLanguage });
    return result.text || "{}";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
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
    
    // Return a promise that resolves when audio ends
    return new Promise((resolve) => {
        source.onended = () => {
            resolve();
            // Optional: close context after a delay or keep it. 
            // For simple usage, letting it garbage collect or closing it is fine.
            // outputAudioContext.close(); 
        };
    });

  } catch (error) {
    console.error("TTS Error:", error);
    throw error;
  }
};