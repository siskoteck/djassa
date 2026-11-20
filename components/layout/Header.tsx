"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function Header() {
  const router = useRouter();
  const [connecte, setConnecte] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setConnecte(Boolean(data.session?.user));
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setConnecte(Boolean(session?.user));
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleDeconnexion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-extrabold text-emerald-600 tracking-tight">
            DJASSA
          </span>
          <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full">
            Abidjan
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-5 text-sm font-medium">
          <Link href="/annonces" className="text-gray-700 hover:text-emerald-600">
            Annonces
          </Link>
          <Link
            href="/publier"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl font-semibold transition text-xs sm:text-sm"
          >
            + Publier
          </Link>

          {connecte ? (
            <>
              <Link
                href="/mon-profil"
                className="text-gray-800 hover:text-emerald-600 font-semibold"
              >
                Mon compte
              </Link>
              <button
                type="button"
                onClick={handleDeconnexion}
                className="text-xs text-red-600 hover:underline font-semibold"
              >
                Quitter
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-gray-800 hover:text-emerald-600 font-semibold"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
