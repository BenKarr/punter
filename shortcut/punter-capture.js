/*
 * punter capture  -  "Run JavaScript on Web Page" body
 * Paste everything below into the Shortcuts action of the same name.
 * It reads the CURRENT listing page, parses the fields, and returns a
 * punter URL. A following "Open URLs" action opens that URL.
 *
 * Reveal the phone number on the listing BEFORE running the Shortcut,
 * so the Call / WhatsApp link is live for the number grab.
 */
const PWA = "https://benkarr.github.io/punter/";

function meta(prop) {
  const el =
    document.querySelector(`meta[property="${prop}"]`) ||
    document.querySelector(`meta[name="${prop}"]`);
  return el ? (el.getAttribute("content") || "").trim() : "";
}
function uniq(a) { return [...new Set(a)]; }
function txt(el) { return el ? (el.innerText || el.textContent || "").trim() : ""; }
function bodyText() { return (document.body.innerText || document.body.textContent || ""); }

const host = location.hostname.replace(/^www\./, "");
let site = "", title = "", price = "", area = "", imgs = [];

if (host.indexOf("vivastreet") === 0 || host.indexOf("vivastreet") > -1) {
  site = "viva";
  title = txt(document.querySelector("h1")) || meta("og:title");
  const pm = (bodyText().match(/£\s?[\d.,]+/) || [])[0];
  price = pm ? pm.replace(/\s/g, "") : "";
  imgs = uniq(
    [...document.querySelectorAll("img")]
      .map((i) => i.currentSrc || i.src || i.getAttribute("data-src") || "")
      .filter((s) => /viva-images\.com\/.+\/(large|extralarge)\//.test(s))
  );
  const bc = [...document.querySelectorAll('a[href*="/rent/"], a[href*="/escort"], nav a, .breadcrumb a')]
    .map(txt).filter(Boolean);
  area = bc.slice(-2).join(", ");
} else if (host.indexOf("publi24") > -1) {
  site = "publi24";
  title = meta("og:title") || txt(document.querySelector("h1"));
  const pm = (bodyText().match(/[\d][\d\s.]*\s?(EUR|€|lei|RON)/i) || [])[0];
  price = pm ? pm.replace(/\s+/g, " ").trim() : "";
  imgs = uniq(
    [meta("og:image")].concat(
      [...document.querySelectorAll("img")].map((i) => i.currentSrc || i.src || "")
    ).filter((s) => /s3\.publi24\.ro\/.+\.(webp|jpe?g|png)/i.test(s))
     .map((s) => s.replace(/\/(top|large)\//, "/extralarge/"))
  );
  const bc = [...document.querySelectorAll('a[href*="/anunturi/"]')].map(txt).filter(Boolean);
  area = uniq(bc).slice(-3).join(", ");
} else {
  site = "other";
  title = meta("og:title") || txt(document.querySelector("h1")) || document.title;
  imgs = meta("og:image") ? [meta("og:image")] : [];
}

// number: prefer the revealed Call / WhatsApp / SMS link
function grabNumber() {
  const sel = ['a[href^="tel:"]', 'a[href^="sms:"]', 'a[href*="wa.me"]', 'a[href^="whatsapp:"]'];
  for (const s of sel) {
    const a = document.querySelector(s);
    if (a) {
      const m = (a.getAttribute("href") || "").match(/(\+?\d[\d\s().-]{6,})/);
      if (m) return m[1].replace(/[\s().-]/g, "");
    }
  }
  // last resort: a visible phone-looking string
  const t = (bodyText().match(/(\+?\d[\d\s().-]{8,})/) || [])[0];
  return t ? t.replace(/[\s().-]/g, "") : "";
}
const num = grabNumber();

imgs = imgs.slice(0, 12);
const p = new URLSearchParams();
p.set("cap", "1");
p.set("site", site);
if (num) p.set("num", num);
if (title) p.set("title", title.slice(0, 140));
if (price) p.set("price", price);
if (area) p.set("area", area.slice(0, 120));
p.set("url", location.href);
if (imgs.length) p.set("imgs", imgs.join("|"));

completion(PWA + "?" + p.toString());
