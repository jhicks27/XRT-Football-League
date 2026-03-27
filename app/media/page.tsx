"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Image as ImageIcon, Mic, Star, Filter } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import YoutubeEmbed from "@/components/ui/YoutubeEmbed";
import { useCollection } from "@/hooks/useFirestore";
import { MediaItem } from "@/types";
import { orderBy } from "@/hooks/useFirestore";
import Image from "next/image";

const categories = [
  { value: "all", label: "All", icon: Star },
  { value: "highlight", label: "Highlights", icon: Video },
  { value: "interview", label: "Interviews", icon: Mic },
  { value: "recap", label: "Recaps", icon: Video },
  { value: "announcement", label: "News", icon: ImageIcon },
];

export default function MediaPage() {
  const { data: media, loading } = useCollection<MediaItem>("media", [orderBy("createdAt", "desc")]);
  const [filter, setFilter] = useState("all");

  if (loading) return <LoadingSpinner size="lg" />;

  const filtered = filter === "all" ? media : media.filter(m => m.category === filter);
  const featured = media.filter(m => m.featured);

  return (
    <div>
      <PageHeader title="Media Hub" description="Game highlights, interviews, and league news" />

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-league-gold" /> Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featured.slice(0, 2).map((item) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {item.type === "youtube" ? (
                  <YoutubeEmbed url={item.url} title={item.title} />
                ) : item.type === "image" ? (
                  <div className="aspect-video rounded-xl overflow-hidden relative">
                    <Image src={item.url} alt={item.title} fill className="object-cover" />
                  </div>
                ) : null}
                <p className="font-bold text-gray-900 dark:text-white mt-2">{item.title}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setFilter(cat.value)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === cat.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Video} title="No media yet" description="Check back soon for highlights and interviews" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {item.type === "youtube" ? (
                <div>
                  <YoutubeEmbed url={item.url} title={item.title} />
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={item.category === "highlight" ? "danger" : item.category === "interview" ? "info" : "default"}>
                        {item.category}
                      </Badge>
                      {item.featured && <Badge variant="warning">Featured</Badge>}
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1 text-sm">{item.title}</p>
                    {item.description && <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>}
                  </div>
                </div>
              ) : item.type === "image" ? (
                <Card className="overflow-hidden">
                  <div className="aspect-video relative">
                    <Image src={item.url} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="p-3">
                    <Badge variant={item.category === "highlight" ? "danger" : "default"}>{item.category}</Badge>
                    <p className="font-semibold text-gray-900 dark:text-white mt-1 text-sm">{item.title}</p>
                  </div>
                </Card>
              ) : null}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
