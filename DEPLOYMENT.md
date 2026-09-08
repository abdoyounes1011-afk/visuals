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

### 1️⃣ تصدير المشروع إلى مستودع جديد تماماً على GitHub (مثلاً باسم `v2`)
مشروعك يظل باسمه الأصلي (**Fawzy AI**) دون أي تعديل على اسمه. لإنشاء ورفع الكود إلى ريبوزيتوري جديد مستقل تماماً على GitHub:

- **الخيار الأول: عبر واجهة Google AI Studio مباشرة (نقرة واحدة)**:
  1. من أعلى واجهة الموقع اضغط على قائمة الإعدادات (أيقونة الترس أو النقاط الثلاث) ثم اختر **Export to GitHub** (أو **Push to GitHub**).
  2. ستفتح لك نافذة تسألك عن اسم المستودع (**Repository Name**).
  3. اكتب في خانة الاسم: **`v2`** (أو اختر "Create new repository" وضع الاسم `v2`).
  4. اختر نوع المستودع (Public أو Private) واضغط **Export / Push**.
  5. سيقوم Google AI Studio فوراً بإنشاء مشروع ومستودع جديد تماماً باسم `v2` على حسابك في GitHub ورفع كل الملفات إليه دون المساس بأي مستودع سابق.

- **الخيار الثاني: يدوياً عبر Git (إذا قمت بتنزيل ملف الـ ZIP)**:
  ```bash
  git init
  git add .
  git commit -m "Initial commit - Fawzy AI"
  git branch -M main
  git remote add origin https://github.com/<حسابك_في_GITHUB>/v2.git
  git push -u origin main
  ```

---

### 2️⃣ النشر على Vercel (معالجة خطأ 404 NOT_FOUND fra1)
إذا قمت بربط المستودع بـ **Vercel** وظهر الخطأ:
`The page could not be found NOT_FOUND fra1::...`

**تم ضبط المشروع تلقائياً ليعمل بكفاءة 100% على Vercel:**
1. تم إنشاء ملف `vercel.json` لتحديد مجلد المخرجات `dist` وتوجيه كافة المسارات تلقائياً لـ `index.html` (SPA Rewrites) لمنع حدوث 404 نهائياً.
2. تم تجهيز ملف `/api/index.ts` لمعالجة مسارات الـ API كـ Serverless Functions على Vercel.
3. كل ما عليك فعله في لوحة تحكم Vercel:
   - إضافة مفتاح `GEMINI_API_KEY` داخل **Settings > Environment Variables**.
   - الضغط على **Redeploy** (أو دفع تحديث جديد عبر Git).

---

### 3️⃣ التشغيل على أي خادم سحابي أو محلي (Node.js VPS / Ubuntu / Hostinger / إلخ)
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
