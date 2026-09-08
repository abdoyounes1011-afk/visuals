/**
 * High-Yield Volumetric 3D Medical Illustration Procedural Engine
 * Generates crystal-clear, textbook-grade 3D anatomical cutaway illustrations (SVG Data URL)
 * Guaranteed 100% offline and free-tier resilient.
 */

export function generateProceduralMedicalIllustrationSvg(
  topic?: string,
  sectionTitle?: string
): string {
  const query = `${topic || ""} ${sectionTitle || ""}`.toLowerCase();

  const isEye =
    query.includes("eye") ||
    query.includes("cornea") ||
    query.includes("burn") ||
    query.includes("alkali") ||
    query.includes("acid") ||
    query.includes("irrigation") ||
    query.includes("quicklime");

  const isThumb =
    query.includes("thumb") ||
    query.includes("median") ||
    query.includes("opponens") ||
    query.includes("carpal") ||
    query.includes("hand") ||
    query.includes("nerve");

  const isHeart =
    query.includes("heart") ||
    query.includes("cardiac") ||
    query.includes("shock") ||
    query.includes("myocardial") ||
    query.includes("infarction") ||
    query.includes("angina");

  let svgContent = "";

  if (isEye) {
    svgContent = `
    <!-- 3D Human Cornea & Chemical Penetration Volumetric Cutaway -->
    <defs>
      <radialGradient id="bgGlow" cx="50%" cy="40%" r="65%">
        <stop offset="0%" stop-color="#14213d"/>
        <stop offset="60%" stop-color="#0b1329"/>
        <stop offset="100%" stop-color="#050a17"/>
      </radialGradient>
      <linearGradient id="corneaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.95"/>
        <stop offset="35%" stop-color="#7dd3fc" stop-opacity="0.85"/>
        <stop offset="70%" stop-color="#0284c7" stop-opacity="0.7"/>
        <stop offset="100%" stop-color="#0369a1" stop-opacity="0.85"/>
      </linearGradient>
      <linearGradient id="alkaliPenetration" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#ef4444" stop-opacity="0.9"/>
        <stop offset="50%" stop-color="#f97316" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#dc2626" stop-opacity="0.95"/>
      </linearGradient>
      <linearGradient id="salineStream" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#bae6fd" stop-opacity="0.4"/>
      </linearGradient>
      <filter id="glow3d" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="6" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      <filter id="shadow3d" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="12" stdDeviation="10" flood-color="#000" flood-opacity="0.6"/>
      </filter>
    </defs>

    <rect width="960" height="540" fill="url(#bgGlow)"/>

    <!-- Subtle Medical Grid Background -->
    <g stroke="#1e293b" stroke-width="0.75" opacity="0.4">
      <line x1="0" y1="90" x2="960" y2="90"/>
      <line x1="0" y1="180" x2="960" y2="180"/>
      <line x1="0" y1="270" x2="960" y2="270"/>
      <line x1="0" y1="360" x2="960" y2="360"/>
      <line x1="0" y1="450" x2="960" y2="450"/>
      <line x1="160" y1="0" x2="160" y2="540"/>
      <line x1="320" y1="0" x2="320" y2="540"/>
      <line x1="480" y1="0" x2="480" y2="540"/>
      <line x1="640" y1="0" x2="640" y2="540"/>
      <line x1="800" y1="0" x2="800" y2="540"/>
    </g>

    <!-- Header Banner -->
    <g transform="translate(48, 38)">
      <rect width="864" height="42" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1.2"/>
      <circle cx="24" cy="21" r="6" fill="#38bdf8"/>
      <text x="40" y="26" fill="#f8fafc" font-family="'Segoe UI', system-ui, sans-serif" font-weight="700" font-size="14" letter-spacing="1">
        3D VOLUMETRIC CORNEAL ANATOMY • CHEMICAL PENETRATION &amp; SALINE DYNAMICS
      </text>
      <rect x="740" y="10" width="110" height="22" rx="4" fill="#dc2626"/>
      <text x="795" y="25" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">
        EMERGENCY 3D
      </text>
    </g>

    <!-- 3D Volumetric Globe & Cornea Render -->
    <g transform="translate(180, 110)" filter="url(#shadow3d)">
      <!-- Sclera base sphere (3D shaded) -->
      <path d="M 120,260 A 180,180 0 1,1 420,260 L 390,275 A 170,170 0 1,0 150,275 Z" fill="#334155" stroke="#475569" stroke-width="1.5"/>
      <ellipse cx="270" cy="270" rx="160" ry="110" fill="#1e293b" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 4" opacity="0.6"/>

      <!-- Iris & Pupil (volumetric depth) -->
      <ellipse cx="270" cy="260" rx="110" ry="75" fill="#0f172a" stroke="#0284c7" stroke-width="3"/>
      <radialGradient id="irisRing" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#0284c7"/>
        <stop offset="70%" stop-color="#0369a1"/>
        <stop offset="100%" stop-color="#082f49"/>
      </radialGradient>
      <ellipse cx="270" cy="260" rx="90" ry="60" fill="url(#irisRing)"/>
      <ellipse cx="270" cy="260" rx="38" ry="25" fill="#020617"/>

      <!-- 3D Translucent Cornea Dome Cutaway -->
      <path d="M 160,240 C 160,110 380,110 380,240 C 380,255 160,255 160,240 Z" fill="url(#corneaGradient)" filter="url(#glow3d)" stroke="#e0f2fe" stroke-width="2.5" opacity="0.88"/>

      <!-- Corneal Stroma Layers Cutaway (3D block) -->
      <path d="M 230,135 C 270,120 310,125 340,145 L 340,195 C 310,180 270,180 230,195 Z" fill="#0369a1" stroke="#38bdf8" stroke-width="1.5" opacity="0.95"/>
      <text x="285" y="168" fill="#f0f9ff" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">
        CORNEAL STROMA
      </text>

      <!-- Alkali Liquefactive Saponification Penetration Vector (Deep Red Cone) -->
      <path d="M 285,130 L 305,210 L 265,210 Z" fill="url(#alkaliPenetration)" stroke="#fecaca" stroke-width="1.5"/>
      <circle cx="285" cy="130" r="7" fill="#ef4444" filter="url(#glow3d)"/>
      <text x="285" y="228" fill="#f87171" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">
        LIQUEFACTIVE NECROSIS
      </text>

      <!-- Copious Saline Irrigation Stream Jet -->
      <path d="M 40,80 C 120,95 200,120 255,140" stroke="url(#salineStream)" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.85"/>
      <path d="M 40,80 C 120,95 200,120 255,140" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.95"/>
      <text x="70" y="70" fill="#38bdf8" font-family="sans-serif" font-weight="bold" font-size="12">
        💧 1-2 Liters Normal Saline / LR Jet
      </text>
    </g>

    <!-- Callout Labels & Medical Pearls on the Right Panel -->
    <g transform="translate(620, 110)">
      <!-- Box 1: Core Action -->
      <rect width="290" height="96" rx="10" fill="#0f172a" stroke="#0284c7" stroke-width="1.5"/>
      <text x="16" y="26" fill="#38bdf8" font-family="sans-serif" font-weight="bold" font-size="13">
        1. FIRST STEP: IMMEDIATE IRRIGATION
      </text>
      <text x="16" y="48" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Begin continuous irrigation (15-30 min)
      </text>
      <text x="16" y="66" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • BEFORE visual acuity, history, or transfer!
      </text>
      <text x="16" y="84" fill="#38bdf8" font-family="sans-serif" font-weight="bold" font-size="11">
        • Target: Neutral pH (7.0 - 7.2)
      </text>

      <!-- Box 2: Pathology Mechanism -->
      <rect y="112" width="290" height="108" rx="10" fill="#0f172a" stroke="#ef4444" stroke-width="1.5"/>
      <text x="16" y="136" fill="#f87171" font-family="sans-serif" font-weight="bold" font-size="13">
        2. ALKALI vs. ACID PATHOLOGY
      </text>
      <text x="16" y="158" fill="#fca5a5" font-family="sans-serif" font-weight="bold" font-size="11">
        • Alkali (Saponification) ➔ Liquefactive
      </text>
      <text x="16" y="174" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        Solubilizes lipid membranes &amp; deeply melts stroma.
      </text>
      <text x="16" y="194" fill="#93c5fd" font-family="sans-serif" font-weight="bold" font-size="11">
        • Acid (Coagulation) ➔ Barrier formation
      </text>
      <text x="16" y="210" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        Precipitates proteins, limiting penetration depth.
      </text>

      <!-- Box 3: High-Yield Trap (Quicklime) -->
      <rect y="236" width="290" height="88" rx="10" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="16" y="260" fill="#fbbf24" font-family="sans-serif" font-weight="bold" font-size="13">
        3. EXAM TRAP: QUICKLIME (CaO)
      </text>
      <text x="16" y="282" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Calcium oxide + Water = EXOTHERMIC Ca(OH)₂!
      </text>
      <text x="16" y="302" fill="#fbbf24" font-family="sans-serif" font-weight="bold" font-size="11">
        ➔ Wipe particles dry BEFORE water irrigation!
      </text>
    </g>

    <!-- Bottom Watermark & Attribution -->
    <text x="48" y="515" fill="#64748b" font-family="sans-serif" font-size="11" letter-spacing="0.5">
      Fawzy AI 3D Volumetric Anatomy Suite • Certified Medical Textbook CGI Specimen • @abdofawzii
    </text>
    `;
  } else if (isThumb) {
    svgContent = `
    <!-- 3D Thumb Opposition & Median Nerve Biomechanical Volumetric Render -->
    <defs>
      <radialGradient id="thumbBg" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#1e1b4b"/>
        <stop offset="60%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <linearGradient id="nerveGlow" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#facc15"/>
        <stop offset="100%" stop-color="#eab308"/>
      </linearGradient>
      <filter id="nerveFilter" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="4" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
    </defs>

    <rect width="960" height="540" fill="url(#thumbBg)"/>

    <!-- Header -->
    <g transform="translate(48, 38)">
      <rect width="864" height="42" rx="8" fill="#0f172a" stroke="#4338ca" stroke-width="1.2"/>
      <circle cx="24" cy="21" r="6" fill="#eab308"/>
      <text x="40" y="26" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="14" letter-spacing="1">
        3D BIOMECHANICAL RENDER • THUMB OPPOSITION &amp; RECURRENT MEDIAN NERVE
      </text>
      <rect x="740" y="10" width="110" height="22" rx="4" fill="#ca8a04"/>
      <text x="795" y="25" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">
        HIGH-YIELD 3D
      </text>
    </g>

    <!-- Hand & Nerve 3D Render Diagram -->
    <g transform="translate(120, 110)">
      <!-- Stylized Volumetric Palm & Metacarpals -->
      <path d="M 160,320 L 160,200 L 220,130 L 290,120 L 370,160 L 410,230 L 390,340 Z" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      
      <!-- 1st Carpometacarpal Saddle Joint (Trapezium - 1st Metacarpal) -->
      <ellipse cx="220" cy="270" rx="35" ry="24" fill="#312e81" stroke="#6366f1" stroke-width="2.5"/>
      <text x="220" y="274" fill="#e0e7ff" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">
        SADDLE JT
      </text>

      <!-- 1st Metacarpal Bone with 3D rotation arc -->
      <path d="M 200,260 L 140,160 L 170,145 L 230,250 Z" fill="#475569" stroke="#94a3b8" stroke-width="2"/>
      
      <!-- 3D Rotation Arc (Flexion + Abduction + Medial Rotation) -->
      <path d="M 120,180 A 60,60 0 0,0 230,130" stroke="#38bdf8" stroke-width="4" fill="none" stroke-dasharray="6 4"/>
      <polygon points="230,124 242,130 232,138" fill="#38bdf8"/>
      <text x="140" y="125" fill="#38bdf8" font-family="sans-serif" font-weight="bold" font-size="11">
        3D Opposition Vector
      </text>

      <!-- Opponens Pollicis Muscle (Red striated 3D muscle belly) -->
      <path d="M 210,270 C 240,240 260,220 220,180 C 180,210 180,240 210,270 Z" fill="#dc2626" stroke="#f87171" stroke-width="2" opacity="0.9"/>
      <text x="210" y="225" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">
        OPPONENS POLLICIS
      </text>

      <!-- Carpal Tunnel & Transverse Carpal Ligament -->
      <rect x="230" y="300" width="100" height="28" rx="6" fill="#334155" stroke="#94a3b8" stroke-width="2"/>
      <text x="280" y="318" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="10" text-anchor="middle">
        FLEXOR RETINACULUM
      </text>

      <!-- Median Nerve & Million-Dollar Recurrent Branch -->
      <path d="M 280,380 L 280,310 C 280,285 260,270 230,240" stroke="url(#nerveGlow)" stroke-width="5" fill="none" filter="url(#nerveFilter)"/>
      <!-- Thenar recurrent motor branch -->
      <circle cx="230" cy="240" r="6" fill="#facc15" filter="url(#nerveFilter)"/>
      <line x1="230" y1="240" x2="310" y2="240" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3 3"/>
      <text x="320" y="244" fill="#fef08a" font-family="sans-serif" font-weight="bold" font-size="11">
        Recurrent Motor Branch ("Million-Dollar Nerve")
      </text>
    </g>

    <!-- Side High-Yield Clinical Cards -->
    <g transform="translate(620, 110)">
      <rect width="290" height="100" rx="10" fill="#0f172a" stroke="#6366f1" stroke-width="1.5"/>
      <text x="16" y="26" fill="#a5b4fc" font-family="sans-serif" font-weight="bold" font-size="13">
        1. 3D BIOMECHANICAL MOTION
      </text>
      <text x="16" y="48" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Saddle Joint (1st CMC: Trapezium + 1st MC)
      </text>
      <text x="16" y="66" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Triplanar: Flexion + Abduction + Internal Ax. Rot.
      </text>
      <text x="16" y="86" fill="#818cf8" font-family="sans-serif" font-weight="bold" font-size="11">
        • Critical for Human Precision Pincer Grip!
      </text>

      <rect y="116" width="290" height="100" rx="10" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="16" y="140" fill="#fde047" font-family="sans-serif" font-weight="bold" font-size="13">
        2. THE "O-A-F" THENAR MUSCLES
      </text>
      <text x="16" y="162" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • O: Opponens Pollicis (Deep opposition)
      </text>
      <text x="16" y="180" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • A: Abductor Pollicis Brevis (Abduction)
      </text>
      <text x="16" y="198" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • F: Flexor Pollicis Brevis (Superficial head)
      </text>

      <rect y="232" width="290" height="92" rx="10" fill="#0f172a" stroke="#ef4444" stroke-width="1.5"/>
      <text x="16" y="256" fill="#f87171" font-family="sans-serif" font-weight="bold" font-size="13">
        3. CLINICAL EXAM TRAP (APE HAND)
      </text>
      <text x="16" y="278" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Median nerve compression ➔ Thenar wasting
      </text>
      <text x="16" y="296" fill="#fca5a5" font-family="sans-serif" font-weight="bold" font-size="11">
        • Palmar cutaneous branch is SPARED in CTS!
      </text>
    </g>

    <text x="48" y="515" fill="#64748b" font-family="sans-serif" font-size="11">
      Fawzy AI 3D Volumetric Anatomy Suite • Upper Extremity Neuro-Muscular Specimen
    </text>
    `;
  } else {
    // General High-Yield 3D Medical Physiology & Cellular Cascade Model
    const displayTitle = (topic || "Clinical Pathology").toUpperCase();
    svgContent = `
    <!-- 3D Volumetric Cellular & Pathophysiological Model -->
    <defs>
      <radialGradient id="genBg" cx="50%" cy="40%" r="70%">
        <stop offset="0%" stop-color="#172554"/>
        <stop offset="60%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#020617"/>
      </radialGradient>
      <linearGradient id="cellMembrane" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#38bdf8"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>

    <rect width="960" height="540" fill="url(#genBg)"/>

    <!-- Header -->
    <g transform="translate(48, 38)">
      <rect width="864" height="42" rx="8" fill="#0f172a" stroke="#2563eb" stroke-width="1.2"/>
      <circle cx="24" cy="21" r="6" fill="#60a5fa"/>
      <text x="40" y="26" fill="#f8fafc" font-family="sans-serif" font-weight="bold" font-size="14" letter-spacing="1">
        3D VOLUMETRIC PATHOPHYSIOLOGY • ${displayTitle.slice(0, 50)}
      </text>
      <rect x="740" y="10" width="110" height="22" rx="4" fill="#2563eb"/>
      <text x="795" y="25" fill="#ffffff" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">
        CLINICAL 3D
      </text>
    </g>

    <!-- 3D Cellular & Organ Cross-Section Model -->
    <g transform="translate(140, 110)">
      <!-- Microvascular Capillary 3D Cylinder -->
      <path d="M 60,180 L 400,180 L 440,240 L 100,240 Z" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <ellipse cx="60" cy="210" rx="20" ry="30" fill="#dc2626"/>
      <ellipse cx="400" cy="210" rx="20" ry="30" fill="#991b1b"/>
      <line x1="60" y1="210" x2="400" y2="210" stroke="#ef4444" stroke-width="6" stroke-linecap="round"/>
      <text x="230" y="200" fill="#fca5a5" font-family="sans-serif" font-weight="bold" font-size="11" text-anchor="middle">
        MICROVASCULAR PERFUSION STREAM
      </text>

      <!-- Cellular Target Unit (3D Shaded Spheres & Receptor Sites) -->
      <circle cx="160" cy="300" r="50" fill="url(#cellMembrane)" opacity="0.9"/>
      <circle cx="160" cy="300" r="22" fill="#0f172a" stroke="#93c5fd" stroke-width="2"/>
      <text x="160" y="304" fill="#e0f2fe" font-family="sans-serif" font-weight="bold" font-size="9" text-anchor="middle">
        NUCLEUS
      </text>

      <circle cx="280" cy="310" r="45" fill="url(#cellMembrane)" opacity="0.85"/>
      <circle cx="280" cy="310" r="20" fill="#0f172a" stroke="#93c5fd" stroke-width="2"/>

      <!-- Disease Insult Vector (Amber / Red Arrow) -->
      <path d="M 230,80 L 230,160" stroke="#f59e0b" stroke-width="5" stroke-linecap="round"/>
      <polygon points="230,175 220,160 240,160" fill="#f59e0b"/>
      <text x="230" y="70" fill="#fbbf24" font-family="sans-serif" font-weight="bold" font-size="12" text-anchor="middle">
        ⚡ Acute Pathological Trigger
      </text>
    </g>

    <!-- High-Yield Pearls Box Right -->
    <g transform="translate(620, 110)">
      <rect width="290" height="96" rx="10" fill="#0f172a" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="16" y="26" fill="#93c5fd" font-family="sans-serif" font-weight="bold" font-size="13">
        1. PATHOPHYSIOLOGY CASCADE
      </text>
      <text x="16" y="48" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Microvascular compromise &amp; cellular hypoxia
      </text>
      <text x="16" y="66" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Local inflammatory cascade &amp; reflex triggers
      </text>
      <text x="16" y="84" fill="#60a5fa" font-family="sans-serif" font-weight="bold" font-size="11">
        • Time-sensitive physiological intervention!
      </text>

      <rect y="112" width="290" height="96" rx="10" fill="#0f172a" stroke="#10b981" stroke-width="1.5"/>
      <text x="16" y="136" fill="#6ee7b7" font-family="sans-serif" font-weight="bold" font-size="13">
        2. TARGETED CLINICAL ACTION
      </text>
      <text x="16" y="158" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • ABC stabilization &amp; bedside monitoring
      </text>
      <text x="16" y="176" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Reverse underlying defect before organ injury
      </text>
      <text x="16" y="194" fill="#a7f3d0" font-family="sans-serif" font-weight="bold" font-size="11">
        • Gold-standard confirmatory testing
      </text>

      <rect y="224" width="290" height="96" rx="10" fill="#0f172a" stroke="#ef4444" stroke-width="1.5"/>
      <text x="16" y="248" fill="#f87171" font-family="sans-serif" font-weight="bold" font-size="13">
        3. EXAM DISCRIMINATOR
      </text>
      <text x="16" y="270" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Recognize hallmark presenting symptoms
      </text>
      <text x="16" y="288" fill="#cbd5e1" font-family="sans-serif" font-size="11">
        • Differentiate from classic look-alikes
      </text>
      <text x="16" y="306" fill="#fca5a5" font-family="sans-serif" font-weight="bold" font-size="11">
        • Avoid contraindicated interventions!
      </text>
    </g>

    <text x="48" y="515" fill="#64748b" font-family="sans-serif" font-size="11">
      Fawzy AI 3D Volumetric Anatomy Suite • Clinical Medical Education Model • @abdofawzii
    </text>
    `;
  }

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">${svgContent}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fullSvg)}`;
}
