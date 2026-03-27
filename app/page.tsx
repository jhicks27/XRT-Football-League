"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Solid black background with subtle red glow */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.08),transparent_70%)]" />

      {/* Red accent lines */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-600 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-600 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5, duration: 1 }}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-hidden">
      <div className="relative min-h-screen flex items-center justify-center">
        <HeroBackground />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateZ: -10 }}
            animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="mx-auto w-fit drop-shadow-[0_0_40px_rgba(220,38,38,0.4)]">
              <Image
                src="/images/logo.png"
                alt="XRT Rough Touch Football League"
                width={160}
                height={160}
                className="rounded-3xl shadow-2xl"
                priority
              />
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="font-black tracking-tight mb-2"
          >
            <span className="text-7xl md:text-9xl">
              <span className="text-primary-500">X</span>
              <span className="text-white">R</span>
              <span className="text-primary-500">T</span>
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-1">
              ROUGH TOUCH
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-gray-400 uppercase">
              Football League
            </h3>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="h-1 bg-primary-600 mx-auto my-8 rounded-full"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto"
          >
            The premier rough touch football league. Track teams, players, games, and championships all in one place.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/auth/login"
              className="px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-lg transition-all shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:scale-105"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-10 py-4 border-2 border-gray-700 hover:border-primary-600 text-white font-bold rounded-xl text-lg transition-all hover:scale-105"
            >
              Create Account
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
          >
            {[
              { label: "Teams", value: "16+" },
              { label: "Players", value: "200+" },
              { label: "Games", value: "100+" },
              { label: "Seasons", value: "Live" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 + i * 0.1 }}
              >
                <div className="text-3xl md:text-4xl font-black text-primary-500">{stat.value}</div>
                <div className="text-gray-500 text-sm font-medium mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
