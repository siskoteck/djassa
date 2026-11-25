"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

interface BanniereItem {
  id: string;
  titre: string;
  sous_titre: string | null;
  image_url: string;
  lien_url: string | null;
  texte_bouton: string | null;
}

export function BannieresDjassa() {
  const [bannieres, setBannieres] = useState<BanniereItem[]>([]);
  const [indexActif, setIndexActif] = useState(0);

  useEffect(() => {
    supabase
      .from("bannieres")
      .select("id, titre, sous_titre, image_url, lien_url, texte_bouton")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setBannieres(data as BanniereItem[]);
        }
      });
  }, []);

  useEffect(() => {
    if (bannieres.length <= 1) return;
    const timer = setInterval(() => {
      setIndexActif((prev) => (prev + 1) % bannieres.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [bannieres.length]);

  if (bannieres.length === 0) return null;

  const courante = bannieres[indexActif] || bannieres;
  const lien = courante.lien_url || "/annonces";
  const estExterne = lien.startsWith("http");

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      <div className="relative rounded-3xl overflow-hidden border border-emerald-200 shadow-sm bg-gray-900 min-h-[190px] sm:min-h-[240px] flex items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={courante.image_url}
          alt={courante.titre}
          className="absolute inset-0 w-full h-full object-cover opacity-55"
        />

        <div className="relative z-10 p-6 sm:p-10 max-w-2xl text-white">
          <span className="inline-block bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full mb-2 uppercase">
            Sélection DJASSA Abidjan
          </span>
          <h2 className="text-xl sm:text-3xl font-black leading-tight">
            {courante.titre}
          </h2>
          {courante.sous_titre && (
            <p className="text-xs sm:text-sm text-gray-100 mt-1.5">
              {courante.sous_titre}
            </p>
          )}

          <div className="mt-4">
            {estExterne ? (
              <a
                href={lien}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition"
              >
                {courante.texte_bouton || "Découvrir"} →
              </a>
            ) : (
              <Link
                href={lien}
                className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition"
              >
                {courante.texte_bouton || "Découvrir"} →
              </Link>
            )}
          </div>
        </div>

        {bannieres.length > 1 && (
          <div className="absolute bottom-3 right-4 z-10 flex gap-1.5">
            {bannieres.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setIndexActif(i)}
                aria-label={`Bannière ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === indexActif ? "w-6 bg-emerald-400" : "w-2 bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
