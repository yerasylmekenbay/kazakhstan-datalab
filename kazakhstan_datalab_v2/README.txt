KAZAKHSTAN DATALAB 3.0 — LIVE + MANUAL

Install: npm install
Run: npm start
Render Root Directory: kazakhstan_datalab_v2
Build Command: npm install
Start Command: npm start
Environment variable: GEMINI_API_KEY (optional for stats; required for Gemini AI).

/api/stats retrieves Kazakhstan World Bank WDI data and caches 12 hours in server memory.
The Statistics page can refresh, manually override individual indicators, export CSV and import CSV.
IMPORTANT: Manual changes live ONLY in the current browser localStorage. They do not update the public server for everyone.
This avoids pretending Render Free ephemeral filesystem is a permanent database.
Some legacy panels/region figures are still static. Indicators have differing publication years.
Gemini model default: gemini-2.5-flash; check availability in your Gemini project.
Do not commit API keys.
World Bank API: https://api.worldbank.org/v2/country/KAZ/indicator/SP.POP.TOTL?format=json
