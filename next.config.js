/** @type {import("next").NextConfig} */
module.exports = {
  outputFileTracingRoot: __dirname,
  // Netlify'da derlenirken NETLIFY=true olur → canlıda Netlify Blobs kullanılır, yerelde dosya sistemi.
  env: { STORAGE: process.env.NETLIFY === "true" || process.env.STORAGE === "netlify" ? "netlify" : "fs" },
};
