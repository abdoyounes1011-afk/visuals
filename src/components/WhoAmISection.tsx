import React, { useState } from "react";
import { User, ChevronDown, Sparkles, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export const WhoAmISection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section
      id="who-am-i-section"
      className="bg-[#FCFAF7] rounded-3xl border border-[#EBE3D7] p-6 sm:p-9 shadow-xs text-right relative overflow-hidden transition-all duration-200"
      dir="rtl"
    >
      {/* Background ambient accent */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#EFE8DC]/40 rounded-br-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EAE2D5] pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1C160E] text-[#FAF7F2] flex items-center justify-center shadow-2xs">
            <User className="w-4 h-4 text-[#FAF7F2]" />
          </div>
          <div>
            <h2 className="font-serif-display font-extrabold text-2xl sm:text-3xl text-[#1C160E] tracking-tight flex items-center gap-2">
              <span>who am I ?</span>
            </h2>
            <p className="text-xs text-[#8C8276] font-medium mt-0.5">
              قصة البداية • The Story Behind Fawzy AI
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFE8DC] text-[#5C5246] text-xs font-semibold border border-[#E0D6C3]">
          <BookOpen className="w-3.5 h-3.5 text-[#1C160E]" />
          <span>طالب طب ومطور المنظومة</span>
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3 font-arabic text-base sm:text-lg text-[#3E342B] leading-relaxed">
        {/* First ~3 lines shown by default */}
        <p className="font-medium text-[#241E17]">
          أنا طالب طب، لكن رحلتي مع الـAI بدأت من احتياج حقيقي أكتر من إنها كانت مجرد اهتمام بالتكنولوجيا.
        </p>
        <p className="text-[#4A4036]">
          الحمد لله ربنا وفقني إني أتعلم من كورسات على Udemy وخارج Udemy ودي اللي كلفتني فلوس كتير ، المشكله مكنتش في الفلوس علي قد ما كانت ان ولا كورس كان بيوجه كلامه لطالب طب ، الكلام كان موجه ل freelancer او صاحب بيزنس ، وده اللي خلاني تايه شويه ،
        </p>

        {/* Small Toggle Button: "read my story" */}
        <div className="pt-1">
          <button
            id="read-my-story-btn"
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[#1C160E] bg-[#EFE8DC] hover:bg-[#E5DDD0] border border-[#DDD3C3] rounded-xl transition-all shadow-2xs cursor-pointer group"
          >
            <span>{isExpanded ? "إخفاء التفاصيل • Show less" : "read my story"}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform duration-200 text-[#5C5246] ${
                isExpanded ? "rotate-180" : "group-hover:translate-y-0.5"
              }`}
            />
          </button>
        </div>

        {/* Expanded continuation */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id="who-am-i-full-story"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-4 pt-3 overflow-hidden text-base sm:text-lg text-[#3E342B] leading-relaxed border-t border-[#EAE2D5]/80 mt-3"
            >
              <p>
                ولكن الحمدلله ربنا وفقني ان مكتفيش بالتعلم النظري؛ طبقت اللي اتعلمته وشوفت بنفسي إزاي الأدوات دي ممكن تغيّر طريقة شغلي وتعلمي. ومع الوقت بدأت أستخدم الـAI في المذاكرة، وهنا اكتشفت إن الموضوع أكبر بكتير من مجرد إنك تسأل ال Ai سؤال أو تطلب منه يلخص لك محاضرة.
              </p>

              <p>
                الـAI بالنسبة لي بقى وسيلة إني أوفر وقت ومجهود، والأهم إني أعيد تشكيل المعلومات بالشكل اللي يخدمني أنا: شكل يساعدني أفهم، أحفظ، أراجع، وأستفيد من المحتوى بأكبر قدر ممكن.
              </p>

              <p>
                التجربة دي جات في فترة كنت محتاج فيها أختصر الطريق وأحافظ على طاقتي، فبدأت أبحث عن طرق أذكى أقدر بيها أطلع نتيجة أكبر من نفس الوقت والمجهود. وبعد ما شفت الفرق اللي حصل معايا، حبيت أنقل التجربة لطلاب الكليات الطبيه لأننا كلنا بنتسابق مع الوقت والكميه .
              </p>

              {/* Core Philosophy Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F6F1EA] border border-[#E0D6C3] text-[#1C160E] text-sm sm:text-base leading-relaxed font-semibold shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-600 mt-1 shrink-0" />
                  <span>
                    هدفي مش إني أعلمك تستخدم أداة جديدة، لكن إني أساعدك تعرف إزاي تستخدم الـAI كجزء من نظام مذاكرة متكامل، يخليك تتعامل مع المعرفة بشكل أذكى، وتحوّل المحتوى للشكل اللي يخدمك بدل ما تفضل أنت اللي تتأقلم مع شكل المحتوى.
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
