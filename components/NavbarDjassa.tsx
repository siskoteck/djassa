"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { obtenirFavorisIds } from "@/lib/favoris";

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "siskoteck@gmail.com"
).toLowerCase();

function NavbarDjassaContenu() {
  const pathname = usePathname() || "/";
  const [connecte, setConnecte] = useState(false);
  const [estAdmin, setEstAdmin] = useState(false);
  const [nbFavoris, setNbFavoris] = useState(0);

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

    function majFavoris() {
      setNbFavoris(obtenirFavorisIds().length);
    }

    majFavoris();
    window.addEventListener("djassa-favoris-maj", majFavoris);
    window.addEventListener("storage", majFavoris);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener("djassa-favoris-maj", majFavoris);
      window.removeEventListener("storage", majFavoris);
    };
  }, []);

  function estActif(href: string) {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  }

  function styleLienDesktop(href: string) {
    return estActif(href)
      ? "bg-emerald-100 text-emerald-900 font-extrabold px-3.5 py-2 rounded-xl transition"
      : "text-gray-700 hover:text-emerald-700 hover:bg-gray-50 font-semibold px-3.5 py-2 rounded-xl transition";
  }

  function styleOngletMobile(href: string) {
    return estActif(href)
      ? "flex flex-col items-center justify-center gap-0.5 text-emerald-700 font-extrabold"
      : "flex flex-col items-center justify-center gap-0.5 text-gray-500 hover:text-emerald-700 font-medium";
  }

  return (
    <>
      {/* Barre supérieure (Desktop + Mobile épuré) */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl font-black tracking-tight text-emerald-600">
              DJASSA
            </span>
            <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
              Abidjan
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm">
            <Link href="/" className={styleLienDesktop("/")}>
              Accueil
            </Link>
            <Link href="/annonces" className={styleLienDesktop("/annonces")}>
              Catalogue
            </Link>
            <Link href="/favoris" className={styleLienDesktop("/favoris")}>
              ❤️ Favoris{nbFavoris > 0 ? ` (${nbFavoris})` : ""}
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

          {/* Actions droites */}
          <div className="flex items-center gap-2">
            <Link
              href="/annonces"
              aria-label="Rechercher un article"
              className="md:hidden w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm"
            >
              🔍
            </Link>

            {estAdmin && (
              <Link
                href="/admin"
                className={`text-xs font-extrabold px-3 py-2 rounded-xl transition ${
                  estActif("/admin")
                    ? "bg-emerald-700 text-white ring-2 ring-emerald-300"
                    : "bg-gray-900 hover:bg-gray-800 text-white"
                }`}
              >
                ⚙️ Admin
              </Link>
            )}

            <Link
              href="/publier"
              className={`hidden sm:inline-flex items-center gap-1 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-xs ${
                estActif("/publier")
                  ? "bg-emerald-800 text-white ring-2 ring-emerald-300"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              + Vendre
            </Link>

            {connecte ? (
              <Link
                href="/mon-compte"
                className={`text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-2 rounded-xl border transition ${
                  estActif("/mon-compte")
                    ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                    : "border-gray-300 hover:bg-gray-50 text-gray-800"
                }`}
              >
                👤 Compte
              </Link>
            ) : (
              <Link
                href="/connexion"
                className={`text-xs sm:text-sm font-bold px-3 sm:px-3.5 py-2 rounded-xl border transition ${
                  estActif("/connexion")
                    ? "bg-emerald-100 border-emerald-400 text-emerald-900"
                    : "border-gray-300 hover:bg-gray-50 text-gray-800"
                }`}
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Barre de navigation inférieure fixe sur Mobile (App-like) */}
      <nav
        aria-label="Navigation principale mobile"
        className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <div className="grid grid-cols-5 items-center text-[11px]">
          <Link href="/" className={styleOngletMobile("/")}>
            <span className="text-lg leading-none">🏠</span>
            <span>Accueil</span>
          </Link>

          <Link href="/annonces" className={styleOngletMobile("/annonces")}>
            <span className="text-lg leading-none">🛍️</span>
            <span>Catalogue</span>
          </Link>

          {/* Bouton central surélevé + Vendre */}
          <Link
            href="/publier"
            className="flex flex-col items-center justify-center -mt-5"
          >
            <span className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg flex items-center justify-center text-2xl font-black border-4 border-white active:scale-95 transition">
              +
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 mt-0.5">
              Vendre
            </span>
          </Link>

          <Link href="/favoris" className={styleOngletMobile("/favoris")}>
            <span className="relative text-lg leading-none">
              ❤️
              {nbFavoris > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-red-600 text-white text-[9px] font-black min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {nbFavoris}
                </span>
              )}
            </span>
            <span>Favoris</span>
          </Link>

          <Link
            href={connecte ? "/mes-annonces" : "/connexion"}
            className={styleOngletMobile(
              connecte ? "/mes-annonces" : "/connexion"
            )}
          >
            <span className="text-lg leading-none">
              {connecte ? "📦" : "👤"}
            </span>
            <span>{connecte ? "Annonces" : "Compte"}</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

export function NavbarDjassa() {
  return (
    <Suspense fallback={<div className="h-16 bg-white border-b" />}>
      <NavbarDjassaContenu />
    </Suspense>
  );
}