"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "cv2tcv2t@gmail.com";

export default function AuthButtons() {
  const router = useRouter();
  const [nom, setNom] = useState<string | null>(null);
  const [estAdmin, setEstAdmin] = useState(false);
  const [connecte, setConnecte] = useState(false);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    function appliquer(user: any) {
      setConnecte(!!user);
      setNom(user?.user_metadata?.nom ?? null);
      setEstAdmin(user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
    }

    supabase.auth.getSession().then(({ data }) => {
      appliquer(data.session?.user);
      setPret(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      appliquer(session?.user);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function deconnexion() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (!pret) return null;

  if (connecte) {
    return (
      <div className="flex items-center gap-3">
        {estAdmin && (
          <Link
            href="/admin"
            className="text-xs font-bold bg-gray-900 text-white px-2.5 py-1 rounded-md hover:bg-gray-800"
          >
            Admin
          </Link>
        )}
        <Link
          href="/mes-annonces"
          className="text-sm font-medium text-gray-700 hover:text-orange-600"
        >
          Mes annonces
        </Link>
        <span className="text-sm text-gray-700 hidden lg:inline">
          {nom ?? "Mon compte"}
        </span>
        <button
          onClick={deconnexion}
          className="text-sm text-gray-600 hover:underline"
        >
          Déconnexion
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/auth/login" className="text-sm font-medium hover:underline">
        Connexion
      </Link>
      <Link
        href="/auth/register"
        className="text-sm font-semibold bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
      >
        S&apos;inscrire
      </Link>
    </div>
  );
}
