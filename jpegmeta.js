/* jpegmeta.js (ng.39 / p.37): one builder for export names and details, one writer that puts them inside a JPEG.
   EXIF (ImageDescription, Artist, XPTitle, XPComment, XPAuthor) for Windows and most viewers; XMP (dc:title, dc:description,
   dc:creator, dc:source) for Apple Photos and macOS. The same file runs in Number Grabber, punter and punter's cloud function,
   so names and details match everywhere. */
(function (root) {
  "use strict";
  var SYM = { THB: "\u0e3f", EUR: "\u20ac", GBP: "\u00a3", USD: "$" };
  function handleName(h) { return String(h || "").replace(/^[a-z]+:/, ""); }
  function tidy(s) { return String(s || "").replace(/[^\p{L}\p{N} ._-]+/gu, " ").replace(/\s+/g, " ").trim(); }
  function fsSafe(s) { return String(s || "").replace(/[\\/:*?"<>|\u0000-\u001f]+/g, " ").replace(/\s+/g, " ").trim(); }
  /* her username if she has one (thaifriendly, TikTok...), else her name, else the first words of the ad title before any number */
  function nameOf(c) {
    c = c || {};
    var h = tidy(handleName(c.handle)); if (h) return h;
    var n = tidy(c.name); if (n) return n.slice(0, 24).trim();
    var words = tidy(c.listingTitle || c.title).split(" "), out = [];
    for (var i = 0; i < words.length && out.length < 2; i++) { if (/\d/.test(words[i]) || words[i].length < 2) break; out.push(words[i]); }
    return out.join(" ").slice(0, 24).trim();
  }
  /* +CC number: the stored e164, else a number field that is only digits (never the digits inside a username) */
  function numOf(c) {
    c = c || {};
    var e = String(c.e164 || "").replace(/[^\d+]/g, "");
    if (/^\+\d{9,15}$/.test(e)) return e;
    var raw = String(c.number || c.display || "");
    if (/[a-z@]/i.test(raw)) return "";
    var n = raw.replace(/[^\d+]/g, "");
    return /^\+?\d{9,15}$/.test(n) ? n : "";
  }
  function ageOf(c) { var a = c && c.age; if (a == null || a === "") return ""; a = String(a).replace(/[^\d]/g, ""); return a && +a >= 16 && +a <= 99 ? a : ""; }
  function tiktokOf(c) { var v = c && c.links && c.links.tiktok; if (!v) return ""; v = String(v).trim(); return /^https?:\/\//i.test(v) ? v : "@" + v.replace(/^@/, ""); }
  function money(a, cur) {
    var s = String(a == null ? "" : a).trim(); if (!s) return "";
    var num = Number(s.replace(/[, ]/g, ""));
    var body = (/^[\d., ]+$/.test(s) && isFinite(num)) ? num.toLocaleString("en-GB") : s;
    return (SYM[cur] || (cur ? cur + " " : "")) + body;
  }
  function ratesOf(c) {
    c = c || {};
    var slots = (Array.isArray(c.slots) ? c.slots : []).filter(function (s) { return s && s.k && s.base != null && String(s.base).trim() !== ""; });
    if (slots.length) return slots.map(function (s) { return s.k + " " + money(s.base, s.cur || c.priceCurrency); }).join(" \u00b7 ");
    var rates = (Array.isArray(c.rates) ? c.rates : []).filter(function (r) { return r && r.amount != null && String(r.amount).trim() !== ""; });
    if (rates.length) return rates.map(function (r) { return ((r.duration || "") + " " + (r.sym ? r.sym + String(r.amount) : money(r.amount, r.currency))).trim(); }).join(" \u00b7 ");
    return c.price ? String(c.price) : "";
  }
  function sourceOf(c) { return String((c && c.url) || "").replace(/^https?:\/\/(www\.)?/i, "").replace(/\/+$/, ""); }
  function detailsOf(c) {
    var name = nameOf(c), num = numOf(c), age = ageOf(c), tt = tiktokOf(c), rates = ratesOf(c), src = sourceOf(c);
    var lines = [[name, num].filter(Boolean).join(" \u00b7 "), [age ? "Age " + age : "", tt ? "TikTok " + tt : ""].filter(Boolean).join(" \u00b7 "), rates, src].filter(Boolean);
    var stem = fsSafe([name, num].filter(Boolean).join(" ")) || "contact";
    return { stem: stem, title: stem, lines: lines, description: lines.join("\n"), creator: name, source: (c && c.url) || "" };
  }
  function fileName(stem, i) { return stem + " " + String(i + 1).padStart(2, "0") + ".jpg"; }
  /* ---- writer ---- */
  function utf8(s) { if (typeof TextEncoder !== "undefined") return Array.from(new TextEncoder().encode(s)); return Array.from(Buffer.from(s, "utf8")); }
  function asciiOf(s) { return String(s || "").replace(/\u0e3f/g, "THB ").replace(/\u20ac/g, "EUR ").replace(/\u00a3/g, "GBP ").replace(/\u00b7/g, "-").replace(/[^\x20-\x7e\n]/g, "").replace(/ {2,}/g, " ").trim(); }
  function ucs2z(s) { var out = []; s = String(s || ""); for (var i = 0; i < s.length; i++) { var u = s.charCodeAt(i); out.push(u & 255, u >> 8); } out.push(0, 0); return out; }
  function seg(marker, body) { var len = body.length + 2; if (len > 65535) throw new Error("metadata too big"); return [0xff, marker, len >> 8, len & 255].concat(body); }
  function exifSeg(f) {
    function ascii(s) { var a = asciiOf(s), b = []; for (var i = 0; i < a.length; i++) b.push(a.charCodeAt(i)); b.push(0); return b; }
    var e = [[0x010e, 2, ascii(f.description)], [0x9c9b, 1, ucs2z(f.title)], [0x9c9c, 1, ucs2z(f.description)]];
    if (f.creator) e.push([0x013b, 2, ascii(f.creator)], [0x9c9d, 1, ucs2z(f.creator)]);
    e.sort(function (a, b) { return a[0] - b[0]; });
    var t = [], data = [], off = 8 + 2 + 12 * e.length + 4;
    function w16(v) { t.push(v & 255, (v >> 8) & 255); }
    function w32(v) { t.push(v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >>> 24) & 255); }
    t.push(0x49, 0x49); w16(42); w32(8); w16(e.length);
    e.forEach(function (x) {
      var bytes = x[2]; w16(x[0]); w16(x[1]); w32(bytes.length);
      if (bytes.length <= 4) { var b = bytes.slice(); while (b.length < 4) b.push(0); Array.prototype.push.apply(t, b); }
      else { w32(off + data.length); Array.prototype.push.apply(data, bytes); if (data.length % 2) data.push(0); }
    });
    w32(0);
    return seg(0xe1, [0x45, 0x78, 0x69, 0x66, 0, 0].concat(t, data));
  }
  function xe(s) { return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function xmpSeg(f, tool) {
    function alt(v) { return '<rdf:Alt><rdf:li xml:lang="x-default">' + xe(v) + "</rdf:li></rdf:Alt>"; }
    var x = '<?xpacket begin="\ufeff" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">'
      + '<rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">'
      + "<dc:title>" + alt(f.title) + "</dc:title><dc:description>" + alt(f.description) + "</dc:description>"
      + (f.creator ? "<dc:creator><rdf:Seq><rdf:li>" + xe(f.creator) + "</rdf:li></rdf:Seq></dc:creator>" : "")
      + (f.source ? "<dc:source>" + xe(f.source) + "</dc:source>" : "")
      + "<photoshop:Headline>" + xe(f.title) + "</photoshop:Headline><xmp:CreatorTool>" + xe(tool || "") + "</xmp:CreatorTool>"
      + '</rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>';
    return seg(0xe1, utf8("http://ns.adobe.com/xap/1.0/\u0000").concat(utf8(x)));
  }
  /* returns a new JPEG: SOI, our EXIF, our XMP, any other header segments (ICC colour profile...), then the image. Old JFIF / EXIF / XMP are dropped, so re-tagging never stacks. */
  function tagJpeg(bytes, f, tool) {
    var b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    if (b[0] !== 0xff || b[1] !== 0xd8) throw new Error("not a JPEG");
    var keep = [], p = 2;
    while (p + 4 <= b.length && b[p] === 0xff) {
      var m = b[p + 1];
      if (m === 0xff) { p += 1; continue; }
      if (!((m >= 0xe0 && m <= 0xef) || m === 0xfe)) break;
      var len = (b[p + 2] << 8) | b[p + 3];
      if (m !== 0xe0 && m !== 0xe1) keep.push(b.subarray(p, p + 2 + len));
      p += 2 + len;
    }
    var head = [0xff, 0xd8].concat(exifSeg(f), xmpSeg(f, tool));
    var size = head.length + keep.reduce(function (t, k) { return t + k.length; }, 0) + (b.length - p);
    var out = new Uint8Array(size), o = head.length;
    out.set(head, 0);
    keep.forEach(function (k) { out.set(k, o); o += k.length; });
    out.set(b.subarray(p), o);
    return out;
  }
  var api = { nameOf: nameOf, numOf: numOf, ratesOf: ratesOf, detailsOf: detailsOf, fileName: fileName, tagJpeg: tagJpeg, asciiOf: asciiOf };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.JpegMeta = api;
})(typeof self !== "undefined" ? self : this);
