"use client";

import { useState } from "react";
import { Share2, Twitter, Facebook, Link as LinkIcon, Check, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export default function ShareButton({ title, text, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const fullText = `${text} ${shareUrl}`;

  const shareOptions = [
    {
      name: "Twitter/X",
      icon: Twitter,
      color: "hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-500",
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`, "_blank"),
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600",
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`, "_blank"),
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "hover:bg-green-50 dark:hover:bg-green-950 text-green-500",
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(fullText)}`, "_blank"),
    },
    {
      name: "Copy Link",
      icon: copied ? Check : LinkIcon,
      color: copied ? "bg-green-50 dark:bg-green-950 text-green-500" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500",
      action: () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    },
  ];

  // Try native share first on mobile
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url: shareUrl });
        return;
      } catch {}
    }
    setOpen(!open);
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className="absolute right-0 top-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-50 min-w-[180px]"
          >
            {shareOptions.map((opt) => (
              <button
                key={opt.name}
                onClick={() => { opt.action(); if (opt.name !== "Copy Link") setOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${opt.color}`}
              >
                <opt.icon className="w-4 h-4" />
                {opt.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
