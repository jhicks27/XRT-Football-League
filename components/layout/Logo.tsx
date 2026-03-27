"use client";

import Link from "next/link";

export function XRTLogoSVG({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect width="120" height="120" rx="24" fill="#0A0A0A" />
      <rect x="2" y="2" width="116" height="116" rx="22" stroke="#DC2626" strokeWidth="4" />

      {/* Football shape background */}
      <ellipse cx="60" cy="55" rx="38" ry="22" fill="#DC2626" opacity="0.15" />
      <ellipse cx="60" cy="55" rx="38" ry="22" stroke="#DC2626" strokeWidth="1.5" opacity="0.3" />

      {/* Football laces */}
      <line x1="42" y1="55" x2="78" y2="55" stroke="#DC2626" strokeWidth="1.5" opacity="0.4" />
      <line x1="52" y1="48" x2="52" y2="62" stroke="#DC2626" strokeWidth="1.5" opacity="0.3" />
      <line x1="60" y1="47" x2="60" y2="63" stroke="#DC2626" strokeWidth="1.5" opacity="0.3" />
      <line x1="68" y1="48" x2="68" y2="62" stroke="#DC2626" strokeWidth="1.5" opacity="0.3" />

      {/* Player silhouette - stiff arm running pose */}
      <g transform="translate(32, 18) scale(0.48)">
        {/* Head */}
        <circle cx="70" cy="28" r="14" fill="white" />
        {/* Torso */}
        <line x1="70" y1="42" x2="70" y2="82" stroke="white" strokeWidth="9" strokeLinecap="round" />
        {/* Left arm - stiff arm */}
        <line x1="70" y1="52" x2="42" y2="62" stroke="white" strokeWidth="8" strokeLinecap="round" />
        {/* Right arm - carrying ball */}
        <line x1="70" y1="55" x2="96" y2="48" stroke="white" strokeWidth="8" strokeLinecap="round" />
        {/* Football */}
        <ellipse cx="102" cy="44" rx="11" ry="6" fill="#DC2626" transform="rotate(-20, 102, 44)" />
        {/* Left leg - forward */}
        <line x1="70" y1="82" x2="50" y2="118" stroke="white" strokeWidth="8" strokeLinecap="round" />
        {/* Right leg - back */}
        <line x1="70" y1="82" x2="92" y2="115" stroke="white" strokeWidth="8" strokeLinecap="round" />
      </g>

      {/* XRT Text - bold */}
      <text
        x="60"
        y="108"
        textAnchor="middle"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="900"
        fontSize="24"
        letterSpacing="5"
      >
        <tspan fill="#DC2626">X</tspan>
        <tspan fill="white">R</tspan>
        <tspan fill="#DC2626">T</tspan>
      </text>

      {/* Corner accents */}
      <path d="M10 28 L10 10 L28 10" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M110 28 L110 10 L92 10" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { icon: 36, title: "text-lg", subtitle: false },
    md: { icon: 44, title: "text-xl", subtitle: true },
    lg: { icon: 72, title: "text-3xl", subtitle: true },
  };

  const s = sizes[size];

  return (
    <Link href="/dashboard" className="flex items-center gap-3 group">
      <div className="transition-transform group-hover:scale-105">
        <XRTLogoSVG size={s.icon} />
      </div>
      <div className="flex flex-col">
        <span className={`${s.title} font-black leading-none tracking-tight`}>
          <span className="text-primary-500">X</span>
          <span className="text-gray-900 dark:text-white">R</span>
          <span className="text-primary-500">T</span>
        </span>
        {s.subtitle && (
          <span className="text-[8px] font-bold text-gray-500 dark:text-gray-400 tracking-[0.12em] uppercase leading-tight mt-0.5">
            Rough Touch Football
          </span>
        )}
      </div>
    </Link>
  );
}
