"use client";

import { motion } from "framer-motion";
import { Trophy, Calendar, Users, Star, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useCollection } from "@/hooks/useFirestore";
import { SeasonArchive } from "@/types";
import { orderBy } from "@/hooks/useFirestore";

export default function SeasonsPage() {
  const { data: seasons, loading } = useCollection<SeasonArchive>("seasonArchives", [orderBy("season", "desc")]);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <PageHeader title="Season History" description="Archive of past seasons and champions" />

      {seasons.length === 0 ? (
        <EmptyState icon={Calendar} title="No season archives" description="Past seasons will appear here once archived by an admin" />
      ) : (
        <div className="space-y-6">
          {seasons.map((season, idx) => (
            <motion.div
              key={season.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="p-6 overflow-hidden relative">
                {/* Gold accent for champion */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-league-gold via-league-gold to-transparent" />

                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Season badge */}
                  <div className="text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                      <Calendar className="w-5 h-5 text-primary-600" />
                      <span className="text-2xl font-black text-gray-900 dark:text-white">{season.season}</span>
                    </div>
                  </div>

                  {/* Champion */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-5 h-5 text-league-gold" />
                      <span className="text-sm font-bold text-league-gold uppercase tracking-wide">Champion</span>
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white">{season.championTeamName}</h3>
                    <p className="text-sm text-gray-500">Record: {season.finalRecord}</p>
                  </div>

                  {/* MVP */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-league-gold" />
                      <span className="text-xs font-bold text-gray-500 uppercase">MVP</span>
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">{season.mvpPlayerName}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-lg font-black text-gray-900 dark:text-white">{season.totalTeams}</p>
                      <p className="text-xs text-gray-500">Teams</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-gray-900 dark:text-white">{season.totalGames}</p>
                      <p className="text-xs text-gray-500">Games</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-black text-primary-600">{season.topScorerTDs}</p>
                      <p className="text-xs text-gray-500">Top TDs</p>
                    </div>
                  </div>
                </div>

                {/* Top scorer */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-500">
                      Top Scorer: <span className="font-semibold text-gray-900 dark:text-white">{season.topScorer}</span> ({season.topScorerTDs} TDs)
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
