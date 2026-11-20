"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "siskoteck@gmail.com"
).toLowerCase();

export function NavbarDjassa() {
  const [connecte, setConnecte] = useState(false);
  const [estAdmin, setEstAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const user = data.session?.user;
      setConnecte(Boolean(user));
      setEstAdmin(user?.email?.toLowerCase() === ADMIN_EMAIL);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      setConnecte(Boolean(user));
      setEstAdmin(user?.email?.toLowerCase() === ADMIN_EMAIL);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black tracking-tight text-emerald-600">
            DJASSA
          </span>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            Abidjan
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-700">
          <Link href="/" className="hover:text-emerald-600 transition">
            Accueil
          </Link>
          <Link href="/publier" className="hover:text-emerald-600 transition">
            Publier
          </Link>
        </nav>

        <div className="flex items-center gap-2.5">
          {estAdmin && (
            <Link
              href="/admin"
              className="bg-gray-900 hover:bg-gray-800 text-white text-xs font-extrabold px-3.5 py-2.5 rounded-xl transition"
            >
              ⚙️ Admin
            </Link>
          )}

          <Link
            href="/publier"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
          >
            + Vendre un article
          </Link>

          {connecte ? (
            <Link
              href="/mon-compte"
              className="border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl transition"
            >
              Mon compte
            </Link>
          ) : (
            <Link
              href="/connexion"
              className="border border-gray-300 hover:bg-gray-50 text-gray-800 text-xs sm:text-sm font-semibold px-3.5 py-2.5 rounded-xl transition"
            >
              Connexion
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
