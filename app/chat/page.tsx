"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, Users, Crown, Shield, ArrowLeft } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { useCollection, addDocument } from "@/hooks/useFirestore";
import { useAuth } from "@/hooks/useAuth";
import { Team, ChatMessage } from "@/types";
import { orderBy, where } from "@/hooks/useFirestore";
import { getInitials } from "@/lib/utils";
import Image from "next/image";

const roleIcons: Record<string, any> = { admin: Shield, executive: Crown };
const roleColors: Record<string, string> = {
  user: "bg-gray-500",
  admin: "bg-blue-500",
  executive: "bg-primary-500",
};

export default function ChatPage() {
  const { profile } = useAuth();
  const { data: teams, loading: teamsLoading } = useCollection<Team>("teams", [orderBy("name")]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: messages, loading: messagesLoading } = useCollection<ChatMessage>(
    "chatMessages",
    selectedTeam ? [where("teamId", "==", selectedTeam.id), orderBy("createdAt", "asc")] : []
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (teamsLoading) return <LoadingSpinner size="lg" />;

  const handleSend = async () => {
    if (!message.trim() || !profile || !selectedTeam) return;
    setSending(true);
    try {
      await addDocument("chatMessages", {
        teamId: selectedTeam.id,
        userId: profile.id,
        userName: profile.name,
        userRole: profile.role,
        message: message.trim(),
      });
      setMessage("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  // Team selection view
  if (!selectedTeam) {
    return (
      <div>
        <PageHeader title="Team Chat Rooms" description="Join a team room and chat with other fans" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card hover onClick={() => setSelectedTeam(team)} className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                    {team.logoUrl ? (
                      <Image src={team.logoUrl} alt={team.name} width={56} height={56} className="object-cover" />
                    ) : (
                      <Users className="w-7 h-7 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white">{team.name}</h3>
                    <p className="text-sm text-gray-500">{team.conference} · {team.division}</p>
                  </div>
                  <MessageCircle className="w-5 h-5 text-primary-500" />
                </div>
              </Card>
            </motion.div>
          ))}
          {teams.length === 0 && (
            <EmptyState icon={MessageCircle} title="No teams yet" description="Teams need to be created first" />
          )}
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setSelectedTeam(null)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </button>
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          {selectedTeam.logoUrl ? (
            <Image src={selectedTeam.logoUrl} alt={selectedTeam.name} width={40} height={40} className="object-cover" />
          ) : (
            <Users className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">{selectedTeam.name} Chat</h2>
          <p className="text-xs text-gray-500">{messages.length} messages</p>
        </div>
      </div>

      {/* Messages */}
      <Card className="mb-4">
        <div className="h-[500px] overflow-y-auto p-4 space-y-3">
          {messagesLoading ? (
            <LoadingSpinner size="sm" />
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No messages yet. Be the first to say something!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.userId === profile?.id;
              const RoleIcon = roleIcons[msg.userRole];
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${roleColors[msg.userRole] || "bg-gray-500"}`}>
                    {getInitials(msg.userName)}
                  </div>
                  <div className={`max-w-[75%] ${isMe ? "text-right" : ""}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {!isMe && (
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{msg.userName}</span>
                      )}
                      {RoleIcon && <RoleIcon className="w-3 h-3 text-primary-500" />}
                    </div>
                    <div className={`inline-block px-3 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "bg-primary-600 text-white rounded-br-sm"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm"
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="p-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}
