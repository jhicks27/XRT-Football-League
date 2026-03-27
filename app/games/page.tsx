"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useCollection } from "@/hooks/useFirestore";
import { Game } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

export default function GamesPage() {
  const { data: games, loading } = useCollection<Game>("games", [orderBy("date", "desc")]);
  const [filter, setFilter] = useState<"all" | "scheduled" | "in_progress" | "final">("all");

  if (loading) return <LoadingSpinner size="lg" />;

  const filtered = filter === "all" ? games : games.filter((g) => g.status === filter);

  // Group by week
  const byWeek = filtered.reduce((acc, game) => {
    const key = `Week ${game.week}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(game);
    return acc;
  }, {} as Record<string, Game[]>);

  return (
    <div>
      <PageHeader title="Games" description="Season schedule and results" />

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "scheduled", "in_progress", "final"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {f === "all" ? "All Games" : f === "in_progress" ? "Live" : f === "scheduled" ? "Upcoming" : "Final"}
          </button>
        ))}
      </div>

      {Object.keys(byWeek).length === 0 ? (
        <EmptyState icon={Calendar} title="No games found" description="No games match your filter" />
      ) : (
        <div className="space-y-8">
          {Object.entries(byWeek).map(([week, weekGames]) => (
            <div key={week}>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{week}</h2>
              <div className="space-y-3">
                {weekGames.map((game, idx) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Home Team */}
                        <div className="flex-1 text-right">
                          <p className="font-bold text-gray-900 dark:text-white">{game.homeTeamName}</p>
                          {game.status === "final" && (
                            <p className={`text-2xl font-black ${game.homeScore > game.awayScore ? "text-primary-600" : "text-gray-400"}`}>
                              {game.homeScore}
                            </p>
                          )}
                        </div>

                        {/* VS / Score */}
                        <div className="flex flex-col items-center px-4">
                          <Badge
                            variant={
                              game.status === "final" ? "success" : game.status === "in_progress" ? "warning" : "default"
                            }
                          >
                            {game.status === "final" ? "Final" : game.status === "in_progress" ? "LIVE" : game.time || "TBD"}
                          </Badge>
                          <span className="text-xs text-gray-500 mt-1">{formatDate(game.date)}</span>
                          {game.venue && <span className="text-xs text-gray-400">{game.venue}</span>}
                        </div>

                        {/* Away Team */}
                        <div className="flex-1">
                          <p className="font-bold text-gray-900 dark:text-white">{game.awayTeamName}</p>
                          {game.status === "final" && (
                            <p className={`text-2xl font-black ${game.awayScore > game.homeScore ? "text-primary-600" : "text-gray-400"}`}>
                              {game.awayScore}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
