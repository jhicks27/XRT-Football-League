"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./useAuth";
import { useCallback } from "react";

export function useActivityLog() {
  const { profile } = useAuth();

  const logActivity = useCallback(
    async (
      action: string,
      entityType: "team" | "player" | "game" | "playoff" | "championship" | "user",
      entityId: string,
      details: string
    ) => {
      if (!profile) return;
      await addDoc(collection(db, "activityLog"), {
        action,
        entityType,
        entityId,
        userId: profile.id,
        userName: profile.name,
        details,
        createdAt: new Date().toISOString(),
      });
    },
    [profile]
  );

  return { logActivity };
}
