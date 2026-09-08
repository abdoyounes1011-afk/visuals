import React, { useState } from "react";
import { PenTool, Sparkles, Loader2, AlertCircle, FileEdit, CheckCircle2 } from "lucide-react";
import { HandwrittenCanvas } from "./HandwrittenCanvas";
import { HandwrittenNoteData } from "../types";

const initialEyeBurnNote: HandwrittenNoteData = {
  title: "WHY IMMEDIATE EYE IRRIGATION IS CRUCIAL IN CHEMICAL BURNS?",
  titleLines: [
    "WHY IMMEDIATE EYE IRRIGATION IS CRUCIAL",
    "IN CHEMICAL BURNS? (EMERGENCY OPHTHALMOLOGY)"
  ],
  subtitle: "@abdofawzii • Clinical Ophthalmology Emergency Sheet",
  date: "High-Yield Medical Sheet",
  sections: [
    {
      numberBadge: 1,
      heading: "THE PROBLEM (ALKALI VS. ACID)",
      type: "concept",
      highlightColor: "yellow",
      icon: "eye",
      diagramType: "eye_burn",
      render3dPrompt: "Photorealistic 3D medical anatomy illustration, human eye cornea cross section showing alkali liquefactive necrosis vs acid coagulative necrosis, volumetric depth",
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
      render3dPrompt: "3D medical illustration, calcium oxide quicklime crystals on ocular eyelid tissue with dry wipe brush mechanism, cinematic studio lighting",
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
      render3dPrompt: "3D medical visualization of chemical penetration into corneal stroma, liquefaction breakdown of keratocytes and collagen fibers",
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
      render3dPrompt: "3D volumetric anatomical render of human eye with corneal melting, limbal stem cell deficiency, and emergency saline eye irrigation jet, medical textbook grade",
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

export const HandwrittenTool: React.FC = () => {
  const [title, setTitle] = useState("Why Immediate Eye Irrigation Is Crucial in Chemical Burns?");
  const [content, setContent] = useState(
    `1. The Problem: Alkali (lye, chlorine, quicklime) penetrates tissues rapidly, destroying stem cells and cornea. Acid causes coagulation necrosis that limits deep penetration.\n2. Important Note: In quicklime (calcium oxide) burns, wipe dry particles off FIRST before irrigation as water activates it. For liquid chemicals, irrigation must be immediate.\n3. The Mechanism: Chemical enters eye -> Penetration & saponification -> Rapid penetration of corneal stroma -> Liquefactive necrosis & lipid dissolution -> Loss of stem cells & corneal opacity -> Total corneal melting & permanent blindness.\n4. The Danger: Delayed or inadequate irrigation leads to irreversible deep tissue damage, symblepharon, and permanent scarring.\n5. Golden Rule: MUST BEGIN IRRIGATION (15-30 mins) BEFORE TAKING HISTORY, EXAM, OR REFERRAL.`
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteData, setNoteData] = useState<HandwrittenNoteData | null>(initialEyeBurnNote);

  const sampleConcepts = [
    {
      title: "Why Immediate Eye Irrigation Is Crucial in Chemical Burns?",
      content: `1. The Problem: Alkali (lye, chlorine, quicklime) penetrates tissues rapidly, destroying stem cells and cornea. Acid causes coagulation necrosis that limits deep penetration.
2. Important Note: In quicklime (calcium oxide) burns, wipe dry particles off FIRST before irrigation as water activates it. For liquid chemicals, irrigation must be immediate.
3. The Mechanism: Chemical enters eye -> Penetration & saponification -> Rapid penetration of corneal stroma -> Liquefactive necrosis & lipid dissolution -> Loss of stem cells & corneal opacity -> Total corneal melting & permanent blindness.
4. The Danger: Delayed or inadequate irrigation leads to irreversible deep tissue damage, symblepharon, and permanent scarring.
5. Golden Rule: MUST BEGIN IRRIGATION (15-30 mins) BEFORE TAKING HISTORY, EXAM, OR REFERRAL.`,
    },
    {
      title: "Thumb Opposition & Median Nerve",
      content: `1. Joint: 1st Carpometacarpal joint (Saddle joint) allows 3D movement: Flexion + Abduction + Medial rotation.
2. Key Muscle: Opponens pollicis (Recurrent branch of Median Nerve). Aided by Abductor pollicis brevis.
3. Clinical Impact: Carpal tunnel syndrome causes median nerve compression -> Thenar wasting -> Loss of opposition & ape-hand deformity.
4. Precision vs Power: Precision grip (writing, holding needle) requires 100% opposition, power grip (carrying bag) does not.`,
    },
    {
      title: "Acute Pulmonary Embolism",
      content: `1. Virchow's Triad: Endothelial injury + Stasis + Hypercoagulability -> DVT thrombus migration.
2. Pathophysiology: Vascular obstruction -> V/Q mismatch -> Hypoxemia -> Reflex hyperventilation (respiratory alkalosis).
3. Classic Signs: Sudden dyspnea, pleuritic chest pain, tachycardia (>100 bpm is most common ECG finding).
4. Investigations: Best initial screening: Wells score + D-dimer. Confirmatory Gold Standard: CT Pulmonary Angiography (CTPA).
5. Immediate Management: Therapeutic IV Heparin anticoagulation. If hemodynamically unstable (massive PE with shock) -> Systemic Thrombolysis (tPA).`,
    },
    {
      title: "Shock Hemodynamics Comparison",
      content: `1. Hypovolemic Shock: ↓ Preload (PCWP), ↓ Cardiac Output (CO), ↑ SVR (compensatory vasoconstriction), cold clammy skin.
2. Cardiogenic Shock: ↑ Preload (PCWP), ↓ Cardiac Output (CO), ↑ SVR, pulmonary edema.
3. Distributive / Septic Shock: ↓/Normal PCWP, ↑ Early Cardiac Output, ↓ SVR (massive vasodilation), warm extremities.
4. First-line Vasopressor: Norepinephrine (Alpha-1 > Beta-1) to restore systemic vascular resistance.`,
    },
  ];

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) {
      setError("Please paste or type the medical information you want to convert.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/handwritten-structure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() || "Medical Study Notes",
          text: content.trim(),
        }),
      });

      const resJson = await response.json();
      if (!response.ok) {
        throw new Error(resJson.error || "Failed to structure handwritten note.");
      }

      setNoteData(resJson.data);
    } catch (err: any) {
      console.error("Handwritten generation error:", err);
      setError(err.message || "Failed to generate note.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sample: typeof sampleConcepts[0]) => {
    setTitle(sample.title);
    setContent(sample.content);
    setError(null);
  };

  return (
    <div id="handwritten-tool-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Banner in Beige */}
      <div className="bg-[#FAF7F2] border border-[#EAE2D5] p-6 sm:p-8 rounded-3xl space-y-3">
        <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C160E]">
          Turn Info Into an Image
        </h2>
        <p className="text-sm sm:text-base text-[#5C5246] leading-relaxed max-w-3xl">
          Got a topic that's hard to imagine? Drop the information here and turn it into a clear visual.
        </p>
      </div>

      {/* Input Form in Beige */}
      <div className="bg-[#FCFAF7] rounded-3xl border border-[#EBE3D7] p-6 sm:p-7 shadow-xs">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label htmlFor="note-title-input" className="block text-xs font-semibold uppercase tracking-wider text-[#8C8276] mb-1.5">
              Topic / Title:
            </label>
            <input
              id="note-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Thumb Opposition & Median Nerve, Acute Pulmonary Embolism..."
              className="w-full px-4 py-2.5 text-[#1C160E] bg-[#FFFDFB] border border-[#DDD3C3] rounded-xl focus:outline-hidden focus:border-[#8C8276] transition text-sm"
            />
          </div>

          {/* Preset Samples */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-medium text-[#8C8276]">Quick Examples:</span>
            {sampleConcepts.map((item, i) => (
              <button
                key={i}
                type="button"
                id={`sample-concept-${i}`}
                onClick={() => handleSelectSample(item)}
                className="text-xs px-2.5 py-1 bg-[#F5EFE6] hover:bg-[#EAE0D0] text-[#1C160E] rounded-lg border border-[#E0D6C3] transition-colors cursor-pointer"
              >
                {item.title}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="note-content-textarea" className="block text-xs font-semibold uppercase tracking-wider text-[#8C8276] mb-1.5">
              Information / Notes:
            </label>
            <textarea
              id="note-content-textarea"
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your notes, concept, or any information here..."
              className="w-full px-4 py-2.5 text-[#1C160E] bg-[#FFFDFB] border border-[#DDD3C3] rounded-xl focus:outline-hidden focus:border-[#8C8276] transition text-sm font-sans"
            />
          </div>

          {error && (
            <div className="p-3.5 bg-[#FAF3EA] border border-[#E0D0BE] text-[#5C5246] rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#1C160E]" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-[#8C8276]">
              ✍️ Black ink, marker highlights, visual diagrams, and landscape study sheet.
            </span>

            <button
              id="generate-handwritten-note-submit-btn"
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#1C160E] hover:bg-[#2F251C] text-[#FAF7F2] font-semibold text-sm rounded-xl shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Making It Visual...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Make It Visual</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Rendered Handwritten Canvas Display */}
      {noteData && (
        <div id="handwritten-canvas-wrapper" className="bg-[#FCFAF7] p-5 sm:p-7 rounded-3xl border border-[#EBE3D7] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-3">
            <div>
              <h3 className="font-serif-display font-bold text-[#1C160E] text-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#1C160E]" />
                Your visual is ready ✨
              </h3>
              <p className="text-xs text-[#8C8276]">
                Click "Download Note (PNG)" to save directly to your device.
              </p>
            </div>
          </div>

          <HandwrittenCanvas data={noteData} onRegenerate={handleGenerate} />
        </div>
      )}
    </div>
  );
};
