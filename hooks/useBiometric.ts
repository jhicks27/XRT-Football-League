"use client";

import { useState, useCallback } from "react";

export function useBiometric() {
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if biometric auth is available
  const checkAvailability = useCallback(async () => {
    try {
      if (!window.PublicKeyCredential) {
        setAvailable(false);
        return false;
      }
      const result = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      setAvailable(result);
      return result;
    } catch {
      setAvailable(false);
      return false;
    }
  }, []);

  // Register biometric for a user (save after login)
  const registerBiometric = useCallback(async (userId: string, userName: string) => {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "XRT Football League", id: window.location.hostname },
          user: {
            id: new TextEncoder().encode(userId),
            name: userName,
            displayName: userName,
          },
          pubKeyCredParams: [
            { alg: -7, type: "public-key" },
            { alg: -257, type: "public-key" },
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required",
          },
          timeout: 60000,
        },
      });

      if (credential) {
        // Store credential ID locally
        const rawId = new Uint8Array((credential as PublicKeyCredential).rawId);
        const credId = btoa(Array.from(rawId).map(b => String.fromCharCode(b)).join(""));
        localStorage.setItem("xrt-biometric-cred", credId);
        localStorage.setItem("xrt-biometric-user", userId);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, []);

  // Authenticate with biometric
  const authenticateBiometric = useCallback(async (): Promise<string | null> => {
    try {
      const storedCredId = localStorage.getItem("xrt-biometric-cred");
      const storedUserId = localStorage.getItem("xrt-biometric-user");

      if (!storedCredId || !storedUserId) return null;

      const credIdBuffer = Uint8Array.from(atob(storedCredId), (c) => c.charCodeAt(0));
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: credIdBuffer, type: "public-key" }],
          userVerification: "required",
          timeout: 60000,
        },
      });

      if (assertion) {
        return storedUserId;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, []);

  const isBiometricRegistered = useCallback(() => {
    return !!localStorage.getItem("xrt-biometric-cred");
  }, []);

  return {
    available,
    error,
    checkAvailability,
    registerBiometric,
    authenticateBiometric,
    isBiometricRegistered,
  };
}
