"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Trophy } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection, addDocument, updateDocument, deleteDocument } from "@/hooks/useFirestore";
import { useActivityLog } from "@/hooks/useActivityLog";
import { PlayoffMatchup, Team } from "@/types";
import { orderBy } from "@/hooks/useFirestore";

const emptyMatchup: { round: number; matchupNumber: number; team1Id: string; team2Id: string; team1Name: string; team2Name: string; team1Logo: string; team2Logo: string; team1Score: number; team2Score: number; winnerId: string; status: "pending" | "in_progress" | "final" } = { round: 1, matchupNumber: 1, team1Id: "", team2Id: "", team1Name: "", team2Name: "", team1Logo: "", team2Logo: "", team1Score: 0, team2Score: 0, winnerId: "", status: "pending" };

export default function AdminPlayoffsPage() {
  const { data: matchups, loading } = useCollection<PlayoffMatchup>("playoffs", [orderBy("round"), orderBy("matchupNumber")]);
  const { data: teams } = useCollection<Team>("teams", [orderBy("name")]);
  const { logActivity } = useActivityLog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlayoffMatchup | null>(null);
  const [form, setForm] = useState(emptyMatchup);
  const [saving, setSaving] = useState(false);

  if (loading) return <LoadingSpinner size="lg" />;

  const openCreate = () => { setEditing(null); setForm(emptyMatchup); setModalOpen(true); };
  const openEdit = (m: PlayoffMatchup) => {
    setEditing(m);
    setForm({ round: m.round, matchupNumber: m.matchupNumber, team1Id: m.team1Id || "", team2Id: m.team2Id || "", team1Name: m.team1Name, team2Name: m.team2Name, team1Logo: m.team1Logo, team2Logo: m.team2Logo, team1Score: m.team1Score, team2Score: m.team2Score, winnerId: m.winnerId || "", status: m.status });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const t1 = teams.find(t => t.id === form.team1Id);
      const t2 = teams.find(t => t.id === form.team2Id);
      const data = { ...form, team1Name: t1?.name || form.team1Name || "TBD", team2Name: t2?.name || form.team2Name || "TBD", team1Logo: t1?.logoUrl || "", team2Logo: t2?.logoUrl || "" };

      // Auto-set winner based on scores when finalized
      if (data.status === "final" && !data.winnerId) {
        data.winnerId = data.team1Score > data.team2Score ? data.team1Id : data.team2Id;
      }

      if (editing) {
        await updateDocument("playoffs", editing.id, data);
        await logActivity("updated", "playoff", editing.id, `Updated playoff matchup: Round ${form.round}, Game ${form.matchupNumber}`);
      } else {
        const docRef = await addDocument("playoffs", data);
        await logActivity("created", "playoff", docRef.id, `Created playoff matchup: Round ${form.round}, Game ${form.matchupNumber}`);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (m: PlayoffMatchup) => {
    if (!confirm("Delete this matchup?")) return;
    await deleteDocument("playoffs", m.id);
    await logActivity("deleted", "playoff", m.id, `Deleted playoff matchup`);
  };

  // Group by round
  const byRound = matchups.reduce((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {} as Record<number, PlayoffMatchup[]>);

  return (
    <div>
      <PageHeader title="Manage Playoffs" description="Set up bracket, update matchup results" action={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Matchup</Button>} />

      {Object.entries(byRound).map(([round, roundMatchups]) => (
        <div key={round} className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Round {round}</h2>
          <div className="space-y-3">
            {roundMatchups.map((m) => (
              <Card key={m.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {m.team1Name || "TBD"} vs {m.team2Name || "TBD"}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={m.status === "final" ? "success" : m.status === "in_progress" ? "warning" : "default"}>
                        {m.status === "final" ? `${m.team1Score}-${m.team2Score}` : m.status}
                      </Badge>
                      {m.winnerId && <span className="text-xs text-green-600 font-semibold">Winner: {m.winnerId === m.team1Id ? m.team1Name : m.team2Name}</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(m)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => handleDelete(m)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Matchup" : "Create Matchup"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Round" type="number" value={form.round} onChange={(e) => setForm({ ...form, round: parseInt(e.target.value) || 1 })} />
            <Input label="Matchup #" type="number" value={form.matchupNumber} onChange={(e) => setForm({ ...form, matchupNumber: parseInt(e.target.value) || 1 })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team 1</label>
              <select value={form.team1Id} onChange={(e) => setForm({ ...form, team1Id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">TBD</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team 2</label>
              <select value={form.team2Id} onChange={(e) => setForm({ ...form, team2Id: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">TBD</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Team 1 Score" type="number" value={form.team1Score} onChange={(e) => setForm({ ...form, team1Score: parseInt(e.target.value) || 0 })} />
            <Input label="Team 2 Score" type="number" value={form.team2Score} onChange={(e) => setForm({ ...form, team2Score: parseInt(e.target.value) || 0 })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="final">Final</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Winner (auto-set on Final)</label>
            <select value={form.winnerId} onChange={(e) => setForm({ ...form, winnerId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">None</option>
              {form.team1Id && <option value={form.team1Id}>Team 1</option>}
              {form.team2Id && <option value={form.team2Id}>Team 2</option>}
            </select>
          </div>
          <Button onClick={handleSave} isLoading={saving} className="w-full">{editing ? "Update" : "Create"}</Button>
        </div>
      </Modal>
    </div>
  );
}
