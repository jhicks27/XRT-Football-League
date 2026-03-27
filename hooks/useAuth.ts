"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/types";

const googleProvider = new GoogleAuthProvider();

// Fetch profile via Firestore REST API — bypasses SDK connection issues
async function fetchProfileREST(user: User): Promise<UserProfile | null> {
  try {
    const token = await user.getIdToken();
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${user.uid}`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    const data = await res.json();
    const f = data.fields || {};
    return {
      id: user.uid,
      name: f.name?.stringValue || user.displayName || "User",
      email: f.email?.stringValue || user.email || "",
      role: (f.role?.stringValue || "user") as UserRole,
      createdAt: f.createdAt?.stringValue || new Date().toISOString(),
      avatarUrl: f.avatarUrl?.stringValue,
    };
  } catch (err) {
    console.warn("REST profile fetch failed:", err);
    return null;
  }
}

// Build a basic profile from Firebase Auth user data
function fallbackProfile(user: User): UserProfile {
  return {
    id: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "User",
    email: user.email || "",
    role: "user" as UserRole,
    createdAt: new Date().toISOString(),
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Try REST API first (bypasses SDK issues), then fallback to auth data
        const p = await fetchProfileREST(firebaseUser);
        setProfile(p || fallbackProfile(firebaseUser));
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const p = await fetchProfileREST(cred.user);
    setProfile(p || fallbackProfile(cred.user));
    return cred;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const newProfile: Omit<UserProfile, "id"> = {
      name,
      email,
      role: "user" as UserRole,
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", cred.user.uid), newProfile);
    setProfile({ id: cred.user.uid, ...newProfile });
    return cred;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const p = await fetchProfileREST(cred.user);
    if (p) {
      setProfile(p);
    } else {
      // First time Google sign-in — create user profile
      const newProfile: Omit<UserProfile, "id"> = {
        name: cred.user.displayName || "User",
        email: cred.user.email || "",
        role: "user" as UserRole,
        avatarUrl: cred.user.photoURL || undefined,
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, "users", cred.user.uid), newProfile);
      } catch {
        // SDK write failed — profile will still work from auth data
      }
      setProfile({ id: cred.user.uid, ...newProfile });
    }
    return cred;
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  }, []);

  const isAdmin = profile?.role === "admin" || profile?.role === "executive";
  const isExecutive = profile?.role === "executive";

  return { user, profile, loading, signIn, signUp, signInWithGoogle, signOut, resetPassword, isAdmin, isExecutive };
}
