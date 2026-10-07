import express from "express";
import "dotenv/config";
import OpenAI from "openai";

const app = express();
const PORT = Number(process.env.PORT || 3000);
app.use(express.json({ limit: "64kb" }));
app.use(express.static("."));

app.get("/api/health", (_req, res) => res.json({ ok: true, ai: Boolean(process.env.OPENAI_API_KEY) }));

app.post("/api/ai", async (req, res) => {
  try {
    const question = String(req.body?.question || "").trim();
    if (!question) return res.status(400).json({ error: "Сұрақ бос болмауы керек." });
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: "OPENAI_API_KEY орнатылмаған." });

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",
      instructions: `Сен Kazakhstan DataLab AI аналитигісің. Негізгі тіл — қазақ тілі. Қазақстанның статистикасы, экономикасы, демографиясы және математикалық модельдеуін түсінікті талда. Нақты дерек пен модельдік болжамды міндетті түрде ажырат. Білмейтін санды ойдан шығарма. Жауапты ықшам, бірақ пайдалы бер.`,
      input: question
    });
    res.json({ answer: result.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI сұранысын орындау мүмкін болмады." });
  }
});

app.listen(PORT, "0.0.0.0", () => console.log(`Kazakhstan DataLab: http://0.0.0.0:${PORT}`));
