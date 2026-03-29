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
              { label: "Teams", value: "8+" },
              { label: "Players", value: "50+" },
              { label: "Games", value: "10+" },
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

      {/* Owner / Founder Section */}
      <section className="relative bg-black py-24 px-4 overflow-hidden">
        {/* Background accents */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(220,38,38,0.06),transparent_60%)]" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="text-primary-500 text-sm font-bold tracking-[0.3em] uppercase">The Visionary</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-3">Meet the Founder</h2>
            <div className="h-1 w-20 bg-primary-600 mx-auto mt-6 rounded-full" />
          </motion.div>

          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Photo */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="flex-shrink-0"
            >
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-br from-primary-600/30 to-transparent rounded-3xl blur-xl" />
                <div className="relative w-72 md:w-80 rounded-2xl overflow-hidden border-2 border-gray-800 shadow-2xl">
                  <Image
                    src="/images/owner.jpg"
                    alt="Joseph Cox Jr."
                    width={320}
                    height={400}
                    className="w-full h-auto"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-primary-600 text-white px-5 py-2 rounded-xl font-bold text-sm shadow-lg shadow-primary-600/30">
                  FOUNDER & OWNER
                </div>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex-1"
            >
              <h3 className="text-3xl md:text-4xl font-black text-white mb-2">
                Joseph Cox Jr.
              </h3>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-primary-500 font-semibold text-sm tracking-wide">Creator of XRT Football</span>
                <span className="text-gray-700">|</span>
                <span className="text-gray-500 text-sm">Est. Fall 2022</span>
              </div>

              <div className="space-y-4 text-gray-400 leading-relaxed">
                <p>
                  Joseph Cox Jr. is making a powerful impact both on and off the field as the proud owner of the
                  <span className="text-white font-semibold"> Xtreme Rough Touch Football League</span> — a completely
                  unique style of football that has never been played this way before.
                </p>
                <p>
                  Created in the fall of 2022 by Joseph Cox Jr., Khalif McBurrows, and Kameron Dickerson, the idea
                  officially came to life in the spring of 2023 and has continued to grow stronger ever since. The league
                  now runs two full seasons every year and has quickly built a loyal following, with more than
                  <span className="text-primary-500 font-bold"> 250+ players and spectators</span> showing up at the
                  field every Sunday.
                </p>
                <p>
                  Beyond the game, the league has had an incredible impact on the community. Through a partnership with
                  <span className="text-white font-semibold"> State Representative Anthony Belmon</span>, the league has
                  helped feed the homeless, connect people with employment opportunities, assist with criminal record
                  expungements, and donate pampers to families in need.
                </p>
                <p>
                  Several players have shared that being part of the league has
                  <span className="text-white font-semibold"> helped save their lives</span> — keeping them on a positive
                  path and giving them a place to relieve stress and escape from everyday challenges every Sunday.
                </p>
              </div>

              {/* Co-founders */}
              <div className="mt-8 pt-6 border-t border-gray-800/50">
                <span className="text-gray-600 text-xs font-semibold tracking-[0.2em] uppercase">Co-Founded with</span>
                <div className="flex gap-6 mt-3">
                  <span className="text-gray-400 font-medium text-sm">Khalif McBurrows</span>
                  <span className="text-gray-400 font-medium text-sm">Kameron Dickerson</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
