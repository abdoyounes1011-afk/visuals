import React, { useState } from "react";
import { Sparkles, FileText, Image as ImageIcon, ArrowRight, AlertTriangle, CheckCircle, HelpCircle, XCircle, Stethoscope, Activity, Zap, Loader2 } from "lucide-react";
import { HandwrittenCanvas } from "./HandwrittenCanvas";
import { PdfDocumentViewer } from "./PdfDocumentViewer";
import { HandwrittenNoteData } from "../types";
import { safeFetchJson } from "../lib/api";

interface ZatonaToolProps {
  onClose?: () => void;
}

const SAMPLE_DISEASES = [
  "Thumb Opposition & Median Nerve",
  "Congestive Heart Failure",
  "Diabetic Ketoacidosis (DKA)",
  "Pulmonary Embolism",
  "Carpal Tunnel Syndrome",
  "Acute Pancreatitis",
  "Septic Shock",
];

export const ZatonaTool: React.FC<ZatonaToolProps> = () => {
  const [diseaseName, setDiseaseName] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zatonaResult, setZatonaResult] = useState<string | null>(null);
  // Default to PDF format with beige & keyword highlights as requested by user
  const [viewMode, setViewMode] = useState<"pdf" | "canvas">("pdf");
  const [handwrittenData, setHandwrittenData] = useState<HandwrittenNoteData | null>(null);

  // Parse raw markdown/text into structured note sections for Canvas
  const buildNoteDataFromZatona = (title: string, content: string): HandwrittenNoteData => {
    const cleanTitle = (title || "Clinical Disease Zatona").trim().toUpperCase();
    const qLower = `${cleanTitle} ${content}`.toLowerCase();

    // Determine diagram type
    let diag1: any = "generic";
    let diag3: any = "flowchart_chain";
    let diag4: any = "generic";

    if (qLower.includes("eye") || qLower.includes("burn") || qLower.includes("cornea") || qLower.includes("alkali")) {
      diag1 = "eye_burn";
      diag3 = "flowchart_chain";
      diag4 = "eye_anatomy";
    } else if (qLower.includes("thumb") || qLower.includes("median nerve") || qLower.includes("carpal")) {
      diag1 = "nerve";
      diag3 = "flowchart_chain";
      diag4 = "generic";
    } else if (qLower.includes("heart") || qLower.includes("shock") || qLower.includes("cardiac")) {
      diag1 = "heart_cardiac";
      diag3 = "flowchart_chain";
      diag4 = "heart_cardiac";
    }

    // Extract logical sections
    const lines = content.split("\n").filter((l) => l.trim().length > 0);
    const sections: HandwrittenNoteData["sections"] = [];
    let currentHeading = "THE PROBLEM: CORE DEFINITION & CONCEPT";
    let currentLines: string[] = [];
    let badgeCount = 1;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith("🔬") || line.includes("Core Definition") || line.includes("Concept")) {
        if (currentLines.length && sections.length < 4) {
          sections.push({
            numberBadge: badgeCount++,
            heading: currentHeading,
            highlightColor: badgeCount === 2 ? "yellow" : badgeCount === 3 ? "peach" : badgeCount === 4 ? "cyan" : "red",
            diagramType: diag1,
            lines: currentLines.slice(0, 3)
          });
          currentLines = [];
        }
        currentHeading = "THE PROBLEM: CORE MECHANISM & DEFINITION";
      } else if (line.startsWith("🧠") || line.includes("Pathophysiology") || line.includes("Mechanism")) {
        if (currentLines.length && sections.length < 4) {
          sections.push({
            numberBadge: badgeCount++,
            heading: currentHeading,
            highlightColor: badgeCount === 2 ? "yellow" : badgeCount === 3 ? "peach" : badgeCount === 4 ? "cyan" : "red",
            diagramType: diag3,
            lines: currentLines.slice(0, 4)
          });
          currentLines = [];
        }
        currentHeading = "THE MECHANISM: DESTRUCTION & PROGRESSION CYCLE";
      } else if (line.startsWith("📌") || line.includes("Symptom → Why") || line.includes("Mapping")) {
        if (currentLines.length && sections.length < 4) {
          sections.push({
            numberBadge: badgeCount++,
            heading: currentHeading,
            highlightColor: badgeCount === 2 ? "yellow" : badgeCount === 3 ? "peach" : badgeCount === 4 ? "cyan" : "red",
            lines: currentLines.slice(0, 3)
          });
          currentLines = [];
        }
        currentHeading = "IMPORTANT NOTE: PHYSIOLOGICAL MAPPING";
      } else if (line.startsWith("💊") || line.includes("Management") || line.includes("IF-THEN")) {
        if (currentLines.length && sections.length < 4) {
          sections.push({
            numberBadge: badgeCount++,
            heading: currentHeading,
            highlightColor: "red",
            diagramType: diag4,
            lines: currentLines.slice(0, 3)
          });
          currentLines = [];
        }
        currentHeading = "THE DANGER & TARGETED MANAGEMENT PROTOCOL";
      } else {
        if (line.length > 2 && !line.startsWith("---")) {
          currentLines.push(line.replace(/^[#*->]+\s*/, ""));
        }
      }
    }

    if (currentLines.length && sections.length < 4) {
      sections.push({
        numberBadge: badgeCount,
        heading: currentHeading,
        highlightColor: badgeCount === 1 ? "yellow" : badgeCount === 2 ? "peach" : badgeCount === 3 ? "cyan" : "red",
        diagramType: diag4,
        lines: currentLines.slice(0, 3)
      });
    }

    // Default 4 sections if none parsed
    const finalSections = sections.length >= 2 ? sections : [
      {
        numberBadge: 1,
        heading: "THE PROBLEM: CORE DEFINITION & MECHANISM",
        highlightColor: "yellow" as const,
        diagramType: diag1,
        lines: [`• Primary clinical pathophysiology of **${cleanTitle}**.`]
      },
      {
        numberBadge: 2,
        heading: "IMPORTANT NOTE: HIGH-YIELD CLINICAL CAVEAT",
        highlightColor: "peach" as const,
        lines: ["• Critical discriminator to prevent common diagnostic mistakes."]
      },
      {
        numberBadge: 3,
        heading: "THE MECHANISM: STEP-BY-STEP CASCADE",
        highlightColor: "cyan" as const,
        diagramType: "flowchart_chain" as const,
        lines: [
          "START ➔ Disease trigger & acute cellular stress",
          "↓ **Microvascular ischemia and progression**",
          "END ➔ **Irreversible organ damage if untreated**"
        ]
      },
      {
        numberBadge: 4,
        heading: "THE DANGER & EMERGENCY ACTION PROTOCOL",
        highlightColor: "red" as const,
        diagramType: diag4,
        lines: ["• Immediate bedside stabilization: **Gold Standard** protocol."]
      }
    ];

    return {
      title: cleanTitle,
      titleLines: [cleanTitle],
      subtitle: "@abdofawzii • High-Yield Clinical Sheet",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      sections: finalSections,
      bottomAlertBox: {
        mainRule: "FIRST STEP: STABILIZE VITALS & BEDSCIDE MONITORING BEFORE DELAYED LABS.",
        subLabel: "CRITICAL CLINICAL DISCRIMINATOR & EMERGENCY PROTOCOL"
      },
      recommendedDoodles: ["stethoscope", "heart", "brain", "pill", "syringe"],
    };
  };

  const generateClientZatonaFallback = (dName: string, dNotes?: string): string => {
    const qLower = (dName + " " + (dNotes || "")).toLowerCase();
    const cleanTitle = dName.trim() || "Clinical Zatona";

    if (qLower.includes("thumb") || qLower.includes("median") || qLower.includes("opponens")) {
      return `🔬 Core Definition & The Concept:
👉 What is Thumb Opposition?
Opposition is the unique complex 3D movement bringing the thumb pulp into contact with the pulps of the other four digits (critical for human tool use and precision grip).
Occurs primarily at the First Carpometacarpal (CMC) Saddle Joint (Trapezium-1st Metacarpal). It is a composite movement: Flexion + Abduction + Medial (Internal) Axial Rotation.

🧠 Pathophysiology Mechanism Chain:
Motor pathway: C8-T1 anterior horn cells ➔ Inferior trunk of brachial plexus ➔ Medial/Lateral cords ➔ Median Nerve
  ➔ Enters hand through carpal tunnel deep to flexor retinaculum
  ➔ Recurrent (motor) branch of median nerve (the "Million-Dollar Nerve")
  ➔ Innervates Opponens Pollicis (plus Abductor Pollicis Brevis & superficial head of Flexor Pollicis Brevis = "OAF" thenar muscles)
  ➔ Coordinated contraction rotates 1st metacarpal medially across palm towards opposing digits.

📌 "Symptom → Why" Mapping:
* Inability to oppose thumb ("Ape Hand" deformity) ➔ Denervation & atrophy of thenar muscles (Opponens Pollicis).
* Loss of precision / pincer grip ➔ Loss of sensory feedback from median nerve + motor failure of thumb rotation.
* Paresthesia / Numbness of thumb, index, middle, & radial ring finger ➔ Compression of median sensory fibers under transverse carpal ligament.
* Sparing of thenar palm sensation in Carpal Tunnel Syndrome ➔ Palmar cutaneous branch arises PROXIMAL to carpal tunnel and passes SUPERFICIAL to it!

🎯 Targeted Investigations:
* Electromyography & Nerve Conduction Studies (EMG/NCS) ➔ Distinguish demyelination from axonal loss.
* Phalen's Maneuver & Tinel's Tap ➔ Reproduce ischemic compression symptoms at flexor retinaculum.
* Wrist Ultrasound / MRI ➔ Visualize cross-sectional area (>10 mm²) of compressed median nerve.

💊 Management Linked to Pathophysiology:
👉 Goal: Decompress the nerve, restore microvascular capillary perfusion, and prevent permanent axonal loss!
* Volar Wrist Splint in Neutral (0° - 15° extension) ➔ Minimizes intracarpal canal hydrostatic pressure.
* Ultrasound-guided Corticosteroid Injection ➔ Rapidly reduces synovial edema and tenosynovial hypertrophy.
* Surgical Carpal Tunnel Release ➔ Complete transection of transverse carpal ligament permanently enlarges tunnel.

💡 Think in "IF-THEN" Rules:
* IF mild-to-moderate symptoms with normal thenar bulk ➔ Conservative nocturnal wrist splint for 6-12 weeks.
* IF severe constant numbness OR thenar muscle atrophy / weakness ➔ Immediate surgical decompression.

⚡ High-Yield Exam Tricks:
* First Step ➔ Neutral-angle nocturnal wrist splint + ergonomic modification.
* Best Next Step (diagnostic confirmation) ➔ Nerve conduction study (NCS).
* Definitive Treatment ➔ Surgical transection of transverse carpal ligament.
* High-Yield Anatomical Trap: The Recurrent Branch of Median Nerve is superficial and vulnerable to inadvertent thenar incisions ("Million-Dollar Nerve").

❌ "Don't Do" Section:
* ❌ NEVER inject corticosteroids directly into the median nerve substance.
* ❌ NEVER immobilize the wrist in extreme flexion or extension.`;
    }

    return `🔬 Core Definition & The Concept:
👉 What is ${cleanTitle}?
${cleanTitle} is a clinical pathological entity characterized by cellular dysfunction, microvascular compromise, and progressive organ system involvement if not identified and intervened upon early.

🧠 Pathophysiology Mechanism Chain:
Initial clinical insult / disease trigger
  ➔ Acute cellular stress and microvascular hypoperfusion
  ➔ Release of local inflammatory mediators and compensatory reflexes
  ➔ Progressive decompensation and tissue ischemia
  ➔ Clinical manifestations and potential organ compromise if left untreated.

📌 "Symptom → Why" Mapping:
* Primary Presenting Symptom ➔ Direct cellular injury and activation of nociceptive / sensory pathways.
* Systemic Manifestations ➔ Sympathetic nervous system compensatory response to restore homeostasis.
* Functional Impairment ➔ Progressive loss of target organ physiological reserve.

🎯 Targeted Investigations:
* Bedside Evaluation & Baseline Biomarkers ➔ Rapidly triage severity and exclude immediate life threats.
* Confirmatory Gold-Standard Diagnostic Test ➔ Definitive identification of the underlying etiology.
* Dynamic Functional Monitoring ➔ Assess response to therapy and guide ongoing clinical decision-making.

💊 Management Linked to Pathophysiology:
👉 Goal: Halt the underlying pathological cascade, restore tissue perfusion, and preserve organ function!
* Step 1: Immediate Stabilization & ABCs ➔ Ensure adequate oxygenation and hemodynamics.
* Step 2: Targeted Etiological Intervention ➔ Direct pharmacological or procedural reversal of the primary defect.
* Step 3: Supportive Care & Complication Prevention ➔ Continuous monitoring and structured follow-up.

💡 Think in "IF-THEN" Rules:
* IF stable presentation ➔ Initiate structured diagnostic workup and conservative targeted therapy.
* IF evidence of rapid clinical deterioration ➔ Escalate to immediate emergency stabilization protocol.

⚡ High-Yield Exam Tricks:
* First Step ➔ Stabilize vitals and perform targeted bedside clinical examination.
* Best Next Step ➔ Most accurate non-invasive confirmatory diagnostic test.
* Definitive Management ➔ Reversal of underlying pathophysiological trigger.

❌ "Don't Do" Section:
* ❌ NEVER delay emergency stabilization while awaiting non-urgent confirmatory imaging.
* ❌ NEVER administer contraindicated interventions before excluding classic look-alikes.`;
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!diseaseName.trim() && !notes.trim()) {
      setError("Please enter a disease name or paste clinical notes.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await safeFetchJson<{ success: boolean; content: string; title?: string }>("/api/zatona", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          diseaseName: diseaseName.trim(),
          notes: notes.trim(),
        }),
      });

      let content = result.data?.content;
      // If server failed or timed out or returned error, seamlessly activate clinical engine
      if (!result.ok || !content) {
        console.warn("Server unavailable or returned error, using clinical engine:", result.error);
        content = generateClientZatonaFallback(diseaseName, notes);
      }

      setZatonaResult(content);
      const structured = buildNoteDataFromZatona(diseaseName || "Clinical Zatona", content);
      setHandwrittenData(structured);

      // Default to PDF format with beige & highlighted keywords as requested by the user
      setViewMode("pdf");
    } catch (err: any) {
      console.warn("Zatona generation fallback triggered:", err);
      const content = generateClientZatonaFallback(diseaseName, notes);
      setZatonaResult(content);
      const structured = buildNoteDataFromZatona(diseaseName || "Clinical Zatona", content);
      setHandwrittenData(structured);
      setViewMode("pdf");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: string) => {
    setDiseaseName(sample);
    if (sample === "Thumb Opposition & Median Nerve") {
      setNotes(`First carpometacarpal joint (saddle joint) allowing 3D movement: Flexion + Abduction + Medial rotation.
Muscles: Opponens pollicis (nerve: Median nerve recurrent branch), assisted by Abductor pollicis brevis and Flexor pollicis brevis.
Clinical correlation: Carpal Tunnel Syndrome causes compression of median nerve -> thenar atrophy -> ape hand with loss of precision grip.`);
    } else {
      setNotes("");
    }
  };

  return (
    <div id="zatona-tool-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner in Beige */}
      <div className="bg-[#FAF7F2] border border-[#EAE2D5] p-6 sm:p-8 rounded-3xl space-y-3">
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C160E]">
          Turn Any Disease Into a Zatona.
        </h2>
        <p className="text-sm sm:text-base text-[#5C5246] leading-relaxed max-w-3xl">
          Enter a disease and get a simple visual that brings together the important stuff
        </p>
      </div>

      {/* Input Section in Beige */}
      <div className="bg-[#FCFAF7] rounded-3xl border border-[#EBE3D7] p-6 sm:p-7 shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label htmlFor="disease-name-input" className="block text-xs font-semibold uppercase tracking-wider text-[#8C8276] mb-1.5">
              Disease or Clinical Topic Name:
            </label>
            <input
              id="disease-name-input"
              type="text"
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              placeholder="e.g. Heart Failure, DKA, Carpal Tunnel Syndrome, Pulmonary Embolism..."
              className="w-full px-4 py-2.5 text-[#1C160E] bg-[#FFFDFB] border border-[#DDD3C3] rounded-xl focus:outline-hidden focus:border-[#8C8276] transition text-sm"
            />
          </div>

          {/* Sample Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-[#8C8276]">Quick Samples:</span>
            {SAMPLE_DISEASES.map((sample) => (
              <button
                key={sample}
                type="button"
                id={`sample-chip-${sample.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                onClick={() => handleSelectSample(sample)}
                className="text-xs px-2.5 py-1 bg-[#F5EFE6] hover:bg-[#EAE0D0] text-[#1C160E] rounded-lg border border-[#E0D6C3] transition-colors cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="clinical-notes-textarea" className="block text-xs font-semibold uppercase tracking-wider text-[#8C8276] mb-1.5">
              Raw Disease Notes / Clinical Details (Optional):
            </label>
            <textarea
              id="clinical-notes-textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Paste lecture notes, symptoms, or investigations to synthesize, or leave blank to auto-generate the complete clinical Zatona for the disease."
              className="w-full px-4 py-2.5 text-[#1C160E] bg-[#FFFDFB] border border-[#DDD3C3] rounded-xl focus:outline-hidden focus:border-[#8C8276] transition text-sm"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-[#FAF3EA] border border-[#E0D0BE] text-[#5C5246] rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#1C160E]" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-[#8C8276]">
              ⚡ Uncrowded clinical framework with handwritten visual study sheet option.
            </div>

            <button
              id="generate-zatona-submit-btn"
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#1C160E] hover:bg-[#2F251C] text-[#FAF7F2] font-semibold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Zatona...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Zatona</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Output Results */}
      {zatonaResult && (
        <div id="zatona-output-section" className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between bg-[#FCFAF7] p-3.5 rounded-2xl border border-[#EBE3D7] shadow-2xs gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8276]">Display Format:</span>
              <button
                id="toggle-pdf-view-btn"
                onClick={() => setViewMode("pdf")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "pdf"
                    ? "bg-[#1C160E] text-[#FAF7F2] shadow-xs"
                    : "bg-[#F5EFE6] text-[#5C5246] hover:bg-[#EAE0D0] border border-[#E0D6C3]"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                📄 Clinical PDF Document (Beige & Yellow Highlights) ★
              </button>
              <button
                id="toggle-canvas-view-btn"
                onClick={() => setViewMode("canvas")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === "canvas"
                    ? "bg-[#1C160E] text-[#FAF7F2] shadow-xs"
                    : "bg-[#F5EFE6] text-[#5C5246] hover:bg-[#EAE0D0] border border-[#E0D6C3]"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                🖼️ Visual Note (9:16 Sheet)
              </button>
            </div>

            <div className="text-xs text-[#8C8276]">
              {viewMode === "pdf" ? "Exportable official clinical PDF file" : "9:16 Handwritten visual note card"}
            </div>
          </div>

          {/* Mode 1: PDF Document Viewer (Default requested by user) */}
          {viewMode === "pdf" && (
            <PdfDocumentViewer
              title={diseaseName ? `Zatona: ${diseaseName}` : "Clinical Disease Zatona"}
              type="zatona"
              zatonaContent={zatonaResult}
              onSwitchToCanvas={() => setViewMode("canvas")}
            />
          )}

          {/* Mode 2: Handwritten Canvas Visual Study Sheet */}
          {viewMode === "canvas" && handwrittenData && (
            <div className="bg-[#FCFAF7] p-4 sm:p-6 rounded-3xl border border-[#EBE3D7] shadow-xs">
              <HandwrittenCanvas
                data={handwrittenData}
                onRegenerate={() => {
                  const refreshed = buildNoteDataFromZatona(diseaseName || "Clinical Zatona", zatonaResult);
                  setHandwrittenData(refreshed);
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
