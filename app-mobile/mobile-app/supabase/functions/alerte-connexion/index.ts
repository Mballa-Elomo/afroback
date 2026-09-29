// =====================================================================
// AFROBACK — Edge Function "alerte-connexion" (cdc-appareil-unique.md)
//
// Envoie au titulaire du compte un email "Nouvelle connexion à ton compte"
// quand un nouvel appareil vient d'être validé. Appelée par l'app (jeton de
// la personne connectée) : l'email part toujours vers l'adresse DU COMPTE,
// jamais vers une adresse fournie par l'appelant.
//
// Mise en place par Yannick (tableau de bord Supabase → Edge Functions) :
//   1. "Deploy a new function" → "Via Editor", nom : alerte-connexion,
//      coller ce fichier, déployer.
//   2. Edge Functions → Secrets : GMAIL_USER = afroback3d@gmail.com,
//      GMAIL_APP_PASSWORD = le mot de passe d'application Google (le même
//      que pour les emails de Supabase). Ne jamais le coller ailleurs.
// Sans cette fonction, tout le reste marche : seul l'email d'alerte manque.
// =====================================================================
import { createClient } from 'npm:@supabase/supabase-js@2';
import nodemailer from 'npm:nodemailer@6';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function escapeHtml(v: string): string {
  return v.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user = userData?.user;
    if (userError || !user?.email) {
      return new Response(JSON.stringify({ ok: false, error: 'non_authentifie' }), { status: 401, headers: cors });
    }

    const body = await req.json().catch(() => ({}));
    const appareil = escapeHtml(String(body.appareil ?? 'un nouvel appareil').slice(0, 80));
    const en = (body.langue ?? user.user_metadata?.langue) === 'en';
    const prenom = escapeHtml(String(user.user_metadata?.prenom ?? ''));
    const quand = new Date().toLocaleString(en ? 'en-GB' : 'fr-FR', {
      timeZone: 'Africa/Douala',
      dateStyle: 'long',
      timeStyle: 'short',
    });

    const subject = en ? 'AFROBACK · New login to your account' : 'AFROBACK · Nouvelle connexion à ton compte';
    const intro = en
      ? `Your AFROBACK account was just logged in on <strong>${appareil}</strong>, on ${quand} (Cameroon time). It is now the only device connected to your account.`
      : `Ton compte AFROBACK vient d'être connecté sur <strong>${appareil}</strong>, le ${quand} (heure du Cameroun). C'est désormais le seul appareil connecté à ton compte.`;
    const warn = en
      ? 'Was it not you? Open the app, tap "Forgot password?" and change your password right away: this will log out every other device.'
      : 'Ce n\'était pas toi ? Ouvre l\'app, touche "Mot de passe oublié ?" et change ton mot de passe tout de suite : tous les autres appareils seront déconnectés.';

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#0B0906;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0B0906;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#15100B;border:1px solid #4A3818;border-radius:18px;">
<tr><td align="center" style="padding:34px 28px 8px 28px;">
<img src="https://afroback-test.vercel.app/email/afroback-logo.png" width="72" height="72" alt="AFROBACK" style="display:block;width:72px;height:72px;border:0;margin:0 auto 14px auto;" />
<div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:bold;letter-spacing:5px;color:#F0C36B;">AFROBACK</div>
<div style="height:1px;background:#4A3818;margin:24px 0 0 0;"></div></td></tr>
<tr><td style="padding:22px 28px 30px 28px;font-family:Arial,Helvetica,sans-serif;color:#EDE3D4;">
<p style="font-size:17px;margin:0 0 12px 0;">${en ? 'Hello' : 'Bonjour'} ${prenom},</p>
<p style="font-size:15px;line-height:23px;margin:0 0 16px 0;color:#D6C6B2;">${intro}</p>
<p style="font-size:14px;line-height:21px;margin:0;padding:14px;border:1px solid #8B3A2F;border-radius:12px;color:#E3A277;">${warn}</p>
</td></tr></table>
<p style="font-family:Arial,Helvetica,sans-serif;font-size:11.5px;color:#6F5F4D;margin:18px 0 0 0;">AFROBACK · Yaoundé, Cameroun</p>
</td></tr></table></body></html>`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: Deno.env.get('GMAIL_USER')!, pass: Deno.env.get('GMAIL_APP_PASSWORD')! },
    });
    await transporter.sendMail({
      from: `AFROBACK <${Deno.env.get('GMAIL_USER')}>`,
      to: user.email,
      subject,
      html,
    });
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500, headers: cors });
  }
});
