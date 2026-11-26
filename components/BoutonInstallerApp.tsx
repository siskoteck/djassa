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
  const [masque, setMasque] = useState<boolean>(() =>
    typeof window !== "undefined"
      ? sessionStorage.getItem("djassa_pwa_masque") === "1"
      : false
  );

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

  function fermerBanniere() {
    setMasque(true);
    sessionStorage.setItem("djassa_pwa_masque", "1");
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
    <div className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 max-w-[270px]">
      <div className="bg-emerald-950/95 backdrop-blur-md text-white rounded-full pl-3.5 pr-2 py-1.5 shadow-lg border border-emerald-700/80 flex items-center gap-2">
        <span className="text-xs font-bold text-emerald-100 truncate">
          📲 {aideIOSVisible ? "Partager → Écran d'accueil" : "App DJASSA"}
        </span>

        {!aideIOSVisible && (
          <button
            type="button"
            onClick={lancerInstallation}
            className="bg-emerald-500 hover:bg-emerald-400 text-gray-950 text-[11px] font-black px-2.5 py-1 rounded-full transition shrink-0"
          >
            {estIOS ? "Aide" : "Installer"}
          </button>
        )}

        <button
          type="button"
          onClick={fermerBanniere}
          aria-label="Fermer"
          className="w-6 h-6 rounded-full hover:bg-white/10 text-emerald-300 hover:text-white text-xs font-bold flex items-center justify-center shrink-0"
        >
          ✕
        </button>
      </div>
    </div>
  );
}