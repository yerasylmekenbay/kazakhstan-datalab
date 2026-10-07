import express from "express";
import "dotenv/config";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

app.use(express.json({ limit: "64kb" }));
app.use(express.static("."));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ai: Boolean(process.env.GEMINI_API_KEY), provider: "gemini", model: GEMINI_MODEL });
});

app.post("/api/ai", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();
    if (!question) return res.status(400).json({ error: "Сұрақ бос болмауы керек." });
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: "GEMINI_API_KEY орнатылмаған." });
    }

    const systemInstruction = `Сен Kazakhstan DataLab AI аналитигісің. Негізгі тіл — қазақ тілі. Қазақстанның статистикасы, экономикасы, демографиясы және математикалық модельдеуін түсінікті талда. Нақты дерек пен модельдік болжамды міндетті түрде ажырат. Білмейтін санды ойдан шығарма. Жауапты ықшам, бірақ пайдалы бер.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: question }] }],
          generationConfig: { temperature: 0.35, maxOutputTokens: 1200 }
        })
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("Gemini API error:", response.status, JSON.stringify(data));
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini API сұранысын орындау мүмкін болмады."
      });
    }

    const answer = data?.candidates?.[0]?.content?.parts
      ?.map((part) => part?.text || "")
      .join("")
      .trim();

    if (!answer) {
      console.error("Gemini empty response:", JSON.stringify(data));
      return res.status(502).json({ error: "Gemini бос жауап қайтарды." });
    }

    res.json({ answer, provider: "gemini", model: GEMINI_MODEL });
  } catch (error) {
    console.error("AI server error:", error);
    res.status(500).json({ error: "AI сұранысын орындау мүмкін болмады." });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Kazakhstan DataLab: http://0.0.0.0:${PORT}`));
