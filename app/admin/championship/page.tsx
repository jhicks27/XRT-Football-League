"use client";

import { useState } from "react";
import { Trophy, Award, Upload } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import { useCollection, addDocument, updateDocument } from "@/hooks/useFirestore";
import { useStorage } from "@/hooks/useStorage";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useAuth } from "@/hooks/useAuth";
import { Championship, Team, Player } from "@/types";
import { orderBy } from "@/hooks/useFirestore";

export default function AdminChampionshipPage() {
  const { isExecutive, isAdmin } = useAuth();
  const { data: championships, loading } = useCollection<Championship>("championship", [orderBy("date", "desc")]);
  const { data: teams } = useCollection<Team>("teams", [orderBy("name")]);
  const { data: players } = useCollection<Player>("players", [orderBy("name")]);
  const { uploadFile, uploading } = useStorage();
  const { logActivity } = useActivityLog();
  const [saving, setSaving] = useState(false);

  const latest = championships[0];
  const [form, setForm] = useState({
    season: latest?.season || "2025",
    winnerTeamId: latest?.winnerTeamId || "",
    runnerUpTeamId: latest?.runnerUpTeamId || "",
    mvpPlayerId: latest?.mvpPlayerId || "",
    finalScore: latest?.finalScore || "",
    date: latest?.date || "",
  });
  const [highlightFiles, setHighlightFiles] = useState<FileList | null>(null);

  if (loading) return <LoadingSpinner size="lg" />;

  if (!isExecutive && !isAdmin) {
    return (
      <div className="text-center py-20">
        <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-600 dark:text-gray-400">Admin Access Required</h2>
        <p className="text-gray-500 mt-2">Only admins and executives can manage championship data.</p>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const winner = teams.find(t => t.id === form.winnerTeamId);
      const runner = teams.find(t => t.id === form.runnerUpTeamId);
      const mvp = players.find(p => p.id === form.mvpPlayerId);

      let highlightImages: string[] = latest?.highlightImages || [];
      if (highlightFiles) {
        for (let i = 0; i < highlightFiles.length; i++) {
          const url = await uploadFile(highlightFiles[i], `championship/${Date.now()}_${highlightFiles[i].name}`);
          highlightImages.push(url);
        }
      }

      const data = {
        season: form.season,
        winnerTeamId: form.winnerTeamId,
        winnerTeamName: winner?.name || "",
        winnerTeamLogo: winner?.logoUrl || "",
        runnerUpTeamId: form.runnerUpTeamId,
        runnerUpTeamName: runner?.name || "",
        mvpPlayerId: form.mvpPlayerId,
        mvpPlayerName: mvp?.name || "",
        mvpPlayerImage: mvp?.imageUrl || "",
        finalScore: form.finalScore,
        date: form.date,
        highlightImages,
        highlightVideos: latest?.highlightVideos || [],
      };

      if (latest) {
        await updateDocument("championship", latest.id, data);
        await logActivity("updated", "championship", latest.id, `Updated championship: ${form.season}`);
      } else {
        const docRef = await addDocument("championship", data);
        await logActivity("created", "championship", docRef.id, `Created championship: ${form.season}`);
      }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Manage Championship" description="Set the champion, MVP, and highlights" />

      <Card className="p-6 max-w-2xl">
        <div className="space-y-4">
          <Input label="Season" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Champion Team</label>
            <select value={form.winnerTeamId} onChange={(e) => setForm({ ...form, winnerTeamId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">Select champion</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Runner Up</label>
            <select value={form.runnerUpTeamId} onChange={(e) => setForm({ ...form, runnerUpTeamId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">Select runner up</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">MVP Player</label>
            <select value={form.mvpPlayerId} onChange={(e) => setForm({ ...form, mvpPlayerId: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="">Select MVP</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.name} ({p.position})</option>)}
            </select>
          </div>
          <Input label="Final Score" value={form.finalScore} onChange={(e) => setForm({ ...form, finalScore: e.target.value })} placeholder="28-24" />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Highlight Images</label>
            <input type="file" accept="image/*" multiple onChange={(e) => setHighlightFiles(e.target.files)} className="text-sm text-gray-500" />
          </div>
          <Button onClick={handleSave} isLoading={saving || uploading} className="w-full" size="lg">
            <Trophy className="w-4 h-4 mr-2" /> {latest ? "Update Championship" : "Set Championship"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
