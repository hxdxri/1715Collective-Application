const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");
const https = require("https");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "docs");

const TEST_RECIPIENT = "hxidari@gmail.com";
const PROD_RECIPIENT = "Just1715related@icloud.com";

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const getResendConfig = () => {
  const { RESEND_API_KEY, FROM_EMAIL } = process.env;
  if (!RESEND_API_KEY || !FROM_EMAIL) {
    return null;
  }
  return { apiKey: RESEND_API_KEY, from: FROM_EMAIL };
};

const formatField = (label, value) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return `${label}:`;
  }
  if (Array.isArray(value)) {
    return `${label}: ${value.join(", ")}`;
  }
  return `${label}: ${value}`;
};

const toEmailBody = (data) => {
  const lines = [
    "New 1715 Collective Application",
    "",
    formatField("Brand name", data.brandName),
    formatField("Website type", data.websiteType),
    formatField("Website URL", data.websiteUrl),
    formatField("Instagram handle", data.instagramHandle || data.brandInstagram),
    formatField("Country / City", data.countryCity),
    formatField("Year established", data.yearEstablished),
    formatField("Primary contact", data.primaryContact),
    formatField("Contact email", data.contactEmail),
    "",
    formatField("Brand categories", data.brandCategory),
    formatField("Other category", data.brandCategoryOtherText),
    "",
    formatField("Brand description", data.brandDescription),
    "",
    formatField("Brand distinct", data.brandDistinct),
    "",
    formatField("Why 1715", data.brandWhy),
    "",
    formatField("Products to showcase", data.productsShowcase),
    formatField("Average price range", data.priceRange),
    formatField("SKU count", data.skuCount),
    "",
    formatField("Attendance", data.attendance),
    formatField("Requirements", data.requirements),
    formatField("Other requirements", data.requirementsOtherText),
    "",
    formatField("Package", "Standard Showcase"),
    formatField("Open to pre-event feature", data.preEventFeature),
    formatField("Brand Instagram handle", data.brandInstagram),
    formatField("Follower count", data.followerCount),
    "",
    formatField("Acknowledgement", data.acknowledgement),
    formatField("Additional notes", data.additionalNotes),
  ];

  return lines.join("\n");
};

const sendMail = async (data) => {
  const resend = getResendConfig();
  if (!resend) {
    throw new Error("Resend is not configured.");
  }

  const recipient = process.env.NODE_ENV === "production" ? PROD_RECIPIENT : TEST_RECIPIENT;
  const payload = JSON.stringify({
    from: resend.from,
    to: recipient,
    subject: "1715 Collective — New Application",
    text: toEmailBody(data),
  });

  await new Promise((resolve, reject) => {
    const request = https.request(
      {
        hostname: "api.resend.com",
        path: "/emails",
        method: "POST",
        headers: {
          Authorization: `Bearer ${resend.apiKey}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(payload),
        },
      },
      (response) => {
        let body = "";
        response.on("data", (chunk) => {
          body += chunk;
        });
        response.on("end", () => {
          if (response.statusCode && response.statusCode >= 200 && response.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`Resend error: ${response.statusCode} ${body}`));
          }
        });
      }
    );

    request.on("error", reject);
    request.write(payload);
    request.end();
  });
};

const parseJsonBody = (req) =>
  new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2e6) {
        reject(new Error("Payload too large"));
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch (error) {
        reject(error);
      }
    });
  });

const serveStatic = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let filePath = path.join(ROOT, url.pathname === "/" ? "index.html" : url.pathname);
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain" });
    res.end(data);
  });
};

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/apply") {
    try {
      const data = await parseJsonBody(req);
      await sendMail(data);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: false, error: error.message }));
    }
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
