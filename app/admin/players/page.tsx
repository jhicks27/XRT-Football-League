"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, UserCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection, addDocument, updateDocument, deleteDocument } from "@/hooks/useFirestore";
import { useStorage } from "@/hooks/useStorage";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Player, Team } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import Image from "next/image";

const emptyStats = { gamesPlayed: 0, touchdowns: 0, passingYards: 0, rushingYards: 0, receivingYards: 0, tackles: 0, sacks: 0, interceptions: 0, fieldGoals: 0, completions: 0, attempts: 0 };
const emptyPlayer = { name: "", teamId: "", teamName: "", number: 0, position: "", imageUrl: "", height: "", weight: 0, age: 0, stats: emptyStats };

export default function AdminPlayersPage() {
  const { data: players, loading } = useCollection<Player>("players", [orderBy("name")]);
  const { data: teams } = useCollection<Team>("teams", [orderBy("name")]);
  const { uploadFile, uploading } = useStorage();
  const { logActivity } = useActivityLog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Player | null>(null);
  const [form, setForm] = useState(emptyPlayer);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  if (loading) return <LoadingSpinner size="lg" />;

  const openCreate = () => { setEditing(null); setForm(emptyPlayer); setImageFile(null); setModalOpen(true); };
  const openEdit = (p: Player) => {
    setEditing(p);
    setForm({ name: p.name, teamId: p.teamId, teamName: p.teamName || "", number: p.number, position: p.position, imageUrl: p.imageUrl, height: p.height, weight: p.weight, age: p.age, stats: { ...p.stats } });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        imageUrl = await uploadFile(imageFile, `players/${Date.now()}_${imageFile.name}`);
      }
      const selectedTeam = teams.find(t => t.id === form.teamId);
      const data = { ...form, imageUrl, teamName: selectedTeam?.name || form.teamName };
      if (editing) {
        await updateDocument("players", editing.id, data);
        await logActivity("updated", "player", editing.id, `Updated player: ${form.name}`);
      } else {
        const docRef = await addDocument("players", data);
        await logActivity("created", "player", docRef.id, `Created player: ${form.name}`);
      }
      setModalOpen(false);
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleDelete = async (p: Player) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    await deleteDocument("players", p.id);
    await logActivity("deleted", "player", p.id, `Deleted player: ${p.name}`);
  };

  const updateStats = (key: string, val: number) => {
    setForm({ ...form, stats: { ...form.stats, [key]: val } });
  };

  return (
    <div>
      <PageHeader title="Manage Players" description="Create, edit, and manage player profiles and stats" action={<Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Player</Button>} />

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Player</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Team</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Pos</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">TDs</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {players.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {p.imageUrl ? <Image src={p.imageUrl} alt={p.name} width={32} height={32} className="object-cover" /> : <span className="text-xs text-gray-400">#{p.number}</span>}
                    </div>
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.teamName}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{p.position}</td>
                <td className="px-4 py-3 text-right text-sm font-bold text-primary-600">{p.stats.touchdowns}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><Edit2 className="w-4 h-4 text-gray-500" /></button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg"><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Player" : "Create Player"}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
              <select value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                <option value="">Select team</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <Input label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} placeholder="QB, RB, WR..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Number" type="number" value={form.number} onChange={(e) => setForm({ ...form, number: parseInt(e.target.value) || 0 })} />
            <Input label="Age" type="number" value={form.age} onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })} />
            <Input label="Weight (lbs)" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) || 0 })} />
          </div>
          <Input label="Height" value={form.height} onChange={(e) => setForm({ ...form, height: e.target.value })} placeholder="6'2&quot;" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-sm text-gray-500" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm pt-2 border-t border-gray-200 dark:border-gray-700">Stats</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(form.stats).map(([key, val]) => (
              <Input key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, s => s.toUpperCase())} type="number" value={val} onChange={(e) => updateStats(key, parseInt(e.target.value) || 0)} />
            ))}
          </div>
          <Button onClick={handleSave} isLoading={saving || uploading} className="w-full">
            {editing ? "Update Player" : "Create Player"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
