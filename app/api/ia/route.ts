import { NextResponse } from "next/server";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Clé API IA non configurée sur le serveur." },
        { status: 500 }
      );
    }

    const { message } = await req.json();
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message invalide." },
        { status: 400 }
      );
    }

    const systeme =
      "Tu es l'assistant IA de DJASSA Abidjan (plateforme de petites annonces et bonnes affaires en Côte d'Ivoire). Réponds en français clair, concis et chaleureux. Aide les acheteurs et vendeurs à Abidjan (estimation de prix en FCFA, rédaction d'annonces attractives, conseils de sécurité contre les arnaques).";

    const response = await fetch(
      `https://googleapis.com{apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systeme }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: message.slice(0, 1500) }],
            },
          ],
        }),
      }
    );

    const data: GeminiResponse = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || "Erreur lors de la réponse IA." },
        { status: 500 }
      );
    }

    const reponseTexte =
      data.candidates?.at(0)?.content?.parts?.at(0)?.text ||
      "Désolé, je n'ai pas pu générer de réponse pour le moment.";

    return NextResponse.json({ reponse: reponseTexte });
  } catch {
    return NextResponse.json(
      { error: "Erreur réseau avec le service IA." },
      { status: 500 }
    );
  }
}
