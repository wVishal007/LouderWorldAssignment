import fs from "fs";
import path from "path";

const ROUTES_DIR = "./routes";
const OUTPUT_FILE = "./all-routes.js";

const files = fs.readdirSync(ROUTES_DIR);

// clear output file
fs.writeFileSync(OUTPUT_FILE, "");

files.forEach((file) => {
  const filePath = path.join(ROUTES_DIR, file);

  // skip non-js files & folders
  if (!file.endsWith(".js")) return;
  if (fs.statSync(filePath).isDirectory()) return;

  const content = fs.readFileSync(filePath, "utf-8");

  fs.appendFileSync(
    OUTPUT_FILE,
    `\n\n// ===============================\n` +
    `// FILE: ${file}\n` +
    `// ===============================\n\n` +
    content
  );
});

console.log("✅ All route files merged into all-routes.js");
