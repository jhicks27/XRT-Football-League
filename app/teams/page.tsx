"use client";

import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import { useState } from "react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useCollection } from "@/hooks/useFirestore";
import { Team } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function TeamsPage() {
  const { data: teams, loading } = useCollection<Team>("teams", [orderBy("wins", "desc")]);
  const [search, setSearch] = useState("");
  const router = useRouter();

  if (loading) return <LoadingSpinner size="lg" />;

  const filtered = teams.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Teams"
        description="All teams in the XRT Football League"
      />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No teams found" description="No teams match your search criteria" />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filtered.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover onClick={() => router.push(`/teams/${team.id}`)}>
                <div className="p-6 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {team.logoUrl ? (
                      <Image src={team.logoUrl} alt={team.name} width={80} height={80} className="object-cover" />
                    ) : (
                      <Users className="w-10 h-10 text-gray-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{team.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{team.conference} · {team.division}</p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <span className="text-green-600 font-bold">{team.wins}W</span>
                    <span className="text-red-600 font-bold">{team.losses}L</span>
                    {team.ties > 0 && <span className="text-gray-500 font-bold">{team.ties}T</span>}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
