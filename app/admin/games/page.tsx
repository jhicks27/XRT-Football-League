"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Calendar } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection, addDocument, updateDocument, deleteDocument } from "@/hooks/useFirestore";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Game, Team } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import { formatDate } from "@/lib/utils";

const emptyGame: { homeTeamId: string; awayTeamId: string; homeTeamName: string; awayTeamName: string; homeTeamLogo: string; awayTeamLogo: string; homeScore: number; awayScore: number; date: string; time: string; venue: string; status: "scheduled" | "in_progress" | "final"; week: number; season: string } = { homeTeamId: "", awayTeamId: "", homeTeamName: "", awayTeamName: "", homeTeamLogo: "", awayTeamLogo: "", homeScore: 0, awayScore: 0, date: "", time: "", venue: "", status: "scheduled", week: 1, season: "2025" };

export default function AdminGamesPage() {
  const { data: games, loading } = useCollection<Game>("games", [orderBy("date", "desc")]);
  const { data: teams } = useCollection<Team>("teams", [orderBy("name")]);
  const { logActivity } = useActivityLog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Game | null>(null);
  const [form, setForm] = useState(emptyGame);
  const [saving, setSaving] = useState(false);

  if (loading) return <LoadingSpinner size="lg" />;

  const openCreate = () => { setEditing(null); setForm(emptyGame); setModalOpen(true); };
  const openEdit = (g: Game) => {
    setEditing(g);
    setForm({ homeTeamId: g.homeTeamId, awayTeamId: g.awayTeamId, homeTeamName: g.homeTeamName, awayTeamName: g.awayTeamName, homeTeamLogo: g.homeTeamLogo, awayTeamLogo: g.awayTeamLogo, homeScore: g.homeScore, awayScore: g.awayScore, date: g.date, time: g.time, venue: g.venue, status: g.status, week: g.week, season: g.season });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const homeTeam = teams.find(t => t.id === form.homeTeamId);
      const awayTeam = teams.find(t => t.id === form.awayTeamId);
      const data = { ...form, homeTeamName: homeTeam?.name || form.homeTeamName, awayTeamName: awayTeam?.name || form.awayTeamName, homeTeamLogo: homeTeam?.logoUrl || "", awayTeamLogo: awayTeam?.logoUrl || "" };
      if (editing) {
        await updateDocument("games", editing.id, data);
        await logActivity("updated", "game", editing.id, `Updated game: ${data.homeTeamName} vs ${data.awayTeamName}`);
      } else {
        const docRef = await addDocument("games", data);
        await logActivity("created", "game", docRef.id, `Created game: ${data.homeTeamName} vs ${data.awayTeamName}`);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (g: Game) => {
    if (!confirm("Delete this game?")) return;
    await deleteDocument("games", g.id);
    await logActivity("deleted", "game", g.id, `Deleted game: ${g.homeTeamName} vs ${g.awayTeamName}`);
  };

  return (
    <div>
      <PageHeader title="Manage Games" description="Schedule games and update scores" action={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Game</Button>} />

      <div className="space-y-3">
        {games.map((game) => (
          <Card key={game.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-gray-900 dark:text-white">{game.homeTeamName}</span>
                  <span className="text-gray-400">vs</span>
                  <span className="font-bold text-gray-900 dark:text-white">{game.awayTeamName}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">Week {game.week} · {formatDate(game.date)}</span>
                  <Badge variant={game.status === "final" ? "success" : game.status === "in_progress" ? "warning" : "default"}>
                    {game.status === "final" ? `${game.homeScore}-${game.awayScore} Final` : game.status === "in_progress" ? "Live" : "Scheduled"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(game)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => handleDelete(game)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Game" : "Create Game"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Home Team</label>
              <select value={form.homeTeamId} onChange={(e) => setForm({ ...form, homeTeamId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Away Team</label>
              <select value={form.awayTeamId} onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Home Score" type="number" value={form.homeScore} onChange={(e) => setForm({ ...form, homeScore: parseInt(e.target.value) || 0 })} />
            <Input label="Away Score" type="number" value={form.awayScore} onChange={(e) => setForm({ ...form, awayScore: parseInt(e.target.value) || 0 })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Input label="Time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} placeholder="7:00 PM" />
          </div>
          <Input label="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Week" type="number" value={form.week} onChange={(e) => setForm({ ...form, week: parseInt(e.target.value) || 1 })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="final">Final</option>
              </select>
            </div>
          </div>
          <Button onClick={handleSave} isLoading={saving} className="w-full">{editing ? "Update Game" : "Create Game"}</Button>
        </div>
      </Modal>
    </div>
  );
}
