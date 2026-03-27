"use client";

import { motion } from "framer-motion";
import { Star, Zap, Target, Shield } from "lucide-react";
import Card from "@/components/ui/Card";
import { useCollection } from "@/hooks/useFirestore";
import { Player } from "@/types";
import { orderBy, limit } from "@/hooks/useFirestore";
import Image from "next/image";
import Link from "next/link";

export default function StatsHighlight() {
  const { data: topPlayers } = useCollection<Player>("players", [orderBy("stats.touchdowns", "desc"), limit(1)]);
  const { data: allPlayers } = useCollection<Player>("players");

  const topPlayer = topPlayers[0];

  // Calculate league-wide stats
  const totalTDs = allPlayers.reduce((sum, p) => sum + p.stats.touchdowns, 0);
  const totalYards = allPlayers.reduce((sum, p) => sum + p.stats.passingYards + p.stats.rushingYards + p.stats.receivingYards, 0);
  const totalSacks = allPlayers.reduce((sum, p) => sum + p.stats.sacks, 0);

  return (
    <div className="space-y-6">
      {/* Player of the Week */}
      {topPlayer && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-gradient-to-br from-league-gold/10 via-transparent to-transparent border-league-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-league-gold" />
              <h3 className="text-sm font-bold text-league-gold uppercase tracking-wide">Player of the Week</h3>
            </div>
            <Link href={`/players/${topPlayer.id}`} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden ring-2 ring-league-gold">
                {topPlayer.imageUrl ? (
                  <Image src={topPlayer.imageUrl} alt={topPlayer.name} width={64} height={64} className="object-cover" />
                ) : (
                  <span className="text-xl font-black text-gray-400">#{topPlayer.number}</span>
                )}
              </div>
              <div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{topPlayer.name}</p>
                <p className="text-sm text-gray-500">{topPlayer.position} · {topPlayer.teamName}</p>
                <p className="text-sm font-bold text-primary-600 mt-1">{topPlayer.stats.touchdowns} TDs · {(topPlayer.stats.passingYards + topPlayer.stats.rushingYards + topPlayer.stats.receivingYards).toLocaleString()} YDs</p>
              </div>
            </Link>
          </Card>
        </motion.div>
      )}

      {/* League Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total TDs", value: totalTDs, icon: Zap, color: "text-yellow-500" },
          { label: "Total Yards", value: totalYards.toLocaleString(), icon: Target, color: "text-green-500" },
          { label: "Total Sacks", value: totalSacks, icon: Shield, color: "text-primary-500" },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
            <p className="text-lg font-black text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-[10px] text-gray-500 uppercase font-semibold">{stat.label}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
