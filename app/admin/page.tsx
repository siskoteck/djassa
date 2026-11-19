"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "cv2tcv2t@gmail.com";

interface ArtisanAdmin {
  id: number;
  name: string;
  metier: string;
  commune: string | null;
  telephone: string | null;
  verifie: boolean | null;
}

interface MessageContact {
  id: number;
  created_at: string;
  nom: string;
  contact: string;
  message: string;
}

interface AvisAdmin {
  id: number;
  created_at: string;
  artisan_id: number;
  auteur_nom: string;
  note: number;
  commentaire: string;
}

interface BanniereAdmin {
  id: number;
  created_at: string;
  partenaire: string;
  image_url: string;
  lien_destination: string;
  emplacement: "accueil" | "annuaire";
  active: boolean;
  clics: number;
}

export default function AdminPage() {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [artisans, setArtisans] = useState<ArtisanAdmin[]>([]);
  const [messages, setMessages] = useState<MessageContact[]>([]);
  const [avisListe, setAvisListe] = useState<AvisAdmin[]>([]);
  const [bannieres, setBannieres] = useState<BanniereAdmin[]>([]);
  const [onglet, setOnglet] = useState<
    "artisans" | "messages" | "avis" | "publicites"
  >("artisans");

  const [partenaire, setPartenaire] = useState("");
  const [lienDestination, setLienDestination] = useState("");
  const [emplacement, setEmplacement] = useState<"accueil" | "annuaire">("accueil");
  const [fichierPub, setFichierPub] = useState<File | null>(null);
  const [envoiPub, setEnvoiPub] = useState(false);
  useEffect(() => {
    async function verifierEtCharger() {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
        router.replace("/");
        return;
      }

      setAutorise(true);

      const [resArtisans, resMessages, resAvis, resBannieres] =
        await Promise.all([
          supabase
            .from("artisans")
            .select("id, name, metier, commune, telephone, verifie")
            .order("id", { ascending: false }),
          supabase
            .from("messages_contact")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("avis")
            .select("*")
            .order("created_at", { ascending: false }),
          supabase
            .from("bannieres")
            .select("*")
            .order("created_at", { ascending: false }),
        ]);

      if (resArtisans.data) setArtisans(resArtisans.data);
      if (resMessages.data) setMessages(resMessages.data);
      if (resAvis.data) setAvisListe(resAvis.data as AvisAdmin[]);
      if (resBannieres.data) setBannieres(resBannieres.data as BanniereAdmin[]);

      setLoading(false);
    }

    verifierEtCharger();
  }, [router]);

  async function basculerVerification(artisan: ArtisanAdmin) {
    const nouveauStatut = !artisan.verifie;

    const { error } = await supabase
      .from("artisans")
      .update({ verifie: nouveauStatut })
      .eq("id", artisan.id);

    if (error) {
      alert("Erreur lors de la mise à jour : " + error.message);
      return;
    }

    setArtisans((prev) =>
      prev.map((a) => (a.id === artisan.id ? { ...a, verifie: nouveauStatut } : a))
    );
  }

  async function supprimerArtisan(artisan: ArtisanAdmin) {
    if (
      !confirm(
        `Supprimer définitivement le profil de "${artisan.name}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("artisans")
      .delete()
      .eq("id", artisan.id);

    if (error) {
      alert("Erreur lors de la suppression : " + error.message);
      return;
    }

    setArtisans((prev) => prev.filter((a) => a.id !== artisan.id));
  }

  async function supprimerMessage(id: number) {
    if (!confirm("Supprimer ce message de contact ?")) return;

    const { error } = await supabase
      .from("messages_contact")
      .delete()
      .eq("id", id);

    if (!error) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
  }

  async function supprimerAvis(id: number) {
    if (!confirm("Supprimer cet avis client ?")) return;

    const { error } = await supabase.from("avis").delete().eq("id", id);

    if (error) {
      alert("Erreur lors de la suppression de l'avis : " + error.message);
      return;
    }

    setAvisListe((prev) => prev.filter((a) => a.id !== id));
  }
  async function ajouterBanniere(e: React.FormEvent) {
    e.preventDefault();
    if (!partenaire.trim() || !lienDestination.trim() || !fichierPub) {
      alert("Veuillez remplir tous les champs et choisir une image.");
      return;
    }

    try {
      setEnvoiPub(true);
      const ext = fichierPub.name.split(".").pop() || "jpg";
      const filePath = `${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("bannieres")
        .upload(filePath, fichierPub);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("bannieres")
        .getPublicUrl(filePath);

      const { data: nouvellePub, error: insertError } = await supabase
        .from("bannieres")
        .insert([
          {
            partenaire: partenaire.trim(),
            image_url: urlData.publicUrl,
            lien_destination: lienDestination.trim(),
            emplacement,
            active: true,
          },
        ])
        .select("*")
        .single();

      if (insertError) throw insertError;

      if (nouvellePub) {
        setBannieres((prev) => [nouvellePub as BanniereAdmin, ...prev]);
      }

      setPartenaire("");
      setLienDestination("");
      setFichierPub(null);
      const inputFile = document.getElementById("input-pub-file") as HTMLInputElement;
      if (inputFile) inputFile.value = "";
    } catch (err: any) {
      console.error("Erreur ajout bannière:", err);
      alert("Erreur lors de l'ajout : " + (err.message || "Inconnue"));
    } finally {
      setEnvoiPub(false);
    }
  }

  async function basculerEtatBanniere(pub: BanniereAdmin) {
    const nouvelEtat = !pub.active;
    const { error } = await supabase
      .from("bannieres")
      .update({ active: nouvelEtat })
      .eq("id", pub.id);

    if (!error) {
      setBannieres((prev) =>
        prev.map((b) => (b.id === pub.id ? { ...b, active: nouvelEtat } : b))
      );
    }
  }

  async function supprimerBanniere(id: number) {
    if (!confirm("Supprimer définitivement cette publicité ?")) return;

    const { error } = await supabase.from("bannieres").delete().eq("id", id);

    if (!error) {
      setBannieres((prev) => prev.filter((b) => b.id !== id));
    }
  }

  if (loading || !autorise) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">
        Vérification des accès administrateur...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <span className="inline-block bg-gray-900 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
          Administration BARA
        </span>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-3 mb-8 border-b border-gray-200 pb-4">
        <button
          onClick={() => setOnglet("artisans")}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            onglet === "artisans"
              ? "bg-orange-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Artisans ({artisans.length})
        </button>

        <button
          onClick={() => setOnglet("messages")}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            onglet === "messages"
              ? "bg-orange-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Messages ({messages.length})
        </button>

        <button
          onClick={() => setOnglet("avis")}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            onglet === "avis"
              ? "bg-orange-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Avis clients ({avisListe.length})
        </button>

        <button
          onClick={() => setOnglet("publicites")}
          className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${
            onglet === "publicites"
              ? "bg-orange-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Publicités ({bannieres.length})
        </button>
      </div>
      {/* Onglet 1 : Artisans */}
      {onglet === "artisans" && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {artisans.map((artisan) => (
              <div
                key={artisan.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900">{artisan.name}</h2>
                    {artisan.verifie && (
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        ✓ Vérifié
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {artisan.metier} • {artisan.commune || "Commune non renseignée"} •{" "}
                    {artisan.telephone || "Sans téléphone"}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => basculerVerification(artisan)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                      artisan.verifie
                        ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    {artisan.verifie ? "Retirer badge" : "Valider ✓"}
                  </button>

                  <button
                    onClick={() => supprimerArtisan(artisan)}
                    className="px-3.5 py-2 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Onglet 2 : Messages */}
      {onglet === "messages" && (
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">
              Aucun message reçu pour le moment.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="font-bold text-gray-900">{msg.nom}</h3>
                    <p className="text-sm text-orange-600 font-medium">
                      {msg.contact}
                    </p>
                  </div>
                  <button
                    onClick={() => supprimerMessage(msg.id)}
                    className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100"
                  >
                    Supprimer
                  </button>
                </div>
                <p className="text-gray-700 text-sm mt-3 whitespace-pre-line">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>
      )}

      {/* Onglet 3 : Modération des avis clients */}
      {onglet === "avis" && (
        <div className="space-y-4">
          {avisListe.length === 0 ? (
            <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">
              Aucun avis publié pour le moment.
            </div>
          ) : (
            avisListe.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{item.auteur_nom}</h3>
                      <span className="text-yellow-500 text-sm">
                        {"★".repeat(item.note)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Fiche artisan #{item.artisan_id}
                    </p>
                  </div>
                  <button
                    onClick={() => supprimerAvis(item.id)}
                    className="px-3 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100"
                  >
                    Supprimer l&apos;avis
                  </button>
                </div>
                <p className="text-gray-700 text-sm mt-3 whitespace-pre-line">
                  {item.commentaire}
                </p>
              </div>
            ))
          )}
        </div>
      )}
      {/* Onglet 4 : Publicités */}
      {onglet === "publicites" && (
        <div className="space-y-8">
          <form
            onSubmit={ajouterBanniere}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4"
          >
            <h2 className="text-lg font-bold text-gray-900">
              Ajouter une bannière partenaire
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Nom du partenaire / annonceur *
                </label>
                <input
                  type="text"
                  required
                  value={partenaire}
                  onChange={(e) => setPartenaire(e.target.value)}
                  placeholder="Ex: Quincaillerie Treichville Pro"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Emplacement sur le site *
                </label>
                <select
                  value={emplacement}
                  onChange={(e) =>
                    setEmplacement(e.target.value as "accueil" | "annuaire")
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
                >
                  <option value="accueil">Page d&apos;accueil</option>
                  <option value="annuaire">Page Annuaire (/artisans)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Lien au clic (WhatsApp, Facebook ou site) *
                </label>
                <input
                  type="url"
                  required
                  value={lienDestination}
                  onChange={(e) => setLienDestination(e.target.value)}
                  placeholder="https://wa.me"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Image bannière (format recommandé : 1200x300 px) *
                </label>
                <input
                  id="input-pub-file"
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setFichierPub(e.target.files?.[0] || null)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={envoiPub}
              className="bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:opacity-50"
            >
              {envoiPub ? "Publication en cours..." : "Publier la bannière"}
            </button>
          </form>

          {/* Liste des bannières existantes */}
          <div className="space-y-4">
            {bannieres.length === 0 ? (
              <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">
                Aucune bannière publicitaire enregistrée.
              </div>
            ) : (
              bannieres.map((pub) => (
                <div
                  key={pub.id}
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={pub.image_url}
                      alt={pub.partenaire}
                      className="w-28 h-14 object-cover rounded-lg border border-gray-200 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">
                          {pub.partenaire}
                        </h3>
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            pub.active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {pub.active ? "Active" : "En pause"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        Emplacement : <strong>{pub.emplacement}</strong> •{" "}
                        <strong>{pub.clics ?? 0} clics</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => basculerEtatBanniere(pub)}
                      className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold hover:bg-gray-50"
                    >
                      {pub.active ? "Mettre en pause" : "Activer"}
                    </button>
                    <button
                      onClick={() => supprimerBanniere(pub.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
