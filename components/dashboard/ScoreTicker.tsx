"use client";

import { motion } from "framer-motion";
import { useCollection } from "@/hooks/useFirestore";
import { Game } from "@/types";
import { orderBy, limit } from "@/hooks/useFirestore";
import Badge from "@/components/ui/Badge";

export default function ScoreTicker() {
  const { data: games } = useCollection<Game>("games", [orderBy("date", "desc"), limit(10)]);

  if (games.length === 0) return null;

  return (
    <div className="bg-gray-900 dark:bg-black border-b border-gray-800 overflow-hidden">
      <motion.div
        className="flex gap-8 py-2.5 px-4 whitespace-nowrap"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      >
        {[...games, ...games].map((game, idx) => (
          <div key={`${game.id}-${idx}`} className="flex items-center gap-3 text-sm">
            {game.status === "in_progress" && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            )}
            <span className="font-semibold text-white">{game.homeTeamName}</span>
            <span className={`font-black ${game.status === "in_progress" ? "text-red-500" : "text-primary-500"}`}>
              {game.status !== "scheduled" ? `${game.homeScore} - ${game.awayScore}` : "vs"}
            </span>
            <span className="font-semibold text-white">{game.awayTeamName}</span>
            <Badge variant={game.status === "final" ? "success" : game.status === "in_progress" ? "danger" : "default"}>
              {game.status === "final" ? "F" : game.status === "in_progress" ? "LIVE" : game.time || "TBD"}
            </Badge>
            <span className="text-gray-600 mx-2">|</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
