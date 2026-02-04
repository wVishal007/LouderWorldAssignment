import fs from "fs";
import path from "path";

const SOURCE_DIR = "./src";          // change if needed
const OUTPUT_FILE = "./all-jsx.js";

fs.writeFileSync(OUTPUT_FILE, "");

function readJSXFiles(dir) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);

    if (fs.statSync(fullPath).isDirectory()) {
      readJSXFiles(fullPath); // recursive
    } 
    else if (item.endsWith(".jsx")) {
      const content = fs.readFileSync(fullPath, "utf-8");

      fs.appendFileSync(
        OUTPUT_FILE,
        `\n\n// ===============================\n` +
        `// FILE: ${fullPath}\n` +
        `// ===============================\n\n` +
        content
      );
    }
  }
}

readJSXFiles(SOURCE_DIR);

console.log("✅ All .jsx files merged into all-jsx.js");
