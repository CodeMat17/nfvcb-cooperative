import { writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Read CONVEX URL from .env.local
const envContent = readFileSync(join(rootDir, ".env.local"), "utf8");
const convexUrl = envContent
  .split("\n")
  .find((line) => line.startsWith("NEXT_PUBLIC_CONVEX_URL="))
  ?.split("=")[1]
  ?.trim();

if (!convexUrl) {
  console.error("Could not find NEXT_PUBLIC_CONVEX_URL in .env.local");
  process.exit(1);
}

console.log(`Connecting to: ${convexUrl}`);
console.log("Fetching backup data...\n");

const response = await fetch(`${convexUrl}/api/query`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    path: "backup:backupAllData",
    args: {},
    format: "json",
  }),
});

if (!response.ok) {
  console.error(`HTTP error ${response.status}: ${await response.text()}`);
  process.exit(1);
}

const result = await response.json();

if (result.status !== "success") {
  console.error("Convex query failed:", result);
  process.exit(1);
}

const data = result.value;

// Save to file with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const filename = `backup-${timestamp}.json`;
const outputPath = join(rootDir, filename);

writeFileSync(outputPath, JSON.stringify(data, null, 2), "utf8");

// Print summary
console.log("=== BACKUP COMPLETE ===");
console.log(`File: ${filename}`);
console.log(`Backup date: ${data.backupDate}`);
console.log("\n=== TOTAL RECORDS ===");
console.log(`  Users:           ${data.totalRecords.users}`);
console.log(`  Quick Loans:     ${data.totalRecords.quickLoans}`);
console.log(`  Core Loans:      ${data.totalRecords.coreLoans}`);
console.log(`  Activity History:${data.totalRecords.activityHistory}`);
const total =
  data.totalRecords.users +
  data.totalRecords.quickLoans +
  data.totalRecords.coreLoans +
  data.totalRecords.activityHistory;
console.log(`  ─────────────────`);
console.log(`  TOTAL:           ${total}`);
console.log("\nBackup saved successfully.");
