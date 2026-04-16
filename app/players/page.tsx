"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Search, Filter, Trophy, GitCompare } from "lucide-react";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { useCollection } from "@/hooks/useFirestore";
import { Player } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const positions = ["All", "QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "ATH"];

export default function PlayersPage() {
  const { data: players, loading } = useCollection<Player>("players", [orderBy("name")]);
  const [search, setSearch] = useState("");
  const [posFilter, setPosFilter] = useState("All");
  const [view, setView] = useState<"grid" | "leaderboard">("grid");
  const router = useRouter();

  if (loading) return <LoadingSpinner size="lg" />;

  const filtered = players.filter((p) => {
    const matchName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchPos = posFilter === "All" || p.position === posFilter;
    return matchName && matchPos;
  });

  const leaderboard = [...players].sort((a, b) => b.stats.touchdowns - a.stats.touchdowns);

  return (
    <div>
      <PageHeader title="Players" description="Browse all players in the league" />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {positions.map((pos) => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                posFilter === pos
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView("grid")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${view === "grid" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
        >
          <UserCircle className="w-4 h-4 inline mr-1" /> Grid
        </button>
        <button
          onClick={() => setView("leaderboard")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${view === "leaderboard" ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}
        >
          <Trophy className="w-4 h-4 inline mr-1" /> Leaderboard
        </button>
        <Link
          href="/players/compare"
          className={`px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700`}
        >
          <GitCompare className="w-4 h-4 inline mr-1" /> Compare
        </Link>
      </div>

      {view === "grid" ? (
        filtered.length === 0 ? (
          <EmptyState icon={UserCircle} title="No players found" description="No players match your search" />
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((player, idx) => (
              <motion.div key={player.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <Card hover onClick={() => router.push(`/players/${player.id}`)}>
                  <div className="p-5 text-center">
                    <div className="w-24 h-24 mx-auto mb-3 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {player.imageUrl ? (
                        <Image src={player.imageUrl} alt={player.name} width={96} height={96} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-lg font-bold text-gray-400">#{player.number}</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{player.name}</h3>
                    <p className="text-sm text-gray-500">#{player.number} · {player.position}</p>
                    <p className="text-xs text-gray-400 mt-1">{player.teamName}</p>
                    <div className="flex justify-center gap-3 mt-3 text-xs">
                      <span className="text-gray-500">{player.stats.gamesPlayed} GP</span>
                      <span className="text-primary-600 font-bold">{player.stats.touchdowns} TDs</span>
                      <span className="text-gray-500">{player.stats.passingYards + player.stats.rushingYards + player.stats.receivingYards} YDs</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Player</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pos</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">TDs</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Pass Yds</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Rush Yds</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Rec Yds</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Tackles</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Sacks</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">INTs</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">PBU</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Fumbles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {leaderboard.map((p, idx) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer" onClick={() => router.push(`/players/${p.id}`)}>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${idx < 3 ? "text-primary-600" : "text-gray-400"}`}>{idx + 1}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {p.imageUrl ? (
                            <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                          ) : (
                            <span className="text-xs font-bold text-gray-400">#{p.number}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</p>
                          <p className="text-xs text-gray-500">{p.teamName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge>{p.position}</Badge></td>
                    <td className="px-4 py-3 text-right font-bold text-primary-600">{p.stats.touchdowns}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{p.stats.passingYards.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{p.stats.rushingYards.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{p.stats.receivingYards.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{p.stats.tackles}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{p.stats.sacks}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{p.stats.interceptions}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{p.stats.pbu || 0}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-600 dark:text-gray-300">{p.stats.fumbles || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
