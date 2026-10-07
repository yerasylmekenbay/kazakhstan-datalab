KAZAKHSTAN DATALAB — INTERNET + AI НҰСҚАСЫ

ЖЕРГІЛІКТІ ІСКЕ ҚОСУ
1. Node.js орнатыңыз.
2. Осы папкада терминал ашып: npm install
3. .env.example файлын .env деп көшіріңіз.
4. .env ішіне өз OPENAI_API_KEY кілтіңізді енгізіңіз.
5. npm start
6. Браузерден http://localhost:3000 ашыңыз.

ИНТЕРНЕТКЕ ЖАРИЯЛАУ (Render)
1. Осы папканы GitHub репозиторийіне жүктеңіз. .env файлын GitHub-қа салмаңыз.
2. Render → New → Web Service → GitHub репозиторийін таңдаңыз.
3. Build Command: npm install
4. Start Command: npm start
5. Environment бөліміне OPENAI_API_KEY = өз API кілтіңізді қосыңыз.
6. Қаласаңыз OPENAI_MODEL = gpt-6-luna қалдырыңыз.
7. Deploy аяқталған соң Render сізге https://...onrender.com қоғамдық сілтемесін береді.

МАҢЫЗДЫ: API кілтін index.html, JavaScript немесе GitHub-қа ешқашан жазбаңыз.
