"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useCollection } from "@/hooks/useFirestore";
import { PlayoffMatchup } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import { cn } from "@/lib/utils";

const roundNames: Record<number, string> = {
  1: "Wild Card",
  2: "Divisional",
  3: "Conference",
  4: "Championship",
};

function MatchupCard({ matchup }: { matchup: PlayoffMatchup }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm w-64"
    >
      {/* Team 1 */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700",
          matchup.winnerId === matchup.team1Id && "bg-green-50 dark:bg-green-950/30"
        )}
      >
        <div className="flex items-center gap-2">
          {matchup.winnerId === matchup.team1Id && (
            <Trophy className="w-3.5 h-3.5 text-league-gold" />
          )}
          <span className={cn(
            "font-semibold text-sm",
            matchup.winnerId === matchup.team1Id
              ? "text-green-700 dark:text-green-400"
              : "text-gray-700 dark:text-gray-300"
          )}>
            {matchup.team1Name || "TBD"}
          </span>
        </div>
        <span className={cn(
          "font-black text-lg",
          matchup.winnerId === matchup.team1Id ? "text-green-600" : "text-gray-400"
        )}>
          {matchup.status !== "pending" ? matchup.team1Score : "-"}
        </span>
      </div>

      {/* Team 2 */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3",
          matchup.winnerId === matchup.team2Id && "bg-green-50 dark:bg-green-950/30"
        )}
      >
        <div className="flex items-center gap-2">
          {matchup.winnerId === matchup.team2Id && (
            <Trophy className="w-3.5 h-3.5 text-league-gold" />
          )}
          <span className={cn(
            "font-semibold text-sm",
            matchup.winnerId === matchup.team2Id
              ? "text-green-700 dark:text-green-400"
              : "text-gray-700 dark:text-gray-300"
          )}>
            {matchup.team2Name || "TBD"}
          </span>
        </div>
        <span className={cn(
          "font-black text-lg",
          matchup.winnerId === matchup.team2Id ? "text-green-600" : "text-gray-400"
        )}>
          {matchup.status !== "pending" ? matchup.team2Score : "-"}
        </span>
      </div>

      {/* Status */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 text-center">
        <Badge
          variant={matchup.status === "final" ? "success" : matchup.status === "in_progress" ? "warning" : "default"}
        >
          {matchup.status === "final" ? "Final" : matchup.status === "in_progress" ? "Live" : "Upcoming"}
        </Badge>
      </div>
    </motion.div>
  );
}

export default function PlayoffsPage() {
  const { data: matchups, loading } = useCollection<PlayoffMatchup>("playoffs", [orderBy("round"), orderBy("matchupNumber")]);

  if (loading) return <LoadingSpinner size="lg" />;

  // Group by round
  const rounds = matchups.reduce((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {} as Record<number, PlayoffMatchup[]>);

  const roundNumbers = Object.keys(rounds).map(Number).sort();

  return (
    <div>
      <PageHeader title="Playoffs" description="XRT Football League Playoff Bracket" />

      {roundNumbers.length === 0 ? (
        <EmptyState icon={Trophy} title="No playoff data" description="The playoff bracket hasn't been set up yet" />
      ) : (
        <div className="overflow-x-auto pb-8">
          <div className="flex gap-8 min-w-max items-center">
            {roundNumbers.map((round) => (
              <div key={round} className="flex flex-col items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  {roundNames[round] || `Round ${round}`}
                </h2>
                <div className="flex flex-col gap-8 justify-center" style={{ minHeight: rounds[round].length > 1 ? `${rounds[round].length * 140}px` : "auto" }}>
                  {rounds[round].map((matchup) => (
                    <MatchupCard key={matchup.id} matchup={matchup} />
                  ))}
                </div>
              </div>
            ))}

            {/* Trophy at the end */}
            <div className="flex flex-col items-center justify-center px-8">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Trophy className="w-16 h-16 text-league-gold" />
              </motion.div>
              <p className="text-sm font-bold text-league-gold mt-2">Champion</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
