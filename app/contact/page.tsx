"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ContactDjassaPage() {
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [sujet, setSujet] = useState("Question générale");
  const [message, setMessage] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState("");

  async function handleEnvoyer(e: React.FormEvent) {
    e.preventDefault();
    setEnvoiEnCours(true);
    setErreur("");

    const { error } = await supabase.from("messages_contact").insert([
      {
        nom: nom.trim(),
        telephone: telephone.trim() || null,
        email: email.trim() || null,
        sujet,
        message: message.trim(),
      },
    ]);

    if (error) {
      setErreur("Erreur lors de l'envoi : " + error.message);
    } else {
      setEnvoye(true);
      setNom("");
      setTelephone("");
      setEmail("");
      setMessage("");
    }
    setEnvoiEnCours(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Informations de contact */}
        <div className="md:col-span-5 space-y-5">
          <div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full">
              ASSISTANCE DJASSA
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">
              Contactez l&apos;équipe DJASSA
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Une question sur une annonce, un signalement ou une demande de
              partenariat à Abidjan ? Écrivez-nous.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 p-5 space-y-3 text-sm text-gray-700 shadow-sm">
            <p>
              📍 <strong>Localisation :</strong> Abidjan, Côte d&apos;Ivoire
            </p>
            <p>
              🕒 <strong>Horaires :</strong> Lundi au Samedi, 08h00 – 19h00
            </p>
            <p>
              🛡️ <strong>Signalement :</strong> Indiquez le titre ou le lien de
              l&apos;annonce suspecte pour une intervention rapide.
            </p>
          </div>
        </div>

        {/* Formulaire de contact */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
          {envoye ? (
            <div className="text-center py-8 space-y-3">
              <span className="text-4xl">✅</span>
              <h2 className="text-xl font-black text-gray-900">
                Message envoyé avec succès !
              </h2>
              <p className="text-sm text-gray-600">
                Merci de nous avoir contactés. L&apos;équipe DJASSA vous
                répondra dans les plus brefs délais.
              </p>
              <button
                type="button"
                onClick={() => setEnvoye(false)}
                className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Envoyer un autre message
              </button>
            </div>
          ) : (
            <form onSubmit={handleEnvoyer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Votre nom *
                </label>
                <input
                  type="text"
                  required
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Ex: Kouassi Jean"
                  className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Téléphone / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="07 00 00 00 00"
                    className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    E-mail (optionnel)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Sujet
                </label>
                <select
                  value={sujet}
                  onChange={(e) => setSujet(e.target.value)}
                  className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm bg-white"
                >
                  <option value="Question générale">Question générale</option>
                  <option value="Signaler une annonce">Signaler une annonce</option>
                  <option value="Aide sur mon compte">Aide sur mon compte</option>
                  <option value="Publicité & Partenariat">Publicité & Partenariat</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Votre message *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Expliquez-nous votre demande..."
                  className="w-full border border-gray-300 focus:border-emerald-600 focus:outline-none rounded-xl px-4 py-2.5 text-sm"
                />
              </div>

              {erreur && (
                <div className="text-red-600 text-xs bg-red-50 border border-red-200 p-3 rounded-xl">
                  {erreur}
                </div>
              )}

              <button
                type="submit"
                disabled={envoiEnCours}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm transition disabled:opacity-50 shadow-sm"
              >
                {envoiEnCours ? "Envoi en cours..." : "📩 Envoyer mon message"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
