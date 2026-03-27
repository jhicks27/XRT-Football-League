"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useCollection } from "@/hooks/useFirestore";
import { ActivityLog } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import { formatDateTime } from "@/lib/utils";

const entityColors: Record<string, string> = {
  team: "info",
  player: "success",
  game: "warning",
  playoff: "danger",
  championship: "default",
  user: "default",
};

export default function ActivityLogPage() {
  const { data: logs, loading } = useCollection<ActivityLog>("activityLog", [orderBy("createdAt", "desc")]);

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div>
      <PageHeader title="Activity Log" description="Track all admin actions" />

      {logs.length === 0 ? (
        <EmptyState icon={Activity} title="No activity" description="No admin actions have been recorded yet" />
      ) : (
        <div className="space-y-3 max-w-3xl">
          {logs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.02 }}
            >
              <Card className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
                    {log.userName?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-semibold">{log.userName}</span>{" "}
                      <span className="text-gray-500">{log.action}</span>{" "}
                      <Badge variant={entityColors[log.entityType] as any || "default"}>{log.entityType}</Badge>
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">{log.details}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(log.createdAt)}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
