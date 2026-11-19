import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Votre adresse personnelle qui recevra les notifications
const EMAIL_ADMIN = "cv2tcv2t@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sujet, contenu } = body;

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Clé RESEND_API_KEY manquante" },
        { status: 500 }
      );
    }

    const { error } = await resend.emails.send({
      from: "BARA Abidjan <onboarding@resend.dev>",
      to: [EMAIL_ADMIN],
      subject: sujet || "Nouvelle notification BARA",
      text: contenu || "",
    });

    if (error) {
      console.error("Erreur Resend:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur API notifier:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
