"use client";

import { motion } from "framer-motion";
import { Bell, Calendar, Trophy, AlertCircle, Users, Award, Megaphone } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useCollection, updateDocument } from "@/hooks/useFirestore";
import { Notification } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";

const typeIcons: Record<string, any> = {
  game: Calendar,
  trade: Users,
  injury: AlertCircle,
  announcement: Megaphone,
  playoff: Trophy,
  championship: Award,
};

const typeColors: Record<string, string> = {
  game: "text-green-500 bg-green-50 dark:bg-green-950",
  trade: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  injury: "text-red-500 bg-red-50 dark:bg-red-950",
  announcement: "text-purple-500 bg-purple-50 dark:bg-purple-950",
  playoff: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950",
  championship: "text-league-gold bg-yellow-50 dark:bg-yellow-950",
};

export default function NotificationsPage() {
  const { data: notifications, loading } = useCollection<Notification>("notifications", [orderBy("createdAt", "desc")]);

  if (loading) return <LoadingSpinner size="lg" />;

  const markRead = async (id: string) => {
    await updateDocument("notifications", id, { read: true });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {notifications.map((notif, idx) => {
            const Icon = typeIcons[notif.type] || Bell;
            const color = typeColors[notif.type] || "text-gray-500 bg-gray-50 dark:bg-gray-800";

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card
                  className={`p-4 ${!notif.read ? "border-l-4 border-l-primary-600" : ""}`}
                  onClick={() => !notif.read && markRead(notif.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2.5 rounded-xl ${color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold text-sm ${!notif.read ? "text-gray-900 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
                          {notif.title}
                        </h3>
                        {!notif.read && <Badge variant="danger">New</Badge>}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDateTime(notif.createdAt)}</p>
                    </div>
                    {notif.link && (
                      <Link href={notif.link} className="text-sm text-primary-600 hover:text-primary-500 font-medium shrink-0">
                        View →
                      </Link>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
