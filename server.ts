import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini API client lazily to prevent startup crashes if GEMINI_API_KEY is missing
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not defined. Please configure it in the SECRETS panel.');
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for generating GMAT passages
app.post('/api/generate-passage', async (req, res) => {
  try {
    const { discipline, difficulty } = req.body;
    
    if (!discipline || !difficulty) {
      return res.status(400).json({ error: 'Discipline and difficulty are required fields.' });
    }

    const ai = getAiClient();

    const prompt = `Generate a dense, custom GMAT-style science passage and questions for an advanced GMAT prep level.
Discipline: ${discipline} (e.g. biology, physics, astronomy)
Target Difficulty Rating: ${difficulty} (e.g., matching a student seeking a GMAT 705 score, current score 605)

Create a passage in ${discipline} at ${difficulty} level with 2-3 dense paragraphs, focusing on challenging scientific terms, complex sentence structures, and questions that test Reading Comprehension and Critical Reasoning. Provide precise, multi-sentence explanations for the correct answer and each incorrect option, with specific GMAT strategies.`;

    const systemInstruction = `You are an elite GMAT prep expert specializing in science passages. Your target user is a student aiming to lift their GMAT score from 605 to 705.
Your task is to generate a highly realistic GMAT science passage matching the user's selected discipline (biology, physics, or astronomy) and target difficulty.

GMAT science passages are dry, dense, and notoriously convoluted. They rely on:
- Highly dense, technical scientific terms.
- Long, winding sentence structures with multiple nested clauses, passive verbs, and double-negatives.
- Relationship tracking between entities, mechanisms, or competing hypotheses.

You MUST respond with a single, highly structured, syntactically correct JSON object conforming EXACTLY to the following structure:
{
  "title": "A short, academic title of the passage",
  "discipline": "${discipline}",
  "difficulty": "${difficulty}",
  "content": "The full passage content. Exactly 180 to 280 words divided into 2 or 3 dense, academic, non-trivial paragraphs.",
  "terms": [
    {
      "term": "a technical scientific term used in the content, written exactly as it appears inside the passage",
      "definition": "the precise academic definition of the term",
      "plainEnglish": "a plain-english, intuitive transition/analogy for a layman to conquer jargon anxiety",
      "gmatTip": "strategic test-taking advice relevant to this specific term on the GMAT science passages"
    }
  ],
  "complexSentences": [
    {
      "sentence": "a confusing, very convoluted sentence extracted EXACTLY from the passage",
      "simplified": "a highly direct, simple, active-voice translation of what the sentence means in plain English",
      "subject": "the primary subject of the sentence's main independent clause",
      "mainVerb": "the primary active verb of the sentence's main independent clause",
      "modifiers": [
        "a brief breakdown of modifier 1",
        "a brief breakdown of modifier 2"
      ]
    }
  ],
  "questions": [
    {
      "id": "gen-q1",
      "questionText": "A challenging GMAT-style question testing reading comprehension or critical reasoning directly related to the passage.",
      "questionType": "Reading Comprehension", 
      "subType": "Main Idea",
      "options": [
        "Option A (convoluted GMAT-style phrasing)",
        "Option B (convoluted GMAT-style phrasing)",
        "Option C (convoluted GMAT-style phrasing)",
        "Option D (convoluted GMAT-style phrasing)",
        "Option E (convoluted GMAT-style phrasing)"
      ],
      "correctAnswerIndex": 1,
      "explanation": {
        "correct": "Why this option is correct, citing the passage explicitly.",
        "incorrect": {
          "0": "Explain why Option A is incorrect and name the GMAT trap (e.g., Out of Scope, Direct Opposite, Too Broad, Half True etc.)",
          "1": "Explain why Option B is incorrect and name the GMAT trap...",
          "2": "Explain why Option C is incorrect and name the GMAT trap...",
          "3": "Explain why Option D is incorrect and name the GMAT trap...",
          "4": "Explain why Option E is incorrect and name the GMAT trap..."
        },
        "gmatStrategy": "Strategic takeaway for solving this style of GMAT question under speed constraints."
      }
    }
  ],
  "scoreBoostTips": [
    "Tip 1: Practical advice on how to handle the specific style of writing or topic presented.",
    "Tip 2: Cognitive training tip for coping with highly complex information on the fly without locking up.",
    "Tip 3: GMAT timing or parsing rule tailored for this context."
  ]
}

DO NOT return any markdown wrapping blocks (like \`\`\`json ... \`\`\`). Only return raw JSON. Avoid empty values. Provide at least 2 distinct GMAT-style multi-choice questions. Ensure all extracted 'terms' and 'complexSentences' match the exact spelling and text in the 'content' field.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini model returned an empty response.');
    }

    try {
      const parsedJson = JSON.parse(text.trim());
      // Give questions random IDs if missing
      if (parsedJson.questions && Array.isArray(parsedJson.questions)) {
        parsedJson.questions = parsedJson.questions.map((q: any, idx: number) => ({
          ...q,
          id: q.id || `gen-q-${Date.now()}-${idx}`
        }));
      }
      res.json(parsedJson);
    } catch (parseError) {
      console.error('Failed to parse response JSON. Raw text was:', text);
      res.status(502).json({
        error: 'The AI model generated invalid JSON. Please try again.',
        raw: text
      });
    }
  } catch (err: any) {
    console.error('Passage generation error:', err);
    res.status(500).json({ error: err.message || 'An error occurred during passage generation.' });
  }
});

// API endpoint for chatbot query with optional Google Search Grounding
app.post('/api/chatbot-query', async (req, res) => {
  try {
    const { query, type, activePassageContent, activePassageTitle, mathContext } = req.body;
    const ai = getAiClient();

    let contextPrompt = '';
    if (activePassageContent) {
      contextPrompt += `Active Science Passage Context:\nTitle: ${activePassageTitle}\nContent: ${activePassageContent}\n\n`;
    }
    if (mathContext) {
      contextPrompt += `Active Maths Question context:\n${mathContext}\n\n`;
    }

    let systemInstruction = "You are a personal GMAT Focus Tutor. Help the student elevate their score from 605 towards a 705 breakthrough. Address doubts systematically, focusing on syntax deconstruction, math clarity, logical structures, and standard Pearson test-prep strategies. Keep explanation highly professional, human, and directly useful. Return your response in clear Markdown.";

    if (type === 'search') {
      systemInstruction += " Use the Google Search tool to trace facts or GMAT solutions on the web if beneficial, providing links for references.";
    }

    const userPrompt = `${contextPrompt}Student's doubt/query: ${query}`;
    
    interface GenConfig {
      systemInstruction: string;
      tools?: Array<{ googleSearch: {} }>;
    }

    const config: GenConfig = {
      systemInstruction,
    };

    if (type === 'search') {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config,
    });

    const text = response.text || "I was unable to construct an explanation. Please try asking again.";
    
    // Extract grounding URLs
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const searchLinks = groundingChunks ? groundingChunks.map((chunk: any) => {
      if (chunk.web) {
        return {
          title: chunk.web.title,
          uri: chunk.web.uri
        };
      }
      return null;
    }).filter(Boolean) : [];

    res.json({
      text,
      searchLinks,
    });

  } catch (err: any) {
    console.error('Chatbot endpoint error:', err);
    res.status(500).json({ error: err.message || 'An error occurred during tutoring. Please verify your Gemini API key.' });
  }
});

