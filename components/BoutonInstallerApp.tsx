"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function BoutonInstallerApp() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [estIOS, setEstIOS] = useState(false);
  const [dejaInstalle, setDejaInstalle] = useState(false);
  const [aideIOSVisible, setAideIOSVisible] = useState(false);
  const [masque, setMasque] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Enregistrement du Service Worker PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Vérifie si l'application est déjà ouverte en mode installé
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setDejaInstalle(true);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setEstIOS(ios);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  if (dejaInstalle || masque || (!deferredPrompt && !estIOS)) {
    return null;
  }

  async function lancerInstallation() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choix = await deferredPrompt.userChoice;
      if (choix.outcome === "accepted") {
        setDejaInstalle(true);
      }
      setDeferredPrompt(null);
    } else if (estIOS) {
      setAideIOSVisible((prev) => !prev);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40">
      <div className="bg-gray-900 text-white rounded-2xl p-4 shadow-xl border border-emerald-500/40">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-lg shrink-0">
              D
            </div>
            <div>
              <p className="text-xs font-extrabold text-white">
                Installer l&apos;app DJASSA
              </p>
              <p className="text-[11px] text-gray-300">
                Accès rapide sur votre téléphone
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={lancerInstallation}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3.5 py-2 rounded-xl transition"
            >
              📲 Installer
            </button>
            <button
              type="button"
              onClick={() => setMasque(true)}
              aria-label="Fermer"
              className="text-gray-400 hover:text-white text-xs px-2 py-1.5"
            >
              ✕
            </button>
          </div>
        </div>

        {aideIOSVisible && (
          <p className="text-[11px] text-emerald-200 mt-3 pt-2.5 border-t border-gray-800 leading-relaxed">
            Sur iPhone/Safari : appuyez sur le bouton{" "}
            <strong>Partager (⬆️)</strong> en bas de l&apos;écran puis choisissez{" "}
            <strong>« Sur l&apos;écran d&apos;accueil »</strong>.
          </p>
        )}
      </div>
    </div>
  );
}
