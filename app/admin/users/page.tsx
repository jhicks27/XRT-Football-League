"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Shield, Crown, User, Search } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection, updateDocument } from "@/hooks/useFirestore";
import { useAuth } from "@/hooks/useAuth";
import { useActivityLog } from "@/hooks/useActivityLog";
import { UserProfile } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import { formatDate } from "@/lib/utils";

const roleIcons: Record<string, any> = { user: User, admin: Shield, executive: Crown };
const roleBadges: Record<string, string> = { user: "default", admin: "info", executive: "danger" };

export default function AdminUsersPage() {
  const { profile, isExecutive } = useAuth();
  const { data: users, loading } = useCollection<UserProfile>("users", [orderBy("createdAt", "desc")]);
  const { logActivity } = useActivityLog();
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  if (loading) return <LoadingSpinner size="lg" />;

  if (!isExecutive) {
    return (
      <div className="text-center py-20">
        <Crown className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400">Executive Access Required</h2>
        <p className="text-gray-500 mt-2">Only executives can manage user roles.</p>
      </div>
    );
  }

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, userName: string, newRole: string) => {
    if (userId === profile?.id) return; // Can't change own role
    setUpdating(userId);
    try {
      await updateDocument("users", userId, { role: newRole });
      await logActivity("updated", "user", userId, `Changed ${userName}'s role to ${newRole}`);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div>
      <PageHeader title="Manage Users" description="Promote or demote user roles" />

      <div className="mb-6 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["user", "admin", "executive"] as const).map(role => {
          const count = users.filter(u => u.role === role).length;
          const Icon = roleIcons[role];
          return (
            <Card key={role} className="p-4 text-center">
              <Icon className="w-6 h-6 mx-auto mb-1 text-primary-600" />
              <p className="text-2xl font-black text-gray-900 dark:text-white">{count}</p>
              <p className="text-xs text-gray-500 capitalize">{role}s</p>
            </Card>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((user, idx) => {
          const Icon = roleIcons[user.role] || User;
          const isSelf = user.id === profile?.id;
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <Card className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">
                      {user.name} {isSelf && <span className="text-gray-400">(you)</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Joined {formatDate(user.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={roleBadges[user.role] as any}>{user.role}</Badge>
                    {!isSelf && (
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, user.name, e.target.value)}
                        disabled={updating === user.id}
                        className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        <option value="executive">Executive</option>
                      </select>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
