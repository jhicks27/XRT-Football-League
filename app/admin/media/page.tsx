"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Video, Image as ImageIcon, Star, Youtube, Link as LinkIcon } from "lucide-react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import YoutubeEmbed from "@/components/ui/YoutubeEmbed";
import { useCollection, addDocument, updateDocument, deleteDocument } from "@/hooks/useFirestore";
import { useStorage } from "@/hooks/useStorage";
import { useActivityLog } from "@/hooks/useActivityLog";
import { MediaItem, Game } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import { getYoutubeVideoId, getYoutubeThumbnail } from "@/lib/youtube";
import { formatDate } from "@/lib/utils";

const emptyMedia: Omit<MediaItem, "id" | "createdAt"> = {
  title: "",
  description: "",
  type: "youtube",
  url: "",
  category: "highlight",
  featured: false,
};

export default function AdminMediaPage() {
  const { data: media, loading } = useCollection<MediaItem>("media", [orderBy("createdAt", "desc")]);
  const { data: games } = useCollection<Game>("games", [orderBy("date", "desc")]);
  const { uploadFile, uploading } = useStorage();
  const { logActivity } = useActivityLog();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [form, setForm] = useState(emptyMedia);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  if (loading) return <LoadingSpinner size="lg" />;

  const openCreate = (type: "youtube" | "image" = "youtube") => {
    setEditing(null);
    setForm({ ...emptyMedia, type });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (item: MediaItem) => {
    setEditing(item);
    setForm({
      title: item.title,
      description: item.description,
      type: item.type,
      url: item.url,
      category: item.category,
      gameId: item.gameId,
      teamId: item.teamId,
      playerId: item.playerId,
      featured: item.featured,
      thumbnailUrl: item.thumbnailUrl,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let url = form.url;
      let thumbnailUrl = form.thumbnailUrl;

      if (form.type === "image" && imageFile) {
        url = await uploadFile(imageFile, `media/${Date.now()}_${imageFile.name}`);
      }

      if (form.type === "youtube" && form.url) {
        const videoId = getYoutubeVideoId(form.url);
        if (videoId) {
          thumbnailUrl = getYoutubeThumbnail(videoId);
        }
      }

      const data = { ...form, url, thumbnailUrl };

      if (editing) {
        await updateDocument("media", editing.id, data);
        await logActivity("updated", "team", editing.id, `Updated media: ${form.title}`);
      } else {
        const docRef = await addDocument("media", data);
        await logActivity("created", "team", docRef.id, `Added media: ${form.title}`);
      }
      setModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MediaItem) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    await deleteDocument("media", item.id);
    await logActivity("deleted", "team", item.id, `Deleted media: ${item.title}`);
  };

  const toggleFeatured = async (item: MediaItem) => {
    await updateDocument("media", item.id, { featured: !item.featured });
  };

  return (
    <div>
      <PageHeader
        title="Manage Media"
        description="Add highlights, interviews, and league content"
        action={
          <div className="flex gap-2">
            <Button onClick={() => openCreate("youtube")} variant="primary">
              <Youtube className="w-4 h-4 mr-2" /> Add YouTube Video
            </Button>
            <Button onClick={() => openCreate("image")} variant="secondary">
              <ImageIcon className="w-4 h-4 mr-2" /> Upload Image
            </Button>
          </div>
        }
      />

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total", value: media.length },
          { label: "Highlights", value: media.filter(m => m.category === "highlight").length },
          { label: "Interviews", value: media.filter(m => m.category === "interview").length },
          { label: "Featured", value: media.filter(m => m.featured).length },
        ].map(s => (
          <Card key={s.label} className="p-3 text-center">
            <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {media.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                {item.thumbnailUrl ? (
                  <img src={item.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    {item.type === "youtube" ? <Youtube className="w-6 h-6 text-red-500" /> : <ImageIcon className="w-6 h-6 text-gray-400" />}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={item.type === "youtube" ? "danger" : "info"}>{item.type}</Badge>
                  <Badge>{item.category}</Badge>
                  {item.featured && <Badge variant="warning">Featured</Badge>}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(item.createdAt)}</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => toggleFeatured(item)} className={`p-2 rounded-lg transition-colors ${item.featured ? "bg-yellow-50 dark:bg-yellow-950" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}>
                  <Star className={`w-4 h-4 ${item.featured ? "text-league-gold fill-league-gold" : "text-gray-400"}`} />
                </button>
                <button onClick={() => openEdit(item)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
                <button onClick={() => handleDelete(item)} className="p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg">
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          </Card>
        ))}
        {media.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No media yet. Add your first YouTube video or image!</p>
          </div>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Media" : form.type === "youtube" ? "Add YouTube Video" : "Upload Image"}>
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Week 5 Highlights - Eagles vs Panthers" required />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..." />

          {form.type === "youtube" ? (
            <div>
              <Input
                label="YouTube URL"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              {form.url && getYoutubeVideoId(form.url) && (
                <div className="mt-3">
                  <YoutubeEmbed url={form.url} title="Preview" />
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="text-sm text-gray-500" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as any })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="highlight">Highlight</option>
              <option value="interview">Interview</option>
              <option value="recap">Game Recap</option>
              <option value="announcement">Announcement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Link to Game (optional)</label>
            <select
              value={form.gameId || ""}
              onChange={(e) => setForm({ ...form, gameId: e.target.value || undefined })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">None</option>
              {games.map(g => (
                <option key={g.id} value={g.id}>{g.homeTeamName} vs {g.awayTeamName} - Week {g.week}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="w-4 h-4 text-primary-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured (shows on top of media page)</span>
          </label>

          <Button onClick={handleSave} isLoading={saving || uploading} className="w-full">
            {editing ? "Update" : "Add Media"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
