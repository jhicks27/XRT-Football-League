"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Award, Image as ImageIcon, Video } from "lucide-react";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { useCollection } from "@/hooks/useFirestore";
import { Championship } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import Image from "next/image";

function AnimatedTrophy() {
  return (
    <div className="relative">
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 bg-league-gold/20 rounded-full blur-3xl"
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Trophy */}
      <motion.div
        animate={{
          y: [0, -20, 0],
          rotateZ: [0, 2, -2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10"
      >
        <Trophy className="w-32 h-32 text-league-gold drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
      </motion.div>
      {/* Sparkles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-league-gold rounded-full"
          style={{
            top: `${20 + Math.random() * 60}%`,
            left: `${10 + Math.random() * 80}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.3,
          }}
        />
      ))}
    </div>
  );
}

export default function ChampionshipPage() {
  const { data: championships, loading } = useCollection<Championship>("championship", [orderBy("date", "desc")]);

  if (loading) return <LoadingSpinner size="lg" />;

  const latest = championships[0];

  if (!latest) {
    return (
      <div>
        <div className="text-center py-12">
          <AnimatedTrophy />
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-gray-900 dark:text-white mt-8 mb-4"
          >
            XRT Championship
          </motion.h1>
          <p className="text-gray-500 text-lg">The championship has not been decided yet. Stay tuned!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 mb-8"
      >
        <AnimatedTrophy />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-6xl font-black mt-8 mb-2"
        >
          <span className="text-league-gold">CHAMPIONS</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-gray-500 mb-2"
        >
          {latest.season} Season
        </motion.p>
      </motion.div>

      {/* Winner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-8"
      >
        <Card className="p-8 text-center bg-gradient-to-b from-league-gold/10 to-transparent border-league-gold/30">
          <div className="flex flex-col items-center">
            {latest.winnerTeamLogo && (
              <Image src={latest.winnerTeamLogo} alt={latest.winnerTeamName} width={120} height={120} className="rounded-2xl mb-4" />
            )}
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">{latest.winnerTeamName}</h2>
            <p className="text-lg text-gray-500 mt-2">Final Score: {latest.finalScore}</p>
            <p className="text-sm text-gray-400 mt-1">vs {latest.runnerUpTeamName}</p>
          </div>
        </Card>
      </motion.div>

      {/* MVP */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <Card className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-league-gold/10 flex items-center justify-center overflow-hidden">
              {latest.mvpPlayerImage ? (
                <Image src={latest.mvpPlayerImage} alt={latest.mvpPlayerName} width={96} height={96} className="object-cover" />
              ) : (
                <Award className="w-12 h-12 text-league-gold" />
              )}
            </div>
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                <Star className="w-5 h-5 text-league-gold" />
                <span className="text-sm font-semibold text-league-gold uppercase tracking-wide">Most Valuable Player</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">{latest.mvpPlayerName}</h2>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Highlights */}
      {(latest.highlightImages?.length > 0 || latest.highlightVideos?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary-600" /> Highlights
          </h2>

          {latest.highlightImages?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {latest.highlightImages.map((img, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + idx * 0.1 }}
                  className="rounded-xl overflow-hidden aspect-video relative"
                >
                  <Image src={img} alt={`Highlight ${idx + 1}`} fill className="object-cover" />
                </motion.div>
              ))}
            </div>
          )}

          {latest.highlightVideos?.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {latest.highlightVideos.map((video, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden aspect-video">
                  <video src={video} controls className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
