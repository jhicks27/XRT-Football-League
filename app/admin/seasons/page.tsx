"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Calendar } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection, addDocument, updateDocument, deleteDocument } from "@/hooks/useFirestore";
import { useActivityLog } from "@/hooks/useActivityLog";
import { SeasonArchive } from "@/types";
import { orderBy } from "@/hooks/useFirestore";

const emptySeason = {
  season: "",
  championTeamName: "",
  championTeamLogo: "",
  mvpPlayerName: "",
  finalRecord: "",
  totalGames: 0,
  totalPlayers: 0,
  totalTeams: 0,
  topScorer: "",
  topScorerTDs: 0,
};

export default function AdminSeasonsPage() {
  const { data: seasons, loading } = useCollection<SeasonArchive>("seasonArchives", [orderBy("season", "desc")]);
  const { logActivity } = useActivityLog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SeasonArchive | null>(null);
  const [form, setForm] = useState(emptySeason);
  const [saving, setSaving] = useState(false);

  if (loading) return <LoadingSpinner size="lg" />;

  const openCreate = () => { setEditing(null); setForm(emptySeason); setModalOpen(true); };
  const openEdit = (s: SeasonArchive) => {
    setEditing(s);
    setForm({
      season: s.season, championTeamName: s.championTeamName, championTeamLogo: s.championTeamLogo,
      mvpPlayerName: s.mvpPlayerName, finalRecord: s.finalRecord, totalGames: s.totalGames,
      totalPlayers: s.totalPlayers, totalTeams: s.totalTeams, topScorer: s.topScorer, topScorerTDs: s.topScorerTDs,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateDocument("seasonArchives", editing.id, form);
        await logActivity("updated", "championship", editing.id, `Updated season archive: ${form.season}`);
      } else {
        const docRef = await addDocument("seasonArchives", form);
        await logActivity("created", "championship", docRef.id, `Created season archive: ${form.season}`);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (s: SeasonArchive) => {
    if (!confirm(`Delete ${s.season} archive?`)) return;
    await deleteDocument("seasonArchives", s.id);
    await logActivity("deleted", "championship", s.id, `Deleted season archive: ${s.season}`);
  };

  return (
    <div>
      <PageHeader title="Season Archives" description="Create and manage historical season records" action={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Season</Button>} />

      <div className="space-y-3">
        {seasons.map((s) => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white">{s.season} Season</p>
                <p className="text-sm text-gray-500">Champion: {s.championTeamName} · MVP: {s.mvpPlayerName}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(s)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                <button onClick={() => handleDelete(s)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Season" : "Add Season Archive"}>
        <div className="space-y-4">
          <Input label="Season (e.g. 2025)" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} />
          <Input label="Champion Team" value={form.championTeamName} onChange={(e) => setForm({ ...form, championTeamName: e.target.value })} />
          <Input label="MVP Player" value={form.mvpPlayerName} onChange={(e) => setForm({ ...form, mvpPlayerName: e.target.value })} />
          <Input label="Final Record (e.g. 12-2)" value={form.finalRecord} onChange={(e) => setForm({ ...form, finalRecord: e.target.value })} />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Teams" type="number" value={form.totalTeams} onChange={(e) => setForm({ ...form, totalTeams: parseInt(e.target.value) || 0 })} />
            <Input label="Games" type="number" value={form.totalGames} onChange={(e) => setForm({ ...form, totalGames: parseInt(e.target.value) || 0 })} />
            <Input label="Players" type="number" value={form.totalPlayers} onChange={(e) => setForm({ ...form, totalPlayers: parseInt(e.target.value) || 0 })} />
          </div>
          <Input label="Top Scorer Name" value={form.topScorer} onChange={(e) => setForm({ ...form, topScorer: e.target.value })} />
          <Input label="Top Scorer TDs" type="number" value={form.topScorerTDs} onChange={(e) => setForm({ ...form, topScorerTDs: parseInt(e.target.value) || 0 })} />
          <Button onClick={handleSave} isLoading={saving} className="w-full">{editing ? "Update" : "Create"}</Button>
        </div>
      </Modal>
    </div>
  );
}
