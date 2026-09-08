import React, { useRef, useState } from "react";
import { Download, Printer, Copy, Check, FileText, Sparkles, Shield, AlertTriangle, CheckCircle2, Stethoscope, Pill, ArrowRight, Loader2 } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import confetti from "canvas-confetti";
import { ExamTrapsData } from "../types";

interface PdfDocumentViewerProps {
  title: string;
  type: "zatona" | "exam-traps";
  authorTag?: string;
  // Either raw text for Zatona or structured ExamTrapsData
  zatonaContent?: string;
  trapsData?: ExamTrapsData;
  onSwitchToCanvas?: () => void;
}

// Helper to highlight keywords in text with warm yellow marker
export const renderTextWithKeywords = (text: string): React.ReactNode => {
  if (!text) return null;

  // If text already has markdown bold **keyword**
  if (text.includes("**")) {
    const parts = text.split("**");
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        return (
          <mark
            key={idx}
            className="bg-[#FEF08A] text-[#1C160E] px-1.5 py-0.5 rounded-xs font-bold border-b border-[#EAB308]/60 mx-0.5"
          >
            {part}
          </mark>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  }

  // Regex pattern for high-yield clinical keywords, drugs, and tests
  const kwRegex = /\b(First Step|Best Next Step|Gold Standard|Definitive|Contraindicated|Virchow'?s Triad|V\/Q mismatch|CTPA|D-dimer|EMG\/NCS|Phalen'?s|Tinel'?s|Opponens [Pp]ollicis|Median Nerve|Ulnar Nerve|Radial Nerve|Carpal Tunnel|Saddle Joint|Recurrent branch|Heparin|tPA|Aspirin|Insulin|Norepinephrine|Furosemide|Dobutamine|Milrinone|PCWP|Hypoxemia|Acidosis|Ketonemia|Hypokalemia|Hyperkalemia|Ape-Hand|Precision grip|Power grip|Avoid|Never|Immediate|Urgent|Rule Out)\b/gi;

  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = kwRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push(text.substring(lastIndex, match.index));
    }
    segments.push(
      <mark
        key={match.index}
        className="bg-[#FEF08A] text-[#1C160E] px-1.5 py-0.5 rounded-xs font-bold border-b border-[#EAB308]/60 mx-0.5"
      >
        {match[0]}
      </mark>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push(text.substring(lastIndex));
  }

  return segments.length > 0 ? segments : text;
};

export const PdfDocumentViewer: React.FC<PdfDocumentViewerProps> = ({
  title,
  type,
  authorTag = "@abdofawzii",
  zatonaContent,
  trapsData,
  onSwitchToCanvas,
}) => {
  const pdfSheetRef = useRef<HTMLDivElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  const cleanDocName = (title || "clinical_study_file")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .toLowerCase();
  const pdfFileName = `${type === "zatona" ? "zatona" : "exam_traps"}_${cleanDocName}.pdf`;

  // True PDF export using jsPDF and html2canvas-pro with fallback
  const handleDownloadPdf = async () => {
    if (!pdfSheetRef.current) return;
    setDownloading(true);

    try {
      const element = pdfSheetRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for crisp PDF text
        useCORS: true,
        backgroundColor: "#FAF7F2",
        logging: false,
        windowWidth: 1200,
        onclone: (clonedDoc) => {
          // Extra safety: sanitize any stylesheets containing oklab/oklch
          try {
            const styleTags = clonedDoc.querySelectorAll("style");
            styleTags.forEach((tag) => {
              if (tag.textContent && (tag.textContent.includes("oklab") || tag.textContent.includes("oklch"))) {
                tag.textContent = tag.textContent
                  .replace(/oklab\([^)]+\)/g, "#1C160E")
                  .replace(/oklch\([^)]+\)/g, "#1C160E");
              }
            });
          } catch (e) {
            // Ignore sanitization error
          }
        },
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(pdfFileName);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error("Canvas PDF generation error, trying direct jsPDF text builder:", err);
      try {
        // Direct jsPDF fallback: creates clean formatted medical PDF
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        doc.setFillColor(250, 247, 242);
        doc.rect(0, 0, 210, 297, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.setTextColor(28, 22, 14);
        doc.text(title || "Clinical Study Sheet", 15, 20);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(140, 130, 118);
        doc.text(`Authored by ${authorTag} • Fawzy AI Clinical System • ${new Date().toLocaleDateString()}`, 15, 27);

        doc.setDrawColor(221, 211, 195);
        doc.setLineWidth(0.4);
        doc.line(15, 31, 195, 31);

        let curY = 40;
        const lines: string[] = [];

        if (type === "zatona" && zatonaContent) {
          lines.push(...zatonaContent.split("\n"));
        } else if (type === "exam-traps" && trapsData) {
          lines.push(`TOPIC: ${trapsData.topic.toUpperCase()}`);
          lines.push("");
          trapsData.traps.forEach((t, i) => {
            lines.push(`[Trap #${i + 1}] ${t.trapName}`);
            lines.push(`- Why Examiners Test It: ${t.whyExaminersTestIt}`);
            lines.push(`- Common Mistake: ${t.theMistake}`);
            lines.push(`- GOLDEN RULE: ${t.theGoldenRule}`);
            if (t.lookAlikes) lines.push(`- Look-Alikes: ${t.lookAlikes}`);
            lines.push("");
          });
          if (trapsData.redFlags.length > 0) {
            lines.push("=== RED FLAGS ===");
            trapsData.redFlags.forEach((rf) => lines.push(`* ${rf}`));
            lines.push("");
          }
          if (trapsData.dontDoList.length > 0) {
            lines.push("=== ABSOLUTE CONTRAINDICATIONS ===");
            trapsData.dontDoList.forEach((dd) => lines.push(`* DON'T: ${dd}`));
          }
        }

        for (const line of lines) {
          if (!line.trim()) {
            curY += 3;
            continue;
          }
          const wrapped = doc.splitTextToSize(line, 180);
          for (const w of wrapped) {
            if (curY > 280) {
              doc.addPage();
              doc.setFillColor(250, 247, 242);
              doc.rect(0, 0, 210, 297, "F");
              curY = 20;
            }
            if (w.startsWith("[Trap #") || w.startsWith("===") || w.startsWith("TOPIC:")) {
              doc.setFont("helvetica", "bold");
              doc.setTextColor(28, 22, 14);
            } else {
              doc.setFont("helvetica", "normal");
              doc.setTextColor(60, 50, 40);
            }
            doc.text(w, 15, curY);
            curY += 5.5;
          }
        }

        doc.save(pdfFileName);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
      } catch (fallbackErr) {
        console.error("Direct jsPDF fallback error:", fallbackErr);
        window.print();
      }
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let copyString = "";
    if (type === "zatona" && zatonaContent) {
      copyString = zatonaContent;
    } else if (type === "exam-traps" && trapsData) {
      copyString = `${trapsData.topic}\n\n` +
        trapsData.traps.map((t, idx) => `Trap #${idx + 1}: ${t.trapName}\n- Why tested: ${t.whyExaminersTestIt}\n- Mistake: ${t.theMistake}\n- Golden Rule: ${t.theGoldenRule}\n`).join("\n");
    }

    navigator.clipboard.writeText(copyString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="pdf-document-container" className="space-y-4">
      {/* 1. PDF Application Toolbar (Styled in Beige & Deep Charcoal) */}
      <div className="bg-[#FAF7F2] border border-[#DDD3C3] p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#EFE8DC] border border-[#DDD3C3] flex items-center justify-center text-[#1C160E] font-bold text-xs shadow-2xs">
            PDF
          </div>
          <div>
            <div className="text-xs font-bold text-[#1C160E] truncate max-w-xs sm:max-w-md">
              {pdfFileName}
            </div>
            <div className="text-[11px] text-[#8C8276] flex items-center gap-1.5">
              <span>A4 Clinical Document</span>
              <span>•</span>
              <span className="text-[#1C160E] font-medium">Authored by {authorTag}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onSwitchToCanvas && (
            <button
              id="switch-to-canvas-sheet-btn"
              onClick={onSwitchToCanvas}
              className="px-3 py-1.5 text-xs font-semibold bg-[#F5EFE6] hover:bg-[#EAE0D0] text-[#1C160E] rounded-xl border border-[#E0D6C3] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>🎨 Switch to 9:16 Visual Image</span>
            </button>
          )}

          <button
            id="copy-pdf-content-btn"
            onClick={handleCopyText}
            className="px-3 py-1.5 text-xs font-medium bg-[#FFFDFB] hover:bg-[#F5EFE6] text-[#1C160E] rounded-xl border border-[#DDD3C3] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#047857]" /> : <Copy className="w-3.5 h-3.5 text-[#5C5246]" />}
            <span>{copied ? "Copied" : "Copy Text"}</span>
          </button>

          <button
            id="print-pdf-document-btn"
            onClick={handlePrint}
            className="px-3 py-1.5 text-xs font-medium bg-[#FFFDFB] hover:bg-[#F5EFE6] text-[#1C160E] rounded-xl border border-[#DDD3C3] transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#5C5246]" />
            <span>Print</span>
          </button>

          <button
            id="download-pdf-file-btn"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2 text-xs font-bold bg-[#1C160E] hover:bg-[#2F251C] text-[#FAF7F2] rounded-xl transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {downloading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF File</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. PDF Document Page Canvas (High-Fidelity A4 Beige Sheet) */}
      <div className="bg-[#EDE4D5]/40 p-4 sm:p-8 rounded-3xl border border-[#E0D5C3] overflow-x-auto flex justify-center">
        <div
          ref={pdfSheetRef}
          id="printable-pdf-sheet"
          className="w-full max-w-[850px] bg-[#FFFDFB] border-2 border-[#DDD3C3] rounded-2xl p-7 sm:p-12 shadow-md space-y-7 text-[#1C160E]"
          style={{ minHeight: "1100px" }}
        >
          {/* Document Official Header in Beige */}
          <div className="border-b-2 border-[#DDD3C3] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8C8276] bg-[#F5EFE6] px-2.5 py-0.5 rounded-md border border-[#E0D6C3]">
                  {type === "zatona" ? "CLINICAL ZATONA STUDY GUIDE" : "HIGH-YIELD EXAM TRAPS REPORT"}
                </span>
                <span className="text-[11px] font-bold text-[#8C8276]">FAWZY AI • MEDICAL SYSTEM</span>
              </div>
              <h1 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C160E] tracking-tight">
                {title || "Clinical Medical File"}
              </h1>
              <p className="text-xs text-[#5C5246]">
                Comprehensive high-yield breakdown with highlighted clinical keywords & exam discriminators.
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 bg-[#FAF7F2] p-3 rounded-xl border border-[#EBE3D7] shrink-0">
              <div className="text-xs font-bold text-[#1C160E] flex items-center sm:justify-end gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-[#8C8276]" />
                <span>Verified Clinical File</span>
              </div>
              <div className="text-[11px] text-[#5C5246]">
                Authored by <strong className="text-[#1C160E]">{authorTag}</strong>
              </div>
              <div className="text-[11px] text-[#8C8276]">
                Date: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* Type 1: Zatona Clinical PDF Layout */}
          {type === "zatona" && zatonaContent && (
            <div className="space-y-5 text-sm leading-relaxed font-sans">
              {zatonaContent.split("\n\n").map((block, idx) => {
                const trimmed = block.trim();
                if (!trimmed) return null;

                // Extract heading if first line has emoji or colon
                const lines = trimmed.split("\n");
                const firstLine = lines[0];
                const restLines = lines.slice(1);

                const isWarningOrContraindication =
                  firstLine.includes("Don't Do") || firstLine.includes("Trap") || firstLine.includes("❌") || firstLine.includes("🚨");

                return (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border ${
                      isWarningOrContraindication
                        ? "bg-[#FAF3EA] border-[#E0D0BE]"
                        : "bg-[#FAF7F2] border-[#EBE3D7]"
                    } shadow-2xs space-y-2`}
                  >
                    <div className="font-serif-display font-bold text-base text-[#1C160E] flex items-center gap-2 border-b border-[#EAE2D5] pb-2">
                      {renderTextWithKeywords(firstLine)}
                    </div>

                    <div className="space-y-1.5 text-xs sm:text-sm text-[#3E342B] font-sans">
                      {restLines.map((l, lineIdx) => {
                        const lineTrimmed = l.trim();
                        if (!lineTrimmed) return null;
                        return (
                          <div key={lineIdx} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-[#8C8276] font-bold shrink-0">•</span>
                            <div className="flex-1">
                              {renderTextWithKeywords(lineTrimmed.replace(/^[•\*\-]\s*/, ""))}
                            </div>
                          </div>
                        );
                      })}
                      {restLines.length === 0 && (
                        <div className="leading-relaxed">
                          {renderTextWithKeywords(firstLine)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Type 2: Exam Traps Clinical PDF Layout */}
          {type === "exam-traps" && trapsData && (
            <div className="space-y-5 text-sm leading-relaxed font-sans">
              {/* Traps Cards */}
              <div className="space-y-4">
                {trapsData.traps.map((trap, index) => (
                  <div
                    key={index}
                    className="bg-[#FAF7F2] rounded-2xl border border-[#EBE3D7] p-5 sm:p-6 shadow-2xs space-y-3.5"
                  >
                    <div className="flex items-center justify-between border-b border-[#EAE2D5] pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#1C160E] bg-[#EFE8DC] px-2.5 py-0.5 rounded-md border border-[#DDD3C3]">
                          Trap #{index + 1}
                        </span>
                        <h3 className="font-serif-display text-lg font-bold text-[#1C160E]">
                          {trap.trapName}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div className="bg-[#F5EFE6] border border-[#E0D6C3] rounded-xl p-3.5">
                        <div className="font-bold text-[#1C160E] mb-1 flex items-center gap-1.5 text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-[#8C8276]" />
                          Why Examiners Test This:
                        </div>
                        <p className="text-[#5C5246] leading-relaxed">
                          {renderTextWithKeywords(trap.whyExaminersTestIt)}
                        </p>
                      </div>

                      <div className="bg-[#F5EFE6] border border-[#E0D6C3] rounded-xl p-3.5">
                        <div className="font-bold text-[#1C160E] mb-1 flex items-center gap-1.5 text-xs">
                          <Shield className="w-3.5 h-3.5 text-[#8C8276]" />
                          Common Student Mistake:
                        </div>
                        <p className="text-[#5C5246] leading-relaxed">
                          {renderTextWithKeywords(trap.theMistake)}
                        </p>
                      </div>
                    </div>

                    {/* Golden Rule Highlighted Box */}
                    <div className="bg-[#EFE8DC] border border-[#DDD3C3] rounded-xl p-3.5 text-xs sm:text-sm text-[#1C160E]">
                      <div className="font-bold text-[#1C160E] flex items-center gap-1.5 mb-1 uppercase tracking-wider text-xs">
                        <CheckCircle2 className="w-4 h-4 text-[#1C160E]" />
                        The High-Yield Discriminator (Golden Rule):
                      </div>
                      <div className="font-medium text-[#2E241B] leading-relaxed">
                        {renderTextWithKeywords(trap.theGoldenRule)}
                      </div>
                    </div>

                    {trap.lookAlikes && (
                      <div className="bg-[#F5EFE6] border border-[#E0D6C3] rounded-xl p-3 text-xs text-[#5C5246]">
                        <strong className="text-[#1C160E]">Look-Alike Investigation Trap: </strong>
                        {renderTextWithKeywords(trap.lookAlikes)}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Red Flags & Don't Do Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* Red Flags */}
                <div className="bg-[#FAF7F2] rounded-2xl border border-[#EBE3D7] p-5 shadow-2xs space-y-3">
                  <h4 className="font-serif-display font-bold text-[#1C160E] flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-[#8C8276]" />
                    Must-Not-Miss Red Flags
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#5C5246]">
                    {trapsData.redFlags.map((rf, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#F5EFE6] p-2.5 rounded-xl border border-[#E0D6C3]">
                        <span className="text-[#1C160E] font-bold">•</span>
                        <span>{renderTextWithKeywords(rf)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Don't Do List */}
                <div className="bg-[#FAF3EA] rounded-2xl border border-[#E0D0BE] p-5 shadow-2xs space-y-3">
                  <h4 className="font-serif-display font-bold text-[#1C160E] flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-[#1C160E]" />
                    Absolute Contraindications ("DON'T DO")
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#5C5246]">
                    {trapsData.dontDoList.map((dd, idx) => (
                      <li key={idx} className="flex items-start gap-2 bg-[#F5EFE6] p-2.5 rounded-xl border border-[#E0D6C3]">
                        <span className="text-[#1C160E] font-bold">❌</span>
                        <span>{renderTextWithKeywords(dd)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Official PDF Document Footer */}
          <div className="border-t-2 border-[#DDD3C3] pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-[#8C8276]">
            <div>
              📄 Page 1 of 1 • Official Fawzy AI Clinical Study Sheet • Authored by {authorTag}
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#059669]"></span>
              <span className="font-medium text-[#1C160E]">High-Yield Medical Format • Beige & Yellow Highlighter</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
