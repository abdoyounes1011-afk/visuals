import React from "react";
import { MessageSquare, Send, Instagram, ExternalLink, Heart, Star, Sparkles, GraduationCap, CheckCircle2 } from "lucide-react";
import { AdBanner } from "./AdBanner";

export const CourseAndCreatorSection: React.FC = () => {
  const reviews = [
    {
      text: "بأمانه الكورس حلو و كويس و انا كنت محتاج فعلاً كورس زيه موجه التركيز أنه يربط ال ai بمذاكره الطب",
      name: "طالب طب بشري",
      badge: "طالب كلية الطب",
    },
    {
      text: "جميل جدا يا دكتور يبارك لك فعلا الكورس مفيد و فيه معلومات جديدة❤️",
      name: "دكتورة متدربة",
      badge: "مشارك في الكورس",
    },
    {
      text: "شكرا جدا لحضرتك والله جزاك الله كل الخير و جعلك دايما من النافعين 🤍🤲🏻",
      name: "طالب طب إكلينيكي",
      badge: "تقييم موثق",
    },
  ];

  return (
    <footer id="course-and-creator-footer" className="mt-16 pt-12 pb-16 border-t border-[#EAE2D5] bg-[#FAF6F0]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Course Intro & Link Card */}
        <div className="bg-[#FCFAF7] rounded-3xl border border-[#EBE3D7] p-6 sm:p-10 shadow-xs text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EFE8DB] text-[#1C160E] text-xs font-bold border border-[#DDD3C3]">
              <GraduationCap className="w-4 h-4 text-[#1C160E]" />
              <span>كورس الذكاء الاصطناعي لطلاب الطب • Medical AI Masterclass</span>
            </div>

            <p className="font-arabic text-lg sm:text-xl text-[#1C160E] leading-relaxed font-semibold">
              بشارك معاك كل اللي اتعلمته ووصلتله من خلال الكورسات والتجارب اللي خضتها.
              <br />
              <span className="text-[#1C160E] font-bold">لو حابب تتعلم معايا، الكورس من هنا 👇</span>
            </p>

            {/* Clickable Course Link */}
            <div className="pt-2">
              <a
                id="medical-course-link"
                href="https://abd-elrhman.nzmly.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-bold text-[#FAF7F2] bg-[#1C160E] hover:bg-[#2F251C] rounded-2xl shadow-xs hover:shadow-md transition-all transform hover:-translate-y-0.5"
              >
                <span>الانضمام للكورس الآن</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <div className="mt-2 text-xs text-[#8C8276] font-arabic">
                رابط المنصة التعليمية: https://abd-elrhman.nzmly.com/
              </div>
            </div>
          </div>

          {/* Student Reviews / Feedbacks Section directly under the Course */}
          <div className="mt-10 pt-8 border-t border-[#EAE2D5]">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="w-4 h-4 fill-[#C8B89A] text-[#C8B89A]" />
              <h3 className="font-arabic font-bold text-[#1C160E] text-base sm:text-lg">
                آراء وتقييمات الطلاب في الكورس (Course Feedback)
              </h3>
              <Star className="w-4 h-4 fill-[#C8B89A] text-[#C8B89A]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-right" dir="rtl">
              {reviews.map((rev, index) => (
                <div
                  key={index}
                  className="bg-[#F6F1EA] hover:bg-[#EFE8DB] border border-[#E0D6C3] rounded-2xl p-5 transition-all flex flex-col justify-between shadow-2xs"
                >
                  <p className="font-arabic text-sm text-[#3E342B] leading-relaxed font-medium">
                    "{rev.text}"
                  </p>
                  <div className="mt-4 pt-3 border-t border-[#E0D6C3] flex items-center justify-between text-xs text-[#8C8276]">
                    <span className="font-bold text-[#1C160E]">{rev.name}</span>
                    <span className="bg-[#EFE8DC] text-[#1C160E] px-2 py-0.5 rounded-md font-semibold border border-[#DDD3C3] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#1C160E]" />
                      {rev.badge}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AdSense Banner - مباشرة قبل معلومات التواصل */}
        <div id="footer-ad-banner" className="pt-2">
          <AdBanner slot="9876543210" />
        </div>

        {/* Creator Contact Info */}
        <div className="bg-[#FCFAF7] rounded-3xl border border-[#EBE3D7] p-6 sm:p-8 shadow-xs text-center space-y-4">
          <div className="space-y-1">
            <h4 className="font-arabic font-bold text-[#1C160E] text-lg">
              تواصل مع د. عبدالرحمن فوزي (Contact Information)
            </h4>
            <p className="text-xs text-[#8C8276]">
              للاستفسارات الطبية أو التدريب ومتابعة الكورسات
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {/* WhatsApp */}
            <a
              id="contact-whatsapp-link"
              href="https://wa.me/201225211153"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F6F1EA] hover:bg-[#EAE0D0] text-[#1C160E] border border-[#DDD3C3] rounded-xl text-sm font-semibold transition-colors shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 text-[#1C160E]" />
              <span>WhatsApp: 01225211153</span>
            </a>

            {/* Telegram */}
            <a
              id="contact-telegram-link"
              href="https://t.me/lifedocter"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F6F1EA] hover:bg-[#EAE0D0] text-[#1C160E] border border-[#DDD3C3] rounded-xl text-sm font-semibold transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4 text-[#1C160E]" />
              <span>Telegram: @lifedocter</span>
            </a>

            {/* Instagram */}
            <a
              id="contact-instagram-link"
              href="https://www.instagram.com/abdofawzii?igsi=dThiYnpmcWV3a3ht&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F6F1EA] hover:bg-[#EAE0D0] text-[#1C160E] border border-[#DDD3C3] rounded-xl text-sm font-semibold transition-colors shadow-2xs"
            >
              <Instagram className="w-4 h-4 text-[#1C160E]" />
              <span>Instagram: @abdofawzii</span>
            </a>
          </div>
        </div>

        {/* AdSense & Legal Links */}
        <div className="pt-4 border-t border-[#EAE2D5] flex flex-col sm:flex-row items-center justify-between text-xs text-[#8C8276] gap-3">
          <div>
            © {new Date().getFullYear()} Fawzy AI • Medical Education & Clinical Visual Assistant.
          </div>
          <div className="flex items-center gap-4">
            <button
              id="footer-privacy-btn"
              onClick={() => window.dispatchEvent(new CustomEvent("open-legal-modal", { detail: "privacy" }))}
              className="hover:text-[#1C160E] transition-colors underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              id="footer-terms-btn"
              onClick={() => window.dispatchEvent(new CustomEvent("open-legal-modal", { detail: "terms" }))}
              className="hover:text-[#1C160E] transition-colors underline cursor-pointer"
            >
              Terms of Service
            </button>
            <button
              id="footer-disclaimer-btn"
              onClick={() => window.dispatchEvent(new CustomEvent("open-legal-modal", { detail: "disclaimer" }))}
              className="hover:text-[#1C160E] transition-colors underline cursor-pointer"
            >
              Medical Disclaimer
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
