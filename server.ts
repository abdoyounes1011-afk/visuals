import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { generateProceduralMedicalIllustrationSvg } from "./src/lib/medical3dGenerator";

dotenv.config();

const app = express();
const PORT = 3000;

// CORS & Preflight handling
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Vercel & Reverse Proxy URL preservation:
// When Vercel rewrites /api/(.*) to /api, req.originalUrl retains the exact route path (/api/zatona)
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (req.url === "/api" && req.originalUrl && req.originalUrl !== "/api") {
    req.url = req.originalUrl;
  }
  next();
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Lazy initialization of Gemini Client
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (e) {
    console.warn("Failed to initialize GoogleGenAI:", e);
    return null;
  }
}

// Health check endpoint (both /api/health and /health)
app.get(["/api/health", "/health"], (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Official @google/genai candidate models prioritizing ultra-fast responsive 3.x models
const CANDIDATE_MODELS = [
  "gemini-3.1-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
];

async function generateGeminiContent(
  aiClient: GoogleGenAI,
  contents: any,
  config?: any
): Promise<string> {
  const overallTimeoutMs = 15000; // 15s timeout allowing flash models to comfortably complete
  let lastError: any = null;

  const runWithTimeout = async () => {
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await aiClient.models.generateContent({
          model,
          contents,
          config,
        });

        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini attempt with "${model}" failed:`, err?.message || err);
      }
    }
    throw lastError || new Error("All candidate models failed or timed out");
  };

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error(`Total deadline of ${overallTimeoutMs}ms exceeded for Gemini call`)),
      overallTimeoutMs
    )
  );

  return Promise.race([runWithTimeout(), timeoutPromise]);
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

// Prompt generator for Zatona
const ZATONA_SYSTEM_PROMPT = `
You are an expert Clinical Medicine Professor and renowned medical educator who has taught thousands of medical students.
Your specialty is deconstructing complex clinical diseases into high-yield, crystal-clear, uncrowded, highly memorizable clinical pearls ("Zatona").

CRITICAL FORMATTING & CONTENT RULES:
1. Language: English only for medical content. Keep points crisp, uncrowded, and never dense or cluttered.
2. Structure your breakdown systematically with clear headings and emojis (🔬, 🧠, 🔑, ⚠️, 🧩, 📌, 💡, ❌, 👉, 🎯).
3. Follow these exact stages:

🔬 Core Definition & Simplified Concept:
- In simple, intuitive terms (What is this disease simply?)
- Pathophysiological reality in 3D/cellular terms.

🧠 Pathophysiology Mechanism Chain:
- Step-by-step linear arrow cascade: Step 1 -> Step 2 -> Step 3 -> Clinical Sequelae.

📌 "Symptom → Why" Mapping (Every symptom MUST have a precise physiological cause):
- Example: Tachycardia → compensatory sympathetic baroreceptor reflex to ↓ stroke volume / BP.
- Example: Edema → ↑ capillary hydrostatic pressure OR ↓ plasma oncotic pressure (albumin).
- Example: Dyspnea → V/Q mismatch or interstitial fluid impairing alveolar gas diffusion.
- Group common mechanisms among symptoms clearly.

🎯 Targeted Investigations ("Why am I ordering this test?"):
- Never random testing! For each test, answer: "Why am I ordering this specific test?"
- Link each test to the pathophysiology it detects.

💊 Management Linked to Pathophysiology (Every intervention = solution to a physiological defect):
- Example: Hypotension → IV crystalloid fluids (↑ preload / end-diastolic volume) → Vasopressors (↑ systemic vascular resistance / alpha-1 tone).
- Structured "IF-THEN" clinical decision rules:
  * IF condition A → do X
  * IF condition B → do Y
  * IF refractory to initial therapy → do Z

⚡ High-Yield Exam Tricks (The discriminators in clinical exams):
- First Step (Initial emergency or triage step)
- Best Next Step (Most accurate next diagnostic action)
- Definitive / Gold Standard Treatment or Diagnosis

🚨 "WHY Students Choose the Wrong Answer" (Exposing Exam Traps):
- For each classic trap: Explain the specific cognitive bias or distractor why students fall into it.

🔍 "Look-Alike Options" (Confusing look-alikes in diagnosis or investigations):
- Clarify subtle differences between 2-3 easily mixed-up choices (e.g., CT vs MRI, Troponin vs CK-MB, etc.).

❌ "Don't Do" Section (Absolute Contraindications & Dangerous Mistakes):
- Crucial things that are strictly forbidden or fatal if done.
`;

// Context-aware clinical fallback generator for Zatona
function getFallbackZatona(diseaseName: string, notes?: string): string {
  const query = (diseaseName || notes || "Clinical Medicine").trim();
  const qLower = query.toLowerCase();

  // 1. Specific Fallback: Thumb Opposition & Median Nerve / Hand Anatomy
  if (qLower.includes("thumb") || qLower.includes("opposition") || qLower.includes("median nerve") || qLower.includes("carpal")) {
    return `🔬 Core Definition & The Concept:
👉 What is Thumb Opposition?
Opposition is the unique complex 3D movement bringing the thumb pulp into contact with the pulps of the other four digits (critical for human evolutionary tool use and precision grip).
Pathophysiological & Anatomical Reality:
Occurs primarily at the First Carpometacarpal (CMC) Saddle Joint (Trapezium-1st Metacarpal). It is a composite movement: Flexion + Abduction + Medial (Internal) Axial Rotation.

🧠 Pathophysiology Mechanism Chain:
Motor pathway: C8-T1 anterior horn cells ➔ Inferior trunk of brachial plexus ➔ Medial/Lateral cords ➔ Median Nerve
  ➔ Enters hand through carpal tunnel deep to flexor retinaculum
  ➔ Recurrent (motor) branch of median nerve (the "Million-Dollar Nerve")
  ➔ Innervates Opponens Pollicis (plus Abductor Pollicis Brevis & superficial head of Flexor Pollicis Brevis = "OAF" thenar muscles)
  ➔ Coordinated contraction rotates 1st metacarpal medially across palm towards opposing digits.

📌 "Symptom → Why" Mapping:
* Inability to oppose thumb ("Ape Hand" deformity) ➔ Denervation & atrophy of thenar muscles (specifically Opponens Pollicis), leaving thumb adducted and extended by intact Ulnar (Adductor pollicis) and Radial (EPL/EPB) nerves.
* Loss of precision / pincer grip (dropping small objects, keys, buttons) ➔ Loss of sensory feedback from median nerve distribution + motor failure of thumb rotation.
* Paresthesia / Numbness of thumb, index, middle, & radial half of ring finger ➔ Compression of median sensory fibers under the transverse carpal ligament (Carpal Tunnel).
* Sparing of thenar palm sensation in Carpal Tunnel Syndrome ➔ Palmar cutaneous branch of median nerve arises ~3 cm PROXIMAL to flexor retinaculum and passes OVER (superficial to) the carpal tunnel!

🎯 Targeted Investigations ("Why am I ordering this test?"):
* Electromyography & Nerve Conduction Studies (EMG/NCS) ➔ Directly distinguish demyelination (prolonged sensory/motor latency across wrist) from axonal loss (reduced amplitude).
* Phalen's Maneuver & Tinel's Tap ➔ Reproduce ischemic compression symptoms at the flexor retinaculum by raising intracarpal pressure.
* Ultrasound / MRI of the Wrist ➔ Directly visualize cross-sectional area (>10 mm²) of the compressed median nerve and identify structural space-occupying lesions (ganglion cyst, tenosynovitis).

💊 Management Linked to Pathophysiology (Every Intervention = Solution to Physiological Defect):
👉 Goal: Decompress the nerve, restore microvascular capillary perfusion, and prevent irreversible axonotmesis!
* Volar Wrist Splint in Neutral (0° - 15° extension) ➔ Minimizes intracarpal canal hydrostatic pressure (pressure spikes dramatically in wrist flexion/extension).
* Ultrasound-guided Corticosteroid Injection into carpal tunnel ➔ Rapidly reduces synovial edema and tenosynovial hypertrophy around flexor tendons.
* Surgical Carpal Tunnel Release (Open or Endoscopic) ➔ Complete transection of transverse carpal ligament permanently enlarges the carpal tunnel volume.

💡 Think in "IF-THEN" Rules:
* IF mild-to-moderate symptoms with normal thenar bulk ➔ Conservative therapy: nocturnal wrist splint + activity modification for 6-12 weeks.
* IF persistent symptoms refractory to splinting and steroid injection ➔ Refer for electrodiagnostic confirmation and elective surgical release.
* IF severe constant numbness OR thenar muscle atrophy / weakness ➔ Immediate surgical decompression (avoid permanent ischemic axonal loss).

⚡ High-Yield Exam Tricks (USMLE & Clinical Board Pearls):
* First Step ➔ Neutral-angle nocturnal wrist splint + ergonomic modification.
* Best Next Step (diagnostic confirmation) ➔ Nerve conduction study (NCS).
* Definitive Treatment (severe or refractory) ➔ Surgical transection of transverse carpal ligament.
* High-Yield Anatomical Trap: The Recurrent Branch of the Median Nerve is superficial and vulnerable to accidental transection during inadvertent thenar incisions (hence the clinical nickname "Million-Dollar Nerve").

🚨 WHY Students Choose the Wrong Answer (Exam Traps):
* Trap 1: Thinking the whole thumb is supplied by median nerve (Student forgets: Adductor Pollicis is supplied by the DEEP branch of ULNAR nerve, tested by Froment's sign!).
* Trap 2: Believing Carpal Tunnel causes numbness of the palm (Student forgets the Palmar Cutaneous branch branches PROXIMAL to and runs SUPERFICIAL to the retinaculum).

🔍 Look-Alike Options:
* Carpal Tunnel Syndrome vs Pronator Teres Syndrome ➔ Pronator syndrome causes numbness of the palm (palmar cutaneous branch affected) and pain with resisted forearm pronation, whereas Carpal Tunnel spares the palm and worsens with wrist flexion (Phalen's).

❌ "Don't Do" Section (Absolute Contraindications & Dangerous Mistakes):
* ❌ NEVER inject corticosteroids directly into the median nerve substance (must be injected into the synovial space).
* ❌ NEVER immobilize the wrist in extreme flexion or extension (dramatically worsens ischemic compression).`;
  }

  // 2. Specific Fallback: Congestive Heart Failure / Cardiogenic Shock
  if (qLower.includes("heart failure") || qLower.includes("chf") || qLower.includes("cardiogenic") || qLower.includes("pulmonary edema")) {
    return `🔬 Core Definition & The Concept:
👉 What is Acute Decompensated Heart Failure (ADHF)?
A clinical syndrome in which myocardial dysfunction (systolic or diastolic) prevents the heart from pumping blood at a rate commensurate with the metabolic requirements of metabolizing tissues, or does so only from an elevated filling pressure.

🧠 Pathophysiology Mechanism Chain:
Myocardial injury / acute stress
  ➔ ↓ Cardiac Output (Stroke Volume × HR)
  ➔ Compensatory activation of Sympathetic Nervous System & RAAS
  ➔ Peripheral vasoconstriction (↑ afterload) + Renal Na+/H2O retention (↑ preload)
  ➔ Progressive ventricular dilation and ↑ Left Ventricular End-Diastolic Pressure (LVEDP)
  ➔ Retrograde transmission of pressure: ↑ Left Atrial Pressure ➔ ↑ Pulmonary Capillary Wedge Pressure (>18-20 mmHg)
  ➔ Fluid extravasation across alveolar-capillary membrane ➔ Alveolar flooding (Pulmonary Edema) & impaired gas exchange.

📌 "Symptom → Why" Mapping:
* Dyspnea & Orthopnea ➔ Redistribution of gravitational venous volume from lower extremities to central circulation when supine, spiking pulmonary capillary hydrostatic pressure.
* Bilateral Basilar Crackles (Rales) ➔ Fluid transudation into alveoli popping open during inspiration.
* Elevated Jugular Venous Pressure (JVP) & Hepatojugular Reflux ➔ Retrograde transmission of elevated right ventricular end-diastolic pressure into central venous system.
* Peripheral Lower-Extremity Edema ➔ Elevated systemic venous hydrostatic pressure exceeding plasma oncotic pressure, driving interstitial transudation.

🎯 Targeted Investigations ("Why am I ordering this test?"):
* B-type Natriuretic Peptide (BNP / NT-proBNP) ➔ Released by ventricular myocytes in direct response to stretch and wall tension; excellent negative predictive value (>98%).
* Chest X-Ray (AP/PA) ➔ Evaluate for venous congestion (Cephalization of vessels), interstitial edema (Kerley B lines), alveolar edema (bat-wing infiltrates), and cardiomegaly.
* Transthoracic Echocardiogram (TTE) ➔ Measure Left Ventricular Ejection Fraction (LVEF) to distinguish HFrEF (systolic ≤40%) from HFpEF (diastolic ≥50%) and check valvular pathology.

💊 Management Linked to Pathophysiology:
👉 Goal: Reduce preload (pulmonary congestion), optimize afterload, and restore tissue perfusion!
* IV Loop Diuretics (Furosemide 1-2.5x home dose IV) ➔ Blocks Na-K-2Cl cotransporter in thick ascending limb, causing venodilation and rapid diuresis.
* Vasodilators (IV Nitroglycerin / Nitroprusside) ➔ Reduces venous return (preload) and systemic vascular resistance (afterload) in hypertensive acute pulmonary edema.
* Non-Invasive Positive Pressure Ventilation (CPAP/BiPAP) ➔ Increases intrathoracic pressure, decreases venous return, recruits flooded alveoli, and reduces work of breathing.

💡 Think in "IF-THEN" Rules:
* IF patient is "Warm & Wet" (well perfused, congested) ➔ IV Loop Diuretic + IV Nitrates.
* IF patient is "Cold & Wet" (hypoperfused, congested with MAP < 65) ➔ Inotrope (Dobutamine / Milrinone) + cautious diuresis, vasopressor if refractory shock.
* IF acute pulmonary edema with severe respiratory distress ➔ Immediate CPAP/BiPAP + High-dose IV Nitroglycerin + IV Furosemide.

⚡ High-Yield Exam Tricks:
* First Step ➔ Sit patient upright + High-flow O2 / CPAP + IV access + ECG.
* Best Next Step (bedside discriminator) ➔ Point-of-care ultrasound (lung B-lines) + BNP.
* Definitive Long-Term Mortality-Reducing Drugs (HFrEF) ➔ "Fantastic Four": ARNI/ACEi + Beta-Blocker (carvedilol/metoprolol succinate) + MRA (spironolactone) + SGLT2 inhibitor (dapagliflozin/empagliflozin).

🚨 WHY Students Choose the Wrong Answer:
* Trap: Initiating or up-titrating beta-blockers during ACUTE decompensation (Beta-blockers reduce inotropy and can precipitate worsening acute cardiogenic shock; only titrate when patient is fully euvolemic).

❌ "Don't Do" Section:
* ❌ NEVER administer IV fluid boluses to a patient in acute pulmonary edema.
* ❌ NEVER start acute beta-blocker therapy in hemodynamically unstable or congested decompensated failure.`;
  }

  // 3. Specific Fallback: Diabetic Ketoacidosis (DKA)
  if (qLower.includes("dka") || qLower.includes("ketoacidosis") || qLower.includes("diabetic keto")) {
    return `🔬 Core Definition & The Concept:
👉 What is Diabetic Ketoacidosis (DKA)?
An acute, life-threatening metabolic complication of diabetes (predominantly Type 1) characterized by the triad of: Hyperglycemia (>250 mg/dL), Anion Gap Metabolic Acidosis (arterial pH <7.30, HCO3 <18), and Ketonemia.

🧠 Pathophysiology Mechanism Chain:
Absolute or severe relative insulin deficiency + Counter-regulatory hormone surge (Glucagon, Epinephrine, Cortisol, GH)
  ➔ Massive uninhibited peripheral lipolysis in adipose tissue
  ➔ Free fatty acids (FFAs) delivered to liver mitochondria
  ➔ Accelerated hepatic beta-oxidation generates excess Acetyl-CoA
  ➔ Channeled into Ketogenesis ➔ Acetoacetate & Beta-Hydroxybutyrate production
  ➔ Accumulation of ketoacids exceeds buffering capacity ➔ High Anion Gap Metabolic Acidosis
  ➔ Concurrent marked hyperglycemia causes osmotic diuresis, massive volume depletion, and profound total-body electrolyte loss (K+, PO4, Mg2+).

📌 "Symptom → Why" Mapping:
* Kussmaul Respirations (Deep, rapid breathing) ➔ Respiratory compensation: hyperventilation to blow off volatile acid (CO2) to compensate for metabolic ketoacidosis.
* Fruity Breath Odor ➔ Spontaneous decarboxylation of acetoacetate into volatile acetone, exhaled via lungs.
* Abdominal Pain & Vomiting ➔ Gastric ileus and delayed emptying driven by systemic acidosis and hyperketonemia.
* Polyuria, Polydipsia, & Hypotension ➔ Glycosuria exceeding renal threshold (180 mg/dL) causing severe osmotic diuresis (average 5-7 L fluid deficit).

🎯 Targeted Investigations ("Why am I ordering this test?"):
* Serum Beta-Hydroxybutyrate & Anion Gap ➔ Accurately quantify the predominant circulating ketoacid and monitor resolution of acidosis (serum ketones > urine dipstick!).
* Serum Potassium (K+) ➔ CRITICAL: Total body K+ is severely depleted despite normal/elevated baseline serum K+ (acidosis and insulin deficiency shift K+ out of cells).
* Venous/Arterial Blood Gas (VBG/ABG) & Basic Metabolic Panel ➔ Calculate Anion Gap = Na - (Cl + HCO3); assess pH and base deficit.

💊 Management Linked to Pathophysiology:
👉 Goal: Restore intravascular volume, resolve ketoacidosis, and prevent fatal hypokalemia or cerebral edema!
* 1. IV Isotonic Saline (0.9% NaCl 1000 mL/hr initial) ➔ Restores renal perfusion and clears counter-regulatory stress hormones.
* 2. Check Potassium BEFORE Insulin:
  - If K+ < 3.3 mEq/L: HOLD insulin, give IV KCl until K+ > 3.3 (Insulin drives K+ into cells, precipitating fatal cardiac arrhythmia!).
  - If K+ 3.3 - 5.2 mEq/L: Give IV regular insulin (0.1 U/kg/hr) AND add 20-30 mEq K+ to each liter of IV fluids.
  - If K+ > 5.2 mEq/L: Start insulin, check K+ every 2 hours, do not add K+ yet.
* 3. Switch to D5W + 0.45% Saline when glucose drops to ~200 mg/dL ➔ Prevents hypoglycemia while continuing insulin until the ANION GAP CLOSES!

💡 Think in "IF-THEN" Rules:
* IF Blood Glucose reaches 200 mg/dL but Anion Gap remains open ➔ ADD 5% Dextrose to IV fluids and CONTINUE insulin infusion (Insulin is treating the acidosis, not just the sugar!).
* IF Serum K+ is < 3.3 mEq/L ➔ STOP/HOLD insulin immediately and infuse potassium.
* IF Anion Gap normalizes (<12), HCO3 ≥ 18, and patient eating ➔ Transition to subcutaneous basal insulin 2 hours BEFORE stopping IV insulin.

⚡ High-Yield Exam Tricks:
* First Step ➔ 1-2 Liters of IV Normal Saline bolus (Fluid resuscitation precedes insulin!).
* Most Important Lab Prior to Starting Insulin ➔ Serum Potassium (K+).
* Definition of DKA Resolution ➔ Glucose < 200 mg/dL AND two of: HCO3 ≥ 15, Venous pH > 7.3, Anion Gap ≤ 12.

🚨 WHY Students Choose the Wrong Answer:
* Trap: Stopping insulin when blood glucose drops to 200 mg/dL (Acidosis returns! You must add dextrose and run insulin until the anion gap is closed).

❌ "Don't Do" Section:
* ❌ NEVER give insulin without verifying that serum potassium is ≥ 3.3 mEq/L.
* ❌ NEVER stop IV insulin without administering subcutaneous basal insulin 1-2 hours prior.`;
  }

  // 4. Dynamic Generic Fallback that uses the user's actual notes and terms
  const safeNotes = (notes || "").trim();
  const summaryLine = safeNotes.length > 20 ? safeNotes.slice(0, 180) + "..." : `Clinical evaluation of ${query}`;

  return `🔬 Core Definition & The Concept:
👉 What is ${query}?
A distinct clinical condition involving disruption of physiological equilibrium.
${safeNotes ? `Context from provided notes: "${summaryLine}"` : `Deconstructed into key pathophysiologic drivers, diagnostic markers, and evidence-based interventions.`}

🧠 Pathophysiology Mechanism Chain:
Primary Trigger / Etiologic Insult
  ➔ Cellular stress, receptor alteration, or microvascular dysfunction
  ➔ Triggering of compensatory neuro-endocrine or inflammatory mediator release
  ➔ End-organ parenchymal strain & functional decompensation
  ➔ Observable clinical findings, laboratory alterations, and clinical sequelae.

📌 "Symptom → Why" Mapping:
* Primary Focal Signs ➔ Direct anatomic or biochemical disruption of target tissue physiology.
* Systemic Manifestations ➔ Autonomic nervous system activation & inflammatory cascade signaling.
* Compensatory Reactions ➔ Homeostatic feedback loops attempting to restore organ perfusion and cellular oxygenation.

🎯 Targeted Investigations ("Why am I ordering this test?"):
* Baseline Diagnostic Chemistry & Biomarkers ➔ Quantify metabolic derangements and organ functional reserve.
* Targeted Imaging / Electrophysiology ➔ Directly localize structural pathology, anatomical impingement, or tissue ischemia.
* Discriminator Confirmatory Testing ➔ Exclude deadliest mimic conditions and guide targeted medical/surgical therapy.

💊 Management Linked to Pathophysiology:
👉 Goal: Correct underlying pathophysiology, support cellular respiration, and prevent secondary complications!
* Acute Phase Stabilization ➔ Immediate ABC optimization, restoration of physiological homeostasis, and relief of focal stress.
* Targeted Pharmacotherapy / Intervention ➔ Molecular or surgical eradication of primary disease trigger.
* Structured Decision Rules:
  - IF stable with mild presentation ➔ Conservative stepwise optimization and close serial monitoring.
  - IF high-risk red flags or decompensation ➔ Immediate protocolized intervention and specialist escalation.

⚡ High-Yield Exam Tricks (Clinical Pearls):
* First Step ➔ Bedside ABC stabilization and rapid evaluation of hemodynamic stability.
* Best Next Step ➔ Most sensitive and specific next diagnostic test before invasive procedures.
* Definitive Treatment ➔ Targeted disease-modifying therapy or structural correction.

🚨 WHY Students Choose the Wrong Answer (Exam Traps):
* Trap 1: Choosing definitive advanced imaging before ensuring patient stability at bedside.
* Trap 2: Mixing up acute bedside emergency actions with long-term outpatient maintenance regimens.

🔍 Look-Alike Options:
* Key Look-Alike ➔ Differentiating acute presentation from its most common clinical mimicker through timing and specific physical exam discriminators.

❌ "Don't Do" Section:
* ❌ NEVER delay life-saving resuscitation or emergency therapy to wait for non-critical lab results.
* ❌ NEVER proceed to aggressive interventions without ruling out absolute contraindications.`;
}

// Fallback generator for handwritten formatted note with deduplication and keyword highlighting
function getFallbackHandwrittenStructure(text: string, title: string) {
  const cleanTitle = (title || "Clinical Medical Notes").trim();
  const qLower = `${cleanTitle} ${text}`.toLowerCase();

  // 1. Exact Match for the User's Uploaded Sample: Chemical Eye Burns
  if (qLower.includes("eye") || qLower.includes("burn") || qLower.includes("chemical") || qLower.includes("cornea") || qLower.includes("irrigation") || qLower.includes("alkali")) {
    return {
      title: "WHY IMMEDIATE EYE IRRIGATION IS CRUCIAL IN CHEMICAL BURNS?",
      titleLines: [
        "WHY IMMEDIATE EYE IRRIGATION IS",
        "CRUCIAL IN CHEMICAL BURNS?"
      ],
      subtitle: "@abdofawzii • Clinical Ophthalmology High-Yield Sheet",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      sections: [
        {
          numberBadge: 1,
          heading: "THE PROBLEM: ALKALI VS. ACID PENETRATION.",
          type: "comparison",
          highlightColor: "yellow",
          icon: "eye",
          diagramType: "eye_burn",
          lines: [
            "• **Alkali** (e.g., Lye/Chlorine/Quicklime) penetrates tissues very rapidly, destroying stem cells and the cornea.",
            "• **Acid burn**: Coagulation necrosis precipitates protein barrier, limiting deeper penetration.",
            "• **Alkali burn**: Saponification & liquefaction necrosis causes progressive deep anterior chamber destruction."
          ]
        },
        {
          numberBadge: 2,
          heading: "IMPORTANT NOTE (e.g., QUICKLIME vs. LIQUID)",
          type: "concept",
          highlightColor: "peach",
          icon: "warning",
          diagramType: "wipe_particles",
          lines: [
            "• In conditions involving **quicklime** (calcium oxide), dry material must be wiped off **before** irrigation, as water activates it (exothermic reaction).",
            "• Otherwise, irrigation must be **immediate** (Household Detergents/Chlorine: copious liquid irrigation)."
          ]
        },
        {
          numberBadge: 3,
          heading: "THE MECHANISM (THE DESTRUCTION CYCLE) (ALKALI)",
          type: "flowchart",
          highlightColor: "cyan",
          icon: "arrows",
          diagramType: "flowchart_chain",
          lines: [
            "START ➔ Chemical (e.g., Alkali) enters the eye",
            "↓ **Penetration & Saponification**",
            "↓ **Rapid penetration of corneal stroma**",
            "↓ **Liquefactive Necrosis** (Protein breakdown & Lipid dissolution)",
            "↓ Loss of stem cells & corneal opacity",
            "END ➔ **Total corneal melted & Permanent blindness**"
          ]
        },
        {
          numberBadge: 4,
          heading: "THE DANGER OF DELAYED IRRIGATION",
          type: "anatomy",
          highlightColor: "red",
          icon: "eye",
          diagramType: "eye_anatomy",
          lines: [
            "• Delayed or inadequate irrigation leads to **irreversible deep tissue damage** and extensive scarring.",
            "• High-Yield Complications: **Cornea Melting** (Corneal Perforation), **Symblepharon** (adhesion), Neovascularization."
          ]
        }
      ],
      bottomAlertBox: {
        mainRule: "MUST BEGIN IRRIGATION (15-30 mins) BEFORE TAKING HISTORY, EXAM, OR REFERRAL.",
        subLabel: "THE HUMAN EYE ANATOMY & EMERGENCY ACTION PROTOCOL"
      },
      recommendedDoodles: ["eye", "warning", "arrows", "pill"]
    };
  }

  // 2. Thumb Opposition & Median Nerve (Matches user's curriculum)
  if (qLower.includes("thumb") || qLower.includes("opposition") || qLower.includes("median nerve") || qLower.includes("carpal")) {
    return {
      title: "THUMB OPPOSITION & MEDIAN NERVE HIGH-YIELD ANATOMY",
      titleLines: [
        "THUMB OPPOSITION & MEDIAN NERVE",
        "HIGH-YIELD CLINICAL ANATOMY"
      ],
      subtitle: "@abdofawzii • Upper Limb Neuro-Anatomy High-Yield Sheet",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      sections: [
        {
          numberBadge: 1,
          heading: "THE CORE ANATOMY: SADDLE JOINT & OPPONENS",
          type: "concept",
          highlightColor: "yellow",
          icon: "brain",
          diagramType: "nerve",
          lines: [
            "• 1st Carpometacarpal joint (**Saddle joint**: Trapezium + 1st Metacarpal) allows composite 3D motion: Flexion + Abduction + Internal Rotation.",
            "• Key Muscle: **Opponens Pollicis** innervated by **Recurrent branch of Median Nerve** (the \"Million-Dollar Nerve\")."
          ]
        },
        {
          numberBadge: 2,
          heading: "HIGH-YIELD CAVEAT: CARPAL TUNNEL SENSATION",
          type: "warning",
          highlightColor: "peach",
          icon: "warning",
          diagramType: "generic",
          lines: [
            "• **Palmar cutaneous branch** arises ~3 cm proximal to flexor retinaculum and passes **superficial to carpal tunnel**.",
            "• Therefore: Sensation over the thenar eminence is **strictly spared** in carpal tunnel syndrome!"
          ]
        },
        {
          numberBadge: 3,
          heading: "THE PATHOLOGY CYCLE: COMPRESSION TO ATROPHY",
          type: "flowchart",
          highlightColor: "cyan",
          icon: "arrows",
          diagramType: "flowchart_chain",
          lines: [
            "START ➔ Raised intracarpal canal pressure (wrist flexion/edema)",
            "↓ **Microvascular ischemia of median nerve**",
            "↓ Sensory loss: Thumb, index, middle, radial half of ring finger",
            "↓ Motor denervation of \"OAF\" thenar muscles",
            "END ➔ **Ape-Hand deformity & permanent loss of precision pincer grip**"
          ]
        },
        {
          numberBadge: 4,
          heading: "EXAM DISCRIMINATOR: PRECISION VS POWER GRIP",
          type: "management",
          highlightColor: "red",
          icon: "pill",
          diagramType: "generic",
          lines: [
            "• **Precision grip** (holding pen, threading needle) requires 100% thumb opposition (Median Nerve).",
            "• **Power grip** (holding hammer, suitcase) relies primarily on Long Flexors & Adductor Pollicis (Deep branch of **Ulnar Nerve**)."
          ]
        }
      ],
      bottomAlertBox: {
        mainRule: "FIRST STEP: NEUTRAL-ANGLE SPLINT (0-15° EXTENSION). DEFINITIVE: SURGICAL RELEASE.",
        subLabel: "HIGH-YIELD MEDIAN NERVE DISCRIMINATOR PROTOCOL"
      },
      recommendedDoodles: ["brain", "warning", "arrows", "pill"]
    };
  }

  // 3. Generic 4-part Infographic Builder for Any Medical Note
  const rawLines = (text || "")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 3);

  const seenNorm = new Set<string>();
  const uniqueLines: string[] = [];

  for (const l of rawLines) {
    const stripped = l.replace(/^(\d+[\.\)]|\*|•|-)\s*/, "").trim();
    if (!stripped) continue;
    const norm = stripped.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seenNorm.has(norm)) continue;
    seenNorm.add(norm);

    let marked = stripped;
    if (!marked.includes("**")) {
      marked = marked.replace(
        /\b(Median Nerve|Opponens [Pp]ollicis|Carpal [Tt]unnel|Saddle [Jj]oint|Virchow'?s Triad|V\/Q mismatch|CTPA|D-dimer|Heparin|tPA|Aspirin|Insulin|Norepinephrine|Furosemide|Gold Standard|First Step|Best Next Step|Contraindicated|Hypoxemia|Hyperkalemia|Hypokalemia|Alkali|Acid|Irrigation|Cornea|Saponification|Necrosis)\b/gi,
        "**$1**"
      );
    }
    uniqueLines.push(marked);
  }

  const finalLines = uniqueLines.length > 0 ? uniqueLines : [
    `• Key Concept: **${cleanTitle}** pathophysiological reality & primary mechanism.`,
    "• Primary trigger leads to **cellular stress** and rapid microvascular changes.",
    "• Step-by-step progression: **Early detection** prevents irreversible tissue injury.",
    "• High-yield rule: **First Step** bedside action before waiting for delayed results."
  ];

  const chunkSize = Math.max(1, Math.ceil(finalLines.length / 4));
  const s1 = finalLines.slice(0, chunkSize);
  const s2 = finalLines.slice(chunkSize, chunkSize * 2);
  const s3 = finalLines.slice(chunkSize * 2, chunkSize * 3);
  const s4 = finalLines.slice(chunkSize * 3);

  const sections: any[] = [
    {
      numberBadge: 1,
      heading: "THE PROBLEM: CORE MECHANISM & DEFINITION",
      type: "concept",
      highlightColor: "yellow",
      icon: "brain",
      diagramType: "generic",
      lines: s1.length > 0 ? s1 : [`• Core pathophysiology of **${cleanTitle}**.`]
    },
    {
      numberBadge: 2,
      heading: "IMPORTANT NOTE: CLINICAL CAVEATS & TRAPS",
      type: "warning",
      highlightColor: "peach",
      icon: "warning",
      diagramType: "wipe_particles",
      lines: s2.length > 0 ? s2 : ["• Critical clinical caveat to remember under high-stress board exams."]
    },
    {
      numberBadge: 3,
      heading: "THE MECHANISM: DESTRUCTION & PROGRESSION CYCLE",
      type: "flowchart",
      highlightColor: "cyan",
      icon: "arrows",
      diagramType: "flowchart_chain",
      lines: s3.length > 0 ? s3 : [
        "START ➔ Initial trigger / disease onset",
        "↓ **Acute physiological compensation**",
        "↓ Microvascular decompensation & tissue damage",
        "END ➔ **Clinical failure if left untreated**"
      ]
    },
    {
      numberBadge: 4,
      heading: "THE DANGER & TARGETED MANAGEMENT PROTOCOL",
      type: "management",
      highlightColor: "red",
      icon: "pill",
      diagramType: "heart_cardiac",
      lines: s4.length > 0 ? s4 : ["• Immediate intervention: **Gold Standard** stabilization protocol."]
    }
  ];

  return {
    title: cleanTitle.toUpperCase(),
    titleLines: [cleanTitle.toUpperCase()],
    subtitle: "@abdofawzii • High-Yield Medical Study Sheet",
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    sections,
    bottomAlertBox: {
      mainRule: "FIRST STEP: STABILIZE VITALS & INITIATE TARGETED PROTOCOL BEFORE DELAYED LABS.",
      subLabel: "CRITICAL HIGH-YIELD CLINICAL DISCRIMINATOR"
    },
    recommendedDoodles: ["heart", "stethoscope", "syringe", "pill", "brain"]
  };
}

// Fallback Exam Traps
function getFallbackExamTraps(topic: string) {
  const safeTopic = topic || "Clinical Medicine Exam Traps";
  return {
    topic: safeTopic,
    traps: [
      {
        trapName: "First Step vs Best Next Step Confusion",
        whyExaminersTestIt: "Students frequently confuse the ultimate diagnostic test with the immediate bedside action.",
        theMistake: "Picking CT Angiography or MRI before checking vitals and stabilizing airway/circulation.",
        theGoldenRule: "Always stabilize vitals and evaluate ABCs first. An unstable patient should never travel to the radiology suite!",
        lookAlikes: "ECG (immediate bedside) vs Echocardiogram (delayed comprehensive assessment)"
      },
      {
        trapName: "Premature Closure on Common Symptoms",
        whyExaminersTestIt: "Students see chest pain or shortness of breath and automatically think typical MI or Asthma, missing subtle atypical presentations.",
        theMistake: "Diagnosing anxiety or musculoskeletal pain in a young female with subtle signs of Pulmonary Embolism or spontaneous pneumothorax.",
        theGoldenRule: "Always rule out the deadliest 'can't-miss' diagnoses before anchoring on benign conditions.",
        lookAlikes: "Pleuritic chest pain in PE vs Pericarditis vs Costochondritis"
      },
      {
        trapName: "Treatment Without Confirmation of Contraindications",
        whyExaminersTestIt: "Testing whether the doctor knows absolute contraindications under pressure.",
        theMistake: "Giving tPA (thrombolysis) without checking recent intracranial hemorrhage or active bleeding history.",
        theGoldenRule: "In every high-stakes intervention question, scan the vignette for exclusion criteria before selecting the miracle drug.",
        lookAlikes: "Aspirin/Heparin in NSTEMI vs Absolute contraindications to Thrombolysis in STEMI"
      }
    ],
    redFlags: [
      "Syncope with exertion (Aortic stenosis, HOCM, Arrhythmia)",
      "New neurologic deficit with sudden severe headache (Subarachnoid hemorrhage)",
      "Unilateral swollen leg + sudden dyspnea (DVT with Pulmonary Embolism)"
    ],
    dontDoList: [
      "Never give beta-blockers in acute cocaine toxicity (unopposed alpha stimulation).",
      "Never give nitrates in right ventricular myocardial infarction (preload dependent).",
      "Never perform LP before CT head if focal neuro deficits or papilledema present."
    ]
  };
}

// 1. Endpoint: Zatona of Any Disease (supports /api/zatona and /zatona)
app.post(["/api/zatona", "/zatona"], async (req: Request, res: Response) => {
  try {
    const { diseaseName, notes } = req.body || {};
    const query = (diseaseName || notes || "").trim();

    if (!query) {
      return res.status(400).json({ error: "Disease name or notes required" });
    }

    const ai = getGenAI();
    if (ai) {
      try {
        const text = await generateGeminiContent(
          ai,
          `Medical Query / Disease to analyze: ${diseaseName ? `Disease: "${diseaseName}"` : ""}\nAdditional Notes / Text: "${notes || ""}"\n\nPlease break this down thoroughly applying all the rules specified in your clinical teaching system prompt.`,
          {
            systemInstruction: ZATONA_SYSTEM_PROMPT,
            temperature: 0.3,
          }
        );

        if (text && text.trim().length > 0) {
          return res.json({
            success: true,
            title: diseaseName || "Clinical Disease Zatona",
            content: text,
          });
        }
      } catch (geminiError: any) {
        console.warn("Gemini model call failed. Transitioning to clinical engine:", geminiError?.message || geminiError);
      }
    }

    // Fallback if AI call didn't succeed - always returns valid clinical content
    const fallbackText = getFallbackZatona(diseaseName, notes);
    return res.json({
      success: true,
      title: diseaseName || "Clinical Disease Zatona",
      content: fallbackText,
      isFallback: true,
    });
  } catch (error: any) {
    console.error("Zatona endpoint error:", error);
    const fallbackText = getFallbackZatona(req.body?.diseaseName, req.body?.notes);
    return res.json({
      success: true,
      title: req.body?.diseaseName || "Clinical Disease Zatona",
      content: fallbackText,
      isFallback: true,
    });
  }
});

// 2. Endpoint: Format into Handwritten Study Sheet Structure (supports /api/handwritten-structure and /handwritten-structure)
app.post(["/api/handwritten-structure", "/handwritten-structure"], async (req: Request, res: Response) => {
  try {
    const { text, title } = req.body || {};
    if (!text && !title) {
      return res.status(400).json({ error: "Content is required" });
    }

    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `You are an elite medical educator creating a high-yield medical study sheet infographic in the style of clinical sketch infographics on lined notebook paper.
Topic / Title: "${title || "Medical Notes"}"
Text to transform:
${text}

CRITICAL INFOGRAPHIC FORMATTING RULES (MATCH THIS EXACT STYLE):
1. HEADER: Provide 1 or 2 uppercase title lines (e.g. "WHY IMMEDIATE EYE IRRIGATION IS", "CRUCIAL IN CHEMICAL BURNS?").
2. 4 NUMBERED SECTIONS:
   - Section 1 (Badge 1, highlightColor: "yellow"): "THE PROBLEM: [Core definition & comparison or penetration]"
   - Section 2 (Badge 2, highlightColor: "peach"): "IMPORTANT NOTE (e.g., [Clinical caveat, exception, or look-alike])"
   - Section 3 (Badge 3, highlightColor: "cyan"): "THE MECHANISM (THE DESTRUCTION / PATHOLOGY CYCLE)" with linear arrow steps: "START ➔ ...", "↓ **step 1**", "↓ **step 2**", "END ➔ **outcome**"
   - Section 4 (Badge 4, highlightColor: "red"): "THE DANGER OF DELAYED [ACTION] / CORE ANATOMICAL TARGET"
3. DIAGRAM TYPES: Assign appropriate diagramType to sections: "eye_burn" | "eye_anatomy" | "wipe_particles" | "flowchart_chain" | "heart_cardiac" | "lungs_resp" | "brain_neuro" | "kidney_renal" | "molecules_chem" | "generic"
4. KEYWORD HIGHLIGHTING: Wrap 1-3 critical medical terms in each line with double asterisks **like this** (e.g. **Alkali**, **Coagulation**, **Saponification**, **First Step**). These will be rendered with yellow marker highlights!
5. BOTTOM EMERGENCY RULE BOX: High-yield "MUST [ACTION] BEFORE [STEP]" board exam discriminator.
6. NO REPETITION: Every fact appears only once.

Respond ONLY with valid JSON in this exact structure:
{
  "title": "Short punchy uppercase title",
  "titleLines": ["LINE 1 OF TITLE", "LINE 2 OF TITLE"],
  "subtitle": "@abdofawzii • High-Yield Clinical Sheet",
  "date": "Month Day, Year",
  "sections": [
    {
      "numberBadge": 1,
      "heading": "THE PROBLEM: ALKALI VS. ACID PENETRATION",
      "type": "comparison",
      "highlightColor": "yellow",
      "diagramType": "eye_burn",
      "lines": [
        "• **Alkali** penetrates tissues very rapidly, destroying stem cells and cornea.",
        "• **Acid burn**: Coagulation necrosis forms barrier limiting deep penetration."
      ]
    },
    {
      "numberBadge": 2,
      "heading": "IMPORTANT NOTE (e.g., QUICKLIME vs. LIQUID)",
      "type": "warning",
      "highlightColor": "peach",
      "diagramType": "wipe_particles",
      "lines": [
        "• Dry material must be wiped off **before** irrigation (water activates it).",
        "• Liquid chemicals: irrigation must be **immediate** and copious."
      ]
    },
    {
      "numberBadge": 3,
      "heading": "THE MECHANISM (THE DESTRUCTION CYCLE)",
      "type": "flowchart",
      "highlightColor": "cyan",
      "diagramType": "flowchart_chain",
      "lines": [
        "START ➔ Chemical enters the eye",
        "↓ **Penetration & Saponification**",
        "↓ **Rapid penetration of corneal stroma**",
        "↓ **Liquefactive Necrosis** (Protein breakdown)",
        "END ➔ **Total corneal melting & Permanent blindness**"
      ]
    },
    {
      "numberBadge": 4,
      "heading": "THE DANGER OF DELAYED IRRIGATION",
      "type": "anatomy",
      "highlightColor": "red",
      "diagramType": "eye_anatomy",
      "lines": [
        "• Delayed irrigation leads to **irreversible deep tissue damage** and scarring.",
        "• **Cornea Melting** (Corneal Perforation) and **Symblepharon**."
      ]
    }
  ],
  "bottomAlertBox": {
    "mainRule": "MUST BEGIN IRRIGATION (15-30 mins) BEFORE TAKING HISTORY, EXAM, OR REFERRAL.",
    "subLabel": "HIGH-YIELD EMERGENCY ACTION PROTOCOL"
  },
  "recommendedDoodles": ["eye", "warning", "arrows", "pill"]
}`;

        const rawText = await generateGeminiContent(ai, prompt, {
          temperature: 0.2,
          responseMimeType: "application/json",
        });

        if (rawText) {
          const parsed = JSON.parse(cleanJsonString(rawText));
          if (parsed && Array.isArray(parsed.sections) && parsed.sections.length > 0) {
            return res.json({ success: true, data: parsed });
          }
        }
      } catch (err: any) {
        console.warn("Handwritten structure generation fallback:", err?.message || err);
      }
    }

    // Fallback structured data
    const fallbackData = getFallbackHandwrittenStructure(text || "", title || "");
    return res.json({ success: true, data: fallbackData, isFallback: true });
  } catch (error: any) {
    console.error("Handwritten structure error:", error);
    const fallbackData = getFallbackHandwrittenStructure(req.body?.text || "", req.body?.title || "");
    return res.json({ success: true, data: fallbackData, isFallback: true });
  }
});

// 3. Endpoint: Exam Traps & Clinical Pearls Analyzer (supports /api/exam-traps and /exam-traps)
app.post(["/api/exam-traps", "/exam-traps"], async (req: Request, res: Response) => {
  try {
    const { topic, notes } = req.body || {};
    const query = (topic || notes || "").trim();

    if (!query) {
      return res.status(400).json({ error: "Topic or clinical notes required" });
    }

    const ai = getGenAI();
    if (ai) {
      try {
        const prompt = `You are a Senior Medical Exam Board Question Writer (USMLE / PLAB / Clinical Boards).
Analyze this topic: "${query}"

Extract the deadliest exam traps, distractors, why students fail, look-alike options, and critical "Don't Do" rules.
Respond strictly in JSON format:
{
  "topic": "${topic || "Medical Topic"}",
  "traps": [
    {
      "trapName": "Name of the trap",
      "whyExaminersTestIt": "Why question writers love this trap",
      "theMistake": "What students typically choose wrongly",
      "theGoldenRule": "The high-yield discriminator rule that gets it right",
      "lookAlikes": "Two look-alike investigations or drugs and how to differentiate"
    }
  ],
  "redFlags": ["Red flag 1", "Red flag 2", "Red flag 3"],
  "dontDoList": ["Forbidden action 1", "Forbidden action 2", "Forbidden action 3"]
}`;

        const rawText = await generateGeminiContent(ai, prompt, {
          temperature: 0.2,
          responseMimeType: "application/json",
        });

        if (rawText) {
          const parsed = JSON.parse(cleanJsonString(rawText));
          if (parsed && Array.isArray(parsed.traps) && parsed.traps.length > 0) {
            return res.json({ success: true, data: parsed });
          }
        }
      } catch (err: any) {
        console.warn("Exam traps generation fallback:", err?.message || err);
      }
    }

    // Fallback traps
    const fallbackTraps = getFallbackExamTraps(topic || notes || "");
    return res.json({ success: true, data: fallbackTraps, isFallback: true });
  } catch (error: any) {
    console.error("Exam traps endpoint error:", error);
    const fallbackTraps = getFallbackExamTraps(req.body?.topic || req.body?.notes || "");
    return res.json({ success: true, data: fallbackTraps, isFallback: true });
  }
});

// 4. Endpoint: Generate 3D Medical Illustration (supports /api/generate-3d-illustration and /generate-3d-illustration)
app.post(["/api/generate-3d-illustration", "/generate-3d-illustration"], async (req: Request, res: Response) => {
  try {
    const { prompt, topic, sectionTitle } = req.body || {};
    const effectivePrompt = prompt || topic || sectionTitle || "Human eye cornea anatomy and chemical burn cross-section";

    const ai = getGenAI();
    if (!ai) {
      return res.status(200).json({
        success: false,
        error: "توليد المجسمات الطبية ثلاثية الأبعاد يتطلب مفتاح GEMINI_API_KEY. تم تفعيل المخطط التوضيحي عالي الدقة بدلاً منه.",
        requiresPaidKey: true,
      });
    }

    const detailed3DPrompt = `3D photorealistic medical illustration of: ${effectivePrompt}. Hyper-detailed medical textbook CGI render, clear anatomical layers, 3D volumetric depth with soft ambient occlusion, translucent corneal stroma, glossy surface reflections, clean studio medical lighting, isolated on clean neutral white background, educational textbook standard.`;

    const imageCandidateModels = [
      "gemini-3.1-flash-image",
      "gemini-3.1-flash-lite-image",
      "gemini-3-pro-image",
    ];

    let lastError: any = null;

    for (const model of imageCandidateModels) {
      try {
        console.log(`Attempting 3D illustration generation with model: ${model}...`);
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [
              {
                text: detailed3DPrompt,
              },
            ],
          },
          config: {
            imageConfig: {
              aspectRatio: "4:3",
              imageSize: "1K",
            },
          },
        });

        if (response?.candidates?.[0]?.content?.parts) {
          for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
              const base64Data = part.inlineData.data;
              const mimeType = part.inlineData.mimeType || "image/png";
              const imageUrl = `data:${mimeType};base64,${base64Data}`;
              return res.json({
                success: true,
                imageUrl,
                modelUsed: model,
                prompt: detailed3DPrompt,
              });
            }
          }
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed for 3D generation:`, err?.message || err);
      }
    }

    // Seamlessly fallback to High-Yield 3D Procedural SVG Medical Engine
    const proceduralUrl = generateProceduralMedicalIllustrationSvg(effectivePrompt);
    return res.status(200).json({
      success: true,
      imageUrl: proceduralUrl,
      modelUsed: "Fawzy 3D Clinical Anatomy Engine",
      prompt: detailed3DPrompt,
      isProcedural: true,
    });
  } catch (error: any) {
    console.error("3D illustration generation error:", error);
    const proceduralUrl = generateProceduralMedicalIllustrationSvg(req.body?.topic || req.body?.prompt);
    return res.status(200).json({
      success: true,
      imageUrl: proceduralUrl,
      modelUsed: "Fawzy 3D Clinical Anatomy Engine",
      isProcedural: true,
    });
  }
});

// Global JSON error handler middleware to prevent ANY HTML 500 error response
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error("Unhandled Express error:", err);
  if (!res.headersSent) {
    res.status(200).json({
      success: false,
      error: err?.message || "حدث خطأ غير متوقع في معالجة الطلب، يرجى المحاولة مرة أخرى.",
    });
  }
});

// Vite Middleware / Static Serving
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fawzy AI server running on http://0.0.0.0:${PORT}`);
  });
}

// Export Express app for serverless deployments (Vercel, AWS Lambda, etc.)
export default app;

// Only start standalone HTTP listener when not running in serverless environment
if (process.env.VERCEL !== "1" && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  start();
}