// API endpoint for GMAT Focus Quant question generation
app.post('/api/generate-math', async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    const ai = getAiClient();

    const systemInstruction = `You are an elite GMAT Quantitative Reasoning instructor.
Generate a realistic Problem Solving multiple-choice math question conforming to the GMAT Focus Edition specifications.
Target topic: ${topic} (algebra, arithmetic, word-problems, or number-properties)
Target difficulty: ${difficulty} (easy, medium, hard)

Your output MUST be a single, highly structured, syntactically correct JSON object conforming EXACTLY to the following structure:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questionText": "The Problem Solving math question. Present expressions, variables, and fractions clearly.",
  "options": [
    "Option A value",
    "Option B value",
    "Option C value",
    "Option D value",
    "Option E value"
  ],
  "correctAnswerIndex": number (between 0 and 4 inclusive, where 0 is A, 1 is B, etc.),
  "explanation": "Provide a complete, mathematical step-by-step solution proving why the correct answer is indeed the chosen index, clarifying logic.",
  "strategy": "A powerful GMAT focus shortcut or test-taking advice (e.g. testing numbers, picking convenient numbers like 100, checking prime properties) to solve this under 2 minutes."
}

DO NOT return any surrounding markdown block codes (like \`\`\`json). Return only pure JSON strings. Ensure math equations are mathematically flawless.`;

    const prompt = `Generate a single custom GMAT Focus math question under topic: ${topic} with target difficulty: ${difficulty}.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini math generator returned empty content.');
    }

    try {
      const parsedJson = JSON.parse(text.trim());
      parsedJson.id = `gen-math-${Date.now()}`;
      res.json(parsedJson);
    } catch (parseError) {
      console.error('Failed to parse math JSON. Raw text:', text);
      res.status(502).json({
        error: 'The AI model generated invalid math JSON. Please trigger again.',
        raw: text
      });
    }

  } catch (err: any) {
    console.error('Math endpoint error:', err);
    res.status(500).json({ error: err.message || 'Failed to synthesize GMAT math question.' });
  }
});

// Setup Vite Dev Server / Static Hosting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
