"use client";

import { motion } from "framer-motion";
import { Shield, Users, UserCircle, Calendar, Trophy, Award, Activity, Settings, Crown, Video } from "lucide-react";
import Card from "@/components/ui/Card";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection } from "@/hooks/useFirestore";
import { useAuth } from "@/hooks/useAuth";
import { Team, Player, Game, ActivityLog } from "@/types";
import { orderBy, limit } from "@/hooks/useFirestore";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

const adminLinks = [
  { href: "/admin/teams", label: "Manage Teams", icon: Users, color: "text-blue-500 bg-blue-50 dark:bg-blue-950", desc: "Create, edit, delete teams" },
  { href: "/admin/players", label: "Manage Players", icon: UserCircle, color: "text-green-500 bg-green-50 dark:bg-green-950", desc: "Manage player profiles & stats" },
  { href: "/admin/games", label: "Manage Games", icon: Calendar, color: "text-orange-500 bg-orange-50 dark:bg-orange-950", desc: "Schedule games, update scores" },
  { href: "/admin/playoffs", label: "Manage Playoffs", icon: Trophy, color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950", desc: "Set up bracket, update results" },
  { href: "/admin/championship", label: "Championship", icon: Award, color: "text-purple-500 bg-purple-50 dark:bg-purple-950", desc: "Set champion, MVP, highlights" },
  { href: "/admin/activity", label: "Activity Log", icon: Activity, color: "text-red-500 bg-red-50 dark:bg-red-950", desc: "View all admin actions" },
  { href: "/admin/users", label: "Manage Users", icon: Crown, color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950", desc: "Promote/demote user roles" },
  { href: "/admin/media", label: "Manage Media", icon: Video, color: "text-pink-500 bg-pink-50 dark:bg-pink-950", desc: "YouTube highlights, interviews, images" },
  { href: "/admin/seasons", label: "Season Archives", icon: Calendar, color: "text-teal-500 bg-teal-50 dark:bg-teal-950", desc: "Manage historical season records" },
];

export default function AdminPage() {
  const { profile, isExecutive } = useAuth();
  const { data: teams } = useCollection<Team>("teams");
  const { data: players } = useCollection<Player>("players");
  const { data: games } = useCollection<Game>("games");
  const { data: recentActivity, loading } = useCollection<ActivityLog>("activityLog", [orderBy("createdAt", "desc"), limit(5)]);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        description={`Logged in as ${profile?.name} (${profile?.role})`}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Teams", value: teams.length, icon: Users },
          { label: "Players", value: players.length, icon: UserCircle },
          { label: "Games", value: games.length, icon: Calendar },
          { label: "Completed", value: games.filter(g => g.status === "final").length, icon: Trophy },
        ].map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className="w-8 h-8 text-primary-600" />
              <div>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Admin Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {adminLinks.map((link, idx) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link href={link.href}>
              <Card hover className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${link.color}`}>
                    <link.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">{link.label}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{link.desc}</p>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary-600" /> Recent Activity
        </h2>
        <div className="space-y-3">
          {recentActivity.map((log) => (
            <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600">
                {log.userName?.charAt(0) || "?"}
              </div>
              <div>
                <p className="text-sm text-gray-900 dark:text-white">
                  <span className="font-semibold">{log.userName}</span> {log.action} {log.entityType}
                </p>
                <p className="text-xs text-gray-500">{log.details}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(log.createdAt)}</p>
              </div>
            </div>
          ))}
          {recentActivity.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
          )}
        </div>
        <Link href="/admin/activity" className="block mt-4 text-center text-sm text-primary-600 hover:text-primary-500 font-semibold">
          View All Activity →
        </Link>
      </Card>
    </div>
  );
}
