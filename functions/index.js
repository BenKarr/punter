/**
 * punter image-copy function
 * Trigger: a contact doc is created or updated under users/{uid}/contacts/{cid}
 * with imagesPending == true and an imagesSrc array of source URLs.
 *
 * It downloads each source image server-side (no CORS, no JS, no anti-bot,
 * just plain GETs of known URLs), uploads them to Firebase Storage under
 * contacts/{uid}/{cid}/, then writes the public Storage URLs back to the doc
 * and clears imagesPending.
 *
 * Deploy:
 *   cd functions && npm install
 *   firebase deploy --only functions
 */
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const bucket = admin.storage().bucket();

const MAX_IMAGES = 12;
const FETCH_TIMEOUT_MS = 15000;

function extFor(url, contentType) {
  if (contentType && contentType.includes("webp")) return "webp";
  if (contentType && contentType.includes("png")) return "png";
  if (contentType && contentType.includes("jpeg")) return "jpg";
  const m = (url.split("?")[0].match(/\.(webp|png|jpe?g)$/i) || [])[1];
  return m ? m.toLowerCase().replace("jpeg", "jpg") : "jpg";
}

async function fetchBuffer(url) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    return { buf, contentType: res.headers.get("content-type") || "" };
  } finally {
    clearTimeout(t);
  }
}

exports.copyContactImages = onDocumentWritten(
  "users/{uid}/contacts/{cid}",
  async (event) => {
    const after = event.data && event.data.after && event.data.after.data();
    if (!after) return; // deleted
    if (!after.imagesPending) return; // nothing to do
    const src = Array.isArray(after.imagesSrc) ? after.imagesSrc.slice(0, MAX_IMAGES) : [];
    if (!src.length) {
      await event.data.after.ref.update({ imagesPending: false });
      return;
    }

    const { uid, cid } = event.params;
    const hosted = [];
    for (let i = 0; i < src.length; i++) {
      const url = src[i];
      try {
        const { buf, contentType } = await fetchBuffer(url);
        const ext = extFor(url, contentType);
        const path = `contacts/${uid}/${cid}/${i}.${ext}`;
        const file = bucket.file(path);
        const token = `${Date.now()}-${i}`;
        await file.save(buf, {
          metadata: {
            contentType: contentType || `image/${ext === "jpg" ? "jpeg" : ext}`,
            metadata: { firebaseStorageDownloadTokens: token },
          },
          resumable: false,
        });
        const publicUrl =
          `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/` +
          `${encodeURIComponent(path)}?alt=media&token=${token}`;
        hosted.push(publicUrl);
      } catch (err) {
        logger.warn(`copy failed for ${url}: ${err.message}`);
        hosted.push(url); // keep the source URL as a fallback for this one
      }
    }

    await event.data.after.ref.update({
      images: hosted,
      imagesPending: false,
      imagesCopiedAt: Date.now(),
    });
    logger.info(`rehosted ${hosted.length} images for ${uid}/${cid}`);
  }
);
