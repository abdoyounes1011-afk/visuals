import React from "react";
import { X, ShieldCheck, FileText, AlertTriangle } from "lucide-react";

interface LegalModalProps {
  type: "privacy" | "terms" | "disclaimer" | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            {type === "privacy" && <ShieldCheck className="w-5 h-5 text-blue-600" />}
            {type === "terms" && <FileText className="w-5 h-5 text-slate-700" />}
            {type === "disclaimer" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
            <h3 className="font-bold text-slate-900 text-lg">
              {type === "privacy" && "Privacy Policy"}
              {type === "terms" && "Terms of Service"}
              {type === "disclaimer" && "Medical & Educational Disclaimer"}
            </h3>
          </div>
          <button
            id="close-legal-modal-btn"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-700 leading-relaxed font-sans">
          {type === "privacy" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Last updated: September 2026</p>
              <h4 className="font-bold text-slate-900">1. Introduction & Google AdSense Compliance</h4>
              <p>
                At Fawzy AI, accessible from our web platform, one of our main priorities is the privacy of our visitors.
                This Privacy Policy document outlines the types of information that is collected and recorded by Fawzy AI and how we use it.
              </p>

              <h4 className="font-bold text-slate-900">2. Google DoubleClick DART Cookie & Third-Party Advertising</h4>
              <p>
                Google is a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors
                based upon their visit to our site and other sites on the internet.
                Visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL:
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline ml-1"
                >
                  https://policies.google.com/technologies/ads
                </a>
              </p>

              <h4 className="font-bold text-slate-900">3. Advertising Partners Privacy Policies (Publisher ID: pub-7821971666635532)</h4>
              <p>
                Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements
                and links that appear on Fawzy AI, which are sent directly to users' browser. They automatically receive your IP address when this occurs.
                These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see.
              </p>

              <h4 className="font-bold text-slate-900">4. User Inputs & Medical Query Privacy</h4>
              <p>
                Medical queries and notes submitted for note generation are processed transiently to produce handwritten visual diagrams,
                clinical pearls, and exam traps. We do not sell or monetize personal medical data.
              </p>

              <h4 className="font-bold text-slate-900">5. GDPR & CCPA Rights</h4>
              <p>
                Users possess the right to access, rectify, or request erasure of any personal data stored or transmitted in accordance with GDPR and CCPA.
              </p>
            </div>
          )}

          {type === "terms" && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">Last updated: September 2026</p>
              <h4 className="font-bold text-slate-900">1. Acceptance of Terms</h4>
              <p>
                By accessing and using Fawzy AI, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h4 className="font-bold text-slate-900">2. Permitted Educational Use</h4>
              <p>
                Fawzy AI is designed exclusively for medical students, healthcare trainees, and clinical examinees to aid study organization,
                visual retention, and board examination preparation.
              </p>

              <h4 className="font-bold text-slate-900">3. Intellectual Property & Image Exports</h4>
              <p>
                Handwritten study sheets and visual summaries generated through Fawzy AI are free for personal educational use, lecture review,
                and exam revision.
              </p>
            </div>
          )}

          {type === "disclaimer" && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs font-semibold">
                ⚠️ Critical Notice: Fawzy AI is strictly an academic study tool for medical students and clinical exam preparation.
              </div>
              <h4 className="font-bold text-slate-900">1. Not Medical Advice</h4>
              <p>
                The information, visual diagrams, Zatona summaries, and exam traps provided by Fawzy AI are intended purely for academic learning,
                memory reinforcement, and board examination review. They DO NOT constitute medical advice, diagnosis, or clinical management recommendations for real patients.
              </p>

              <h4 className="font-bold text-slate-900">2. Professional Clinical Judgment</h4>
              <p>
                Licensed medical practitioners and clinicians must always exercise their own independent clinical judgment and consult official clinical practice guidelines,
                peer-reviewed journals, and institutional protocols before making diagnostic or treatment decisions for patients.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            id="modal-understand-btn"
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
