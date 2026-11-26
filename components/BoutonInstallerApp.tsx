"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function abonnerVide() {
  return () => {};
}

export function BoutonInstallerApp() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installeMaintenant, setInstalleMaintenant] = useState(false);
  const [aideIOSVisible, setAideIOSVisible] = useState(false);
  const [masque, setMasque] = useState(false);

  const estStandalone = useSyncExternalStore(
    abonnerVide,
    () => window.matchMedia("(display-mode: standalone)").matches,
    () => true
  );

  const estIOS = useSyncExternalStore(
    abonnerVide,
    () => /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()),
    () => false
  );

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  if (
    estStandalone ||
    installeMaintenant ||
    masque ||
    (!deferredPrompt && !estIOS)
  ) {
    return null;
  }

  async function lancerInstallation() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choix = await deferredPrompt.userChoice;
      if (choix.outcome === "accepted") {
        setInstalleMaintenant(true);
      }
      setDeferredPrompt(null);
    } else if (estIOS) {
      setAideIOSVisible((prev) => !prev);
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-40">
      <div className="bg-emerald-900 text-white rounded-2xl p-4 shadow-xl border border-emerald-700 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-amber-300">
            📲 Application DJASSA
          </p>
          <p className="text-[11px] text-emerald-100 mt-0.5">
            {aideIOSVisible
              ? "Appuyez sur Partager (en bas) puis « Sur l'écran d'accueil »."
              : "Installez DJASSA sur votre téléphone pour un accès rapide."}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!estIOS && (
            <button
              type="button"
              onClick={lancerInstallation}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold px-3 py-2 rounded-xl transition"
            >
              Installer
            </button>
          )}
          {estIOS && !aideIOSVisible && (
            <button
              type="button"
              onClick={lancerInstallation}
              className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-extrabold px-3 py-2 rounded-xl transition"
            >
              Comment ?
            </button>
          )}
          <button
            type="button"
            onClick={() => setMasque(true)}
            aria-label="Fermer"
            className="text-emerald-200 hover:text-white text-xs font-bold px-2 py-1"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}