"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useDocument } from "@/hooks/useFirestore";
import { Player } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function PlayerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: player, loading } = useDocument<Player>("players", params.id as string);

  if (loading) return <LoadingSpinner size="lg" />;
  if (!player) return <div className="text-center py-20 text-gray-500">Player not found</div>;

  const s = player.stats || {} as any;

  const offenseStats = [
    { label: "Games Played", value: s.gamesPlayed || 0 },
    { label: "Touchdowns", value: s.touchdowns || 0, highlight: true },
    { label: "Passing Yards", value: (s.passingYards || 0).toLocaleString() },
    { label: "Rushing Yards", value: (s.rushingYards || 0).toLocaleString() },
    { label: "Receiving Yards", value: (s.receivingYards || 0).toLocaleString() },
    { label: "Completions", value: s.completions || 0 },
    { label: "Attempts", value: s.attempts || 0 },
    { label: "Kick Return TDs", value: s.kickReturnTDs || 0 },
    { label: "INTs Thrown", value: s.interceptionsThrown || 0 },
  ];

  const defenseStats = [
    { label: "Tackles", value: s.tackles || 0 },
    { label: "Tackles For Loss", value: s.tacklesForLoss || 0 },
    { label: "Sacks", value: s.sacks || 0 },
    { label: "Interceptions", value: s.interceptions || 0 },
    { label: "PBU", value: s.pbu || 0 },
    { label: "Forced Fumbles", value: s.forcedFumbles || 0 },
    { label: "Fumbles", value: s.fumbles || 0 },
    { label: "Pancakes", value: s.pancakes || 0 },
  ];

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {player.imageUrl ? (
                <Image src={player.imageUrl} alt={player.name} width={128} height={128} className="object-cover" />
              ) : (
                <span className="text-4xl font-black text-gray-400">#{player.number}</span>
              )}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">{player.name}</h1>
              <div className="flex items-center gap-2 mt-2 justify-center md:justify-start flex-wrap">
                <Badge variant="info">{player.position}</Badge>
                <span className="text-gray-500">#{player.number}</span>
                {player.experience && (
                  <Badge variant={player.experience === "Rookie" ? "success" : player.experience === "Vet" ? "warning" : "default"}>
                    {player.experience}
                  </Badge>
                )}
              </div>
              {player.teamName && (
                <Link href={`/teams/${player.teamId}`} className="text-primary-600 hover:text-primary-500 font-semibold mt-2 inline-block">
                  {player.teamName}
                </Link>
              )}
              <div className="flex gap-4 mt-3 text-sm text-gray-500 justify-center md:justify-start">
                <span>{player.height}</span>
                <span>{player.weight} lbs</span>
                <span>Age {player.age}</span>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Offense
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {offenseStats.map((stat) => (
              <div key={stat.label} className={`p-4 rounded-xl text-center ${stat.highlight ? "bg-primary-50 dark:bg-primary-950 border border-primary-200 dark:border-primary-800" : "bg-gray-50 dark:bg-gray-800/50"}`}>
                <p className={`text-2xl font-black ${stat.highlight ? "text-primary-600" : "text-gray-900 dark:text-white"}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 mt-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" /> Defense
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {defenseStats.map((stat) => (
              <div key={stat.label} className="p-4 rounded-xl text-center bg-gray-50 dark:bg-gray-800/50">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
