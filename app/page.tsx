"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      {/* Hero */}
      <div className="relative min-h-screen flex items-center justify-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-primary-950 to-gray-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(220,38,38,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(220,38,38,0.1),transparent_50%)]" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="w-32 h-32 mx-auto mb-6 relative">
              <Image
                src="/images/logo.png"
                alt="XRT Football League"
                width={128}
                height={128}
                className="rounded-2xl shadow-2xl shadow-primary-600/30"
                priority
              />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-8xl font-black mb-4 tracking-tight"
          >
            <span className="text-primary-500">XRT</span> FOOTBALL
            <br />
            <span className="text-gradient">LEAGUE</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            The premier football league. Track teams, players, games, and championships all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/auth/login"
              className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:scale-105"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-8 py-4 border-2 border-gray-700 hover:border-primary-600 text-white font-bold rounded-xl text-lg transition-all hover:scale-105"
            >
              Create Account
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { label: "Teams", value: "16+" },
              { label: "Players", value: "200+" },
              { label: "Games", value: "100+" },
              { label: "Seasons", value: "Live" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-black text-primary-500">{stat.value}</div>
                <div className="text-gray-500 text-sm font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
