"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { updateDocument } from "@/hooks/useFirestore";
import Button from "@/components/ui/Button";

interface LiveGameClockProps {
  gameId: string;
  status: "scheduled" | "in_progress" | "final";
  isAdmin?: boolean;
}

export default function LiveGameClock({ gameId, status, isAdmin = false }: LiveGameClockProps) {
  const [quarter, setQuarter] = useState(1);
  const [minutes, setMinutes] = useState(15);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running || status !== "in_progress") return;
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev === 0) {
          if (minutes === 0) {
            if (quarter < 4) {
              setQuarter((q) => q + 1);
              setMinutes(15);
              return 0;
            } else {
              setRunning(false);
              return 0;
            }
          }
          setMinutes((m) => m - 1);
          return 59;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [running, minutes, quarter, status]);

  if (status === "scheduled") {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-500">Game hasn&apos;t started</p>
        {isAdmin && (
          <Button
            size="sm"
            className="mt-2"
            onClick={() => updateDocument("games", gameId, { status: "in_progress" })}
          >
            <Play className="w-3 h-3 mr-1" /> Start Game
          </Button>
        )}
      </div>
    );
  }

  if (status === "final") {
    return (
      <div className="text-center">
        <span className="text-sm font-bold text-green-600 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full">
          FINAL
        </span>
      </div>
    );
  }

  return (
    <div className="text-center">
      <motion.div
        animate={{ scale: running ? [1, 1.02, 1] : 1 }}
        transition={{ duration: 1, repeat: running ? Infinity : 0 }}
      >
        <div className="flex items-center justify-center gap-1">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Live</span>
        </div>
        <p className="text-3xl font-black text-gray-900 dark:text-white font-mono mt-1">
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </p>
        <p className="text-sm font-semibold text-primary-600 mt-0.5">Q{quarter}</p>
      </motion.div>

      {isAdmin && (
        <div className="flex items-center justify-center gap-2 mt-3">
          <button
            onClick={() => setRunning(!running)}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { setMinutes(15); setSeconds(0); setRunning(false); }}
            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => updateDocument("games", gameId, { status: "final" })}
          >
            End Game
          </Button>
        </div>
      )}
    </div>
  );
}
