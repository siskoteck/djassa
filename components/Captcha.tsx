"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

// Vrai si une clé de site est configurée
export const CAPTCHA_ACTIF = !!SITE_KEY;

function chargerScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.turnstile) return resolve();

    const existant = document.getElementById("turnstile-script");
    if (existant) {
      existant.addEventListener("load", () => resolve());
      return;
    }

    const script = document.createElement("script");
    script.id = "turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

type Props = {
  onToken: (token: string | null) => void;
  // Augmentez cette valeur pour relancer la vérification (un jeton ne sert qu'une fois)
  resetSignal?: number;
};

export default function Captcha({ onToken, resetSignal = 0 }: Props) {
  const conteneur = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!SITE_KEY) return;
    let annule = false;

    chargerScript().then(() => {
      if (annule || !conteneur.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(conteneur.current, {
        sitekey: SITE_KEY,
        language: "fr",
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(null),
        "error-callback": () => onTokenRef.current(null),
      });
    });

    return () => {
      annule = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (resetSignal > 0 && widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
      onTokenRef.current(null);
    }
  }, [resetSignal]);

  if (!SITE_KEY) return null;

  return <div ref={conteneur} className="flex justify-center" />;
}