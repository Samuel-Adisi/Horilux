const API = (process.env.VITE_API_BASE_URL || "https://188-245-8-181.sslip.io/api/v1").replace(/\/$/, "");

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function pickImage(p) {
  var cands = [];
  if (p.cover_image) cands.push(p.cover_image);
  if (Array.isArray(p.media)) {
    p.media.forEach(function (m) {
      if (!m) return;
      var isVideo = m.media_type === "video" || m.type === "video";
      var u = m.url || m.file || m.image || m.file_url || m.media_url;
      if (typeof u === "string" && !isVideo && !/\.(mp4|webm|mov)(\?|$)/i.test(u)) cands.push(u);
    });
  }
  var first = cands.find(function (u) { return typeof u === "string" && u.length > 0; });
  return first || null;
}

function b64url(str) {
  return Buffer.from(str).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function sized(url, logo) {
  if (url.indexOf("/upload/") === -1 || url.indexOf("res.cloudinary.com") === -1) {
    return { plain: url, branded: url };
  }
  var base = "c_fill,w_1200,h_630";
  var plain = url.replace("/upload/", "/upload/" + base + ",q_auto,f_jpg/");
  var branded = url.replace(
    "/upload/",
    "/upload/" + base + "/e_brightness:-15/l_horilux_logo/c_scale,w_240/fl_layer_apply,g_south_west,x_40,y_36/q_auto,f_jpg/"
  );
  return { plain: plain, branded: branded };
}

export default async function handler(req, res) {
  var id = req.query.id;
  var host = req.headers["x-forwarded-host"] || req.headers.host;
  var origin = "https://" + host;
  var pageUrl = origin + "/listings/" + encodeURIComponent(id);

  var title = "Horilux Estates";
  var desc = "Premium real estate in Ghana.";
  var image = origin + "/covers/cover-0.jpg";

  try {
    var r = await fetch(API + "/public/properties/" + encodeURIComponent(id) + "/");
    if (r.ok) {
      var p = await r.json();
      title = (p.title || p.name || title) + " | Horilux Estates";
      var bits = [];
      if (p.listing_type) bits.push("For " + (p.listing_type === "rent" ? "Rent" : "Sale"));
      if (p.price) bits.push("GH₵ " + Number(p.price).toLocaleString("en-GH"));
      if (p.bedrooms) bits.push(p.bedrooms + " bed");
      if (p.bathrooms) bits.push(p.bathrooms + " bath");
      var loc = [p.location, p.city, p.region].filter(Boolean).join(", ");
      if (loc) bits.push(loc);
      desc = bits.length ? bits.join(" · ") : desc;
      var img = pickImage(p);
      if (img) {
        var v = sized(img, origin + "/logo.png");
        image = v.plain;
      }
    }
  } catch (e) {}

  var html = [
    "<!doctype html>",
    "<html lang=\"en\"><head>",
    "<meta charset=\"utf-8\">",
    "<link rel=\"icon\" type=\"image/png\" href=\"" + origin + "/favicon.png\">",
    "<link rel=\"shortcut icon\" href=\"" + origin + "/favicon.png\">",
    "<link rel=\"apple-touch-icon\" href=\"" + origin + "/apple-touch-icon.png\">",
    "<title>" + esc(title) + "</title>",
    "<meta name=\"description\" content=\"" + esc(desc) + "\">",
    "<link rel=\"canonical\" href=\"" + esc(pageUrl) + "\">",
    "<meta property=\"og:type\" content=\"website\">",
    "<meta property=\"og:site_name\" content=\"Horilux Estates\">",
    "<meta property=\"og:title\" content=\"" + esc(title) + "\">",
    "<meta property=\"og:description\" content=\"" + esc(desc) + "\">",
    "<meta property=\"og:url\" content=\"" + esc(pageUrl) + "\">",
    "<meta property=\"og:image\" content=\"" + esc(image) + "\">",
    "<meta property=\"og:image:width\" content=\"1200\">",
    "<meta property=\"og:image:height\" content=\"630\">",
    "<meta name=\"twitter:card\" content=\"summary_large_image\">",
    "<meta name=\"twitter:title\" content=\"" + esc(title) + "\">",
    "<meta name=\"twitter:description\" content=\"" + esc(desc) + "\">",
    "<meta name=\"twitter:image\" content=\"" + esc(image) + "\">",
    "</head><body></body></html>"
  ].join("\n");

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.status(200).send(html);
};
