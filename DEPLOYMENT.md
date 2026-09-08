# 🚀 دليل نشر وتشغيل منصة Fawzy AI (Deployment Guide)

تم إعداد المشروع وتجهيزه بالكامل للنشر والتشغيل على مختلف البيئات السحابية والخوادم.

---

## 📦 محتويات مجلد النشر المجهزة:
- `dist/`: يحتوي على ملفات الواجهة الأمامية مبنية ومضغوطة بالكامل (`index.html`, `assets/`) بالإضافة إلى ملف خادم الباك إند المترجم مسبقاً (`server.cjs`).
- `Dockerfile` & `.dockerignore`: ملفات جاهزة للنشر السحابي الفوري كحاوية (Container) على أي منصة تدعم Docker (مثل Google Cloud Run, Railway, Render, Fly.io, DigitalOcean, VPS).
- `package.json`: مجهز بأوامر البناء (`npm run build`) والتشغيل المباشر للإنتاج (`npm start`).
- `.env.example`: يوضح المتغير السحابي المطلوب (`GEMINI_API_KEY`).

---

## 🛠️ خيارات النشر والتشغيل:

### 1️⃣ التصدير والنشر المباشر من Google AI Studio (الأسهل)
1. من أعلى واجهة Google AI Studio Build، اضغط على زر **Deploy** لاختيار النشر السريع على **Google Cloud Run**.
2. أو اضغط على خيارات الإعدادات ثم **Export to ZIP** أو **Export to GitHub** لتنزيل كود المشروع كاملاً على جهازك.

---

### 2️⃣ التشغيل على أي خادم سحابي أو محلي (Node.js VPS / Ubuntu / Hostinger / إلخ)
1. **تثبيت الحزم**:
   ```bash
   npm install
   ```
2. **إعداد مفتاح الـ API**:
   قم بإنشاء ملف `.env` في المجلد الرئيسي وضع بداخله:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   NODE_ENV=production
   ```
3. **بناء المشروع (Production Build)**:
   ```bash
   npm run build
   ```
4. **تشغيل المشروع**:
   ```bash
   npm start
   ```
   أو باستخدام مدير العمليات `pm2` للتشغيل المستمر في الخلفية:
   ```bash
   npm install -g pm2
   pm2 start dist/server.cjs --name "fawzy-ai"
   pm2 save
   ```

---

### 3️⃣ النشر باستخدام Docker (Google Cloud Run / Railway / Render / DigitalOcean)
تم تجهيز `Dockerfile` بتقنية Multi-Stage لتقليل حجم الحاوية وتسريع الإقلاع.

- **بناء صورة الدوكر محلياً**:
  ```bash
  docker build -t fawzy-ai .
  ```
- **تشغيل الحاوية**:
  ```bash
  docker run -d -p 3000:3000 -e GEMINI_API_KEY="your_api_key" --name fawzy-ai-container fawzy-ai
  ```

---

### 4️⃣ النشر السريع على منصة Render أو Railway:
1. ارفع المشروع على مستودع **GitHub**.
2. في **Render** أو **Railway**، اختر "New Web Service" واختر المستودع.
3. الإعدادات التلقائية:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start` (أو سيقرأ الـ Dockerfile تلقائياً)
   - **Environment Variables**: أضف `GEMINI_API_KEY` بقيمتك السرية.
