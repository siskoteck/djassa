"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = (
  process.env.NEXT_PUBLIC_ADMIN_EMAIL || "siskoteck@gmail.com"
).toLowerCase();

interface AnnonceAdmin {
  id: string;
  created_at: string;
  titre: string;
  prix: number;
  commune: string;
  telephone: string | null;
  statut: string;
  booste: boolean;
}

interface VendeurAdmin {
  id: string;
  created_at: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  commune: string | null;
  verifie: boolean;
}

interface MessageContactAdmin {
  id: string;
  created_at: string;
  nom: string;
  telephone: string | null;
  email: string | null;
  sujet: string;
  message: string;
  lu: boolean;
}

export default function AdminDjassaPage() {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState<"annonces" | "vendeurs" | "messages">(
    "annonces"
  );

  const [annonces, setAnnonces] = useState<AnnonceAdmin[]>([]);
  const [vendeurs, setVendeurs] = useState<VendeurAdmin[]>([]);
  const [messages, setMessages] = useState<MessageContactAdmin[]>([]);
  const [recherche, setRecherche] = useState("");

  const [ancienMdp, setAncienMdp] = useState("");
  const [nouveauMdp, setNouveauMdp] = useState("");
  const [verifMdpEnCours, setVerifMdpEnCours] = useState(false);
  const [msgMdp, setMsgMdp] = useState("");
  useEffect(() => {
    async function chargerAdmin() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) {
        router.replace("/connexion");
        return;
      }

      setAutorise(true);

      const [resAnn, resVend, resMsg] = await Promise.all([
        supabase
          .from("annonces")
          .select("id, created_at, titre, prix, commune, telephone, statut, booste")
          .order("created_at", { ascending: false }),
        supabase
          .from("utilisateurs")
          .select("id, created_at, nom, email, telephone, commune, verifie")
          .order("created_at", { ascending: false }),
        supabase
          .from("messages_contact")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (resAnn.data) setAnnonces(resAnn.data as AnnonceAdmin[]);
      if (resVend.data) setVendeurs(resVend.data as VendeurAdmin[]);
      if (resMsg.data) setMessages(resMsg.data as MessageContactAdmin[]);
      setLoading(false);
    }

    chargerAdmin();
  }, [router]);

  async function toggleBoostAnnonce(id: string, boostActuel: boolean) {
    const nouveauBoost = !boostActuel;
    const { error } = await supabase
      .from("annonces")
      .update({ booste: nouveauBoost })
      .eq("id", id);

    if (!error) {
      setAnnonces((prev) =>
        prev.map((a) => (a.id === id ? { ...a, booste: nouveauBoost } : a))
      );
    }
  }

  async function supprimerAnnonceAdmin(id: string, titre: string) {
    if (!confirm(`Supprimer définitivement l'annonce "${titre}" ?`)) return;
    const { error } = await supabase.from("annonces").delete().eq("id", id);
    if (!error) {
      setAnnonces((prev) => prev.filter((a) => a.id !== id));
    }
  }

  async function toggleVendeurVerifie(id: string, verifieActuel: boolean) {
    const nouveauStatut = !verifieActuel;
    const { error } = await supabase
      .from("utilisateurs")
      .update({ verifie: nouveauStatut })
      .eq("id", id);

    if (!error) {
      setVendeurs((prev) =>
        prev.map((v) => (v.id === id ? { ...v, verifie: nouveauStatut } : v))
      );
    }
  }

  async function toggleMessageLu(id: string, luActuel: boolean) {
    const nouveauLu = !luActuel;
    const { error } = await supabase
      .from("messages_contact")
      .update({ lu: nouveauLu })
      .eq("id", id);

    if (!error) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, lu: nouveauLu } : m))
      );
    }
  }

  async function supprimerMessage(id: string) {
    if (!confirm("Supprimer ce message ?")) return;
    const { error } = await supabase
      .from("messages_contact")
      .delete()
      .eq("id", id);
    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  }

  function lienWhatsAppReponse(tel: string | null, nomClient: string) {
    let chiffres = (tel || "").replace(/\D/g, "");
    if (chiffres.length === 10 && chiffres.startsWith("0")) {
      chiffres = "225" + chiffres;
    }
    const texte = encodeURIComponent(
      `Bonjour ${nomClient}, ici l'équipe DJASSA Abidjan suite à votre message.`
    );
    return `https://wa.me{chiffres}?text=${texte}`;
  }

  async function handleChangerMdp(e: React.FormEvent) {
    e.preventDefault();
    setMsgMdp("");

    if (!ancienMdp) {
      setMsgMdp("❌ Veuillez saisir votre ancien mot de passe.");
      return;
    }
    if (nouveauMdp.length < 6) {
      setMsgMdp("❌ Le nouveau mot de passe doit contenir 6 caractères minimum.");
      return;
    }

    setVerifMdpEnCours(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const emailActuel = sessionData.session?.user?.email;

    if (!emailActuel) {
      setMsgMdp("❌ Session expirée, veuillez vous reconnecter.");
      setVerifMdpEnCours(false);
      return;
    }

    const { error: checkError } = await supabase.auth.signInWithPassword({
      email: emailActuel,
      password: ancienMdp,
    });

    if (checkError) {
      setMsgMdp("❌ L'ancien mot de passe est incorrect.");
      setVerifMdpEnCours(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({ password: nouveauMdp });
    if (error) {
      setMsgMdp("❌ Erreur : " + error.message);
    } else {
      setMsgMdp("✅ Mot de passe administrateur mis à jour avec succès !");
      setAncienMdp("");
      setNouveauMdp("");
    }
    setVerifMdpEnCours(false);
  }
  if (loading || !autorise) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">
        Vérification des droits administrateur DJASSA...
      </div>
    );
  }

  const annoncesFiltrees = annonces.filter((a) => {
    const q = recherche.trim().toLowerCase();
    if (!q) return true;
    return (
      a.titre.toLowerCase().includes(q) ||
      a.commune.toLowerCase().includes(q) ||
      (a.telephone || "").includes(q)
    );
  });

  const nbMessagesNonLus = messages.filter((m) => !m.lu).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
          ADMINISTRATION DJASSA ABIDJAN
        </span>
        <h1 className="text-3xl font-black text-gray-900 mt-2">
          Tableau de bord Administrateur
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">
            Total Annonces
          </p>
          <p className="text-3xl font-black text-emerald-700 mt-1">
            {annonces.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">
            Annonces à la une
          </p>
          <p className="text-3xl font-black text-amber-600 mt-1">
            {annonces.filter((a) => a.booste).length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">
            Vendeurs inscrits
          </p>
          <p className="text-3xl font-black text-gray-900 mt-1">
            {vendeurs.length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <p className="text-xs font-bold text-gray-500 uppercase">
            Messages reçus ({nbMessagesNonLus} non lu{nbMessagesNonLus > 1 ? "s" : ""})
          </p>
          <p className="text-3xl font-black text-emerald-700 mt-1">
            {messages.length}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setOnglet("annonces")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            onglet === "annonces"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          🛍️ Annonces ({annonces.length})
        </button>

        <button
          type="button"
          onClick={() => setOnglet("vendeurs")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            onglet === "vendeurs"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          👥 Vendeurs ({vendeurs.length})
        </button>

        <button
          type="button"
          onClick={() => setOnglet("messages")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition ${
            onglet === "messages"
              ? "bg-emerald-600 text-white"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          📩 Messages ({messages.length})
          {nbMessagesNonLus > 0 && (
            <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
              {nbMessagesNonLus}
            </span>
          )}
        </button>
      </div>

      {onglet === "annonces" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
          <div className="mb-4">
            <input
              type="text"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un article, une commune ou un numéro..."
              className="w-full sm:w-96 border border-gray-300 rounded-xl px-4 py-2 text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                  <th className="py-3 px-2">Article</th>
                  <th className="py-3 px-2">Prix</th>
                  <th className="py-3 px-2">Zone & Contact</th>
                  <th className="py-3 px-2">Mise en avant</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {annoncesFiltrees.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="py-3 px-2 font-bold text-gray-900">
                      <Link
                        href={`/annonces/${a.id}`}
                        className="hover:text-emerald-700 hover:underline"
                      >
                        {a.titre}
                      </Link>
                    </td>
                    <td className="py-3 px-2 font-extrabold text-emerald-700">
                      {a.prix > 0
                        ? a.prix.toLocaleString("fr-FR") + " FCFA"
                        : "À débattre"}
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-600">
                      {a.commune} • {a.telephone || "—"}
                    </td>
                    <td className="py-3 px-2">
                      <button
                        type="button"
                        onClick={() => toggleBoostAnnonce(a.id, a.booste)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                          a.booste
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-600 hover:bg-emerald-50"
                        }`}
                      >
                        {a.booste ? "⭐ À la une (Retirer)" : "Booster en tête"}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => supprimerAnnonceAdmin(a.id, a.titre)}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {onglet === "vendeurs" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-xs uppercase text-gray-500">
                <th className="py-3 px-2">Vendeur / Boutique</th>
                <th className="py-3 px-2">Contact & E-mail</th>
                <th className="py-3 px-2">Commune</th>
                <th className="py-3 px-2">Badge Vérifié</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vendeurs.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="py-3 px-2 font-bold text-gray-900">{v.nom}</td>
                  <td className="py-3 px-2 text-xs text-gray-600">
                    {v.telephone || "—"} • {v.email || "—"}
                  </td>
                  <td className="py-3 px-2">{v.commune || "Abidjan"}</td>
                  <td className="py-3 px-2">
                    <button
                      type="button"
                      onClick={() => toggleVendeurVerifie(v.id, v.verifie)}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        v.verifie
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-700 hover:bg-emerald-50"
                      }`}
                    >
                      {v.verifie ? "✓ Vérifié (Retirer)" : "Activer ✓ Vérifié"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {onglet === "messages" && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500">
              Aucun message reçu depuis la page Contact pour le moment.
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl border p-5 shadow-sm transition ${
                  m.lu
                    ? "bg-white border-gray-200"
                    : "bg-emerald-50/60 border-emerald-300"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {!m.lu && (
                        <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                          NOUVEAU
                        </span>
                      )}
                      <span className="text-xs font-bold bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded-full">
                        {m.sujet}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(m.created_at).toLocaleString("fr-FR")}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-gray-900 text-base mt-2">
                      {m.nom}
                    </h3>
                    <p className="text-xs text-gray-600">
                      📞 {m.telephone || "Non renseigné"}
                      {m.email ? ` • ✉️ ${m.email}` : ""}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {m.telephone && (
                      <a
                        href={lienWhatsAppReponse(m.telephone, m.nom)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition"
                      >
                        💬 Répondre WhatsApp
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleMessageLu(m.id, m.lu)}
                      className="text-xs font-bold px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition"
                    >
                      {m.lu ? "Marquer non lu" : "✓ Marquer lu"}
                    </button>
                    <button
                      type="button"
                      onClick={() => supprimerMessage(m.id)}
                      className="text-xs font-bold text-red-600 px-3 py-1.5 rounded-xl hover:bg-red-50 transition"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-800 mt-3 pt-3 border-t border-gray-200/70 whitespace-pre-line">
                  {m.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Changement de mot de passe administrateur avec vérification */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm max-w-2xl">
        <h2 className="text-base font-extrabold text-gray-900 mb-3">
          🔐 Sécurité du compte administrateur
        </h2>
        <form
          onSubmit={handleChangerMdp}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <input
            type="password"
            required
            value={ancienMdp}
            onChange={(e) => setAncienMdp(e.target.value)}
            placeholder="Ancien mot de passe *"
            className="border border-gray-300 rounded-xl px-4 py-2 text-sm"
          />
          <input
            type="password"
            required
            minLength={6}
            value={nouveauMdp}
            onChange={(e) => setNouveauMdp(e.target.value)}
            placeholder="Nouveau mot de passe *"
            className="border border-gray-300 rounded-xl px-4 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={verifMdpEnCours}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition disabled:opacity-50"
          >
            {verifMdpEnCours ? "Vérification..." : "Mettre à jour"}
          </button>
        </form>
        {msgMdp && (
          <p
            className={`text-xs font-bold mt-2 ${
              msgMdp.startsWith("✅") ? "text-emerald-700" : "text-red-600"
            }`}
          >
            {msgMdp}
          </p>
        )}
      </div>
    </div>
  );
}
