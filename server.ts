import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for Gemini AI assistance
  app.post("/api/ai/generate-details", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "GEMINI_API_KEY is not set. Please set the GEMINI_API_KEY environment variable in Settings > Secrets." 
        });
      }

      const { prompt, title, category, targetAudience, currentText, contextType } = req.body;
      
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are an academic writing assistant for faculty and teachers at Bina Bangsa School (BBS).
Your task is to help teachers compose, enrich, polish, or summarize clear, professional, and well-structured details for school events, announcements, bulletins, and assignments.
Maintain an encouraging, concise, academic tone. Format cleanly with bullet points or short paragraphs when helpful.
Return only the generated content without extra meta-commentary.`;

      const userPrompt = `Context: Drafting ${contextType || 'school event or announcement details'} for Bina Bangsa School.
Title: ${title || 'Untitled'}
Category: ${category || 'General'}
Target Audience: ${targetAudience || 'All Students'}
Current Draft/Notes: ${currentText || '(None)'}
User Request: ${prompt || 'Write engaging and comprehensive details for this entry, including purpose, expectations, and necessary instructions.'}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
        },
      });

      res.json({ text: response.text || "" });
    } catch (error: any) {
      console.error("AI details generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate details with AI." });
    }
  });

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
