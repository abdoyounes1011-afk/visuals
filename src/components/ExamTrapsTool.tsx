import React, { useState } from "react";
import { AlertOctagon, Sparkles, Loader2, AlertTriangle, CheckCircle, ShieldAlert, Image as ImageIcon, FileText } from "lucide-react";
import { HandwrittenCanvas } from "./HandwrittenCanvas";
import { PdfDocumentViewer } from "./PdfDocumentViewer";
import { ExamTrapsData, HandwrittenNoteData } from "../types";
import { safeFetchJson } from "../lib/api";

export const ExamTrapsTool: React.FC = () => {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trapsData, setTrapsData] = useState<ExamTrapsData | null>(null);
  // Default to PDF format with beige & keyword highlights as requested by user
  const [viewMode, setViewMode] = useState<"pdf" | "canvas">("pdf");
  const [handwrittenData, setHandwrittenData] = useState<HandwrittenNoteData | null>(null);

  const sampleTopics = [
    "Acute Coronary Syndrome (STEMI vs NSTEMI)",
    "Hyponatremia Workup & Osmolality",
    "Headache: SAH vs Meningitis vs Migraine",
    "Pulmonary Embolism (PE) Clinical Decision Rules",
    "Adrenal Crisis & Cortisol Testing",
    "Septic Shock Resuscitation Traps",
  ];

  const buildHandwrittenFromTraps = (data: ExamTrapsData): HandwrittenNoteData => {
    const topicUpper = (data.topic || "CLINICAL EXAM TRAPS").trim().toUpperCase();
    const qLower = topicUpper.toLowerCase();

    let diag1: any = "generic";
    let diag3: any = "flowchart_chain";
    let diag4: any = "generic";

    if (qLower.includes("eye") || qLower.includes("burn") || qLower.includes("alkali")) {
      diag1 = "eye_burn";
      diag3 = "flowchart_chain";
      diag4 = "eye_anatomy";
    } else if (qLower.includes("thumb") || qLower.includes("median") || qLower.includes("carpal")) {
      diag1 = "nerve";
      diag3 = "flowchart_chain";
    } else if (qLower.includes("heart") || qLower.includes("shock") || qLower.includes("ecg")) {
      diag1 = "heart_cardiac";
      diag3 = "flowchart_chain";
      diag4 = "heart_cardiac";
    }

    const sections: HandwrittenNoteData["sections"] = [];
    const traps = data.traps || [];

    // Badge 1: The Trap / Problem
    if (traps[0]) {
      sections.push({
        numberBadge: 1,
        heading: `THE PROBLEM: ${traps[0].trapName || "COMMON BOARD TRAP"}`,
        highlightColor: "yellow",
        diagramType: diag1,
        lines: [
          `• Examiner's intent: **${traps[0].whyExaminersTestIt || "Testing clinical discrimination"}**`,
          `• ❌ Common student mistake: **${traps[0].theMistake || "Missing the atypical presentation"}**`,
        ],
      });
    }

    // Badge 2: Look-alike / Important Note
    const trap2 = traps[1] || traps[0];
    sections.push({
      numberBadge: 2,
      heading: "IMPORTANT NOTE: LOOK-ALIKES & CAVEATS",
      highlightColor: "peach",
      lines: [
        `• 🔍 Look-alike entity: **${trap2?.lookAlikes || "Mimicking clinical presentations"}**`,
        `• 🔑 Clinical distinction: **${trap2?.theGoldenRule || "Always check hemodynamic stability first"}**`,
      ],
    });

    // Badge 3: Destruction Cycle / Mechanism Flowchart
    sections.push({
      numberBadge: 3,
      heading: "THE MECHANISM: DECISION CASCADE",
      highlightColor: "cyan",
      diagramType: "flowchart_chain",
      lines: [
        `START ➔ Patient presents with suspected **${topicUpper}**`,
        `↓ **Differentiate from look-alikes using key exam signs**`,
        `END ➔ **Select high-yield definitive management**`,
      ],
    });

    // Badge 4: The Danger / Red Flags
    const rfList = data.redFlags && data.redFlags.length > 0
      ? data.redFlags.slice(0, 2).map((rf) => `• ⚠️ Red Flag: **${rf}**`)
      : ["• ⚠️ Delayed diagnosis leads to irreversible morbidity."];

    sections.push({
      numberBadge: 4,
      heading: "THE DANGER: MUST-NOT-MISS RED FLAGS",
      highlightColor: "red",
      diagramType: diag4,
      lines: rfList,
    });

    const topGoldenRule = traps[0]?.theGoldenRule || "ALWAYS CONFIRM CLINICAL STABILITY BEFORE ORDERING EXTENSIVE WORKUP.";

    return {
      title: topicUpper,
      titleLines: [topicUpper],
      subtitle: "@abdofawzii • High-Yield Board Exam Traps",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      sections,
      bottomAlertBox: {
        mainRule: topGoldenRule.toUpperCase(),
        subLabel: "EMERGENCY CLINICAL DISCRIMINATOR & GOLDEN RULE",
      },
      marginNote: `Pinned by @abdofawzii: High-yield board traps for ${data.topic}`,
      recommendedDoodles: ["warning", "heart", "brain", "syringe", "stethoscope"],
    };
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a medical exam topic to analyze.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await safeFetchJson<{ success: boolean; data: ExamTrapsData }>("/api/exam-traps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topic.trim() }),
      });

      if (!result.ok || !result.data?.data) {
        throw new Error(result.error || "Failed to analyze exam traps.");
      }

      setTrapsData(result.data.data);
      const hw = buildHandwrittenFromTraps(result.data.data);
      setHandwrittenData(hw);
      // Default to PDF format with beige and highlighted keywords
      setViewMode("pdf");
    } catch (err: any) {
      console.error("Exam traps analysis error:", err);
      setError(err.message || "Failed to analyze topic.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="exam-traps-tool-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Banner in Beige */}
      <div className="bg-[#FAF7F2] border border-[#EAE2D5] p-6 sm:p-8 rounded-3xl space-y-3">
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C160E]">
          Find the Traps Before the Exam Finds You.
        </h2>
        <p className="text-sm sm:text-base text-[#5C5246] leading-relaxed max-w-3xl">
          Drop your notes or lecture here, and AI will find the tricky points, common confusions, and exam traps you need to watch out for.
        </p>
      </div>

      {/* Input in Beige */}
      <div className="bg-[#FCFAF7] rounded-3xl border border-[#EBE3D7] p-6 sm:p-7 shadow-xs">
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label htmlFor="exam-topic-input" className="block text-xs font-semibold uppercase tracking-wider text-[#8C8276] mb-1.5">
              Medical Exam Topic / Case Dilemma:
            </label>
            <input
              id="exam-topic-input"
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Acute Coronary Syndrome, Hyponatremia, Pulmonary Embolism, Diabetic Ketoacidosis..."
              className="w-full px-4 py-2.5 text-[#1C160E] bg-[#FFFDFB] border border-[#DDD3C3] rounded-xl focus:outline-hidden focus:border-[#8C8276] transition text-sm"
            />
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-[#8C8276]">High-Yield Topics:</span>
            {sampleTopics.map((t, idx) => (
              <button
                key={idx}
                type="button"
                id={`exam-topic-chip-${idx}`}
                onClick={() => setTopic(t)}
                className="text-xs px-2.5 py-1 bg-[#F5EFE6] hover:bg-[#EAE0D0] text-[#1C160E] rounded-lg border border-[#E0D6C3] transition-colors cursor-pointer"
              >
                {t}
              </button>
            ))}
          </div>

          {error && (
            <div className="p-3.5 bg-[#FAF3EA] border border-[#E0D0BE] text-[#5C5246] rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-[#1C160E]" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-[#8C8276]">
              🎯 Highlights First Step vs Best Next Step, look-alike options, and dangerous mistakes.
            </span>

            <button
              id="analyze-exam-traps-submit-btn"
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#1C160E] hover:bg-[#2F251C] text-[#FAF7F2] font-semibold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Board Traps...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Dissect Exam Traps</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {trapsData && (
        <div id="traps-results-section" className="space-y-4">
          {/* View Mode Toggle */}
          <div className="flex flex-wrap items-center justify-between bg-[#FCFAF7] p-3.5 rounded-2xl border border-[#EBE3D7] shadow-2xs gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8276]">Display:</span>
              <button
                id="toggle-traps-pdf-btn"
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
                id="toggle-traps-canvas-btn"
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
              {viewMode === "pdf" ? "Exportable official clinical PDF report" : "9:16 Visual note card"}
            </div>
          </div>

          {/* View 1: PDF Document Viewer (Default requested by user) */}
          {viewMode === "pdf" && (
            <PdfDocumentViewer
              title={`Exam Traps: ${trapsData.topic}`}
              type="exam-traps"
              trapsData={trapsData}
              onSwitchToCanvas={() => setViewMode("canvas")}
            />
          )}

          {/* View 2: Handwritten Canvas Visual Note */}
          {viewMode === "canvas" && handwrittenData && (
            <div className="bg-[#FCFAF7] p-4 sm:p-6 rounded-3xl border border-[#EBE3D7] shadow-xs">
              <HandwrittenCanvas
                data={handwrittenData}
                onRegenerate={() => {
                  const refreshed = buildHandwrittenFromTraps(trapsData);
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
