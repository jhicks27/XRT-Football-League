"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Vote, Star, Trophy, Check } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection, addDocument, where } from "@/hooks/useFirestore";
import { useAuth } from "@/hooks/useAuth";
import { Player, MvpVote } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import Image from "next/image";

export default function MvpVotingPage() {
  const { profile } = useAuth();
  const { data: players, loading: playersLoading } = useCollection<Player>("players", [orderBy("stats.touchdowns", "desc")]);
  const { data: votes, loading: votesLoading } = useCollection<MvpVote>("mvpVotes");
  const [voting, setVoting] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (playersLoading || votesLoading) return <LoadingSpinner size="lg" />;

  const currentSeason = "2025";
  const userVote = votes.find((v) => v.userId === profile?.id && v.season === currentSeason);

  // Tally votes
  const voteCounts = votes
    .filter((v) => v.season === currentSeason)
    .reduce((acc, v) => {
      acc[v.playerId] = (acc[v.playerId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topVoted = Object.entries(voteCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const handleVote = async (playerId: string, playerName: string) => {
    if (!profile || userVote) return;
    setVoting(true);
    setSelectedId(playerId);
    try {
      await addDocument("mvpVotes", {
        playerId,
        playerName,
        userId: profile.id,
        season: currentSeason,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setVoting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="MVP Voting"
        description="Cast your vote for the season's Most Valuable Player"
      />

      {userVote && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-green-700 dark:text-green-400 font-medium">
            You voted for <span className="font-bold">{userVote.playerName}</span>
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vote Results */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-league-gold" /> Current Standings
            </h2>
            <div className="space-y-3">
              {topVoted.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No votes yet</p>
              ) : (
                topVoted.map(([playerId, count], idx) => {
                  const player = players.find((p) => p.id === playerId);
                  return (
                    <div key={playerId} className="flex items-center gap-3 p-2">
                      <span className={`w-6 text-center font-bold text-sm ${idx === 0 ? "text-league-gold" : idx === 1 ? "text-league-silver" : idx === 2 ? "text-league-bronze" : "text-gray-400"}`}>
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {player?.name || "Unknown"}
                        </p>
                      </div>
                      <Badge variant={idx === 0 ? "success" : "default"}>{count} votes</Badge>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Players to vote for */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Select Your MVP</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {players.slice(0, 20).map((player, idx) => {
              const isVoted = userVote?.playerId === player.id;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card className={`p-4 ${isVoted ? "ring-2 ring-league-gold" : ""}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        {player.imageUrl ? (
                          <Image src={player.imageUrl} alt={player.name} width={48} height={48} className="object-cover" />
                        ) : (
                          <span className="font-bold text-gray-400">#{player.number}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{player.name}</p>
                        <p className="text-xs text-gray-500">{player.position} · {player.teamName}</p>
                        <p className="text-xs text-primary-600 font-bold mt-0.5">{player.stats.touchdowns} TDs</p>
                      </div>
                      {!userVote ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVote(player.id, player.name)}
                          isLoading={voting && selectedId === player.id}
                          disabled={voting}
                        >
                          <Vote className="w-4 h-4 mr-1" /> Vote
                        </Button>
                      ) : isVoted ? (
                        <Badge variant="success">
                          <Star className="w-3 h-3 mr-1" /> Voted
                        </Badge>
                      ) : null}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
