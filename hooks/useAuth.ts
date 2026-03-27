"use client";

import { useState, useEffect, useCallback } from "react";
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
import { doc, getDoc, setDoc, enableNetwork, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/types";

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure Firestore network is enabled
    enableNetwork(db).catch(() => {});

    let profileUnsub: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // Clean up previous profile listener
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }
      if (firebaseUser) {
        // Use onSnapshot instead of getDoc — it works offline and retries automatically
        profileUnsub = onSnapshot(
          doc(db, "users", firebaseUser.uid),
          (snapshot) => {
            if (snapshot.exists()) {
              setProfile({ id: snapshot.id, ...snapshot.data() } as UserProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          },
          (err) => {
            console.warn("Could not fetch user profile:", err);
            setProfile(null);
            setLoading(false);
          }
        );
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    try {
      const userDoc = await getDoc(doc(db, "users", cred.user.uid));
      if (userDoc.exists()) {
        setProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
      }
    } catch {
      // Profile will be picked up by the onSnapshot listener
    }
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
    const userDoc = await getDoc(doc(db, "users", cred.user.uid));
    if (userDoc.exists()) {
      setProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
    } else {
      // First time Google sign-in — create user profile
      const newProfile: Omit<UserProfile, "id"> = {
        name: cred.user.displayName || "User",
        email: cred.user.email || "",
        role: "user" as UserRole,
        avatarUrl: cred.user.photoURL || undefined,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", cred.user.uid), newProfile);
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
