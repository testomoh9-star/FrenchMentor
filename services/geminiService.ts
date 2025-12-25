
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

const SYSTEM_INSTRUCTION = `
You are "FrenchMentor", an elite French language tutor. You help users improve their French through correction or translation.

### CORE OPERATIONAL LOGIC:

1. **Step 1: Response Language (CRITICAL)**
   - The user has selected a System Language ([Response Language]).
   - ALL 'explanation' fields in the 'corrections' list MUST be written in the [Response Language].
   - The 'tutorNotes' MUST be written in the [Response Language].

2. **Step 2: Task Execution & "Silent Polish"**
   - **Scenario A (Input is French)**: 
     - **SILENT FIXES**: Silently fix capitalization and missing ending punctuation in 'correctedFrench'.
     - **SUBSTANTIVE ERRORS**: Only list errors in 'corrections' for Grammar, Conjugation, Vocabulary, Prepositions, or Gender.
   - **Scenario B (Input is English/Arabic)**: Translate into natural French.

3. **Step 3: Output Formatting**
   - **correctedFrench**: The perfect French sentence.
   - **englishTranslation**: A natural English translation (Always English).
   - **corrections**: A list of substantive errors only.
   - **tutorNotes**: 2-4 sentences in [Response Language].

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

export const sendMessageToGemini = async (message: string, language: SupportLanguage, history: Message[] = []): Promise<string> => {
  try {
    const chat = getChatSession(history);
    const promptWithLanguage = `Input: "${message}"\n\n[Response Language]: ${language}`;
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
    Mistakes: ${filteredMistakes}.
    
    Generate a laser-focused report in ${language}.
    
    1. title: Use a SIMPLE, INDICATIVE title. (e.g., "Le verbe 'Aller' au passé", "Les prépositions 'Dans' et 'En'").
    2. whyYouMadeIt: Brief insight.
    3. theRule: A clear, simple rule in ${language}.
    4. mentalTrick: A mnemonic.
    5. conjugationTable: If a verb is central, provide present tense forms.

    Output JSON ONLY. All text content MUST be in ${language}.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
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
            description: "Optional conjugation mapping.",
            properties: {
              je: { type: Type.STRING },
              tu: { type: Type.STRING },
              il_elle: { type: Type.STRING },
              nous: { type: Type.STRING },
              vous: { type: Type.STRING },
              ils_elles: { type: Type.STRING }
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
    
    FORMAT RULES:
    1. Start with a clear bold title.
    2. Use a numbered list for key points.
    3. Provide exactly 3 clear examples (French with English translation).
    4. End with one "Actionable Tip".
    5. Keep it structured and visually clean.
    6. Language of lesson: ${language}.

    Respond with the lesson content only.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: { temperature: 0.1 }
  });

  return response.text || "Failed to generate lesson.";
};

// --- Audio / TTS Logic ---
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
      speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return;

  const WinAudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
  if (!WinAudioContext) return;
  
  let ctx: AudioContext;
  try {
    ctx = new WinAudioContext();
  } catch (err) {
    console.error("Failed to initialize AudioContext:", err);
    return;
  }

  const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start(0);
  
  return new Promise(resolve => { 
    source.onended = () => {
      ctx.close().catch(() => {});
      resolve();
    };
  });
};
