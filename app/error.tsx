"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalErrorDjassa({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 p-8 text-center shadow-xs space-y-5">
        <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-gray-900">
          Une erreur temporaire est survenue
        </h1>
        <p className="text-sm text-gray-600">
          Notre équipe technique a été alertée. Vérifiez votre connexion et réessayez.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-sm px-5 py-3 rounded-xl transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Réessayer</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-800 font-bold text-sm px-5 py-3 rounded-xl transition"
          >
            <Home className="w-4 h-4" />
            <span>Accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}