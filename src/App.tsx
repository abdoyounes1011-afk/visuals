import React, { useState, useEffect } from "react";
import {
  PenTool,
  Zap,
  Shield,
  ArrowRight,
  Stethoscope,
  ExternalLink,
  Layers,
  ArrowLeft,
} from "lucide-react";
import { ActiveTool } from "./types";
import { HandwrittenTool } from "./components/HandwrittenTool";
import { ZatonaTool } from "./components/ZatonaTool";
import { ExamTrapsTool } from "./components/ExamTrapsTool";
import { CourseAndCreatorSection } from "./components/CourseAndCreatorSection";
import { WhoAmISection } from "./components/WhoAmISection";
import { LegalModal } from "./components/LegalModals";

export default function App() {
  const [activeTool, setActiveTool] = useState<ActiveTool>("home");
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | "disclaimer" | null>(null);

  // Listen for custom modal events from footer
  useEffect(() => {
    const handleLegalOpen = (e: any) => {
      if (e.detail) {
        setLegalModal(e.detail);
      }
    };
    window.addEventListener("open-legal-modal", handleLegalOpen);
    return () => window.removeEventListener("open-legal-modal", handleLegalOpen);
  }, []);

  // Scroll to top when switching tool windows
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTool]);

  return (
    <div id="fawzy-ai-app" className="min-h-screen bg-[#F6F1EA] text-[#1C160E] flex flex-col font-sans selection:bg-[#EAE0CD] selection:text-[#1C160E]">
      {/* Top Main Navigation in Beige */}
      <header id="main-header" className="sticky top-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#EAE2D5]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            id="brand-logo"
            onClick={() => setActiveTool("home")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1C160E] flex items-center justify-center text-[#FAF7F2] shadow-xs group-hover:opacity-90 transition-opacity">
              <Stethoscope className="w-4 h-4 text-[#FAF7F2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-display font-bold text-lg sm:text-xl tracking-tight text-[#1C160E]">
                  Fawzy AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-[#EFE8DC] text-[#5C5246] px-2 py-0.5 rounded-full border border-[#E0D6C3]">
                  Medical
                </span>
              </div>
              <p className="text-[11px] text-[#8C8276] font-medium hidden sm:block">
                Study Information, Reshaped
              </p>
            </div>
          </div>

          {/* Navigation Controls in Beige tones */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="nav-home-btn"
              onClick={() => setActiveTool("home")}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                activeTool === "home"
                  ? "bg-[#1C160E] text-[#FAF7F2]"
                  : "text-[#5C5246] hover:text-[#1C160E] hover:bg-[#EFE8DB]"
              }`}
            >
              Dashboard
            </button>

            <button
              id="nav-handwritten-btn"
              onClick={() => setActiveTool("handwritten")}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === "handwritten"
                  ? "bg-[#1C160E] text-[#FAF7F2]"
                  : "text-[#5C5246] hover:text-[#1C160E] hover:bg-[#EFE8DB]"
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Turn Info Into an Image</span>
            </button>

            <button
              id="nav-zatona-btn"
              onClick={() => setActiveTool("zatona")}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === "zatona"
                  ? "bg-[#1C160E] text-[#FAF7F2]"
                  : "text-[#5C5246] hover:text-[#1C160E] hover:bg-[#EFE8DB]"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Turn Any Disease Into a Zatona</span>
            </button>

            <button
              id="nav-traps-btn"
              onClick={() => setActiveTool("traps")}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTool === "traps"
                  ? "bg-[#1C160E] text-[#FAF7F2]"
                  : "text-[#5C5246] hover:text-[#1C160E] hover:bg-[#EFE8DB]"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Find Exam Traps</span>
            </button>

            <button
              id="nav-who-am-i-btn"
              onClick={() => {
                setActiveTool("home");
                setTimeout(() => {
                  document.getElementById("who-am-i-section")?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold text-[#5C5246] hover:text-[#1C160E] hover:bg-[#EFE8DB] rounded-xl transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Who am I ?</span>
            </button>

            {/* Course Link in Beige */}
            <a
              id="header-course-cta"
              href="https://abd-elrhman.nzmly.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 sm:ml-2 px-3 py-1.5 text-xs font-bold text-[#1C160E] bg-[#EFE8DB] hover:bg-[#E5DDD0] border border-[#DDD3C3] rounded-xl flex items-center gap-1 transition-colors"
            >
              <span className="hidden lg:inline">الكورس</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* VIEW 1: HOME PORTAL / 4 OPTION CARDS */}
        {activeTool === "home" && (
          <div id="home-portal-dashboard" className="space-y-10 sm:space-y-12 animate-in fade-in duration-300">
            {/* Header section matching user request */}
            <div className="max-w-4xl space-y-4 pt-2">
              <h1 className="font-serif-display text-4xl sm:text-6xl font-extrabold text-[#1C160E] tracking-tight leading-[1.12]">
                Study Smarter. See It. Remember It.
              </h1>

              <p className="text-base sm:text-lg text-[#5C5246] leading-relaxed max-w-3xl pt-1">
                Turn any information into something easier to understand, visualize, and remember.
              </p>
            </div>

            {/* Who am I? Section - First! */}
            <WhoAmISection />

            {/* Quranic Verse Banner right after Who am I? */}
            <div
              id="quranic-verse-banner"
              className="bg-[#FCFAF7] rounded-3xl border border-[#EBE3D7] p-6 sm:p-8 text-center relative overflow-hidden shadow-xs"
              dir="rtl"
            >
              <div className="max-w-3xl mx-auto space-y-2">
                <p className="font-serif text-[#1C160E] text-lg sm:text-2xl leading-loose font-medium tracking-wide">
                  ﴿ مَّا يَفْتَحِ اللَّهُ لِلنَّاسِ مِن رَّحْمَةٍ فَلَا مُمْسِكَ لَهَا ۖ وَمَا يُمْسِكْ فَلَا مُرْسِلَ لَهُ مِن بَعْدِهِ ۚ وَهُوَ الْعَزِيزُ الْحَكِيمُ ﴾
                </p>
                <p className="text-xs text-[#8C8276] font-medium tracking-wider">
                  [سورة فاطر: الآية 2]
                </p>
              </div>
            </div>

            {/* The Options Grid (الأدوات) */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-[#EBE3D7] pb-3">
                <div>
                  <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#1C160E]">
                    الأدوات الطبية الذكية • AI Tools
                  </h2>
                  <p className="text-xs sm:text-sm text-[#8C8276] mt-0.5">
                    اختر الأداة المناسبة لاحتياجك الدراسي
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                {/* Turn Info Into an Image */}
                <div
                  id="card-option-1-handwritten"
                  onClick={() => setActiveTool("handwritten")}
                  className="bg-[#FCFAF7] hover:bg-[#FAF6F0] rounded-3xl border border-[#EBE3D7] hover:border-[#DDD3C3] p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xs"
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-8 h-8 flex items-center text-[#1C160E]">
                      <PenTool className="w-6 h-6 stroke-[1.75]" />
                    </div>

                    {/* Title */}
                    <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C160E] group-hover:text-[#000] transition-colors">
                      Turn Info Into an Image
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-[#5C5246] leading-relaxed">
                      Got a topic that's hard to imagine? Drop the information here and turn it into a clear visual.
                    </p>
                  </div>

                  {/* Bottom Link */}
                  <div className="pt-8 flex items-center text-[#1C160E] font-medium text-sm group-hover:translate-x-0.5 transition-transform">
                    <span>Start Visualizing →</span>
                  </div>
                </div>

                {/* Turn Any Disease Into a Zatona */}
                <div
                  id="card-option-4-zatona"
                  onClick={() => setActiveTool("zatona")}
                  className="bg-[#FCFAF7] hover:bg-[#FAF6F0] rounded-3xl border border-[#EBE3D7] hover:border-[#DDD3C3] p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xs"
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-8 h-8 flex items-center text-[#1C160E]">
                      <Stethoscope className="w-6 h-6 stroke-[1.75]" />
                    </div>

                    {/* Title */}
                    <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C160E] group-hover:text-[#000] transition-colors">
                      Turn Any Disease Into a Zatona.
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-[#5C5246] leading-relaxed">
                      Enter a disease and get a simple visual that brings together the important stuff
                    </p>
                  </div>

                  {/* Bottom Link */}
                  <div className="pt-8 flex items-center text-[#1C160E] font-medium text-sm group-hover:translate-x-0.5 transition-transform">
                    <span>Explore Zatona →</span>
                  </div>
                </div>

                {/* Find the Traps Before the Exam Finds You */}
                <div
                  id="card-option-3-traps"
                  onClick={() => setActiveTool("traps")}
                  className="bg-[#FCFAF7] hover:bg-[#FAF6F0] rounded-3xl border border-[#EBE3D7] hover:border-[#DDD3C3] p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 cursor-pointer group shadow-xs"
                >
                  <div className="space-y-4">
                    {/* Icon */}
                    <div className="w-8 h-8 flex items-center text-[#1C160E]">
                      <Shield className="w-6 h-6 stroke-[1.75]" />
                    </div>

                    {/* Title */}
                    <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#1C160E] group-hover:text-[#000] transition-colors">
                      Find the Traps Before the Exam Finds You.
                    </h3>

                    {/* Description */}
                    <p className="text-sm sm:text-base text-[#5C5246] leading-relaxed">
                      Drop your notes or lecture here, and AI will find the tricky points, common confusions, and exam traps you need to watch out for.
                    </p>
                  </div>

                  {/* Bottom Link */}
                  <div className="pt-8 flex items-center text-[#1C160E] font-medium text-sm group-hover:translate-x-0.5 transition-transform">
                    <span>Find Traps →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED WINDOW FOR TURN INFO INTO AN IMAGE */}
        {activeTool === "handwritten" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-[#FCFAF7] p-3.5 rounded-2xl border border-[#EBE3D7] shadow-2xs">
              <button
                id="back-to-home-from-hw-btn"
                onClick={() => setActiveTool("home")}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1C160E] bg-[#EFE8DC] hover:bg-[#E5DDD0] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8276] bg-[#F5EFE6] border border-[#E0D6C3] px-3 py-1 rounded-full">
                TURN INFO INTO AN IMAGE
              </span>
            </div>
            <HandwrittenTool />
          </div>
        )}

        {/* DEDICATED WINDOW FOR EXAM TRAPS */}
        {activeTool === "traps" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-[#FCFAF7] p-3.5 rounded-2xl border border-[#EBE3D7] shadow-2xs">
              <button
                id="back-to-home-from-traps-btn"
                onClick={() => setActiveTool("home")}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1C160E] bg-[#EFE8DC] hover:bg-[#E5DDD0] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8276] bg-[#F5EFE6] border border-[#E0D6C3] px-3 py-1 rounded-full">
                FIND THE TRAPS BEFORE THE EXAM FINDS YOU
              </span>
            </div>
            <ExamTrapsTool />
          </div>
        )}

        {/* DEDICATED WINDOW FOR ZATONA */}
        {activeTool === "zatona" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between bg-[#FCFAF7] p-3.5 rounded-2xl border border-[#EBE3D7] shadow-2xs">
              <button
                id="back-to-home-from-zatona-btn"
                onClick={() => setActiveTool("home")}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#1C160E] bg-[#EFE8DC] hover:bg-[#E5DDD0] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </button>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8C8276] bg-[#F5EFE6] border border-[#E0D6C3] px-3 py-1 rounded-full">
                TURN ANY DISEASE INTO A ZATONA
              </span>
            </div>
            <ZatonaTool />
          </div>
        )}
      </main>

      {/* Footer with Dr. Fawzy's Course in Beige Theme */}
      <CourseAndCreatorSection />

      {/* Legal Modals */}
      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </div>
  );
}
