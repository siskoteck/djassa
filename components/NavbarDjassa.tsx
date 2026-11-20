"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "siskoteck@gmail.com"
).toLowerCase();

function NavbarDjassaContenu() {
  const pathname = usePathname();
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

  function styleLienDesktop(href: string) {
    const actif =
      href === "/" ? pathname === "/" : pathname?.startsWith(href);
    return actif
      ? "bg-emerald-100 text-emerald-800 font-extrabold px-3.5 py-2 rounded-xl transition"
      : "text-gray-700 hover:text-emerald-700 hover:bg-gray-50 font-semibold px-3.5 py-2 rounded-xl transition";
  }

  function styleLienMobile(href: string) {
    const actif =
      href === "/" ? pathname === "/" : pathname?.startsWith(href);
    return actif
      ? "bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1.5 rounded-lg transition"
      : "text-gray-700 hover:text-emerald-700 font-semibold px-3 py-1.5 rounded-lg transition";
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black tracking-tight text-emerald-600">
            DJASSA
          </span>
          <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
            Abidjan
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-2 text-sm">
          <Link href="/" className={styleLienDesktop("/")}>
            Accueil
          </Link>
          <Link href="/annonces" className={styleLienDesktop("/annonces")}>
            Toutes les annonces
          </Link>
          {connecte && (
            <Link
              href="/mes-annonces"
              className={styleLienDesktop("/mes-annonces")}
            >
              Mes annonces
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {estAdmin && (
            <Link
              href="/admin"
              className={`text-xs font-extrabold px-3 py-2.5 rounded-xl transition ${
                pathname?.startsWith("/admin")
                  ? "bg-emerald-700 text-white ring-2 ring-emerald-300"
                  : "bg-gray-900 hover:bg-gray-800 text-white"
              }`}
            >
              ⚙️ Admin
            </Link>
          )}

          <Link
            href="/publier"
            className={`text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2.5 rounded-xl transition shadow-sm ${
              pathname?.startsWith("/publier")
                ? "bg-emerald-800 text-white ring-2 ring-emerald-300"
                : "bg-emerald-600 hover:bg-emerald-700 text-white"
            }`}
          >
            + Vendre
          </Link>

          {connecte ? (
            <Link
              href="/mon-compte"
              className={`text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-2.5 rounded-xl border transition ${
                pathname?.startsWith("/mon-compte")
                  ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                  : "border-gray-300 hover:bg-gray-50 text-gray-800"
              }`}
            >
              Mon compte
            </Link>
          ) : (
            <Link
              href="/connexion"
              className={`text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-2.5 rounded-xl border transition ${
                pathname?.startsWith("/connexion")
                  ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                  : "border-gray-300 hover:bg-gray-50 text-gray-800"
              }`}
            >
              Connexion
            </Link>
          )}
        </div>
      </div>

      {/* Barre mobile avec onglet actif en surbrillance */}
      <nav className="flex md:hidden items-center justify-around border-t border-gray-100 py-2 text-xs">
        <Link href="/" className={styleLienMobile("/")}>
          🏠 Accueil
        </Link>
        <Link href="/annonces" className={styleLienMobile("/annonces")}>
          🛍️ Catalogue
        </Link>
        {connecte && (
          <Link
            href="/mes-annonces"
            className={styleLienMobile("/mes-annonces")}
          >
            📦 Mes annonces
          </Link>
        )}
      </nav>
    </div>
  );
}

export function NavbarDjassa() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <Suspense fallback={<div className="h-16" />}>
        <NavbarDjassaContenu />
      </Suspense>
    </header>
  );
}
