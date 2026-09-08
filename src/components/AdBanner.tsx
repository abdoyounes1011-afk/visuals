import React, { useEffect, useRef } from "react";

interface AdBannerProps {
  slot?: string;
  format?: "auto" | "horizontal" | "rectangle";
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slot = "1234567890",
  format = "auto",
  className = "",
}) => {
  const adRef = useRef<HTMLModElement | null>(null);

  useEffect(() => {
    try {
      // Trigger adsbygoogle if available
      if (typeof window !== "undefined") {
        const adsbygoogle = (window as any).adsbygoogle || [];
        adsbygoogle.push({});
      }
    } catch (e) {
      // Suppress adblocker or initialization exceptions
    }
  }, []);

  return (
    <div className={`w-full my-6 text-center overflow-hidden ${className}`}>
      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
        Sponsored Advertisement
      </div>
      <div className="min-h-[90px] bg-slate-100/60 border border-dashed border-slate-200 rounded-xl flex items-center justify-center p-2">
        <ins
          ref={adRef}
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client="ca-pub-7821971666635532"
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
};
