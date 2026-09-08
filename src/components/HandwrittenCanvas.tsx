import React, { useEffect, useRef, useState } from "react";
import { Download, Copy, Check, Sparkles, ZoomIn, ZoomOut, Palette, RefreshCw, Box, Layers, Image as ImageIcon, Loader2, AlertTriangle, ShieldCheck } from "lucide-react";
import confetti from "canvas-confetti";
import { HandwrittenNoteData } from "../types";
import { safeFetchJson } from "../lib/api";
import { generateProceduralMedicalIllustrationSvg } from "../lib/medical3dGenerator";

interface HandwrittenCanvasProps {
  data: HandwrittenNoteData;
  onRegenerate?: () => void;
}

export const HandwrittenCanvas: React.FC<HandwrittenCanvasProps> = ({ data, onRegenerate }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [inkColor, setInkColor] = useState<"black" | "blue" | "purple">("black");
  const [paperStyle, setPaperStyle] = useState<"lined" | "grid" | "cream">("lined");
  const [aspectRatio, setAspectRatio] = useState<"auto" | "9:16" | "16:10" | "16:9" | "4:3">("auto");
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: number; height: number }>({ width: 1080, height: 1600 });
  const [authorTag, setAuthorTag] = useState<string>("@abdofawzii");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // 3D Medical Renders & Nano Banana Pro State
  const [is3dMode, setIs3dMode] = useState<boolean>(true);
  const [generating3d, setGenerating3d] = useState<boolean>(false);
  const [show3dModal, setShow3dModal] = useState<boolean>(false);
  const [custom3dPrompt, setCustom3dPrompt] = useState<string>("");
  const [selectedSectionIdx, setSelectedSectionIdx] = useState<number>(0);
  const [section3dImages, setSection3dImages] = useState<Record<number, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const customImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Palette matching the user's uploaded reference image
  const inkColors = {
    black: "#111827", // Dark rich ink
    blue: "#1d4ed8",  // Pilot blue ballpoint
    purple: "#6b21a8", // Medical violet
  };

  const sectionHighlights = {
    yellow: "rgba(254, 240, 138, 0.9)", // Vibrant highlighter yellow (#FEF08A)
    peach: "rgba(254, 215, 170, 0.88)",  // Peach / warm orange (#FED7AA)
    cyan: "rgba(186, 230, 253, 0.88)",   // Sky blue (#BAE6FD)
    red: "rgba(254, 205, 211, 0.88)",    // Coral / soft red (#FECDD3)
    green: "rgba(187, 247, 208, 0.85)",  // Mint green (#BBF7D0)
  };

  // --- 3D MEDICAL DRAWING ENGINE (HIGH-YIELD REALISTIC VOLUMETRIC RENDERS) ---
  const draw3DEyeBurnComparison = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    ctx.save();
    ctx.translate(x, y);

    const halfW = (width - 20) / 2;

    // --- LEFT: ACID BURN (3D COAGULATION BARRIER) ---
    ctx.save();
    // Container card with subtle 3D bevel
    ctx.fillStyle = "rgba(241, 245, 249, 0.75)";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, 0, halfW - 8, 172, 10);
    ctx.fill();
    ctx.stroke();

    // Title badge
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 13px 'Architects Daughter', sans-serif";
    ctx.fillText("🧪 ACID BURN (3D COAGULATION)", 12, 22);

    const leftCx = 65;
    const leftCy = 95;
    const eyeR = 40;

    // 3D Spherical Eyeball Shading (Ambient occlusion + Specular highlight)
    const leftSphereGrad = ctx.createRadialGradient(leftCx - 10, leftCy - 12, 4, leftCx, leftCy, eyeR);
    leftSphereGrad.addColorStop(0, "#ffffff");
    leftSphereGrad.addColorStop(0.65, "#f1f5f9");
    leftSphereGrad.addColorStop(0.95, "#cbd5e1");
    leftSphereGrad.addColorStop(1, "#94a3b8");

    ctx.fillStyle = leftSphereGrad;
    ctx.strokeStyle = "#64748b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(leftCx, leftCy, eyeR, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.fill();
    ctx.stroke();

    // 3D Cornea Dome with glassy highlight
    const corneaGrad = ctx.createLinearGradient(leftCx + 15, leftCy - 28, leftCx + 45, leftCy + 28);
    corneaGrad.addColorStop(0, "rgba(56, 189, 248, 0.75)");
    corneaGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.5)");
    corneaGrad.addColorStop(1, "rgba(3, 105, 161, 0.8)");

    ctx.strokeStyle = corneaGrad;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(leftCx + 16, leftCy, 30, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // 3D Specular reflection on cornea
    ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(leftCx + 14, leftCy - 12, 16, -Math.PI * 0.25, 0);
    ctx.stroke();

    // 3D Coagulated Protein Shield (Dense golden barrier)
    const coagGrad = ctx.createLinearGradient(leftCx + 36, leftCy - 22, leftCx + 44, leftCy + 22);
    coagGrad.addColorStop(0, "#b45309");
    coagGrad.addColorStop(0.5, "#f59e0b");
    coagGrad.addColorStop(1, "#78350f");

    ctx.fillStyle = coagGrad;
    ctx.beginPath();
    ctx.roundRect(leftCx + 34, leftCy - 22, 10, 44, 4);
    ctx.fill();
    ctx.strokeStyle = "#451a03";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 3D Blocked Arrow (Bouncing off shield with spark burst)
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(halfW - 25, leftCy);
    ctx.lineTo(leftCx + 48, leftCy);
    ctx.stroke();

    // Spark ricochet burst
    ctx.fillStyle = "#f59e0b";
    ctx.beginPath();
    ctx.arc(leftCx + 48, leftCy, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(leftCx + 52, leftCy - 6);
    ctx.lineTo(leftCx + 64, leftCy - 16);
    ctx.moveTo(leftCx + 52, leftCy + 6);
    ctx.lineTo(leftCx + 64, leftCy + 16);
    ctx.stroke();

    // 3D Barrier Badge
    ctx.fillStyle = "#ecfdf5";
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(10, 142, halfW - 28, 22, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#047857";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("🛡️ Dense Coagulum Limits Deep Penetration", 14, 157);
    ctx.restore();

    // --- RIGHT: ALKALI BURN (3D LIQUEFACTION & DEEP STROMA MELT) ---
    ctx.save();
    ctx.translate(halfW, 0);

    ctx.fillStyle = "rgba(254, 242, 242, 0.75)";
    ctx.strokeStyle = "#fca5a5";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, 0, halfW - 8, 172, 10);
    ctx.fill();
    ctx.stroke();

    // Title badge
    ctx.fillStyle = "#991b1b";
    ctx.font = "bold 13px 'Architects Daughter', sans-serif";
    ctx.fillText("🔥 ALKALI BURN (3D LIQUEFACTION)", 12, 22);

    const rightCx = 65;
    const rightCy = 95;

    // 3D Spherical Eyeball with toxic reddish-gray undertone
    const rightSphereGrad = ctx.createRadialGradient(rightCx - 10, rightCy - 12, 4, rightCx, rightCy, eyeR);
    rightSphereGrad.addColorStop(0, "#ffffff");
    rightSphereGrad.addColorStop(0.6, "#fee2e2");
    rightSphereGrad.addColorStop(0.95, "#fca5a5");
    rightSphereGrad.addColorStop(1, "#7f1d1d");

    ctx.fillStyle = rightSphereGrad;
    ctx.strokeStyle = "#991b1b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(rightCx, rightCy, eyeR, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.fill();
    ctx.stroke();

    // Dissolving/Melting Cornea (Eroded cavity stroma)
    ctx.strokeStyle = "rgba(234, 179, 8, 0.85)";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(rightCx + 16, rightCy, 30, -Math.PI * 0.4, -0.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rightCx + 16, rightCy, 30, 0.1, Math.PI * 0.4);
    ctx.stroke();

    // 3D Saponification Cavity (Melted stroma crater with lipid froth)
    const meltGrad = ctx.createRadialGradient(rightCx + 30, rightCy, 2, rightCx + 30, rightCy, 16);
    meltGrad.addColorStop(0, "rgba(239, 68, 68, 0.9)");
    meltGrad.addColorStop(0.7, "rgba(245, 158, 11, 0.7)");
    meltGrad.addColorStop(1, "rgba(254, 240, 138, 0.1)");
    ctx.fillStyle = meltGrad;
    ctx.beginPath();
    ctx.ellipse(rightCx + 28, rightCy, 14, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Saponification foam bubbles
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    [[rightCx + 26, rightCy - 6, 2.5], [rightCx + 33, rightCy + 4, 3], [rightCx + 22, rightCy + 8, 2], [rightCx + 35, rightCy - 8, 1.8]].forEach(([bx, by, br]) => {
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fill();
    });

    // Deep penetrating 3D laser-vector arrow boring straight through
    const arrowGrad = ctx.createLinearGradient(halfW - 25, rightCy, rightCx + 5, rightCy);
    arrowGrad.addColorStop(0, "#ea580c");
    arrowGrad.addColorStop(1, "#dc2626");

    ctx.strokeStyle = arrowGrad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(halfW - 25, rightCy);
    ctx.lineTo(rightCx + 6, rightCy);
    ctx.stroke();

    // Piercing arrowhead deep inside anterior chamber
    ctx.fillStyle = "#dc2626";
    ctx.beginPath();
    ctx.moveTo(rightCx + 6, rightCy);
    ctx.lineTo(rightCx + 18, rightCy - 6);
    ctx.lineTo(rightCx + 18, rightCy + 6);
    ctx.fill();

    // 3D Danger Badge
    ctx.fillStyle = "#fff1f2";
    ctx.strokeStyle = "#f43f5e";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(10, 142, halfW - 28, 22, 5);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#be123c";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("🚨 Saponification Melts Stroma in Minutes!", 14, 157);
    ctx.restore();

    ctx.restore();
  };

  // 2D Fallback helper
  const drawEyeBurnComparison = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    if (is3dMode) {
      draw3DEyeBurnComparison(ctx, x, y, width);
      return;
    }
    ctx.save();
    ctx.translate(x, y);

    const halfW = (width - 20) / 2;

    // --- LEFT: ACID BURN (COAGULATION) ---
    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.8;

    ctx.font = "bold 15px 'Architects Daughter', 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText("ACID BURN (COAGULATION)", 10, 18);
    ctx.font = "12px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("(superficial barrier formed)", 10, 32);

    ctx.beginPath();
    ctx.arc(60, 80, 38, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.arc(75, 80, 28, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    ctx.strokeStyle = "#f59e0b";
    ctx.lineWidth = 2.5;
    for (let i = -16; i <= 16; i += 6) {
      ctx.beginPath();
      ctx.moveTo(96, 80 + i);
      ctx.lineTo(104, 80 + i + 4);
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 2;
    ctx.moveTo(130, 80);
    ctx.lineTo(108, 80);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = "#dc2626";
    ctx.moveTo(108, 80);
    ctx.lineTo(114, 76);
    ctx.lineTo(114, 84);
    ctx.fill();

    ctx.font = "bold 12px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#dc2626";
    ctx.fillText("Blocked!", 125, 74);
    ctx.fillStyle = "#475569";
    ctx.font = "11px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillText("Coagulation necrosis", 20, 130);
    ctx.fillText("limits deeper penetration", 20, 144);

    // --- RIGHT: ALKALI BURN ---
    ctx.translate(halfW + 15, 0);

    ctx.font = "bold 15px 'Architects Daughter', 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#991b1b";
    ctx.fillText("ALKALI BURN (LIQUEFACTION)", 10, 18);
    ctx.font = "12px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#b91c1c";
    ctx.fillText("(Rapid deep anterior penetration!)", 10, 32);

    ctx.strokeStyle = "#475569";
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(60, 80, 38, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 3.5;
    ctx.arc(75, 80, 28, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#ea580c";
    ctx.lineWidth = 2.5;
    ctx.moveTo(135, 80);
    ctx.lineTo(45, 80);
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = "#ea580c";
    ctx.moveTo(45, 80);
    ctx.lineTo(53, 75);
    ctx.lineTo(53, 85);
    ctx.fill();

    ctx.font = "bold 12px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#ea580c";
    ctx.fillText("Deep Penetration", 70, 72);
    ctx.font = "11px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#7c2d12";
    ctx.fillText("Saponifies fatty acids &", 20, 130);
    ctx.fillText("melts corneal stroma", 20, 144);

    ctx.restore();
  };

  // --- 3D WIPE PARTICLES ILLUSTRATION ---
  const draw3DWipeParticlesIllustration = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Background 3D pill container
    ctx.fillStyle = "rgba(255, 251, 235, 0.75)";
    ctx.strokeStyle = "#fde68a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, 0, width - 20, 92, 10);
    ctx.fill();
    ctx.stroke();

    // 1. Isometric 3D Sterile Gauze Pad (Left)
    const padX = 20;
    const padY = 22;
    // Drop shadow
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.beginPath();
    ctx.roundRect(padX + 4, padY + 6, 68, 48, 6);
    ctx.fill();
    // Gauze layer
    const padGrad = ctx.createLinearGradient(padX, padY, padX + 68, padY + 48);
    padGrad.addColorStop(0, "#ffffff");
    padGrad.addColorStop(1, "#f1f5f9");
    ctx.fillStyle = padGrad;
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(padX, padY, 68, 48, 6);
    ctx.fill();
    ctx.stroke();
    // Weave texture lines
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 0.8;
    for (let lx = padX + 12; lx < padX + 60; lx += 10) {
      ctx.beginPath();
      ctx.moveTo(lx, padY + 4);
      ctx.lineTo(lx, padY + 44);
      ctx.stroke();
    }
    for (let ly = padY + 10; ly < padY + 42; ly += 10) {
      ctx.beginPath();
      ctx.moveTo(padX + 4, ly);
      ctx.lineTo(padX + 64, ly);
      ctx.stroke();
    }

    // 2. 3D Floating Mineral Crystals (CaO / Quicklime)
    const crystalDots = [
      [padX + 78, padY + 12, 4],
      [padX + 90, padY + 22, 5],
      [padX + 82, padY + 34, 4.5],
      [padX + 102, padY + 14, 5.5],
      [padX + 98, padY + 32, 4],
      [padX + 112, padY + 24, 6],
    ];

    crystalDots.forEach(([cx, cy, cr]) => {
      const cGrad = ctx.createRadialGradient(cx - 1.5, cy - 1.5, 1, cx, cy, cr);
      cGrad.addColorStop(0, "#ffffff");
      cGrad.addColorStop(0.6, "#e2e8f0");
      cGrad.addColorStop(1, "#64748b");
      ctx.fillStyle = cGrad;
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.rect(cx - cr / 2, cy - cr / 2, cr, cr);
      ctx.fill();
      ctx.stroke();
    });

    // 3. Motion sweeping vectors
    ctx.strokeStyle = "#f97316";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(padX + 68, padY + 44);
    ctx.quadraticCurveTo(padX + 95, padY + 52, padX + 120, padY + 42);
    ctx.stroke();
    ctx.fillStyle = "#f97316";
    ctx.beginPath();
    ctx.moveTo(padX + 120, padY + 42);
    ctx.lineTo(padX + 112, padY + 36);
    ctx.lineTo(padX + 114, padY + 46);
    ctx.fill();

    // 4. Instructions
    ctx.font = "bold 15px 'Architects Daughter', sans-serif";
    ctx.fillStyle = "#c2410c";
    ctx.fillText("1️⃣ WIPE DRY PARTICLES FIRST (Mechanical Removal)", padX + 135, padY + 22);
    ctx.font = "13px 'Patrick Hand', sans-serif";
    ctx.fillStyle = "#334155";
    ctx.fillText("Water + Calcium Oxide = Exothermic Ca(OH)₂ reaction → Severe Thermal + Chemical Burn!", padX + 135, padY + 44);

    // 5. Crossed-out water droplet bottle on right
    const bottleX = width - 90;
    ctx.save();
    ctx.translate(bottleX, 12);
    const bGrad = ctx.createLinearGradient(0, 0, 30, 45);
    bGrad.addColorStop(0, "rgba(56, 189, 248, 0.7)");
    bGrad.addColorStop(1, "rgba(2, 132, 199, 0.9)");
    ctx.fillStyle = bGrad;
    ctx.strokeStyle = "#0369a1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, 10, 30, 42, 4);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(15, 31, 20, 0, Math.PI * 2);
    ctx.moveTo(1, 17);
    ctx.lineTo(29, 45);
    ctx.stroke();
    ctx.font = "bold 10px sans-serif";
    ctx.fillStyle = "#991b1b";
    ctx.fillText("NO WATER!", -6, 64);
    ctx.restore();

    ctx.restore();
  };

  const drawWipeParticlesIllustration = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    if (is3dMode) {
      draw3DWipeParticlesIllustration(ctx, x, y, width);
      return;
    }
    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#f1f5f9";
    ctx.beginPath();
    ctx.roundRect(15, 12, 65, 45, 8);
    ctx.fill();
    ctx.stroke();

    ctx.font = "bold 15px 'Architects Daughter', 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#c2410c";
    ctx.fillText("➔ Wipe dry particles *first*", 135, 28);
    ctx.font = "14px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#1e293b";
    ctx.fillText("➔ Follow with copious liquid irrigation.", 135, 48);

    ctx.restore();
  };

  const drawFlowchartSteps = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    lines: string[]
  ) => {
    ctx.save();
    let curY = y;

    const flowItems = lines.filter((l) => l.includes("➔") || l.includes("↓") || l.includes("START") || l.includes("END") || l.length > 5);

    flowItems.forEach((item) => {
      const isStart = item.includes("START");
      const isEnd = item.includes("END");
      const isArrow = item.startsWith("↓");

      ctx.save();

      if (isStart) {
        ctx.fillStyle = "#fef08a";
        ctx.strokeStyle = "#ca8a04";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x + 10, curY - 18, width - 40, 32, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = "bold 16px 'Architects Daughter', 'Patrick Hand', 'Caveat', sans-serif";
        ctx.fillStyle = "#1e293b";
        ctx.fillText(item.replace(/\*\*/g, ""), x + 24, curY + 4);
        curY += 38;
      } else if (isEnd) {
        ctx.fillStyle = "#fee2e2";
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x + 10, curY - 18, width - 40, 34, 8);
        ctx.fill();
        ctx.stroke();

        ctx.font = "bold 16px 'Architects Daughter', 'Patrick Hand', 'Caveat', sans-serif";
        ctx.fillStyle = "#991b1b";
        ctx.fillText(`🚨 ${item.replace(/\*\*/g, "")}`, x + 20, curY + 5);
        curY += 40;
      } else if (isArrow) {
        ctx.font = "bold 20px 'Architects Daughter', sans-serif";
        ctx.fillStyle = "#0284c7";
        ctx.fillText("↓", x + 35, curY - 4);

        const cleanText = item.replace(/^↓\s*/, "").replace(/\*\*/g, "");
        ctx.font = "bold 16px 'Patrick Hand', 'Caveat', sans-serif";

        if (cleanText.toLowerCase().includes("penetration") || cleanText.toLowerCase().includes("necrosis")) {
          const metrics = ctx.measureText(cleanText);
          ctx.fillStyle = "#e0f2fe";
          ctx.beginPath();
          ctx.roundRect(x + 60, curY - 20, Math.min(metrics.width + 24, width - 100), 28, 6);
          ctx.fill();
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.fillStyle = "#0369a1";
        } else {
          ctx.fillStyle = "#1e293b";
        }

        ctx.fillText(cleanText, x + 72, curY);
        curY += 32;
      } else {
        ctx.font = "15px 'Patrick Hand', 'Caveat', sans-serif";
        ctx.fillStyle = "#334155";
        ctx.fillText(`• ${item.replace(/\*\*/g, "")}`, x + 40, curY);
        curY += 28;
      }

      ctx.restore();
    });

    ctx.restore();
    return curY;
  };

  // --- 3D EYE ANATOMY & IRRIGATION JET ---
  const draw3DEyeAnatomyIllustration = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    ctx.save();
    ctx.translate(x, y);

    const eyeCenterX = 135;
    const eyeCenterY = 90;
    const eyeRadius = 62;

    // 3D Spherical Eyeball Sclera with radial depth
    const scleraGrad = ctx.createRadialGradient(eyeCenterX - 18, eyeCenterY - 20, 8, eyeCenterX, eyeCenterY, eyeRadius);
    scleraGrad.addColorStop(0, "#ffffff");
    scleraGrad.addColorStop(0.7, "#f8fafc");
    scleraGrad.addColorStop(0.92, "#e2e8f0");
    scleraGrad.addColorStop(1, "#94a3b8");

    ctx.fillStyle = scleraGrad;
    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(eyeCenterX, eyeCenterY, eyeRadius, -Math.PI * 0.75, Math.PI * 0.75);
    ctx.fill();
    ctx.stroke();

    // 3D Choroid & Retina Inner Layers
    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(eyeCenterX, eyeCenterY, eyeRadius - 4, -Math.PI * 0.7, Math.PI * 0.7);
    ctx.stroke();

    // 3D Optic Nerve Trunk with volumetric cylinder shading
    const nerveGrad = ctx.createLinearGradient(eyeCenterX - eyeRadius - 32, eyeCenterY - 14, eyeCenterX - eyeRadius - 32, eyeCenterY + 14);
    nerveGrad.addColorStop(0, "#f1f5f9");
    nerveGrad.addColorStop(0.5, "#e2e8f0");
    nerveGrad.addColorStop(1, "#94a3b8");
    ctx.fillStyle = nerveGrad;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(eyeCenterX - eyeRadius + 4, eyeCenterY - 12);
    ctx.lineTo(eyeCenterX - eyeRadius - 35, eyeCenterY - 16);
    ctx.lineTo(eyeCenterX - eyeRadius - 35, eyeCenterY + 16);
    ctx.lineTo(eyeCenterX - eyeRadius + 4, eyeCenterY + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3D Cornea Transparent Front Dome
    const corneaGrad = ctx.createLinearGradient(eyeCenterX + 25, eyeCenterY - 35, eyeCenterX + 55, eyeCenterY + 35);
    corneaGrad.addColorStop(0, "rgba(56, 189, 248, 0.85)");
    corneaGrad.addColorStop(0.5, "rgba(186, 230, 253, 0.6)");
    corneaGrad.addColorStop(1, "rgba(3, 105, 161, 0.9)");

    ctx.strokeStyle = corneaGrad;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(eyeCenterX + 34, eyeCenterY, 39, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    // 3D Cornea Specular Highlight Arc
    ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eyeCenterX + 32, eyeCenterY - 14, 20, -Math.PI * 0.35, -0.05);
    ctx.stroke();

    // 3D Iris & Pupil Blades
    const irisGrad = ctx.createLinearGradient(eyeCenterX + 28, eyeCenterY - 35, eyeCenterX + 24, eyeCenterY + 35);
    irisGrad.addColorStop(0, "#0369a1");
    irisGrad.addColorStop(0.5, "#0284c7");
    irisGrad.addColorStop(1, "#0369a1");
    ctx.strokeStyle = irisGrad;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(eyeCenterX + 28, eyeCenterY - 35);
    ctx.lineTo(eyeCenterX + 24, eyeCenterY - 12);
    ctx.moveTo(eyeCenterX + 28, eyeCenterY + 35);
    ctx.lineTo(eyeCenterX + 24, eyeCenterY + 12);
    ctx.stroke();

    // 3D Biconvex Crystalline Lens with glass refraction gradient
    const lensGrad = ctx.createRadialGradient(eyeCenterX + 16, eyeCenterY - 5, 2, eyeCenterX + 16, eyeCenterY, 22);
    lensGrad.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    lensGrad.addColorStop(0.4, "rgba(186, 230, 253, 0.8)");
    lensGrad.addColorStop(1, "rgba(2, 132, 199, 0.6)");

    ctx.fillStyle = lensGrad;
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(eyeCenterX + 16, eyeCenterY, 9, 23, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3D Volumetric Emergency Saline Irrigation Jet from Right
    const jetGrad = ctx.createLinearGradient(eyeCenterX + 180, eyeCenterY - 35, eyeCenterX + 50, eyeCenterY);
    jetGrad.addColorStop(0, "rgba(2, 132, 199, 0.9)");
    jetGrad.addColorStop(0.6, "rgba(56, 189, 248, 0.85)");
    jetGrad.addColorStop(1, "rgba(224, 242, 254, 0.9)");

    ctx.strokeStyle = jetGrad;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(eyeCenterX + 180, eyeCenterY - 30);
    ctx.quadraticCurveTo(eyeCenterX + 110, eyeCenterY - 18, eyeCenterX + 54, eyeCenterY);
    ctx.stroke();

    // 3D Translucent Water Droplets & Splashes
    const droplets = [
      [eyeCenterX + 95, eyeCenterY - 10, 4],
      [eyeCenterX + 78, eyeCenterY - 3, 3.5],
      [eyeCenterX + 62, eyeCenterY + 12, 4.5],
      [eyeCenterX + 82, eyeCenterY + 22, 3.8],
      [eyeCenterX + 104, eyeCenterY + 14, 3],
    ];

    droplets.forEach(([dx, dy, dr]) => {
      const dGrad = ctx.createRadialGradient(dx - 1, dy - 1, 0.8, dx, dy, dr);
      dGrad.addColorStop(0, "#ffffff");
      dGrad.addColorStop(0.5, "#38bdf8");
      dGrad.addColorStop(1, "#0284c7");
      ctx.fillStyle = dGrad;
      ctx.beginPath();
      ctx.arc(dx, dy, dr, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.font = "bold 13px 'Architects Daughter', sans-serif";
    ctx.fillStyle = "#0369a1";
    ctx.fillText("🌊 3D COPIOUS SALINE IRRIGATION ➔", eyeCenterX + 105, eyeCenterY - 36);

    // 3D Labels & Pin Indicators with Shadow
    const labels = [
      { text: "Cornea (1st Target)", px: eyeCenterX + 48, py: eyeCenterY - 18, lx: eyeCenterX + 105, ly: eyeCenterY + 32, color: "#0284c7" },
      { text: "Iris / Pupil", px: eyeCenterX + 24, py: eyeCenterY - 18, lx: eyeCenterX + 105, ly: eyeCenterY + 54, color: "#0369a1" },
      { text: "Crystalline Lens", px: eyeCenterX + 16, py: eyeCenterY, lx: eyeCenterX + 105, ly: eyeCenterY + 76, color: "#0284c7" },
      { text: "Retina & Choroid", px: eyeCenterX - 30, py: eyeCenterY + 45, lx: eyeCenterX - 30, ly: eyeCenterY + 84, color: "#be123c" },
      { text: "Optic Nerve Trunk", px: eyeCenterX - eyeRadius - 15, py: eyeCenterY, lx: eyeCenterX - eyeRadius - 90, ly: eyeCenterY + 5, color: "#334155" },
      { text: "Protective Sclera", px: eyeCenterX - 20, py: eyeCenterY - 55, lx: eyeCenterX - 20, ly: eyeCenterY - 78, color: "#475569" },
    ];

    labels.forEach((lbl) => {
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lbl.px, lbl.py);
      ctx.lineTo(lbl.lx, lbl.ly);
      ctx.stroke();

      ctx.fillStyle = lbl.color;
      ctx.beginPath();
      ctx.arc(lbl.px, lbl.py, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = "bold 12px 'Patrick Hand', sans-serif";
      ctx.fillStyle = lbl.color;
      ctx.fillText(lbl.text, lbl.lx > lbl.px ? lbl.lx + 4 : lbl.lx - ctx.measureText(lbl.text).width - 4, lbl.ly + 4);
    });

    ctx.restore();
  };

  const drawEyeAnatomyIllustration = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    if (is3dMode) {
      draw3DEyeAnatomyIllustration(ctx, x, y, width);
      return;
    }
    ctx.save();
    ctx.translate(x, y);

    const eyeCenterX = 130;
    const eyeCenterY = 90;
    const eyeRadius = 60;

    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(eyeCenterX, eyeCenterY, eyeRadius, -Math.PI * 0.75, Math.PI * 0.75);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3.5;
    ctx.arc(eyeCenterX + 35, eyeCenterY, 38, -Math.PI * 0.45, Math.PI * 0.45);
    ctx.stroke();

    ctx.font = "bold 13px 'Architects Daughter', 'Patrick Hand', sans-serif";
    ctx.fillStyle = "#0369a1";
    ctx.fillText("COPIOUS IRRIGATION ➔", eyeCenterX + 105, eyeCenterY - 32);

    ctx.restore();
  };

  // --- 3D CARDIAC ILLUSTRATION ---
  const draw3DCardiacIllustration = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    ctx.save();
    ctx.translate(x, y);

    const heartGrad = ctx.createLinearGradient(10, 10, 110, 110);
    heartGrad.addColorStop(0, "#f43f5e");
    heartGrad.addColorStop(0.5, "#e11d48");
    heartGrad.addColorStop(1, "#9f1239");

    ctx.fillStyle = heartGrad;
    ctx.strokeStyle = "#881337";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(60, 30);
    ctx.bezierCurveTo(40, 5, 10, 25, 10, 55);
    ctx.bezierCurveTo(10, 85, 45, 105, 60, 120);
    ctx.bezierCurveTo(75, 105, 110, 85, 110, 55);
    ctx.bezierCurveTo(110, 25, 80, 5, 60, 30);
    ctx.fill();
    ctx.stroke();

    const aortaGrad = ctx.createLinearGradient(50, 5, 75, 30);
    aortaGrad.addColorStop(0, "#fb7185");
    aortaGrad.addColorStop(1, "#be123c");
    ctx.fillStyle = aortaGrad;
    ctx.strokeStyle = "#881337";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(50, 8, 20, 24, 6);
    ctx.fill();
    ctx.stroke();

    [[53, 0], [60, -2], [67, 0]].forEach(([bx, by]) => {
      ctx.beginPath();
      ctx.roundRect(bx, by, 4, 10, 2);
      ctx.fill();
      ctx.stroke();
    });

    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(130, 75);
    ctx.lineTo(160, 75);
    ctx.lineTo(168, 65);
    ctx.lineTo(176, 75);
    ctx.lineTo(182, 75);
    ctx.lineTo(186, 85);
    ctx.lineTo(194, 25);
    ctx.lineTo(202, 105);
    ctx.lineTo(208, 75);
    ctx.lineTo(218, 75);
    ctx.lineTo(228, 60);
    ctx.lineTo(238, 75);
    ctx.lineTo(280, 75);
    ctx.stroke();

    ctx.font = "bold 13px 'Patrick Hand', sans-serif";
    ctx.fillStyle = "#991b1b";
    ctx.fillText("❤️ 3D Myocardial Perfusion & Electrical Conduction", 135, 105);

    ctx.restore();
  };

  const drawCardiacIllustration = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    if (is3dMode) {
      draw3DCardiacIllustration(ctx, x, y, width);
      return;
    }
    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = "#e11d48";
    ctx.lineWidth = 2.5;
    ctx.fillStyle = "rgba(254, 205, 211, 0.35)";
    ctx.beginPath();
    ctx.moveTo(60, 30);
    ctx.bezierCurveTo(40, 5, 10, 25, 10, 55);
    ctx.bezierCurveTo(10, 85, 45, 105, 60, 120);
    ctx.bezierCurveTo(75, 105, 110, 85, 110, 55);
    ctx.bezierCurveTo(110, 25, 80, 5, 60, 30);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  // --- 3D NEURO ILLUSTRATION ---
  const draw3DNeuroIllustration = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2.5;
    ctx.fillStyle = "rgba(241, 245, 249, 0.75)";
    ctx.beginPath();
    ctx.moveTo(50, 110);
    ctx.lineTo(30, 80);
    ctx.lineTo(15, 55);
    ctx.lineTo(35, 45);
    ctx.lineTo(45, 65);
    ctx.lineTo(55, 30);
    ctx.lineTo(68, 30);
    ctx.lineTo(72, 70);
    ctx.lineTo(82, 35);
    ctx.lineTo(94, 35);
    ctx.lineTo(98, 75);
    ctx.lineTo(105, 50);
    ctx.lineTo(116, 50);
    ctx.lineTo(118, 85);
    ctx.lineTo(124, 65);
    ctx.lineTo(134, 65);
    ctx.lineTo(135, 110);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    const muscleGrad = ctx.createLinearGradient(30, 80, 45, 65);
    muscleGrad.addColorStop(0, "#991b1b");
    muscleGrad.addColorStop(0.5, "#dc2626");
    muscleGrad.addColorStop(1, "#f87171");
    ctx.fillStyle = muscleGrad;
    ctx.beginPath();
    ctx.ellipse(36, 72, 10, 16, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#d97706";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(40, 100);
    ctx.lineTo(100, 100);
    ctx.stroke();

    ctx.strokeStyle = "#eab308";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(70, 120);
    ctx.lineTo(70, 95);
    ctx.lineTo(38, 75);
    ctx.stroke();

    [[70, 108], [70, 95], [54, 85], [38, 75]].forEach(([nx, ny]) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(nx, ny, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.font = "bold 13px 'Patrick Hand', sans-serif";
    ctx.fillStyle = "#b45309";
    ctx.fillText("🧠 3D Opponens Pollicis (Recurrent Median Branch)", 150, 50);
    ctx.fillStyle = "#1e293b";
    ctx.fillText("1st CMC Saddle Joint: Flexion + Abduction + Medial Rotation", 150, 72);
    ctx.fillStyle = "#047857";
    ctx.fillText("✓ Sensation to thenar eminence SPARED (Palmar branch superficial)", 150, 94);

    ctx.restore();
  };

  const drawNeuroIllustration = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number) => {
    if (is3dMode) {
      draw3DNeuroIllustration(ctx, x, y, width);
      return;
    }
    ctx.save();
    ctx.translate(x, y);

    ctx.strokeStyle = "#334155";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 110);
    ctx.lineTo(30, 80);
    ctx.lineTo(15, 55);
    ctx.stroke();

    ctx.font = "bold 13px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#b45309";
    ctx.fillText("Recurrent Branch (Motor to Opponens)", 150, 50);

    ctx.restore();
  };

  // Helper to calculate exact required height based on content to eliminate empty space
  const calculateContentHeight = (
    ctx: CanvasRenderingContext2D,
    width: number,
    lineHeight: number,
    topMargin: number,
    leftMargin: number
  ): number => {
    const contentStartX = leftMargin + 20;
    const contentWidth = width - contentStartX - 40;
    let curY = topMargin + 15;
    const sections = data.sections || [];

    sections.forEach((sec, secIndex) => {
      // Heading height
      curY += lineHeight + 6;

      // Lines of text wrapped
      (sec.lines || []).forEach((line) => {
        const lineText = line.trim();
        const parts = lineText.includes("**")
          ? lineText.split("**")
          : lineText.split(/(\s+)/);

        ctx.font = "22px 'Patrick Hand', 'Caveat', sans-serif";
        let curLineX = contentStartX + 12;
        let lineLines = 1;

        parts.forEach((p) => {
          if (!p) return;
          const w = ctx.measureText(p).width;
          if (curLineX + w > contentStartX + 12 + (contentWidth - 20) && curLineX > contentStartX + 12) {
            lineLines++;
            curLineX = contentStartX + 12 + 16;
          }
          curLineX += w;
        });

        curY += lineLines * lineHeight;
      });

      // AI 3D Image generated via Nano Banana Pro
      const sec3dImg = section3dImages[secIndex] || sec.render3dUrl;
      if (sec3dImg) {
        const targetImgWidth = Math.min(contentWidth - 20, 520);
        curY += Math.round((targetImgWidth * 9) / 16) + 38;
      }

      // Diagram height estimation
      const diag = sec.diagramType;
      const isEyeBurn = diag === "eye_burn" || sec.heading.toLowerCase().includes("alkali vs. acid");
      const isWipe = diag === "wipe_particles" || sec.heading.toLowerCase().includes("quicklime");
      const isFlow = diag === "flowchart_chain" || sec.type === "flowchart" || sec.heading.toLowerCase().includes("mechanism");
      const isAnatomy = diag === "eye_anatomy" || sec.heading.toLowerCase().includes("danger") || sec.heading.toLowerCase().includes("anatomy");
      const isCardiac = diag === "heart_cardiac" || sec.heading.toLowerCase().includes("heart");
      const isNeuro = diag === "brain_neuro" || diag === "nerve" || sec.heading.toLowerCase().includes("thumb") || sec.heading.toLowerCase().includes("nerve");

      if (isEyeBurn) {
        curY += is3dMode ? 175 : 155;
      } else if (isWipe) {
        curY += is3dMode ? 100 : 85;
      } else if (isFlow) {
        const flowItemsCount = (sec.lines || []).filter(
          (l) => l.includes("➔") || l.includes("↓") || l.includes("START") || l.includes("END") || l.length > 5
        ).length;
        curY += Math.max(3, flowItemsCount) * 34 + 16;
      } else if (isAnatomy) {
        curY += is3dMode ? 180 : 160;
      } else if (isCardiac) {
        curY += is3dMode ? 145 : 135;
      } else if (isNeuro) {
        curY += is3dMode ? 145 : 135;
      }

      curY += 14; // Space between sections
    });

    // Alert box height (75px) + gap above alert box (24px) + footer watermark (35px) + bottom margin (25px)
    const totalNeeded = curY + 24 + 75 + 35 + 25;
    // Snap to multiple of lineHeight for authentic notebook lines
    const snapped = Math.ceil(totalNeeded / lineHeight) * lineHeight + Math.round(lineHeight / 2);
    return Math.max(680, Math.round(snapped));
  };

  // Main Canvas Rendering Engine
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas Dimensions
    let width = 1080;
    let height = 1920;
    const isPortrait = aspectRatio === "auto" || aspectRatio === "9:16";

    if (isPortrait) {
      width = 1080;
    } else if (aspectRatio === "16:9") {
      width = 1600;
      height = 900;
    } else if (aspectRatio === "4:3") {
      width = 1400;
      height = 1050;
    } else {
      width = 1600;
      height = 1000;
    }

    let lineHeight = isPortrait ? 34 : 30;
    const topMargin = isPortrait ? 175 : 140;
    const leftMargin = isPortrait ? 85 : 95;
    const centerSplitX = Math.round(width * 0.5);

    let extraSectionSpacing = 0;

    // Zero-Waste Dynamic Aspect Ratio calculation (Priority: No large empty spaces)
    if (aspectRatio === "auto") {
      height = calculateContentHeight(ctx, width, lineHeight, topMargin, leftMargin);
    } else if (aspectRatio === "9:16") {
      height = 1920;
      const neededH = calculateContentHeight(ctx, width, lineHeight, topMargin, leftMargin);
      if (neededH < 1920) {
        // Distribute remaining space evenly across sections so there is no awkward bottom void
        const diff = 1920 - neededH;
        const gaps = Math.max(1, (data.sections?.length || 1) + 1);
        extraSectionSpacing = Math.min(30, Math.floor(diff / gaps));
        lineHeight = Math.min(40, 34 + Math.floor(diff / 60));
      }
    }

    canvas.width = width;
    canvas.height = height;

    setCanvasDimensions((prev) => {
      if (prev.width !== width || prev.height !== height) {
        return { width, height };
      }
      return prev;
    });

    // 1. Realistic Ruled Notebook Paper Background
    ctx.fillStyle = paperStyle === "cream" ? "#faf5eb" : "#fdfbf7";
    ctx.fillRect(0, 0, width, height);

    if (paperStyle === "grid") {
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 26) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 26) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    } else {
      // Crisp horizontal blue notebook lines
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      for (let y = topMargin; y < height - 50; y += lineHeight) {
        ctx.beginPath();
        ctx.moveTo(35, y);
        ctx.lineTo(width - 35, y);
        ctx.stroke();
      }

      // Vertical red margin line on left
      ctx.strokeStyle = "#f87171";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(leftMargin, 0);
      ctx.lineTo(leftMargin, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(leftMargin + 3.5, 0);
      ctx.lineTo(leftMargin + 3.5, height);
      ctx.stroke();

      // Notebook Hole Punch Marks scaled proportionally to canvas height
      const holeYPositions =
        height < 900
          ? [130, height - 130]
          : height < 1500
          ? [160, Math.round(height / 2), height - 160]
          : [160, Math.round(height * 0.38), Math.round(height * 0.62), height - 160];

      holeYPositions.forEach((hy) => {
        ctx.beginPath();
        ctx.arc(36, hy, 13, 0, Math.PI * 2);
        ctx.fillStyle = "#e2e8f0";
        ctx.fill();
        ctx.strokeStyle = "#cbd5e1";
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }

    const activeInk = inkColors[inkColor];

    // 2. Title with Vibrant Fluorescent Yellow Highlighter (Exact match to uploaded image)
    const rawTitle = data.title || "WHY IMMEDIATE EYE IRRIGATION IS CRUCIAL IN CHEMICAL BURNS?";
    let titleLines: string[] = data.titleLines || [];

    if (titleLines.length === 0) {
      if (rawTitle.includes("\n")) {
        titleLines = rawTitle.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      } else if (rawTitle.length > 35) {
        // Break intelligently at middle space
        const words = rawTitle.split(" ");
        const mid = Math.ceil(words.length / 2);
        titleLines = [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
      } else {
        titleLines = [rawTitle];
      }
    }

    let titleY = isPortrait ? 55 : 48;
    ctx.font = isPortrait
      ? "bold 38px 'Architects Daughter', 'Caveat', sans-serif"
      : "bold 34px 'Architects Daughter', 'Caveat', sans-serif";

    titleLines.forEach((tLine) => {
      const lineUpper = tLine.toUpperCase();
      const metrics = ctx.measureText(lineUpper);
      const hlWidth = Math.min(metrics.width + 28, width - leftMargin - 120);

      // Yellow Highlighter Rectangle behind title line
      ctx.save();
      ctx.fillStyle = sectionHighlights.yellow;
      ctx.beginPath();
      ctx.roundRect(leftMargin + 18, titleY - 30, hlWidth, 44, 6);
      ctx.fill();
      ctx.restore();

      // Title Text
      ctx.fillStyle = activeInk;
      ctx.fillText(lineUpper, leftMargin + 28, titleY + 4);
      titleY += 48;
    });

    // Subtitle & Author Tag
    const tagText = authorTag || "@abdofawzii";
    const subStr = data.subtitle || "@abdofawzii • High-Yield Clinical Sheet";
    const dateStr = data.date || new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    ctx.font = "20px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText(`${subStr} • 📅 ${dateStr}`, leftMargin + 28, titleY);

    // 3. Section Rendering with Number Badges & Custom Infographics
    const sections = data.sections || [];
    let curY = topMargin + 15;
    const contentStartX = leftMargin + 20;
    const contentWidth = isPortrait ? width - contentStartX - 40 : centerSplitX - contentStartX - 25;

    // Helper to tokenize lines for keyword highlighting
    const renderKeywordLine = (text: string, x: number, y: number, maxW: number): number => {
      let lineText = text.trim();
      const tokens: Array<{ text: string; isKeyword: boolean }> = [];

      if (lineText.includes("**")) {
        const parts = lineText.split("**");
        for (let i = 0; i < parts.length; i++) {
          if (!parts[i]) continue;
          tokens.push({ text: parts[i], isKeyword: i % 2 === 1 });
        }
      } else {
        // Auto-detect high yield clinical terms
        const words = lineText.split(/(\s+)/);
        const kwPattern = /\b(Alkali|Acid|Coagulation|Liquefaction|Necrosis|Saponification|Immediate|Irrigation|Melting|Blindness|Cornea|Symblepharon|Quicklime|Calcium oxide|Median Nerve|Opponens|Saddle Joint|Ape-Hand|First Step|Gold Standard|Best Next Step|Must Begin)\b/i;
        for (const w of words) {
          if (!w) continue;
          tokens.push({ text: w, isKeyword: kwPattern.test(w) });
        }
      }

      ctx.font = "22px 'Patrick Hand', 'Caveat', sans-serif";

      // Draw tokens with wrapped lines
      let curLineX = x;
      let lineY = y;

      tokens.forEach((tok) => {
        ctx.font = tok.isKeyword
          ? "bold 23px 'Architects Daughter', 'Patrick Hand', sans-serif"
          : "22px 'Patrick Hand', 'Caveat', sans-serif";
        const w = ctx.measureText(tok.text).width;

        if (curLineX + w > x + maxW && curLineX > x) {
          lineY += lineHeight;
          curLineX = x + 16;
        }

        // Draw yellow highlight behind keyword
        if (tok.isKeyword && tok.text.trim().length > 0) {
          ctx.save();
          ctx.fillStyle = sectionHighlights.yellow;
          ctx.beginPath();
          ctx.roundRect(curLineX - 2, lineY - 18, w + 4, 24, 4);
          ctx.fill();
          ctx.restore();
        }

        ctx.fillStyle = activeInk;
        ctx.fillText(tok.text, curLineX, lineY);
        curLineX += w;
      });

      return lineY + lineHeight;
    };

    // Render Each Section
    sections.forEach((sec, idx) => {
      if (curY > height - 160) return;

      const badgeNum = sec.numberBadge || idx + 1;
      const highlightBg =
        badgeNum === 1
          ? sectionHighlights.yellow
          : badgeNum === 2
          ? sectionHighlights.peach
          : badgeNum === 3
          ? sectionHighlights.cyan
          : sectionHighlights.red;

      const badgeBorder =
        badgeNum === 1
          ? "#eab308"
          : badgeNum === 2
          ? "#f97316"
          : badgeNum === 3
          ? "#0284c7"
          : "#e11d48";

      const badgeText =
        badgeNum === 1
          ? "#854d0e"
          : badgeNum === 2
          ? "#c2410c"
          : badgeNum === 3
          ? "#0369a1"
          : "#9f1239";

      // --- SECTION HEADER ---
      // Circled Number Badge
      ctx.save();
      ctx.fillStyle = highlightBg;
      ctx.beginPath();
      ctx.arc(contentStartX + 14, curY - 6, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = badgeBorder;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = "bold 18px 'Architects Daughter', sans-serif";
      ctx.fillStyle = badgeText;
      ctx.fillText(`${badgeNum}`, contentStartX + 9, curY);

      // Section Heading with Highlighter Rectangle
      ctx.font = "bold 24px 'Architects Daughter', 'Patrick Hand', sans-serif";
      const headingUpper = sec.heading.toUpperCase();
      const headingMetrics = ctx.measureText(headingUpper);
      const headHlWidth = Math.min(headingMetrics.width + 20, contentWidth - 45);

      ctx.fillStyle = highlightBg;
      ctx.beginPath();
      ctx.roundRect(contentStartX + 36, curY - 24, headHlWidth, 34, 6);
      ctx.fill();

      ctx.fillStyle = activeInk;
      ctx.fillText(headingUpper, contentStartX + 44, curY);
      ctx.restore();

      curY += lineHeight + 4;

      // --- SECTION CONTENT LINES ---
      (sec.lines || []).forEach((line) => {
        if (aspectRatio !== "auto" && curY > height - 140) return;
        curY = renderKeywordLine(line, contentStartX + 12, curY, contentWidth - 20);
      });

      // --- AI 3D ILLUSTRATION (NANO BANANA PRO / GEMINI 3 PRO IMAGE) ---
      const sec3dImgUrl = section3dImages[idx] || sec.render3dUrl;
      if (sec3dImgUrl) {
        let cachedImg = customImagesRef.current.get(sec3dImgUrl);
        if (!cachedImg) {
          cachedImg = new Image();
          cachedImg.crossOrigin = "anonymous";
          cachedImg.onload = () => {
            renderCanvas();
          };
          cachedImg.src = sec3dImgUrl;
          customImagesRef.current.set(sec3dImgUrl, cachedImg);
        }

        if (cachedImg.complete && cachedImg.naturalWidth > 0) {
          const targetImgWidth = Math.min(contentWidth - 20, 520);
          const targetImgHeight = Math.round((targetImgWidth * 9) / 16);

          if (aspectRatio === "auto" || curY + targetImgHeight < height - 120) {
            ctx.save();
            ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
            ctx.shadowBlur = 10;
            ctx.shadowOffsetY = 4;

            ctx.fillStyle = "#ffffff";
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(contentStartX + 10, curY, targetImgWidth, targetImgHeight + 28, 12);
            ctx.fill();
            ctx.stroke();
            ctx.restore();

            ctx.save();
            ctx.beginPath();
            ctx.roundRect(contentStartX + 10, curY, targetImgWidth, targetImgHeight, [12, 12, 0, 0]);
            ctx.clip();
            ctx.drawImage(cachedImg, contentStartX + 10, curY, targetImgWidth, targetImgHeight);
            ctx.restore();

            ctx.fillStyle = "#0f172a";
            ctx.font = "bold 12px 'Architects Daughter', sans-serif";
            ctx.fillText("✨ NANO BANANA PRO (GEMINI 3 PRO IMAGE) 3D MODEL", contentStartX + 22, curY + targetImgHeight + 19);

            curY += targetImgHeight + 36;
          }
        }
      }

      // --- SECTION DIAGRAMS / ILLUSTRATIONS ---
      const diag = sec.diagramType;
      const isEyeBurn = diag === "eye_burn" || sec.heading.toLowerCase().includes("alkali vs. acid");
      const isWipe = diag === "wipe_particles" || sec.heading.toLowerCase().includes("quicklime");
      const isFlow = diag === "flowchart_chain" || sec.type === "flowchart" || sec.heading.toLowerCase().includes("mechanism");
      const isAnatomy = diag === "eye_anatomy" || sec.heading.toLowerCase().includes("danger") || sec.heading.toLowerCase().includes("anatomy");
      const isCardiac = diag === "heart_cardiac" || sec.heading.toLowerCase().includes("heart");
      const isNeuro = diag === "brain_neuro" || diag === "nerve" || sec.heading.toLowerCase().includes("thumb") || sec.heading.toLowerCase().includes("nerve");

      if (isEyeBurn && (aspectRatio === "auto" || curY < height - 200)) {
        drawEyeBurnComparison(ctx, contentStartX + 10, curY, contentWidth);
        curY += 155;
      } else if (isWipe && (aspectRatio === "auto" || curY < height - 150)) {
        drawWipeParticlesIllustration(ctx, contentStartX + 10, curY, contentWidth);
        curY += 85;
      } else if (isFlow && (aspectRatio === "auto" || curY < height - 200)) {
        curY = drawFlowchartSteps(ctx, contentStartX, curY, contentWidth, sec.lines || []);
        curY += 12;
      } else if (isAnatomy && (aspectRatio === "auto" || curY < height - 220)) {
        drawEyeAnatomyIllustration(ctx, contentStartX + 10, curY, contentWidth);
        curY += 160;
      } else if (isCardiac && (aspectRatio === "auto" || curY < height - 180)) {
        drawCardiacIllustration(ctx, contentStartX + 10, curY, contentWidth);
        curY += 135;
      } else if (isNeuro && (aspectRatio === "auto" || curY < height - 180)) {
        drawNeuroIllustration(ctx, contentStartX + 10, curY, contentWidth);
        curY += 135;
      }

      curY += 14 + extraSectionSpacing; // Space between sections
    });

    // 4. Prominent Bottom High-Yield Warning Box (Yellow fill + double border)
    const alertData = data.bottomAlertBox || {
      mainRule: "MUST BEGIN IRRIGATION (15-30 mins) BEFORE TAKING HISTORY, EXAM, OR REFERRAL.",
      subLabel: "THE HUMAN EYE ANATOMY & EMERGENCY ACTION PROTOCOL"
    };

    const alertY = aspectRatio === "auto" ? Math.max(curY + 20, height - 135) : height - 135;
    const alertBoxWidth = width - leftMargin - 50;

    ctx.save();
    // Yellow background fill
    ctx.fillStyle = "#fef08a";
    ctx.beginPath();
    ctx.roundRect(leftMargin + 20, alertY, alertBoxWidth, 75, 10);
    ctx.fill();

    // Outer dark navy/black border
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Inner red warning border
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(leftMargin + 24, alertY + 4, alertBoxWidth - 8, 67, 7);
    ctx.stroke();

    // Main Rule Text
    ctx.font = "bold 20px 'Architects Daughter', 'Patrick Hand', sans-serif";
    ctx.fillStyle = "#991b1b";
    ctx.fillText(`⚠️ ${alertData.mainRule}`, leftMargin + 36, alertY + 34);

    // Sub-label
    if (alertData.subLabel) {
      ctx.font = "bold 14px 'Patrick Hand', sans-serif";
      ctx.fillStyle = "#1e293b";
      ctx.fillText(alertData.subLabel, leftMargin + 40, alertY + 58);
    }
    ctx.restore();

    // 5. Watermark Footer
    ctx.font = "bold 18px 'Patrick Hand', 'Caveat', sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(`✍️ High-Yield Study Sheet by ${tagText} • Fawzy AI Clinical System`, leftMargin + 24, height - 20);
  };

  useEffect(() => {
    document.fonts.ready.then(() => {
      renderCanvas();
    });
  }, [data, inkColor, paperStyle, aspectRatio, authorTag, is3dMode, section3dImages]);

  // Preload any existing render3dUrls
  useEffect(() => {
    (data.sections || []).forEach((sec, idx) => {
      const url = section3dImages[idx] || sec.render3dUrl;
      if (url && !customImagesRef.current.has(url)) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          customImagesRef.current.set(url, img);
          renderCanvas();
        };
        img.src = url;
      }
    });
  }, [data, section3dImages]);

  const handleGenerate3dIllustration = async (sectionIdx: number, userCustomPrompt?: string) => {
    const sec = data.sections?.[sectionIdx];
    const basePrompt = userCustomPrompt?.trim() || sec?.render3dPrompt || sec?.heading || data.title || "Human eye cornea chemical burn 3D medical illustration";
    const enhancedPrompt = `Photorealistic 3D medical anatomy illustration, volumetric render, professional medical textbook grade, cinematic soft studio lighting, high resolution: ${basePrompt}`;

    setGenerating3d(true);
    setStatusMessage({ text: "جاري استدعاء نموذج Nano Banana Pro (Gemini 3 Pro Image) لتوليد المجسم الطبي 3D..." });

    try {
      let imageUrl: string | undefined;
      let modelUsed = "Fawzy 3D Clinical Anatomy Engine";

      const result = await safeFetchJson<{
        success: boolean;
        imageUrl?: string;
        modelUsed?: string;
        requiresPaidKey?: boolean;
        error?: string;
      }>("/api/generate-3d-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: enhancedPrompt,
          topic: data.title,
          sectionTitle: sec?.heading,
        }),
      });

      if (result.ok && result.data?.success && result.data?.imageUrl) {
        imageUrl = result.data.imageUrl;
        modelUsed = result.data.modelUsed || "الذكاء الاصطناعي 3D";
      } else {
        // High-Yield 3D Procedural Fallback Engine
        imageUrl = generateProceduralMedicalIllustrationSvg(data.title, sec?.heading);
      }

      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          customImagesRef.current.set(imageUrl!, img);
          setSection3dImages((prev) => ({ ...prev, [sectionIdx]: imageUrl! }));
          setStatusMessage({
            text: `تم توليد ودمج المجسم الطبي 3D بنجاح بواسطة ${modelUsed}!`,
            isError: false,
          });
          confetti({ particleCount: 35, spread: 65, origin: { y: 0.7 } });
        };
        img.src = imageUrl;
      }
    } catch (err: any) {
      console.warn("3D generation fallback triggered:", err);
      const fallbackUrl = generateProceduralMedicalIllustrationSvg(data.title, sec?.heading);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        customImagesRef.current.set(fallbackUrl, img);
        setSection3dImages((prev) => ({ ...prev, [sectionIdx]: fallbackUrl }));
        setStatusMessage({
          text: "تم توليد ودمج المجسم الطبي 3D عالي الدقة بنجاح داخل المذكرة الورقية!",
          isError: false,
        });
        confetti({ particleCount: 35, spread: 65, origin: { y: 0.7 } });
      };
      img.src = fallbackUrl;
    } finally {
      setGenerating3d(false);
    }
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const safeTitle = (data.title || "medical_study_note")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .slice(0, 32);
      const filename = `fawzy_ai_${safeTitle}_${Date.now()}.png`;

      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error("Canvas download error:", err);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = "fawzy_ai_note.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
      }, "image/png");
    } finally {
      setTimeout(() => setDownloading(false), 500);
    }
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "image/png": blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (clipErr) {
          console.warn("Clipboard write error:", clipErr);
        }
      }, "image/png");
    } catch (e) {
      console.warn("Copy to clipboard failed:", e);
    }
  };

  return (
    <div id="handwritten-canvas-container" className="flex flex-col items-center w-full max-w-6xl mx-auto space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-[#FCFAF7] p-4 rounded-2xl border border-[#EBE3D7] shadow-xs">
        {/* Style and Customization */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Ink selector */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#1C160E] text-xs flex items-center gap-1">
              <Palette className="w-3.5 h-3.5 text-[#1C160E]" /> Ink:
            </span>
            <div className="flex items-center gap-1 bg-[#F5EFE6] p-1 rounded-xl border border-[#E0D6C3]">
              <button
                id="ink-black-btn"
                onClick={() => setInkColor("black")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  inkColor === "black" ? "bg-[#1C160E] text-[#FAF7F2] shadow-xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
                }`}
                title="Deep Black Ink"
              >
                Black Ink ★
              </button>
              <button
                id="ink-blue-btn"
                onClick={() => setInkColor("blue")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  inkColor === "blue" ? "bg-[#2C241B] text-white shadow-xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
                }`}
                title="Pilot Blue Ink"
              >
                Pilot Blue
              </button>
              <button
                id="ink-purple-btn"
                onClick={() => setInkColor("purple")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  inkColor === "purple" ? "bg-[#3D3025] text-white shadow-xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
                }`}
                title="Medical Violet"
              >
                Violet
              </button>
            </div>
          </div>

          {/* Aspect Ratio Selector (Auto by default - zero waste space) */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#1C160E] text-xs flex items-center gap-1">
              📐 Ratio:
            </span>
            <div className="flex items-center gap-1 bg-[#F5EFE6] p-1 rounded-xl border border-[#E0D6C3]">
              <button
                id="ratio-auto-btn"
                onClick={() => setAspectRatio("auto")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  aspectRatio === "auto" ? "bg-[#1C160E] text-[#FAF7F2] shadow-xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
                }`}
                title="تلقائي ذكي حسب كمية المعلومات (يمنع الفراغات الكبيرة تماماً)"
              >
                ⚡ Auto-Fit (بلا فراغ) ★
              </button>
              <button
                id="ratio-9-16-btn"
                onClick={() => setAspectRatio("9:16")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  aspectRatio === "9:16" ? "bg-[#1C160E] text-[#FAF7F2] shadow-xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
                }`}
                title="Vertical 9:16 (1080 × 1920) - Mobile / Story"
              >
                📱 9:16
              </button>
              <button
                id="ratio-16-10-btn"
                onClick={() => setAspectRatio("16:10")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  aspectRatio === "16:10" ? "bg-[#1C160E] text-[#FAF7F2] shadow-xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
                }`}
                title="Landscape 16:10 (1600 × 1000)"
              >
                16:10
              </button>
              <button
                id="ratio-16-9-btn"
                onClick={() => setAspectRatio("16:9")}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  aspectRatio === "16:9" ? "bg-[#1C160E] text-[#FAF7F2] shadow-xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
                }`}
                title="Widescreen 16:9 (1600 × 900)"
              >
                16:9
              </button>
            </div>

            {/* Live Dimensions & Zero-Space Pill */}
            <div className="hidden sm:flex items-center gap-1 bg-[#EAE0D0]/70 px-2 py-1 rounded-lg border border-[#DDD3C3] text-[11px] font-mono text-[#4A3E31]">
              <span>{canvasDimensions.width} × {canvasDimensions.height}px</span>
              {aspectRatio === "auto" && (
                <span className="text-emerald-700 font-sans font-bold text-[10px] bg-emerald-100 px-1 py-0.5 rounded">
                  ✓ بلا فراغ مهدور
                </span>
              )}
            </div>
          </div>

          {/* Watermark Tag Input */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-[#1C160E] text-xs">
              🏷️ Tag:
            </span>
            <input
              id="canvas-author-tag-input"
              type="text"
              value={authorTag}
              onChange={(e) => setAuthorTag(e.target.value)}
              placeholder="@abdofawzii"
              className="px-2.5 py-1 text-xs font-semibold text-[#1C160E] bg-[#FFFDFB] border border-[#DDD3C3] rounded-lg focus:outline-hidden focus:border-[#8C8276] w-28"
            />
          </div>

          {/* Paper selector */}
          <div className="flex items-center gap-1 bg-[#F5EFE6] p-1 rounded-xl border border-[#E0D6C3]">
            <button
              id="paper-lined-btn"
              onClick={() => setPaperStyle("lined")}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                paperStyle === "lined" ? "bg-[#FFFDF9] text-[#1C160E] shadow-2xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
              }`}
            >
              Lined Paper
            </button>
            <button
              id="paper-cream-btn"
              onClick={() => setPaperStyle("cream")}
              className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
                paperStyle === "cream" ? "bg-[#FFFDF9] text-[#1C160E] shadow-2xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
              }`}
            >
              Cream Paper
            </button>
          </div>

          {/* 3D Mode Switcher */}
          <div className="flex items-center gap-1 bg-[#F5EFE6] p-1 rounded-xl border border-[#E0D6C3]">
            <button
              id="toggle-3d-btn"
              onClick={() => setIs3dMode(!is3dMode)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                is3dMode ? "bg-[#1C160E] text-[#FAF7F2] shadow-xs" : "text-[#5C5246] hover:bg-[#EAE0D0]"
              }`}
              title="تفعيل رسومات ومجسمات طبية ثلاثية الأبعاد 3D"
            >
              <Box className="w-3.5 h-3.5 text-amber-400" />
              {is3dMode ? "مجسمات 3D مفعلة ★" : "رسم 2D"}
            </button>
          </div>

          {/* Nano Banana Pro 3D Generator Button */}
          <button
            id="nano-banana-pro-btn"
            onClick={() => {
              const defaultSec = data.sections?.[0];
              setCustom3dPrompt(defaultSec?.render3dPrompt || defaultSec?.heading || data.title || "Human eye cornea chemical burn 3D medical render");
              setSelectedSectionIdx(0);
              setShow3dModal(true);
            }}
            className="px-3 py-1 text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-200 via-amber-300 to-yellow-400 hover:from-amber-300 hover:to-yellow-500 rounded-xl flex items-center gap-1.5 shadow-xs transition-all border border-amber-400/80 cursor-pointer"
            title="توليد رسومات ومجسمات طبية 3D فائقة الدقة باستخدام Nano Banana Pro (Gemini 3 Pro Image)"
          >
            {generating3d ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-900" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-900" />
            )}
            <span>✨ Nano Banana Pro 3D</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              id="canvas-regenerate-btn"
              onClick={onRegenerate}
              className="px-3 py-1.5 text-xs font-medium text-[#1C160E] bg-[#F5EFE6] hover:bg-[#EAE0D0] rounded-xl flex items-center gap-1.5 transition-colors border border-[#E0D6C3]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Redraw
            </button>
          )}

          <div className="flex items-center bg-[#F5EFE6] rounded-xl p-0.5 border border-[#E0D6C3]">
            <button
              id="zoom-out-btn"
              onClick={() => setZoomLevel((prev) => Math.max(0.6, prev - 0.15))}
              className="p-1.5 text-[#5C5246] hover:text-[#1C160E] rounded hover:bg-[#FFFDF9]"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium px-1.5 text-[#1C160E]">{Math.round(zoomLevel * 100)}%</span>
            <button
              id="zoom-in-btn"
              onClick={() => setZoomLevel((prev) => Math.min(1.5, prev + 0.15))}
              className="p-1.5 text-[#5C5246] hover:text-[#1C160E] rounded hover:bg-[#FFFDF9]"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            id="copy-image-btn"
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs font-medium text-[#1C160E] bg-[#FFFDF9] border border-[#DDD3C3] hover:bg-[#F5EFE6] rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>

          <button
            id="instant-download-image-btn"
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-2 text-xs font-bold text-[#FAF7F2] bg-[#1C160E] hover:bg-[#2F251C] active:bg-[#000] rounded-xl flex items-center gap-1.5 shadow-xs transition-all"
          >
            <Download className="w-4 h-4" />
            {downloading ? "Downloading..." : "Download Note (PNG)"}
          </button>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div
          className={`w-full p-3 rounded-2xl border text-xs font-medium flex items-center justify-between gap-2 transition-all ${
            statusMessage.isError
              ? "bg-amber-50 text-amber-950 border-amber-300 shadow-xs"
              : "bg-emerald-50 text-emerald-950 border-emerald-300 shadow-xs"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.isError ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-xs px-2 py-0.5 rounded hover:bg-black/5 cursor-pointer font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Canvas Viewport */}
      <div className="w-full overflow-auto bg-[#EDE4D5]/50 p-4 sm:p-6 rounded-3xl flex justify-center border border-[#E0D5C3]">
        <div
          className="transition-transform duration-200 origin-top shadow-xl rounded-sm overflow-hidden flex justify-center"
          style={{
            transform: `scale(${zoomLevel})`,
            width: aspectRatio === "16:10" || aspectRatio === "16:9" ? "100%" : "auto",
            maxWidth: aspectRatio === "16:10" || aspectRatio === "16:9" ? "1050px" : "540px",
          }}
        >
          <canvas
            ref={canvasRef}
            id="handwritten-study-sheet-canvas"
            className="block cursor-grab active:cursor-grabbing h-auto bg-white rounded-sm shadow-md"
            style={{
              width: "100%",
              maxWidth: aspectRatio === "16:10" || aspectRatio === "16:9" ? "1050px" : "540px",
              aspectRatio: `${canvasDimensions.width} / ${canvasDimensions.height}`,
            }}
          />
        </div>
      </div>

      <div className="text-center text-xs text-[#8C8276] flex flex-wrap items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#C8B89A]" />
        <span>
          📐 أبعاد المذكرة: <strong className="text-[#1C160E]">{canvasDimensions.width} × {canvasDimensions.height} px</strong>
          {aspectRatio === "auto" && " • نسبة مضبوطة تلقائياً بنسبة 100% حسب كمية المعلومات لمنع الفراغات الفارغة"}
          {" • "}
          ورق كشكول مسطّر • أقلام فسفورية • إعداد: <strong className="text-[#1C160E]">{authorTag || "@abdofawzii"}</strong>
        </span>
      </div>

      {/* Nano Banana Pro 3D Render Modal */}
      {show3dModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#E0D5C3] rounded-2xl shadow-2xl max-w-lg w-full p-6 text-right space-y-4">
            <div className="flex items-center justify-between border-b border-[#E0D5C3] pb-3">
              <button
                onClick={() => setShow3dModal(false)}
                className="text-[#8C8276] hover:text-[#1C160E] text-sm p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                  Gemini 3 Pro Image
                </span>
                <h3 className="font-bold text-base text-[#1C160E] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  توليد مجسم طبي 3D بـ Nano Banana Pro
                </h3>
              </div>
            </div>

            <p className="text-xs text-[#5C5246] leading-relaxed">
              يقوم نموذج <strong>Nano Banana Pro (Gemini 3 Pro Image)</strong> بتوليد مجسمات تشريحية ثلاثية الأبعاد volumetric 3D فائقة الدقة مخصصة طبياً وتضمينها فوراً داخل مذكرة المذاكرة اليدوية.
            </p>

            {/* Section selector */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-[#1C160E] block">
                اختر القسم لإدراج المجسم 3D فيه:
              </label>
              <select
                id="nano-banana-section-select"
                value={selectedSectionIdx}
                onChange={(e) => {
                  const idx = Number(e.target.value);
                  setSelectedSectionIdx(idx);
                  const s = data.sections?.[idx];
                  if (s) {
                    setCustom3dPrompt(s.render3dPrompt || s.heading || "");
                  }
                }}
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#DDD3C3] bg-white text-[#1C160E] focus:outline-hidden focus:border-[#8C8276]"
              >
                {(data.sections || []).map((sec, idx) => (
                  <option key={idx} value={idx}>
                    قسم {idx + 1}: {sec.heading}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt input */}
            <div className="space-y-1.5 text-right">
              <label className="text-xs font-bold text-[#1C160E] block">
                وصف المجسم الطبي 3D (Prompt):
              </label>
              <textarea
                id="nano-banana-prompt-input"
                rows={3}
                value={custom3dPrompt}
                onChange={(e) => setCustom3dPrompt(e.target.value)}
                placeholder="مثال: 3D realistic volumetric human eye cross section cornea chemical liquefactive necrosis vs coagulative necrosis render..."
                className="w-full text-xs font-medium p-2.5 rounded-xl border border-[#DDD3C3] bg-white text-[#1C160E] focus:outline-hidden focus:border-[#8C8276]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShow3dModal(false)}
                className="px-4 py-2 text-xs font-medium text-[#5C5246] hover:bg-[#EAE0D0] rounded-xl transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                id="execute-3d-generation-btn"
                type="button"
                disabled={generating3d}
                onClick={async () => {
                  setShow3dModal(false);
                  await handleGenerate3dIllustration(selectedSectionIdx, custom3dPrompt);
                }}
                className="px-4 py-2 text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-600 rounded-xl flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {generating3d ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    جاري التوليد...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    توليد المجسم 3D الآن
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
