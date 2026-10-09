import express from "express";
import "dotenv/config";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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


// World Bank public indicators, refreshed at most once per 12 hours on this server.
const INDICATORS = Object.freeze({population:'SP.POP.TOTL',gdp:'NY.GDP.MKTP.CD',gdp_pc:'NY.GDP.PCAP.CD',growth:'NY.GDP.MKTP.KD.ZG',unemployment:'SL.UEM.TOTL.ZS',inflation:'FP.CPI.TOTL.ZG',life:'SP.DYN.LE00.IN'});
const cache = new Map();
app.get('/api/stats', async (req,res)=>{
 const now=Date.now();
 const cached=cache.get('kz');
 if(cached && now-cached.at<12*3600*1000 && req.query.refresh!=='1') return res.json({...cached.value,cached:true});
 try {
  const entries=await Promise.all(Object.entries(INDICATORS).map(async ([key,id])=>{
   const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),12000);
   try {const r=await fetch(`https://api.worldbank.org/v2/country/KAZ/indicator/${id}?format=json&per_page=80`,{signal:controller.signal});if(!r.ok)throw Error('World Bank HTTP '+r.status);const j=await r.json();if(!Array.isArray(j)||!Array.isArray(j[1]))throw Error('World Bank format');return [key,j[1].filter(x=>x.value!==null).map(x=>({year:Number(x.date),value:Number(x.value)})).sort((a,b)=>a.year-b.year)];}finally{clearTimeout(timeout)}
  }));
  const value={updatedAt:new Date().toISOString(),source:'World Bank API / WDI',indicators:Object.fromEntries(entries)};
  cache.set('kz',{at:now,value});res.json(value);
 }catch(e){console.error('Statistics refresh:',e.message);if(cached)return res.json({...cached.value,cached:true,warning:'Source unavailable; cached data'});res.status(503).json({error:'World Bank деректері қазір қолжетімсіз. Кейін қайталаңыз.'});}
});

app.listen(PORT, "0.0.0.0", () => console.log(`Kazakhstan DataLab: http://0.0.0.0:${PORT}`));
