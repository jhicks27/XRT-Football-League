"use client";

import Image from "next/image";
import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { width: 32, height: 32, text: "text-lg" },
    md: { width: 40, height: 40, text: "text-xl" },
    lg: { width: 64, height: 64, text: "text-3xl" },
  };

  const s = sizes[size];

  return (
    <Link href="/dashboard" className="flex items-center gap-3">
      <div className="relative" style={{ width: s.width, height: s.height }}>
        <Image
          src="/images/logo.png"
          alt="XRT Football League"
          width={s.width}
          height={s.height}
          className="rounded-lg"
          priority
        />
      </div>
      <div className="flex flex-col">
        <span className={`${s.text} font-black text-primary-600 dark:text-primary-500 leading-none tracking-tight`}>
          XRT
        </span>
        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 tracking-[0.2em] uppercase">
          Football League
        </span>
      </div>
    </Link>
  );
}
