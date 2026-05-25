import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini AI client helper
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error("GEMINI_API_KEY is missing or unconfigured in the system secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Local Cognitive Simulation Sandbox Helper for missing, leaked, or restricted API Keys
function simulateAssistantResponse(
  message: string,
  persona: string,
  memory: any,
  originalError: string
): any {
  const lowercaseMsg = message.toLowerCase();
  let intent = "Information";
  let responseSpeech = "";
  let responseExtendedText = "";
  let emotionDetected = "neutral";
  let memoryUpdates: any = {};
  let extractedAction = { type: "none", content: "", datetime: "" };

  // Detect basic emotions
  if (lowercaseMsg.includes("happy") || lowercaseMsg.includes("great") || lowercaseMsg.includes("awesome") || lowercaseMsg.includes("zinda") || lowercaseMsg.includes("theek")) {
    emotionDetected = "happy";
  } else if (lowercaseMsg.includes("sad") || lowercaseMsg.includes("bad") || lowercaseMsg.includes("sorry") || lowercaseMsg.includes("afsoos")) {
    emotionDetected = "sad";
  } else if (lowercaseMsg.includes("stressed") || lowercaseMsg.includes("worry") || lowercaseMsg.includes("tired") || lowercaseMsg.includes("pareshan")) {
    emotionDetected = "stressed";
  }

  // Detect basic memory changes
  if (lowercaseMsg.includes("my name is") || lowercaseMsg.includes("i am")) {
    const parts = message.split(/(?:my name is|i am)\s+/i);
    if (parts[1]) {
      const name = parts[1].split(/[.,\s\?]/)[0];
      memoryUpdates.user_name = name;
    }
  }
  if (lowercaseMsg.includes("remember") || lowercaseMsg.includes("save")) {
    memoryUpdates.last_topic = "Bypassed reminder register";
  }

  // Detect workspace actions
  if (lowercaseMsg.includes("remind") || lowercaseMsg.includes("reminder") || lowercaseMsg.includes("yaad")) {
    intent = "Reminder";
    extractedAction = {
      type: "reminder",
      content: message.replace(/remind me to |reminder /gi, ""),
      datetime: "Today / Scheduled"
    };
  } else if (lowercaseMsg.includes("todo") || lowercaseMsg.includes("task") || lowercaseMsg.includes("job") || lowercaseMsg.includes("kaam")) {
    intent = "Task";
    extractedAction = {
      type: "task",
      content: message,
      datetime: "Pending"
    };
  } else if (lowercaseMsg.includes("note") || lowercaseMsg.includes("memo") || lowercaseMsg.includes("likho")) {
    intent = "Note";
    extractedAction = {
      type: "note",
      content: message,
      datetime: new Date().toLocaleDateString()
    };
  }

  // Identity dialect matching
  if (persona === "Ayyan") {
    responseSpeech = `Aalam-o-alaikum! Main Ayyan hoon. Main help ke liye ready hoon par hamara Gemini core system offline mode main ya to unconfigured hai ya key block hui hai.`;
    responseExtendedText = `### 🎙️ Ayyan Dostana Roman Urdu Diagnostic Console:\n\n* **API Error Captured:** \`${originalError}\`\n* **Safe-Mode active:** App functions operate dynamically! You can still test full Memory Registries, Agenda creation, and task checking.\n* **Next Step:** Update your secure \`GEMINI_API_KEY\` inside the Settings sidebar to activate the cognitive live engine.`;
  } else if (persona === "Friday") {
    responseSpeech = `System Alert: API authorization failure detected. Running client-side simulation engine sandbox backup sequence.`;
    responseExtendedText = `### 🤖 Tech Friday Core Analytics Logs:\n\n* **Status Code:** 403 / Revoked / Leaked Key\n* **Exception Caught:** \`${originalError}\`\n* **Action required:** Please provision a valid \`GEMINI_API_KEY\` to activate full live reasoning. All other local memory registers remain operative and reactive.`;
  } else if (persona === "Jarvis") {
    responseSpeech = `Pardon me, Sir. It appears our main cognitive server returned an authorization warning. I have routed our systems onto auxiliary sandbox backup generators.`;
    responseExtendedText = `### 🎩 Sir Jarvis Report Log:\n\n* **Diagnostics:** Leaked or unverified key structure.\n* **Resolution advice:** Sir, please update your environment variable secrets in Settings.\n* **Adaptive Mode:** I have fully processed your text input and synchronized mock actions below.`;
  } else if (persona === "Voxa") {
    responseSpeech = `Whoops! Looks like our AI key took a tumble! No worries, I'm playing with bypass fuel right now to keep you smiling.`;
    responseExtendedText = `### 🤪 Voxa Comedy Diagnostics:\n\n* **Symptom:** Leaked key or 403 API block.\n* **Prescription:** Paste a secure new key in Settings > Secrets.\n* **Demo Status:** Fully interactive! Add notes or tasks below to test workspace mechanics!`;
  } else if (persona === "Lumina") {
    responseSpeech = `Take a deep breath and relax. Although our server is temporarily in mock mode because of a leaked key, we can still organize your tasks and maintain safe focus.`;
    responseExtendedText = `### 🍃 Lumina Mindfulness Sandbox:\n\n* **Notice:** ${originalError}\n* **Guide:** There is absolutely no pressure. Set your API Key inside the platform secrets whenever you are ready. Let&apos;s continue our calm session.`;
  } else {
    // Nova (Default)
    responseSpeech = `Aalam-o-alaikum! I'm running in local companion fallback mode. It seems your API key was reported as leaked or is invalid.`;
    responseExtendedText = `### 🌸 Nova Companion System Diagnostic Dashboard:\n\n* **API Error Logged:**\n\`\`\`\n${originalError}\n\`\`\`\n\n* **Resolution Instructions:** Go to **Settings > Secrets** in your AI Studio dashboard and paste a secure, valid \`GEMINI_API_KEY\` to re-enable cognitive reasoning.\n\n* **Sandbox Active:** You can still test full memory mutations, action lists, reminders, and persona changes flawlessly!`;
  }

  return {
    responseSpeech,
    responseExtendedText,
    intent,
    emotionDetected,
    memoryUpdates,
    extractedAction,
    searchSources: []
  };
}

// REST Assistant API Endpoint
app.post("/api/assistant", async (req, res) => {
  const { 
    message, 
    history = [], 
    memory = {}, 
    persona = "Nova", 
    userSpeechLanguage = "English" 
  } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing required 'message' field in body." });
  }

  const customKey = req.headers["x-gemini-api-key"] as string | undefined;

  try {
    let ai;
    try {
      if (customKey && customKey.trim().length > 0) {
        ai = new GoogleGenAI({
          apiKey: customKey.trim(),
          httpOptions: {
            headers: {
              "User-Agent": "aistudio-build-custom",
            },
          },
        });
      } else {
        ai = getGeminiClient();
      }
    } catch (err: any) {
      // Return 403 error status to trigger client-side secure configuration overlay dialog
      console.warn("AI Key unconfigured error captured:", err.message);
      return res.status(403).json({
        error: "GEMINI_API_KEY is missing, leaked, or invalid. Please configure a valid key to reactivate AI reasoning.",
        code: 403,
        message: err.message
      });
    }

    // Wrap ALL model generation & search steps in an inner try-catch, so ANY API execution failures
    // (such as leaked key, code 403, permissions, or quota issues) are caught and handled gracefully here
    try {
      // Persona Prompt definitions
      const personas: Record<string, string> = {
        Nova: `You are Nova, an energetic, sprightly, and fast-responding premium voice assistant. You respond of high-vitality, clear pronunciation, and with supportive encouragement. Use short punchy feedback.`,
        Ayyan: `You are Ayyan, a friendly, ultra-cool, and natural guide speaking in a bilingual Urdu/Hindi + English (often styled in clean 'Roman Urdu' or 'Hinglish') style. E.g. "Aalam-o-alaikum! Kaise ho aap?", "Haan bilkul, main abhi ye note bana deta hoon!". Always match this warm conversational dynamic.`,
        Friday: `You are Friday, a sleek, technical, and precise digital intelligence. Your tone is clean, optimized, professional, and focuses on rapid productivity. Avoid fluff.`,
        Jarvis: `You are Jarvis, a highly sophisticated, polite, and elite virtual gentleman assistant. You refer to the user with ultimate respect (e.g., 'Sir/Ma'am' if appropriate, or elegantly professional), and offer thoughtful, polished counsel with slightly slower, calmer spoken rhythm directives.`,
        Voxa: `You are Voxa, a playful, humorous, and witty conversationalist. You love inserting small analogies, puns, and high-quality lighthearted jokes or interactive commentary.`,
        Lumina: `You are Lumina, a calming, deeply relaxed, and emotionally intelligent mindfulness assistant. Speak softly, reassuringly, and with deep empathy.`
      };

      const chosenPersonaContext = personas[persona] || personas.Nova;
      const memoryString = JSON.stringify(memory);

      const systemInstruction = `
${chosenPersonaContext}

CORE RULES FOR VOICE BEHAVIOR:
1. Always parse user intent accurately first.
2. Keep responseSpeech VERY short, natural, and under 2-3 sentences max. It must sound ready to be spoken smoothly! Avoid markdown tags, bold formatting, quotes, or asterisks (*) inside responseSpeech since it is fed directly to Text-to-Speech synthesis engines.
3. If the user asks for elaborate details (e.g. detailed steps, draft code, bullet lists, translations), put those elaborate details inside 'responseExtendedText'. This text will be elegantly rendered on the screen console, while the short verbal response plays.
4. If the user sounds sad, respond softly and empathetically. If they sound stressed, respond calmly. If happy, respond with matching high spirits.
5. Identify commands or actions requested by the user. If they want to save/set a "task", "reminder", or "note", you MUST extract it and fill the 'extractedAction' object.
6. Record and refine user memory state. If they introduce themselves, state their interests, tell you things to remember, or outline preferred dialects, provide a key-value structure in 'memoryUpdates' to update their central profile.

CURRENT PERSISTENT MEMORY OF USER:
${memoryString}

Be emotionally intelligent, realistic, and prioritize high utility conversation.
`;

      // 1. Core classification pass to detect Information intent & search requirements
      let classifiedIntent = "Information";
      let searchQuery = "";
      try {
        const classificationResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Analyze user message: "${message}". What is its primary intent category?
          Available choices are exactly: 'Information', 'App Control', 'Reminder', 'Entertainment', 'Translation', 'Communication', 'Note', 'Task'.
          
          Write a search query if they are asking for factual information, fresh events, real-time facts, or web lookups.
          Return your analysis in JSON with the keys 'intent' and 'searchQuery'.`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["intent", "searchQuery"],
              properties: {
                intent: { type: Type.STRING },
                searchQuery: { type: Type.STRING }
              }
            }
          }
        });
        const classification = JSON.parse(classificationResponse.text || "{}");
        classifiedIntent = classification.intent || "Information";
        searchQuery = classification.searchQuery || "";
      } catch (err) {
        console.warn("Classification step failed, parsing inline:", err);
      }

      // 2. Perform Real-Time Google Search Grounding if Information intent is detected
      let searchResultText = "";
      let searchSources: Array<{ title: string; url: string }> = [];

      if (classifiedIntent === "Information" && searchQuery && searchQuery.trim().length > 0) {
        try {
          console.log(`[Search Grounding] Performing Google search for: "${searchQuery}"`);
          const searchResponse = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: searchQuery,
            config: {
              tools: [{ googleSearch: {} }]
            }
          });
          searchResultText = searchResponse.text || "";
          const chunks = searchResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks) {
            searchSources = chunks
              .map((chunk: any) => {
                if (chunk.web?.uri && chunk.web?.title) {
                  return { title: chunk.web.title, url: chunk.web.uri };
                }
                return null;
              })
              .filter(Boolean);
          }
          console.log(`[Search Grounding] Found ${searchSources.length} search source references.`);
        } catch (se: any) {
          console.warn("[Search Grounding] Google search execution failed:", se.message);
        }
      }

      // Combine factual context with dynamic persona instructions
      let finalSystemContext = systemInstruction;
      if (searchResultText) {
        finalSystemContext += `
        
[IMPORTANT REAL-TIME GOOGLE SEARCH GROUNDING DATA]
Factual and current information retrieved from Google Search:
---
${searchResultText}
---
Use these facts directly to answer precisely, and ensure absolute truthfulness regarding current event details (e.g. scores, times, news etc.)!`;
      }

      // Construct history parts
      const contents: any[] = [];
      
      // Feed formatted history
      for (const item of history.slice(-8)) { // Last 8 turn context
        contents.push({
          role: item.role === "user" ? "user" : "model",
          parts: [{ text: item.text }]
        });
      }

      // Append current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: finalSystemContext,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            required: ["responseSpeech", "responseExtendedText", "intent", "emotionDetected"],
            properties: {
              responseSpeech: {
                type: Type.STRING,
                description: "A short, engaging verbal answer suited directly for real-time Text-To-Speech. Max 2 sentences, NO markdown structure, stars, HTML, or weird markup tags."
              },
              responseExtendedText: {
                type: Type.STRING,
                description: "Detailed description, steps, output code, markdown formatting, or bullet lists shown on screen for supplementary reading."
              },
              intent: {
                type: Type.STRING,
                description: "The primary intention categorized exactly as one of: 'Information', 'App Control', 'Reminder', 'Entertainment', 'Translation', 'Communication', 'Note', 'Task'."
              },
              emotionDetected: {
                type: Type.STRING,
                description: "Estimated mood of user based on their input: 'happy', 'sad', 'angry', 'neutral', 'confused', 'stressed'."
              },
              memoryUpdates: {
                type: Type.OBJECT,
                description: "Any key-value details learned or updated about user preferences, hobbies, name, etc. Return empty object if nothing new learned.",
                properties: {
                  user_name: { type: Type.STRING },
                  favorite_topics: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  last_conversation: { type: Type.STRING },
                  language_preferences: { type: Type.STRING }
                }
              },
              extractedAction: {
                type: Type.OBJECT,
                description: "Extract actionable item if users request to set note, task, or reminder.",
                required: ["type", "content", "datetime"],
                properties: {
                  type: { 
                    type: Type.STRING, 
                    description: "Must be one of 'note', 'task', 'reminder', or 'none'." 
                  },
                  content: { 
                    type: Type.STRING, 
                    description: "Subject context of the note, task, or reminder." 
                  },
                  datetime: { 
                    type: Type.STRING, 
                    description: "Approximate parsed time if mentioned (e.g. 5:00 PM, tomorrow, 2026-05-25)." 
                  }
                }
              }
            }
          }
        }
      });

      const rawText = response.text;
      if (!rawText) {
        throw new Error("No response output from Gemini model.");
      }

      const parsedResponse = JSON.parse(rawText.trim());
      
      // Override calculated intent if detected as Information
      if (searchSources.length > 0) {
        parsedResponse.intent = "Information";
      }
      parsedResponse.searchSources = searchSources;

      return res.json(parsedResponse);

    } catch (apiError: any) {
      console.warn("Gemini Live Core failed with API error:", apiError.message);
      
      const errMsg = apiError.message || String(apiError);
      const isLeaked = errMsg.toLowerCase().includes("leaked") || errMsg.includes("403") || errMsg.toLowerCase().includes("permission_denied");
      const status = isLeaked ? 403 : 500;
      
      return res.status(status).json({
        error: `Gemini API call failed with status ${status}: ${errMsg}`,
        code: status,
        message: errMsg
      });
    }

  } catch (error: any) {
    console.error("Assistant outer failure handler fallback:", error);
    const errMsg = error.message || String(error);
    return res.status(500).json({
      error: `Unexpected system failure: ${errMsg}`,
      code: 500,
      message: errMsg
    });
  }
});

// Serve frontend build static files & mount Vite middleware in development
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Voice Assistant fullstack server running on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
