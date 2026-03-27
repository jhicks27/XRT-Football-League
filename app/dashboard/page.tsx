"use client";

import { motion } from "framer-motion";
import { Trophy, Users, Calendar, TrendingUp, Star, Bell } from "lucide-react";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { useCollection } from "@/hooks/useFirestore";
import { useAuth } from "@/hooks/useAuth";
import { Team, Player, Game, Notification } from "@/types";
import { orderBy, limit } from "@/hooks/useFirestore";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import StatsHighlight from "@/components/dashboard/StatsHighlight";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { profile } = useAuth();
  const { data: teams, loading: teamsLoading } = useCollection<Team>("teams", [orderBy("wins", "desc")]);
  const { data: players, loading: playersLoading } = useCollection<Player>("players", [orderBy("stats.touchdowns", "desc"), limit(5)]);
  const { data: games, loading: gamesLoading } = useCollection<Game>("games", [orderBy("date", "desc"), limit(5)]);
  const { data: notifications } = useCollection<Notification>("notifications", [orderBy("createdAt", "desc"), limit(5)]);

  if (teamsLoading || playersLoading || gamesLoading) return <LoadingSpinner size="lg" />;

  const totalGames = games.length;
  const standings = [...teams].sort((a, b) => b.wins - a.wins);

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      {/* Welcome */}
      <motion.div variants={item} className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white">
          Welcome back, <span className="text-primary-600">{profile?.name}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here&apos;s what&apos;s happening in the league</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Teams", value: teams.length, icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-950" },
          { label: "Total Players", value: players.length, icon: Star, color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950" },
          { label: "Games Played", value: games.filter(g => g.status === "final").length, icon: Calendar, color: "text-green-500 bg-green-50 dark:bg-green-950" },
          { label: "Upcoming", value: games.filter(g => g.status === "scheduled").length, icon: TrendingUp, color: "text-primary-500 bg-primary-50 dark:bg-primary-950" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Standings */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-league-gold" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Standings</h2>
            </div>
            <div className="space-y-3">
              {standings.slice(0, 8).map((team, idx) => (
                <Link key={team.id} href={`/teams/${team.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className={`w-6 text-center font-bold text-sm ${idx < 3 ? "text-primary-600" : "text-gray-400"}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{team.name}</p>
                  </div>
                  <span className="text-sm text-gray-500">
                    {team.wins}-{team.losses}
                  </span>
                </Link>
              ))}
            </div>
            <Link href="/teams" className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-500 font-semibold">
              View All Teams →
            </Link>
          </Card>
        </motion.div>

        {/* Recent Games */}
        <motion.div variants={item} className="lg:col-span-1">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Games</h2>
            </div>
            <div className="space-y-3">
              {games.slice(0, 5).map((game) => (
                <div key={game.id} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/30">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-900 dark:text-white">{game.homeTeamName}</span>
                    <span className="font-black text-primary-600">
                      {game.status === "final" ? `${game.homeScore} - ${game.awayScore}` : "vs"}
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">{game.awayTeamName}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">{formatDate(game.date)}</span>
                    <Badge variant={game.status === "final" ? "success" : game.status === "in_progress" ? "warning" : "default"}>
                      {game.status === "final" ? "Final" : game.status === "in_progress" ? "Live" : "Upcoming"}
                    </Badge>
                  </div>
                </div>
              ))}
              {games.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No games yet</p>
              )}
            </div>
            <Link href="/games" className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-500 font-semibold">
              View Schedule →
            </Link>
          </Card>
        </motion.div>

        {/* Stats + Top Players + Notifications */}
        <motion.div variants={item} className="lg:col-span-1 space-y-6">
          <StatsHighlight />
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Top Players</h2>
            </div>
            <div className="space-y-3">
              {players.slice(0, 5).map((player, idx) => (
                <Link key={player.id} href={`/players/${player.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <span className={`w-6 text-center font-bold text-sm ${idx === 0 ? "text-league-gold" : idx === 1 ? "text-league-silver" : idx === 2 ? "text-league-bronze" : "text-gray-400"}`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{player.name}</p>
                    <p className="text-xs text-gray-500">{player.position}</p>
                  </div>
                  <span className="text-sm font-bold text-primary-600">{player.stats.touchdowns} TDs</span>
                </Link>
              ))}
            </div>
            <Link href="/players" className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-500 font-semibold">
              View All Players →
            </Link>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary-500" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Notifications</h2>
            </div>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{notif.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                </div>
              ))}
              {notifications.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-2">No notifications</p>
              )}
            </div>
            <Link href="/notifications" className="block mt-3 text-center text-sm text-primary-600 hover:text-primary-500 font-semibold">
              View All →
            </Link>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
