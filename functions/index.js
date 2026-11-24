/* Lityra — "Esqueci o código".
 * Callable requestAccessCodeReset({ email }): encontra o perfil pelo e-mail, gera um código novo,
 * migra tudo que depende do hash do código (o readerId interno NÃO muda) e envia o código por e-mail
 * (coleção "mail", lida pela extensão "Trigger Email from Firestore").
 * Sempre responde ok, exista ou não o e-mail (não revela quem tem perfil). */
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // igual ao app
const COOLDOWN_MS = 10 * 60 * 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");
const makeCode = () => {
  const bytes = crypto.randomBytes(6);
  let out = "";
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  return out;
};

async function updateInChunks(docs, patch) {
  for (let i = 0; i < docs.length; i += 400) {
    const b = db.batch();
    docs.slice(i, i + 400).forEach((d) => b.update(d.ref, patch));
    await b.commit();
  }
}

async function rotate(oldHash, profile, email) {
  const rid = String(profile.readerId || "");
  if (!rid) return;

  let code = "", newHash = "";
  for (let i = 0; i < 12; i++) {
    code = makeCode();
    newHash = sha256(code);
    if (newHash === oldHash) continue;
    if (!(await db.collection("readerProfiles").doc(newHash).get()).exists) break;
    code = "";
  }
  if (!code) throw new Error("Sem código único disponível.");

  const now = Date.now();
  const next = { ...profile, email, updatedAt: now, lastCodeResetAt: now };
  ["deleted", "deletedAt", "deletedBy", "replacedBy"].forEach((k) => delete next[k]);

  const batch = db.batch();
  batch.set(db.collection("readerProfiles").doc(newHash), next);
  batch.set(db.collection("readerProfiles").doc(oldHash), {
    deleted: true, deletedAt: now, deletedBy: "code-reset", replacedBy: newHash, updatedAt: now,
  });
  batch.set(db.collection("readerAccessCodes").doc(newHash), {
    profileHash: newHash, readerId: rid, accessCode: code, email, updatedAt: now,
  });
  batch.delete(db.collection("readerAccessCodes").doc(oldHash));
  await batch.commit();

  // Tudo que referencia o hash antigo passa a referenciar o novo (best effort).
  const safe = async (fn) => { try { await fn(); } catch (e) { console.warn("migração parcial:", e.message); } };
  await safe(async () => {
    const s = await db.collection("popupMessages").where("recipientProfileId", "==", oldHash).get();
    await updateInChunks(s.docs, { recipientProfileId: newHash, updatedAt: Date.now() });
  });
  await safe(async () => {
    const ref = db.collection("readerAnalytics").doc(rid);
    if ((await ref.get()).exists) await ref.set({ profileHash: newHash, updatedAt: Date.now() }, { merge: true });
    const ch = await ref.collection("chapters").get();
    await updateInChunks(ch.docs, { profileHash: newHash, updatedAt: Date.now() });
  });
  await safe(async () => {
    const s = await db.collection("betaFeedback").where("readerId", "==", rid).get();
    await updateInChunks(s.docs, { profileHash: newHash, updatedAt: Date.now() });
  });
  await safe(async () => {
    const ref = db.collection("readerPresence").doc(rid);
    if ((await ref.get()).exists) await ref.set({ profileHash: newHash }, { merge: true });
  });

  const name = String(profile.name || "").replace(/[<>&]/g, "");
  await db.collection("mail").add({
    to: [email],
    message: {
      subject: "Seu novo código de acesso ao Lityra",
      text: `Olá, ${name}!\n\nSeu novo código de acesso ao Lityra é: ${code}\n\nPara entrar, use este e-mail e o código acima. O código anterior deixou de funcionar. Seu progresso e comentários continuam iguais.\n\nSe não foi você que pediu, pode ignorar esta mensagem.`,
      html: `<p>Olá, ${name}!</p><p>Seu novo código de acesso ao Lityra é:</p><p style="font-size:28px;letter-spacing:4px"><strong>${code}</strong></p><p>Para entrar, use este e-mail e o código acima. O código anterior deixou de funcionar. Seu progresso e comentários continuam iguais.</p><p style="color:#777">Se não foi você que pediu, pode ignorar esta mensagem.</p>`,
    },
  });
}

exports.requestAccessCodeReset = onCall({ region: "us-central1", maxInstances: 5 }, async (req) => {
  const email = String(req.data?.email || "").trim().toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 120) throw new HttpsError("invalid-argument", "E-mail inválido.");

  const snap = await db.collection("readerProfiles").where("email", "==", email).limit(5).get();
  for (const doc of snap.docs) {
    const p = doc.data();
    if (p.deleted === true) continue;
    if (Date.now() - Number(p.lastCodeResetAt || 0) < COOLDOWN_MS) continue; // evita spam/rotação em loop
    try { await rotate(doc.id, p, email); }
    catch (e) { console.error("falha ao renovar código:", e); }
  }
  return { ok: true }; // sempre igual, exista ou não o perfil
});
