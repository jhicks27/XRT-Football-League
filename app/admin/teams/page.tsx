"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Upload, Users } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection, addDocument, updateDocument, deleteDocument } from "@/hooks/useFirestore";
import { useStorage } from "@/hooks/useStorage";
import { useActivityLog } from "@/hooks/useActivityLog";
import { Team } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import Image from "next/image";

const emptyTeam = { name: "", abbreviation: "", conference: "", division: "", logoUrl: "", wins: 0, losses: 0, ties: 0, points: 0 };

export default function AdminTeamsPage() {
  const { data: teams, loading } = useCollection<Team>("teams", [orderBy("name")]);
  const { uploadFile, uploading } = useStorage();
  const { logActivity } = useActivityLog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [form, setForm] = useState(emptyTeam);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  if (loading) return <LoadingSpinner size="lg" />;

  const openCreate = () => {
    setEditingTeam(null);
    setForm(emptyTeam);
    setLogoFile(null);
    setModalOpen(true);
  };

  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setForm({ name: team.name, abbreviation: team.abbreviation, conference: team.conference, division: team.division, logoUrl: team.logoUrl, wins: team.wins, losses: team.losses, ties: team.ties, points: team.points });
    setLogoFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let logoUrl = form.logoUrl;
      if (logoFile) {
        logoUrl = await uploadFile(logoFile, `teams/${Date.now()}_${logoFile.name}`);
      }

      const data = { ...form, logoUrl };

      if (editingTeam) {
        await updateDocument("teams", editingTeam.id, data);
        await logActivity("updated", "team", editingTeam.id, `Updated team: ${form.name}`);
      } else {
        const docRef = await addDocument("teams", data);
        await logActivity("created", "team", docRef.id, `Created team: ${form.name}`);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (team: Team) => {
    if (!confirm(`Delete ${team.name}?`)) return;
    await deleteDocument("teams", team.id);
    await logActivity("deleted", "team", team.id, `Deleted team: ${team.name}`);
  };

  return (
    <div>
      <PageHeader
        title="Manage Teams"
        description="Create, edit, and delete teams"
        action={
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Team
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                {team.logoUrl ? (
                  <Image src={team.logoUrl} alt={team.name} width={48} height={48} className="object-cover" />
                ) : (
                  <Users className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{team.name}</h3>
                <p className="text-xs text-gray-500">{team.wins}W - {team.losses}L</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(team)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => handleDelete(team)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingTeam ? "Edit Team" : "Create Team"}>
        <div className="space-y-4">
          <Input label="Team Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Abbreviation" value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} placeholder="e.g. NYG" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Conference" value={form.conference} onChange={(e) => setForm({ ...form, conference: e.target.value })} />
            <Input label="Division" value={form.division} onChange={(e) => setForm({ ...form, division: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Wins" type="number" value={form.wins} onChange={(e) => setForm({ ...form, wins: parseInt(e.target.value) || 0 })} />
            <Input label="Losses" type="number" value={form.losses} onChange={(e) => setForm({ ...form, losses: parseInt(e.target.value) || 0 })} />
            <Input label="Ties" type="number" value={form.ties} onChange={(e) => setForm({ ...form, ties: parseInt(e.target.value) || 0 })} />
          </div>
          <Input label="Points" type="number" value={form.points} onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team Logo</label>
            <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="text-sm text-gray-500" />
          </div>
          <Button onClick={handleSave} isLoading={saving || uploading} className="w-full">
            {editingTeam ? "Update Team" : "Create Team"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
