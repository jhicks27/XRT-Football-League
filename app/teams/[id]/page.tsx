"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Trophy, TrendingUp } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { useDocument, useCollection, where } from "@/hooks/useFirestore";
import { Team, Player, Game } from "@/types";
import Image from "next/image";
import Link from "next/link";

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const { data: team, loading: teamLoading } = useDocument<Team>("teams", teamId);
  const { data: players, loading: playersLoading } = useCollection<Player>("players", [where("teamId", "==", teamId)]);
  const { data: allGames } = useCollection<Game>("games");

  if (teamLoading || playersLoading) return <LoadingSpinner size="lg" />;
  if (!team) return <div className="text-center py-20 text-gray-500">Team not found</div>;

  const teamGames = allGames.filter(
    (g) => g.homeTeamId === teamId || g.awayTeamId === teamId
  );

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Team Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-28 h-28 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {team.logoUrl ? (
                <Image src={team.logoUrl} alt={team.name} width={112} height={112} className="object-cover" />
              ) : (
                <Users className="w-14 h-14 text-gray-400" />
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-black text-gray-900 dark:text-white">{team.name}</h1>
              <p className="text-gray-500 mt-1">{team.conference} Conference · {team.division} Division</p>
              {(team.headCoach || team.assistantCoach) && (
                <div className="flex items-center gap-4 mt-2 justify-center md:justify-start text-sm">
                  {team.headCoach && <span className="text-gray-400"><span className="font-semibold text-gray-300">HC:</span> {team.headCoach}</span>}
                  {team.assistantCoach && <span className="text-gray-400"><span className="font-semibold text-gray-300">AC:</span> {team.assistantCoach}</span>}
                </div>
              )}
              <div className="flex items-center gap-6 mt-4 justify-center md:justify-start">
                <div className="text-center">
                  <p className="text-2xl font-black text-green-600">{team.wins}</p>
                  <p className="text-xs text-gray-500">Wins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-red-600">{team.losses}</p>
                  <p className="text-xs text-gray-500">Losses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-gray-500">{team.ties}</p>
                  <p className="text-xs text-gray-500">Ties</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black text-primary-600">{team.points}</p>
                  <p className="text-xs text-gray-500">Points</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roster */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary-600" /> Roster ({players.length})
            </h2>
            <div className="space-y-2">
              {players.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center overflow-hidden">
                    {player.imageUrl ? (
                      <Image src={player.imageUrl} alt={player.name} width={40} height={40} className="object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-gray-500">#{player.number}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{player.name}</p>
                    <p className="text-xs text-gray-500">#{player.number} · {player.position}</p>
                  </div>
                  <span className="text-sm text-primary-600 font-bold">{player.stats.touchdowns} TDs</span>
                </Link>
              ))}
              {players.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No players on roster</p>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Games */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-league-gold" /> Games
            </h2>
            <div className="space-y-2">
              {teamGames.slice(0, 10).map((game) => {
                const isHome = game.homeTeamId === teamId;
                const won = game.status === "final" && (
                  (isHome && game.homeScore > game.awayScore) ||
                  (!isHome && game.awayScore > game.homeScore)
                );
                return (
                  <div key={game.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                    <Badge variant={game.status === "final" ? (won ? "success" : "danger") : "default"}>
                      {game.status === "final" ? (won ? "W" : "L") : "—"}
                    </Badge>
                    <div className="flex-1 text-sm">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {isHome ? `vs ${game.awayTeamName}` : `@ ${game.homeTeamName}`}
                      </span>
                    </div>
                    {game.status === "final" && (
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                        {game.homeScore} - {game.awayScore}
                      </span>
                    )}
                  </div>
                );
              })}
              {teamGames.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No games played</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
