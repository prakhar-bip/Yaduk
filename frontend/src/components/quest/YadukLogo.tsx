import React from "react";

interface YadukLogoProps {
  className?: string;
  size?: number | string;
  variant?: "icon" | "full";
  textClassName?: string;
}

export function YadukLogo({
  className = "",
  size = 36,
  variant = "icon",
  textClassName = "",
}: YadukLogoProps) {
  const icon = (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Yaduk Brand Crest"
    >
      <defs>
        {/* Dynamic Sapphire-to-Cyan Electric Gradient */}
        <linearGradient id="yaduk-primary-grad" x1="10%" y1="10%" x2="90%" y2="90%">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="40%" stopColor="#0080ff" />
          <stop offset="85%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#312e81" />
        </linearGradient>

        {/* Emerald-to-Teal Accent Gradient */}
        <linearGradient id="yaduk-accent-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#059669" />
          <stop offset="50%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>

        {/* Ambient Crest Glow */}
        <filter id="yaduk-crest-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#0284c7" floodOpacity="0.4" />
        </filter>

        {/* Background Tile Radial Gradient */}
        <radialGradient id="yaduk-tile-bg" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#0284c7" stopOpacity="0.18" />
          <stop offset="65%" stopColor="#1e1b4b" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.03" />
        </radialGradient>
      </defs>

      {/* Rounded Container Tile */}
      <rect
        width="100"
        height="100"
        rx="24"
        fill="url(#yaduk-tile-bg)"
        stroke="#0284c7"
        strokeWidth="1.5"
        strokeOpacity="0.4"
      />

      {/* Modern Geometric 'Y' Crest Geometry */}
      <g filter="url(#yaduk-crest-glow)">
        {/* Left Wing of Y */}
        <path
          d="M 26 24 C 32 36, 44 48, 50 56 L 50 82"
          stroke="url(#yaduk-primary-grad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Right Wing of Y */}
        <path
          d="M 74 24 C 68 36, 56 48, 50 56"
          stroke="url(#yaduk-primary-grad)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* High-Tech Emerald Core Ray (Strategic Nexus) */}
        <path
          d="M 50 48 L 50 78"
          stroke="url(#yaduk-accent-grad)"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* Central Core Singularity / Pivot */}
        <circle cx="50" cy="52" r="5" fill="#38bdf8" />
        <circle cx="50" cy="52" r="2.5" fill="#ffffff" />

        {/* Upper Nodes (Input Branches) */}
        <circle cx="26" cy="24" r="3.5" fill="#00d2ff" />
        <circle cx="74" cy="24" r="3.5" fill="#38bdf8" />
      </g>
    </svg>
  );

  if (variant === "icon") {
    return icon;
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {icon}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-display text-xl font-bold tracking-tight text-slate-900 ${textClassName}`}>
            Yaduk
          </span>
          <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700 border border-sky-200 uppercase tracking-wide">
            AI
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 hidden sm:block">
          AI Project Mentor & Architect
        </span>
      </div>
    </div>
  );
}

// Backward compatibility alias
export const SarthiLogo = YadukLogo;
export default YadukLogo;
