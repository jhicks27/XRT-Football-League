"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GitCompare, Search, ArrowRight, Trophy } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection } from "@/hooks/useFirestore";
import { Player } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import Image from "next/image";

function StatBar({ label, value1, value2, name1, name2 }: { label: string; value1: number; value2: number; name1: string; name2: string }) {
  const max = Math.max(value1, value2, 1);
  const pct1 = (value1 / max) * 100;
  const pct2 = (value2 / max) * 100;
  const winner = value1 > value2 ? 1 : value2 > value1 ? 2 : 0;

  return (
    <div className="py-3">
      <div className="flex items-center justify-between mb-1">
        <span className={`text-sm font-bold ${winner === 1 ? "text-primary-600" : "text-gray-500"}`}>{value1.toLocaleString()}</span>
        <span className="text-xs font-semibold text-gray-400 uppercase">{label}</span>
        <span className={`text-sm font-bold ${winner === 2 ? "text-primary-600" : "text-gray-500"}`}>{value2.toLocaleString()}</span>
      </div>
      <div className="flex gap-1">
        <div className="flex-1 flex justify-end">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct1}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-2.5 rounded-l-full ${winner === 1 ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600"}`}
          />
        </div>
        <div className="flex-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct2}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-2.5 rounded-r-full ${winner === 2 ? "bg-primary-500" : "bg-gray-300 dark:bg-gray-600"}`}
          />
        </div>
      </div>
    </div>
  );
}

function PlayerSelector({ players, selected, onSelect, search, onSearch, label }: {
  players: Player[];
  selected: Player | null;
  onSelect: (p: Player) => void;
  search: string;
  onSearch: (s: string) => void;
  label: string;
}) {
  const filtered = players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.position.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden mb-2 ring-2 ring-primary-500">
          {selected.imageUrl ? (
            <Image src={selected.imageUrl} alt={selected.name} width={80} height={80} className="object-cover" />
          ) : (
            <span className="text-2xl font-black text-gray-400">#{selected.number}</span>
          )}
        </div>
        <h3 className="font-black text-gray-900 dark:text-white">{selected.name}</h3>
        <p className="text-sm text-gray-500">{selected.position} · #{selected.number}</p>
        <p className="text-xs text-gray-400">{selected.teamName}</p>
        <button
          onClick={() => { onSelect(null as any); onSearch(""); }}
          className="text-xs text-primary-600 hover:text-primary-500 mt-2 font-semibold"
        >
          Change Player
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm font-semibold text-gray-500 mb-2 text-center">{label}</p>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search player..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div className="max-h-60 overflow-y-auto space-y-1">
        {filtered.slice(0, 15).map((p) => (
          <button
            key={p.id}
            onClick={() => onSelect(p)}
            className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {p.imageUrl ? (
                <Image src={p.imageUrl} alt={p.name} width={32} height={32} className="object-cover" />
              ) : (
                <span className="text-xs font-bold text-gray-400">#{p.number}</span>
              )}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</p>
              <p className="text-xs text-gray-500">{p.position} · {p.teamName}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ComparePlayersPage() {
  const { data: players, loading } = useCollection<Player>("players", [orderBy("name")]);
  const [player1, setPlayer1] = useState<Player | null>(null);
  const [player2, setPlayer2] = useState<Player | null>(null);
  const [search1, setSearch1] = useState("");
  const [search2, setSearch2] = useState("");

  if (loading) return <LoadingSpinner size="lg" />;

  const statKeys: { key: keyof Player["stats"]; label: string }[] = [
    { key: "gamesPlayed", label: "Games" },
    { key: "touchdowns", label: "Touchdowns" },
    { key: "passingYards", label: "Pass Yards" },
    { key: "rushingYards", label: "Rush Yards" },
    { key: "receivingYards", label: "Rec Yards" },
    { key: "completions", label: "Completions" },
    { key: "tackles", label: "Tackles" },
    { key: "sacks", label: "Sacks" },
    { key: "interceptions", label: "INTs" },
    { key: "pbu", label: "PBU" },
    { key: "fumbles", label: "Fumbles" },
    { key: "pancakes", label: "Pancakes" },
  ];

  const getWinCount = () => {
    if (!player1 || !player2) return { p1: 0, p2: 0 };
    let p1 = 0, p2 = 0;
    statKeys.forEach(({ key }) => {
      if (player1.stats[key] > player2.stats[key]) p1++;
      else if (player2.stats[key] > player1.stats[key]) p2++;
    });
    return { p1, p2 };
  };

  const wins = getWinCount();

  return (
    <div>
      <PageHeader title="Compare Players" description="Head-to-head stat comparison" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <PlayerSelector
            players={players.filter(p => p.id !== player2?.id)}
            selected={player1}
            onSelect={setPlayer1}
            search={search1}
            onSearch={setSearch1}
            label="Select Player 1"
          />
        </Card>

        <Card className="p-6">
          <PlayerSelector
            players={players.filter(p => p.id !== player1?.id)}
            selected={player2}
            onSelect={setPlayer2}
            search={search2}
            onSearch={setSearch2}
            label="Select Player 2"
          />
        </Card>
      </div>

      {player1 && player2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Winner banner */}
          <Card className="p-4 mb-6 text-center bg-gradient-to-r from-primary-50 dark:from-primary-950/30 to-transparent">
            <div className="flex items-center justify-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-primary-600">{wins.p1}</p>
                <p className="text-xs text-gray-500">{player1.name}</p>
              </div>
              <Trophy className="w-6 h-6 text-league-gold" />
              <div className="text-center">
                <p className="text-2xl font-black text-primary-600">{wins.p2}</p>
                <p className="text-xs text-gray-500">{player2.name}</p>
              </div>
            </div>
          </Card>

          {/* Stat comparison */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-sm text-gray-900 dark:text-white">{player1.name}</span>
              <GitCompare className="w-5 h-5 text-gray-400" />
              <span className="font-bold text-sm text-gray-900 dark:text-white">{player2.name}</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {statKeys.map(({ key, label }) => (
                <StatBar
                  key={key}
                  label={label}
                  value1={player1.stats[key]}
                  value2={player2.stats[key]}
                  name1={player1.name}
                  name2={player2.name}
                />
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
