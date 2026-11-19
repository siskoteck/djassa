"use client";

import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// Remplacez par votre vrai numéro WhatsApp d'assistance BARA (avec l'indicatif 225)
const WHATSAPP_SUPPORT = "2250700000000";

export default function ContactPage() {
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const nom = (formData.get("nom") as string).trim();
    const contact = (formData.get("contact") as string).trim();
    const message = (formData.get("message") as string).trim();

    // 1. Enregistrer le message dans Supabase
    const { error: insertError } = await supabase
      .from("messages_contact")
      .insert([{ nom, contact, message }]);

    if (insertError) {
      console.error("Erreur envoi message:", insertError);
      setError(
        "Impossible d'envoyer votre message. Réessayez ou écrivez-nous sur WhatsApp."
      );
      setLoading(false);
      return;
    }

    // 2. Envoyer une notification par e-mail à l'administrateur
    try {
      await fetch("/api/notifier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sujet: `📩 Nouveau message Contact BARA de ${nom}`,
          contenu: `Nom : ${nom}\nContact : ${contact}\n\nMessage :\n${message}`,
        }),
      });
    } catch (mailError) {
      console.error("Erreur notification e-mail:", mailError);
    }

    setEnvoye(true);
    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Contactez-nous</h1>
        <p className="text-gray-600">
          Une question, une suggestion ou besoin d&apos;aide pour vérifier votre profil artisan à Abidjan ? Écrivez-nous.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl mb-2">📍</div>
          <h2 className="font-semibold text-gray-900 text-sm">Localisation</h2>
          <p className="text-gray-600 text-sm mt-1">Abidjan, Côte d&apos;Ivoire</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl mb-2">✉️</div>
          <h2 className="font-semibold text-gray-900 text-sm">E-mail</h2>
          <p className="text-gray-600 text-sm mt-1">contact@bara.ci</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="text-2xl mb-2">💬</div>
          <h2 className="font-semibold text-gray-900 text-sm">Assistance rapide</h2>
          <a
            href={`https://wa.me{WHATSAPP_SUPPORT}?text=${encodeURIComponent(
              "Bonjour l'équipe BARA, j'ai besoin d'assistance."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-green-600 font-semibold text-sm mt-1 hover:underline"
          >
            Discuter sur WhatsApp →
          </a>
        </div>
      </div>

      {envoye ? (
        <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold mb-2">Message envoyé !</h2>
          <p className="text-gray-600 mb-8">
            Merci pour votre message. L&apos;équipe BARA vous répondra très rapidement.
          </p>
          <Link
            href="/"
            className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border p-6 sm:p-8 space-y-5"
        >
          <div>
            <label htmlFor="nom" className="block text-sm font-medium mb-1">
              Nom complet *
            </label>
            <input
              id="nom"
              name="nom"
              type="text"
              required
              placeholder="Votre nom"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="contact" className="block text-sm font-medium mb-1">
              Téléphone (WhatsApp) ou E-mail *
            </label>
            <input
              id="contact"
              name="contact"
              type="text"
              required
              placeholder="07 00 00 00 00 ou vous@exemple.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium mb-1">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              placeholder="Expliquez votre demande..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:opacity-50 transition"
          >
            {loading ? "Envoi en cours..." : "Envoyer le message"}
          </button>
        </form>
      )}
    </div>
  );
}
